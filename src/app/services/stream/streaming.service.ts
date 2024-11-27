import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class StreamingService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private socket!: Socket;
  public broadcasters: Array<{ id: string; name?: string }> = []; // Store broadcaster details


  constructor() {
    // Initialize the socket connection to the signaling server
    this.socket = io('/signal', {
      path: '/socket.io',
      transports: ['websocket'],
    });

    // Listen for available broadcasters
    this.socket.on('broadcaster-available', (broadcasters) => {
      this.broadcasters = broadcasters;
    });
  }

  async startBroadcaster(videoElement: HTMLVideoElement) {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    videoElement.srcObject = this.localStream;

    this.socket.emit('start-stream');

    this.socket.on('viewer-joined', ({ viewer_id }) => {
      this.createOffer(viewer_id);
    });
  }

  async joinStream(broadcasterId: string, videoElement: HTMLVideoElement) {
    this.socket.emit('join-stream', { broadcaster_id: broadcasterId });

    this.socket.on('stream-offer', async (data) => {
      const { offer, sender_id } = data;
      const peerConnection = this.createPeerConnection(sender_id, videoElement);

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      this.socket.emit('stream-answer', { target_id: sender_id, answer });
    });
  }

  private createOffer(targetId: string) {
    const peerConnection = this.createPeerConnection(targetId);

    this.localStream?.getTracks().forEach((track) =>
      peerConnection.addTrack(track, this.localStream!)
    );

    peerConnection.createOffer().then((offer) => {
      peerConnection.setLocalDescription(offer);
      this.socket.emit('stream-offer', { target_id: targetId, offer });
    });
  }

  private createPeerConnection(targetId: string, videoElement?: HTMLVideoElement) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('stream-ice-candidate', {
          target_id: targetId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      if (videoElement) {
        videoElement.srcObject = event.streams[0];
      }
    };

    this.peerConnections.set(targetId, peerConnection);

    return peerConnection;
  }

  public getAvailableBroadcasters() {
    this.socket.emit('request-broadcasters');
  }
}
