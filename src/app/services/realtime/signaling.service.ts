import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SignalingService {
  private socket!: Socket;

  constructor() {
    // Initialize the socket connection to the signaling server
    this.socket = io('/signal', {
      path: '/socket.io',
      transports: ['websocket'],
    });

    // Log connection status
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
    });
    
    this.socket.on('error', (error: Error) => {
      console.error('Connection error:', error);
    });
  }

  /**
   * Create a new room on the signaling server.
   * @param room_name - The name of the room to create.
   * @param user_id - The ID of the user creating the room.
   */
  createRoom(room_name: string, user_id: string) {
    console.log(`Creating room: ${room_name} for user: ${user_id}`);
    this.socket.emit('createRoom', { room_name, user_id });
  }

  /**
   * Join an existing room on the signaling server.
   * @param room_name - The name of the room to join.
   * @param user_id - The ID of the user joining the room.
   */
  joinRoom(room_name: string, user_id: string) {
    console.log(`Joining room: ${room_name} for user: ${user_id}`);
    this.socket.emit('joinRoom', { room_name, user_id });
  }

  /**
   * Leave a room on the signaling server.
   * @param room_name - The name of the room to leave.
   * @param user_id - The ID of the user leaving the room.
   */
  leaveRoom(room_name: string, user_id: string) {
    console.log(`Leaving room: ${room_name} for user: ${user_id}`);
    this.socket.emit('leaveRoom', { room_name, user_id });
  }

  /**
   * Listen for the 'roomCreated' event from the signaling server.
   * @returns An Observable that emits the name of the created room.
   */
  onRoomCreated(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('roomCreated', (room_name: string) => {
        console.log(`Room created: ${room_name}`);
        observer.next(room_name);
      });
    });
  }

  /**
   * Listen for the 'roomJoinError' event from the signaling server.
   * @returns An Observable that emits the error message.
   */
  onRoomJoinError(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('roomJoinError', (error: string) => {
        console.error(`Room join error: ${error}`);
        observer.next(error);
      });
    });
  }

  /**
   * Listen for the 'roomExists' event from the signaling server.
   * @returns An Observable that emits the error message.
   */
  onRoomExists(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('roomExists', (error: string) => {
        console.error(`Room exists error: ${error}`);
        observer.next(error);
      });
    });
  }

  /**
   * Send an offer to another user via the signaling server.
   * @param receiver_id - The ID of the user to send the offer to.
   * @param offer - The RTC session description offer.
   */
  sendOffer(receiver_id: string, offer: RTCSessionDescriptionInit) {
    console.log(`Sending offer to user: ${receiver_id}`);
    this.socket.emit('offer', { receiver_id, offer });
  }

  /**
   * Send an answer to another user via the signaling server.
   * @param receiver_id - The ID of the user to send the answer to.
   * @param answer - The RTC session description answer.
   */
  sendAnswer(receiver_id: string, answer: RTCSessionDescriptionInit) {
    console.log(`Sending answer to user: ${receiver_id}`);
    this.socket.emit('answer', { receiver_id, answer });
  }

  /**
   * Send an ICE candidate to another user via the signaling server.
   * @param receiver_id - The ID of the user to send the ICE candidate to.
   * @param candidate - The ICE candidate.
   */
  sendIceCandidate(receiver_id: string, candidate: RTCIceCandidateInit) {
    console.log(`Sending ICE candidate to user: ${receiver_id}`);
    this.socket.emit('ice-candidate', { receiver_id, candidate });
  }

  /**
   * Listen for the 'offer' event from the signaling server.
   * @returns An Observable that emits the offer data.
   */
  onOffer(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('offer', (data) => {
        console.log('Received offer:', data);
        observer.next(data);
      });
    });
  }

  /**
   * Listen for the 'answer' event from the signaling server.
   * @returns An Observable that emits the answer data.
   */
  onAnswer(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('answer', (data) => {
        console.log('Received answer:', data);
        observer.next(data);
      });
    });
  }

  /**
   * Listen for the 'ice-candidate' event from the signaling server.
   * @returns An Observable that emits the ICE candidate data.
   */
  onIceCandidate(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('ice-candidate', (data) => {
        console.log('Received ICE candidate:', data);
        observer.next(data);
      });
    });
  }

  /**
   * Listen for the 'userJoined' event from the signaling server.
   * @returns An Observable that emits the data of the user who joined.
   */
  onUserJoined(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('userJoined', (data) => {
        console.log('User joined:', data);
        observer.next(data);
      });
    });
  }

  /**
   * Listen for the 'existingUsers' event from the signaling server.
   * @returns An Observable that emits the list of existing users.
   */
  onExistingUsers(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('existingUsers', (users) => {
        console.log('Existing users:', users);
        observer.next(users);
      });
    });
  }

  /**
   * Listen for the 'userLeft' event from the signaling server.
   * @returns An Observable that emits the data of the user who left.
   */
  onUserLeft(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('userLeft', (data) => {
        console.log('User left:', data);
        observer.next(data);
      });
    });
  }

  /**
   * Send a chat message to the signaling server.
   * @param message - The chat message to send.
   */
  sendChatMessage(message: string) {
    console.log(`Sending chat message: ${message}`);
    this.socket.emit('chatMessage', message);
  }

  /**
   * Listen for the 'chatMessage' event from the signaling server.
   * @returns An Observable that emits the chat message data.
   */
  onChatMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('chatMessage', (data) => {
        console.log('Received chat message:', data);
        observer.next(data);
      });
    });
  }

  /**
   * Send a reaction to the signaling server.
   * @param reaction - The reaction to send.
   */
  sendReaction(reaction: string) {
    console.log(`Sending reaction: ${reaction}`);
    this.socket.emit('sendReaction', reaction);
  }

  /**
   * Listen for the 'receiveReaction' event from the signaling server.
   * @returns An Observable that emits the reaction data.
   */
  onReceiveReaction(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('receiveReaction', (data) => {
        console.log('Received reaction:', data);
        observer.next(data);
      });
    });
  }

  /**
   * Send an admin action to the signaling server.
   * @param action - The admin action to send.
   * @param target_socket_id - The socket ID of the target user.
   */
  sendAdminAction(action: string, target_socket_id: string) {
    console.log(`Sending admin action: ${action} to user: ${target_socket_id}`);
    this.socket.emit('adminAction', { action, target_socket_id });
  }

  /**
   * Listen for the 'adminAction' event from the signaling server.
   * @returns An Observable that emits the admin action data.
   */
  onAdminAction(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('adminAction', (data) => {
        console.log('Received admin action:', data);
        observer.next(data);
      });
    });
  }

  /**
   * Listen for the 'kicked' event from the signaling server.
   * @returns An Observable that emits when the user is kicked.
   */
  onKicked(): Observable<void> {
    return new Observable((observer) => {
      this.socket.on('kicked', () => {
        console.log('You have been kicked from the room');
        observer.next();
      });
    });
  }

  /**
   * Listen for the 'adminAssigned' event from the signaling server.
   * @returns An Observable that emits when the user is assigned as an admin.
   */
  onAdminAssigned(): Observable<void> {
    return new Observable((observer) => {
      this.socket.on('adminAssigned', () => {
        console.log('You have been assigned as an admin');
        observer.next();
      });
    });
  }
}
