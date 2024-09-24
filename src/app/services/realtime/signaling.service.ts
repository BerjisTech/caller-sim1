import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SignalingService {
  private socket!: Socket;

  constructor() {
    this.socket = io('/ws/signal', {
      path: '/ws/socket.io',
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
    });
  }

  // Room management
  createRoom(room_name: string, user_id: string) {
    this.socket.emit('createRoom', { room_name, user_id });
  }

  joinRoom(room_name: string, user_id: string) {
    this.socket.emit('joinRoom', { room_name, user_id });
  }

  leaveRoom(room_name: string, user_id: string) {
    this.socket.emit('leaveRoom', { room_name, user_id });
  }

  onRoomCreated(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('roomCreated', (room_name: string) =>
        observer.next(room_name)
      );
    });
  }

  onRoomJoinError(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('roomJoinError', (error: string) => observer.next(error));
    });
  }

  onRoomExists(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('roomExists', (error: string) => observer.next(error));
    });
  }

  // Signaling methods
  sendOffer(receiver_id: string, offer: RTCSessionDescriptionInit) {
    this.socket.emit('offer', { receiver_id, offer });
  }

  sendAnswer(receiver_id: string, answer: RTCSessionDescriptionInit) {
    this.socket.emit('answer', { receiver_id, answer });
  }

  sendIceCandidate(receiver_id: string, candidate: RTCIceCandidateInit) {
    this.socket.emit('ice-candidate', { receiver_id, candidate });
  }

  // Event listeners
  onOffer(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('offer', (data) => observer.next(data));
    });
  }

  onAnswer(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('answer', (data) => observer.next(data));
    });
  }

  onIceCandidate(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('ice-candidate', (data) => observer.next(data));
    });
  }

  onUserJoined(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('userJoined', (data) => observer.next(data));
    });
  }

  onExistingUsers(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('existingUsers', (users) => observer.next(users));
    });
  }

  onUserLeft(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('userLeft', (data) => observer.next(data));
    });
  }

  // Chat and reactions
  sendChatMessage(message: string) {
    this.socket.emit('chatMessage', message);
  }

  onChatMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('chatMessage', (data) => observer.next(data));
    });
  }

  sendReaction(reaction: string) {
    this.socket.emit('sendReaction', reaction);
  }

  onReceiveReaction(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('receiveReaction', (data) => observer.next(data));
    });
  }

  // Admin actions
  sendAdminAction(action: string, target_socket_id: string) {
    this.socket.emit('adminAction', { action, target_socket_id });
  }

  onAdminAction(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('adminAction', (data) => observer.next(data));
    });
  }

  // Miscellaneous
  onKicked(): Observable<void> {
    return new Observable((observer) => {
      this.socket.on('kicked', () => observer.next());
    });
  }

  onAdminAssigned(): Observable<void> {
    return new Observable((observer) => {
      this.socket.on('adminAssigned', () => observer.next());
    });
  }
}
