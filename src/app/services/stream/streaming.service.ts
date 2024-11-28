import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface Broadcaster {
  id: string;
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StreamingService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private socket!: Socket;
  private configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  private broadcastersSubject = new BehaviorSubject<Broadcaster[]>([]);
  public broadcasters$ = this.broadcastersSubject.asObservable();

  constructor() {
    // Initialize socket connection
    this.socket = io('http://localhost:3006/signal', {
      path: '/socket.io',
      transports: ['websocket']
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.getAvailableBroadcasters();
    });

    this.socket.on('broadcaster-available', (broadcasters: Broadcaster[]) => {
      console.log('Available broadcasters:', broadcasters);
      this.broadcastersSubject.next(broadcasters);
    });

    this.socket.on('stream-ice-candidate', async ({ sender_id, candidate }) => {
      const peerConnection = this.peerConnections.get(sender_id);
      if (peerConnection) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
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
        this.createBroadcastOffer(viewer_id);
      });

    } catch (error) {
      console.error('Error starting broadcast:', error);
      throw new Error('Failed to start broadcast');
    }
  }

  async joinStream(broadcasterId: string, videoElement: HTMLVideoElement): Promise<void> {
    try {
      console.log('Joining stream:', broadcasterId);
      this.socket.emit('join-stream', { broadcaster_id: broadcasterId });

      const peerConnection = this.createPeerConnection(broadcasterId, videoElement);

      this.socket.on('stream-offer', async ({ offer, sender_id }) => {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          this.socket.emit('stream-answer', { target_id: sender_id, answer });
        } catch (error) {
          console.error('Error handling stream offer:', error);
        }
      });

    } catch (error) {
      console.error('Error joining stream:', error);
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

    peerConnection.ontrack = (event) => {
      console.log('Track received:', event.streams[0]);
      if (videoElement && event.streams[0]) {
        videoElement.srcObject = event.streams[0];
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', peerConnection.iceConnectionState);
    };

    this.peerConnections.set(targetId, peerConnection);
    return peerConnection;
  }

  public getAvailableBroadcasters(): void {
    this.socket.emit('request-broadcasters');
  }

  public cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.peerConnections.forEach(connection => {
      connection.close();
    });
    this.peerConnections.clear();

    if (this.socket) {
      this.socket.disconnect();
    }
  }
}