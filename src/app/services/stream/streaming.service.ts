import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface Broadcaster {
  id: string;
  viewers: Set<string>;
  user_id: string;
  socket_id: string;
  name?: string;
  viewerCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class StreamingService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private socket!: Socket;
  private isConnected = false;
  private currentBroadcasterId: string | null = null;

  private configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  private broadcastersSubject = new BehaviorSubject<Broadcaster[]>([]);
  public broadcasters$ = this.broadcastersSubject.asObservable();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    this.socket = io('/signal', {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.isConnected = true;
      this.socket.emit('request-broadcasters');
    });

    this.socket.on('broadcaster-available', (broadcasters: Broadcaster[]) => {
      console.log('Received broadcasters update:', broadcasters);
      this.broadcastersSubject.next(broadcasters);
    });

    this.socket.on('viewer-left', ({ viewer_id }) => {
      console.log('Viewer left:', viewer_id);
      this.cleanupConnection(viewer_id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
      this.cleanupConnections();
      this.socket.connect();
    });

    this.socket.on('stream-ice-candidate', async ({ candidate, sender_id }) => {
      try {
        const peerConnection = this.peerConnections.get(sender_id);
        if (peerConnection && peerConnection.signalingState !== 'closed') {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    });

    this.socket.on('stream-answer', async ({ answer, sender_id }) => {
      try {
        const peerConnection = this.peerConnections.get(sender_id);
        if (peerConnection && peerConnection.signalingState !== 'closed') {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (error) {
        console.error('Error handling stream answer:', error);
      }
    });
  }

  async startBroadcaster(videoElement: HTMLVideoElement, userId: string): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      videoElement.srcObject = this.localStream;
      await videoElement.play();

      this.socket.emit('start-stream', { user_id: userId });

      this.socket.on('viewer-joined', ({ viewer_id }) => {
        console.log('New viewer joined:', viewer_id);
        if (!this.peerConnections.has(viewer_id)) {
          this.createBroadcastOffer(viewer_id);
        }
      });

    } catch (error) {
      console.error('Error starting broadcast:', error);
      this.cleanupConnections();
      throw new Error('Failed to start broadcast');
    }
  }

  async joinStream(broadcasterId: string, videoElement: HTMLVideoElement): Promise<void> {
    try {
      console.log('Joining stream:', broadcasterId);
      this.currentBroadcasterId = broadcasterId;

      // Clean up any existing connections before joining
      this.cleanupConnections();

      // Create new peer connection for this broadcast
      const peerConnection = this.createPeerConnection(broadcasterId, videoElement);

      // Set up offer handling before emitting join-stream
      this.socket.off('stream-offer').on('stream-offer', async ({ offer, sender_id }) => {
        try {
          if (peerConnection.signalingState !== 'closed') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            this.socket.emit('stream-answer', { target_id: sender_id, answer });
          }
        } catch (error) {
          console.error('Error handling stream offer:', error);
          this.cleanupConnections();
          throw new Error('Failed to process stream offer');
        }
      });

      this.socket.emit('join-stream', { broadcaster_id: broadcasterId });
      this.currentBroadcasterId = broadcasterId;

    } catch (error) {
      console.error('Error joining stream:', error);
      this.cleanupConnections();
      throw new Error('Failed to join stream');
    }
  }

  private async createBroadcastOffer(viewerId: string): Promise<void> {
    try {
      const peerConnection = this.createPeerConnection(viewerId);

      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream!);
        });
      }

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      this.socket.emit('stream-offer', { target_id: viewerId, offer });

    } catch (error) {
      console.error('Error creating broadcast offer:', error);
      this.cleanupConnections();
    }
  }

  private createPeerConnection(targetId: string, videoElement?: HTMLVideoElement): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection(this.configuration);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('stream-ice-candidate', {
          target_id: targetId,
          candidate: event.candidate
        });
      }
    };

    if (videoElement) {
      peerConnection.ontrack = (event) => {
        console.log('Track received:', event.streams[0]);
        if (videoElement && event.streams[0]) {
          videoElement.srcObject = event.streams[0];
        }
      };
    }

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', peerConnection.iceConnectionState);
      if (peerConnection.iceConnectionState === 'failed' ||
        peerConnection.iceConnectionState === 'closed') {
        this.cleanupConnection(targetId);
      }
    };

    this.peerConnections.set(targetId, peerConnection);
    return peerConnection;
  }

  private cleanupConnection(targetId: string): void {
    const connection = this.peerConnections.get(targetId);
    if (connection) {
      if (connection.signalingState !== 'closed') {
        connection.close();
      }
      this.peerConnections.delete(targetId);
    }
  }

  private cleanupConnections(): void {
    this.peerConnections.forEach((connection, id) => {
      this.cleanupConnection(id);
    });
    this.peerConnections.clear();
  }

  public getAvailableBroadcasters(): void {
    if (this.isConnected) {
      console.log('Requesting updated broadcaster list');
      this.socket.emit('request-broadcasters');
    } else {
      console.log('Socket not connected, attempting to reconnect...');
      this.socket.connect();
    }
  }

  public cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.isConnected) {
      this.socket.disconnect();
    }

    this.cleanupConnections();
    this.currentBroadcasterId = null;

    // Don't disconnect the socket, just clean up the connections
    this.getAvailableBroadcasters();
  }

  public leaveStream(broadcaster_id: string): void {
    this.socket.disconnect();
    this.getAvailableBroadcasters();
  }
}