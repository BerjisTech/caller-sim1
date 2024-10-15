import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DarkModeComponent } from '../../components/shared/dark-mode/dark-mode.component';
import { Profile } from '../../interfaces/user/profile';
import { SignalingService } from '../../services/realtime/signaling.service';
import { ProfileService } from '../../services/user/profile.service';
import { NotificationService } from '../../services/notifications/notification.service';
import { SharedModule } from '../../modules/shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from '../../interfaces/call/room';
import { ContentService } from '../../services/content/content.service';
import { CallManagementService } from '../../services/call/call-management.service';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DarkModeComponent,
    SharedModule,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
})
export class RoomComponent
  implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit
{
  public base_url = window.location.origin;
  public user!: Profile;
  public local_video!: HTMLVideoElement;
  public local_stream!: MediaStream;
  public peer_connections: { [socket_id: string]: RTCPeerConnection } = {};
  public remote_streams: Array<{
    id: string;
    stream: MediaStream;
    user_id: string;
  }> = [];
  public data_channels: { [socket_id: string]: RTCDataChannel } = {};
  public user_id: string = Math.random().toString(36).substring(2, 15);
  public room!: Room;
  public name: string = '';
  public room_error: string = '';
  public is_muted = false;
  public is_video_on = true;
  public is_in_call = false;
  public is_screen_sharing = false;
  public show_sidechat: boolean = false;
  public side_chat_tag: string = 'chat';
  public chat_message: string = '';
  public messages: Array<{ user_id: string; message: string }> = [];
  public reactions: Array<{ user_id: string; reaction: string; left: number }> =
    [];
  public show_reactions: boolean = false;
  public audio_devices: MediaDeviceInfo[] = [];
  public show_audio_devices: boolean = false;
  public video_devices: MediaDeviceInfo[] = [];
  public show_video_devices: boolean = false;
  public selected_audio_device_id: string = '';
  public selected_video_device_id: string = '';
  public is_admin = false;
  public connected_users: Array<{ user_id: string; socket_id: string }> = [];
  public is_initiator: boolean = false;
  public handlersSetUp: boolean = false;
  public vudeo_layouts: { [layout_name: string]: string } = {
    grid: 'grid',
    list: 'list',
  };
  public video_sizes: {
    width: number; // grid-template-columns count
    height: number; // grid-template-rows count
  } = {
    width: 1,
    height: 1,
  };

  constructor(
    private signalingService: SignalingService,
    private profileService: ProfileService,
    private zone: NgZone,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private contentService: ContentService,
    private callManagement: CallManagementService,
    private router: Router
  ) {
    this.activatedRoute.params.subscribe({
      next: (params) => {
        // Get :name
        this.name = params['name'];
      },
    });
  }

  public copyContent = (content: string) =>
    this.contentService.copyContent(content);

  async ngOnInit() {
    await this.profileService.getUser().then(async (user) => {
      if (user) {
        this.user = user;
        this.user_id = this.user.user_id;
      }
    });

    await this.callManagement.getRoom(this.name).then(async (room) => {
      this.room = room;

      await this.joinRoom().then(() => {
        console.log('Joined room:', this.name);
      });

      this.local_video = document.getElementById(
        'local_video'
      ) as HTMLVideoElement;
      if (this.local_video) {
        this.local_video.muted = true;
      }
      if (!this.handlersSetUp) {
        this.setupSignalingHandlers();
        this.handlersSetUp = true;
      }
      this.listDevices();
      this.updateVideoSizes();
    });
  }

  ngAfterViewInit() {
    this.updateVideoSizes();
    if (this.local_video) {
      // this.local_video.srcObject = this.local_stream;
      this.local_video.muted;
    }
  }

  ngAfterViewChecked() {
    this.updateVideoSizes();
  }

  // Detect changes on ui
  ngDoCheck() {
    this.updateVideoSizes();
  }

  private setupSignalingHandlers() {
    this.signalingService.onOffer().subscribe((data) => {
      this.handleOffer(data);
    });

    this.signalingService.onAnswer().subscribe((data) => {
      this.handleAnswer(data);
    });

    this.signalingService.onIceCandidate().subscribe((data) => {
      this.handleIceCandidate(data);
    });

    this.signalingService.onUserJoined().subscribe(async (data) => {
      console.log('User joined:', data);
      if (
        !this.connected_users.some((user) => user.socket_id === data.socket_id)
      ) {
        this.connected_users.push({
          user_id: data.user_id,
          socket_id: data.socket_id,
        });
      }

      this.is_initiator = false; // Existing user
      await this.createPeerConnection(data.socket_id);
    });

    this.signalingService.onExistingUsers().subscribe(async (users) => {
      console.log('Existing users:', users);
      for (const user of users) {
        if (!this.connected_users.some((u) => u.socket_id === user.socket_id)) {
          this.connected_users.push({
            user_id: user.user_id,
            socket_id: user.socket_id,
          });
        }

        this.is_initiator = true; // New user
        const peerConnection = await this.createPeerConnection(user.socket_id);

        // New user initiates the offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        this.signalingService.sendOffer(user.socket_id, offer);
      }
    });

    this.signalingService.onUserLeft().subscribe((data) => {
      this.closePeerConnection(data.socket_id);
      this.connected_users = this.connected_users.filter(
        (user) => user.socket_id !== data.socket_id
      );
    });

    this.signalingService.onChatMessage().subscribe((data) => {
      this.messages.push({ user_id: data.user_id, message: data.message });
    });

    this.signalingService.onReceiveReaction().subscribe((data) => {
      for (let i = 0; i < 5; i++) {
        this.reactions.push({
          user_id: data.user_id,
          reaction: data.reaction,
          left: this.getRandomPosition(),
        });
      }
    });

    this.signalingService.onAdminAction().subscribe((data) => {
      this.handleAdminAction(data);
    });

    this.signalingService.onAdminAssigned().subscribe(() => {
      this.is_admin = true;
    });

    this.signalingService.onKicked().subscribe(() => {
      this.hangUp();
      alert('You have been kicked from the room');
    });

    // Handle room errors
    this.signalingService.onRoomJoinError().subscribe((error) => {
      this.room_error = error;
      this.createRoom();
    });
  }

  async joinRoom() {
    this.is_initiator = true; // New user
    this.signalingService.joinRoom(this.name, this.user_id);

    try {
      this.is_in_call = true;
      const constraints = {
        audio: { deviceId: this.selected_audio_device_id },
        video: { deviceId: this.selected_video_device_id },
      };
      this.local_stream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      // this.local_video.srcObject = this.local_stream;
    } catch (error) {
      this.is_in_call = false;
      this.notificationService.notify(
        'Error accessing media devices. Please check your settings and try again.',
        'error'
      );
      console.error('Error accessing media devices.', error);
    }
  }

  async createRoom() {
    this.signalingService.createRoom(this.name, this.user_id);
    this.joinRoom();
  }

  async createPeerConnection(socket_id: string): Promise<RTCPeerConnection> {
    if (this.peer_connections[socket_id]) {
      console.warn(`Peer connection with ${socket_id} already exists.`);
      return this.peer_connections[socket_id];
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    this.peer_connections[socket_id] = peerConnection;

    // Add local stream tracks
    this.local_stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, this.local_stream);
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalingService.sendIceCandidate(socket_id, event.candidate);
      }
    };

    // Handle remote streams
    peerConnection.ontrack = (event) => {
      this.zone.run(() => {
        let remoteStream = this.remote_streams.find((s) => s.id === socket_id);
        if (!remoteStream) {
          remoteStream = {
            id: socket_id,
            stream: new MediaStream(),
            user_id:
              this.connected_users.find((u) => u.socket_id === socket_id)
                ?.user_id || 'Unknown User',
          };
          this.remote_streams.push(remoteStream);
        }
        remoteStream.stream.addTrack(event.track);
      });
    };

    if (this.is_initiator) {
      // Create data channel
      const dataChannel = peerConnection.createDataChannel('chat');
      this.data_channels[socket_id] = dataChannel;

      dataChannel.onmessage = (e) => {
        const messageData = JSON.parse(e.data);
        if (messageData.type === 'chat') {
          this.messages.push({
            user_id: messageData.user_id,
            message: messageData.message,
          });
        }
      };
    } else {
      // Handle data channels
      peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;
        dataChannel.onmessage = (e) => {
          const messageData = JSON.parse(e.data);
          if (messageData.type === 'chat') {
            this.messages.push({
              user_id: messageData.user_id,
              message: messageData.message,
            });
          }
        };
        this.data_channels[socket_id] = dataChannel;
      };
    }

    return peerConnection;
  }

  async handleOffer(data: any) {
    const { sender_id, sender_user_id, offer } = data;
    let peerConnection = this.peer_connections[sender_id];
    if (!peerConnection) {
      this.is_initiator = false;
      peerConnection = await this.createPeerConnection(sender_id);
    } else if (peerConnection.signalingState !== 'stable') {
      console.warn(
        `Cannot handle offer in state ${peerConnection.signalingState}`
      );
      return;
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    this.signalingService.sendAnswer(sender_id, answer);
  }

  async handleAnswer(data: any) {
    const { sender_id, answer } = data;
    const peerConnection = this.peer_connections[sender_id];
    if (peerConnection.signalingState !== 'have-local-offer') {
      console.warn(
        `Cannot set remote description in state ${peerConnection.signalingState}`
      );
      return;
    }
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  }

  async handleIceCandidate(data: any) {
    const { sender_id, candidate } = data;
    const peerConnection = this.peer_connections[sender_id];
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  closePeerConnection(socket_id: string) {
    const peerConnection = this.peer_connections[socket_id];
    if (peerConnection) {
      peerConnection.close();
      delete this.peer_connections[socket_id];
    }
    // Remove the remote stream from the array
    this.zone.run(() => {
      this.remote_streams = this.remote_streams.filter(
        (s) => s.id !== socket_id
      );
    });
  }

  async listDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    this.audio_devices = devices.filter(
      (device) => device.kind === 'audioinput'
    );
    this.video_devices = devices.filter(
      (device) => device.kind === 'videoinput'
    );
  }

  async updateMediaStream() {
    const constraints = {
      audio: { deviceId: this.selected_audio_device_id },
      video: { deviceId: this.selected_video_device_id },
    };
    const newStream = await navigator.mediaDevices.getUserMedia(constraints);

    // Replace tracks in peer connections
    for (const pc of Object.values(this.peer_connections)) {
      const senders = pc.getSenders();
      const audioSender = senders.find((s) => s.track?.kind === 'audio');
      const videoSender = senders.find((s) => s.track?.kind === 'video');

      if (audioSender) {
        audioSender.replaceTrack(newStream.getAudioTracks()[0]);
      }
      if (videoSender) {
        videoSender.replaceTrack(newStream.getVideoTracks()[0]);
      }
    }

    // Update local stream
    this.local_stream = newStream;
    this.local_video.srcObject = this.local_stream;
    this.show_audio_devices = false;
    this.show_video_devices = false;
  }

  toggleAudio() {
    this.local_stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    this.is_muted = !this.is_muted;
  }

  toggleVideo() {
    this.local_stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    this.is_video_on = !this.is_video_on;
  }

  async shareScreen() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace video track in all peer connections
      for (const pc of Object.values(this.peer_connections)) {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        sender?.replaceTrack(screenTrack);
      }

      screenTrack.onended = () => {
        // Revert to camera
        this.local_stream.getVideoTracks()[0].enabled = true;
      };
      this.is_screen_sharing = true;
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  }

  sendMessage(message: string) {
    if (!message) {
      return;
    }
    for (const dataChannel of Object.values(this.data_channels)) {
      if (dataChannel.readyState === 'open') {
        dataChannel.send(
          JSON.stringify({ type: 'chat', user_id: this.user_id, message })
        );
      }
    }
    this.messages.push({ user_id: this.user_id, message });
  }

  sendReaction(reaction: string) {
    this.signalingService.sendReaction(reaction);
    for (let i = 0; i < 5; i++) {
      this.reactions.push({
        user_id: this.user_id,
        reaction: reaction,
        left: this.getRandomPosition(),
      });
    }
  }

  // Method to toggle reactions
  toggleReactions(): void {
    this.show_reactions = true;
    setTimeout(() => {
      this.show_reactions = false;
    }, 3000); // Show reactions for 3 seconds
  }

  handleAdminAction(data: any) {
    const { action } = data;
    if (action === 'mute') {
      this.local_stream
        .getAudioTracks()
        .forEach((track) => (track.enabled = false));
    } else if (action === 'disableCamera') {
      this.local_stream
        .getVideoTracks()
        .forEach((track) => (track.enabled = false));
    } else if (action === 'kick') {
      this.hangUp();
      alert('You have been kicked from the room');
    }
  }

  performAdminAction(action: string, user_id: string) {
    // Get socket id by user id
    const target_socket_id = this.connected_users.find(
      (user) => user.user_id === user_id
    )?.socket_id;

    if (this.is_admin && target_socket_id) {
      this.signalingService.sendAdminAction(action, target_socket_id);
    } else {
      this.notificationService.notify(
        'You are not authorized to perform this action',
        'error'
      );
    }
  }

  hangUp() {
    // Close all peer connections
    for (const pc of Object.values(this.peer_connections)) {
      pc.close();
    }
    this.peer_connections = {};

    // Stop local stream
    if (this.local_stream) {
      this.local_stream.getTracks().forEach((track) => track.stop());
    }

    // Leave the room
    this.signalingService.leaveRoom(this.name, this.user_id);
    this.is_in_call = false;

    // Reset variables
    this.remote_streams = [];
    this.connected_users = [];
    this.is_admin = false;
    this.is_initiator = false;

    // Redirect to home
    this.router.navigate(['/']);
  }

  toggleSidechatTabs(active_tab: string) {
    this.side_chat_tag = active_tab;
  }

  getVideosFromConnectedUsers() {
    this.connected_users.forEach((user) => {
      return this.remote_streams.find((s) => s.id === user.socket_id)?.stream;
    });
  }

  updateVideoSizes(): void {
    this.video_sizes = this.calculateVideoSizes();
  }

  calculateVideoSizes(): { width: number; height: number } {
    const num_streams = this.remote_streams.length;

    const width = Math.ceil(Math.sqrt(num_streams)); // Dynamic column count
    const height = Math.ceil(num_streams / width); // Dynamic row count

    return { width, height };
  }

  // Generate grid styles dynamically
  getGridStyles(): any {
    const { width, height } = this.calculateVideoSizes();
    const columns = `repeat(${width}, 1fr)`;
    const rows = `repeat(${height}, 1fr)`;
    return {
      'grid-template-columns': columns,
      'grid-template-rows': rows,
      height: `calc(100vh - 100px)`, // Adjust height based on available space
    };
  }

  // Generate video styles dynamically
  getVideoStyles(): any {
    const { height, width } = this.calculateVideoSizes();
    const videoHeight = `calc((100vh - 100px) / ${height})`;
    const videoWidth = `calc(100% / ${width})`;
    return {
      height: videoHeight,
      // width: videoWidth,
      minWidth: '300px',
      minHeight: '200px',
    };
  }

  getRandomPosition() {
    // [style.left.%]
    return Math.random() * 100;
  }

  randomSeconds() {
    const min = 1;
    const max = 3;
    const random = Math.random() * (max - min) + min;
    return `${random}s`;
  }

  ngOnDestroy() {
    this.hangUp();
  }
}
