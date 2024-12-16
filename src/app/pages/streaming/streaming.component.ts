import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamingService, Broadcaster, Viewer } from '../../services/stream/streaming.service';
import { faker } from '@faker-js/faker';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ContentService } from '../../services/content/content.service';

@Component({
  selector: 'app-streaming',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './streaming.component.html',
  styleUrls: ['./streaming.component.scss'],
  providers: [StreamingService, ContentService]
})
export class StreamingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('localVideo', { static: true }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: true }) remoteVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('messageContainer', { static: true }) messageContainer!: ElementRef<HTMLDivElement>;

  public broadcasters: Broadcaster[] = [];
  public is_broadcasting = false;
  public is_viewing = false;
  public error: string | null = null;
  public user_id: string;
  public currentBroadcaster: Broadcaster = {
    id: '',
    user_id: '',
    socket_id: '',
    name: '',
    viewerCount: 0
  };
  public currentBroadcasterId!: string;
  public chat_message: string = '';
  public messages: Array<{ name: string; message: string }> = [];
  public reactions: Array<{ name: string; reaction: string; left: number }> =
    [];
  public show_reactions: boolean = false;
  public randomSeconds!: () => string;
  public getRandomPosition!: () => number;
  public getRandomTailwindColorClass!: () => string;

  private stream: MediaStream | null = null;
  private autoScrollEnabled: boolean = true;

  constructor(
    private streamingService: StreamingService,
    private contentService: ContentService
  ) {
    this.user_id = `${faker.person.zodiacSign()}_${faker.animal.type()}`;
  }

  ngOnInit(): void {
    console.log('Component initialized');
    this.streamingService.broadcasters$.subscribe({
      next: (broadcasters) => {
        // check if broadcasters has currentBroadcasterId
        // Update current broadcaster info if we're viewing
        if (this.is_broadcasting) {
          let temp_broadcaster = this.getBroadcasterByName(this.user_id);
          if (temp_broadcaster && temp_broadcaster.id !== '') {
            this.currentBroadcaster = temp_broadcaster;
            this.currentBroadcasterId = temp_broadcaster.id;
          }
        } else if (this.currentBroadcaster && this.currentBroadcaster.id !== '') {
          let temp_broadcaster = broadcasters.find(b => b.id === this.currentBroadcaster.id);
          if (temp_broadcaster && temp_broadcaster.id !== '') {
            this.currentBroadcaster = temp_broadcaster;
            this.currentBroadcasterId = temp_broadcaster.id;
          }
        }

        this.broadcasters = broadcasters;
        console.log('Received broadcasters in component:', broadcasters);

        // // if broadcaster list is empty, clean up the stream
        if (broadcasters.length === 0) {
          // this.cleanupStream();
          this.is_viewing = false;
        }
      },
      error: (error) => {
        console.error('Failed to update broadcasters:', error);
        this.error = `Failed to get broadcasters: ${error.message}`;
      }
    });


    this.streamingService.getAvailableBroadcasters();

    this.streamingService.onChatMessage().subscribe({
      next: (message) => {
        console.log('Chat message in StreamingComponent:', message);
        this.messages.push(message);

        if (this.autoScrollEnabled) {
          this.scrollToBottom();
        }
      },
      error: (error) => {
        console.error('Error receiving chat message:', error);
      }
    });

    this.streamingService.onReceiveReaction().subscribe({
      next: (reaction) => {
        console.log('Reaction in StreamingComponent:', reaction);
        this.reactions.push(reaction);
      },
      error: (error) => {
        console.error('Error receiving reactions:', error);
      }
    });

    // Fix: Invoke methods instead of assigning references
    this.randomSeconds = this.contentService.randomSeconds;
    this.getRandomPosition = this.contentService.getRandomPosition;
    this.getRandomTailwindColorClass = this.contentService.getRandomTailwindColorClass;

  }

  requestBroadcastersList(): void {
    // Request the list of available broadcasters
    console.log('Requesting broadcasters list...');
    this.streamingService.getAvailableBroadcasters();

  }

  ngAfterViewInit(): void {
    console.log('Video elements initialized:', {
      local: !!this.localVideo,
      remote: !!this.remoteVideo
    });

    this.messageContainer.nativeElement.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = this.messageContainer.nativeElement;
      this.autoScrollEnabled = scrollHeight - scrollTop === clientHeight;
    });
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Failed to scroll to bottom:', err);
    }
  }

  async startBroadcast(): Promise<void> {
    this.error = null;

    try {
      console.log('Starting broadcast...');

      if (!this.localVideo) {
        throw new Error('Local video element not found');
      }

      console.log('Requesting media permissions...');

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        console.log('Media stream obtained:', this.stream);
        this.localVideo.nativeElement.srcObject = this.stream;

        await new Promise<void>((resolve, reject) => {
          const video = this.localVideo.nativeElement;
          video.onloadedmetadata = () => resolve();
          video.onerror = (e) => reject(new Error(`Video loading failed: ${video.error?.message || 'Unknown error'}`));
        });

        console.log('Local video ready, starting broadcaster...');

        await this.streamingService.startBroadcaster(
          this.localVideo.nativeElement,
          this.user_id
        )

        this.is_broadcasting = true;
        console.log('Broadcasting started successfully');

        this.streamingService.getAvailableBroadcasters();
      } catch (mediaError: any) {
        console.error('Media access error:', mediaError);
        throw new Error(`Failed to access camera/microphone: ${mediaError.message}`);
      }

    } catch (error: any) {
      console.error('Broadcasting error:', error);
      this.error = error.message;
      this.is_broadcasting = false;
      this.cleanupStream();
    }
  }

  async initiateStreamJoin(broadcasterId: string): Promise<void> {
    this.leaveStream();
    this.error = null;

    this.messages = [];
    this.reactions = [];

    try {

      if (!this.remoteVideo) {
        throw new Error('Remote video element reference not initialized');
      }

      this.is_viewing = true;
      console.log('Joining stream for broadcaster:', broadcasterId);

      await this.streamingService.joinStream(
        broadcasterId,
        this.remoteVideo.nativeElement,
        {
          id: '',
          name: this.user_id
        }
      ).then(() => {
        let temp_broadcaster = this.broadcasters.find(b => b.id === broadcasterId);
        if (temp_broadcaster && temp_broadcaster.id !== '') this.currentBroadcaster = temp_broadcaster;
        this.currentBroadcasterId = broadcasterId;
      })

      console.log('Joined stream successfully');
    } catch (error: any) {
      console.error('Failed to join stream:', error);
      this.error = `Failed to join stream: ${error.message}`;
      this.is_viewing = false;
      this.currentBroadcasterId = '';
    }
  }

  getBroadcasterByName(broadcaster_name: string): Broadcaster | undefined {
    let broadcaster = this.broadcasters.find(b => b.name === broadcaster_name);
    console.log(`getBroadcasterByName (${broadcaster_name}) Found: `, broadcaster);
    console.log('Broadcasters:', this.broadcasters);
    // if (this.is_broadcasting && this.user_id == broadcaster?.name) {
    //   this.currentBroadcaster = broadcaster;
    //   this.currentBroadcasterId = broadcaster.id;
    // }
    return broadcaster;
  }

  async leaveStream(): Promise<void> {
    this.error = null;

    try {
      console.log('Leaving stream...');
      await this.streamingService.leaveStream(this.currentBroadcasterId);
      // this.is_viewing = false;
      this.currentBroadcasterId = '';
      console.log('Stream left successfully');
    } catch (error: any) {
      console.error('Failed to leave stream:', error);
      this.error = `Failed to leave stream: ${error.message}`;
      // this.is_viewing = false;
    }
  }

  private cleanupStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.localVideo) {
      this.localVideo.nativeElement.srcObject = null;
    }
    this.requestBroadcastersList();
    this.is_viewing = false;
  }

  stopBroadcast(): void {
    this.cleanupStream();
    this.streamingService.cleanup();
    this.is_broadcasting = false;
    this.error = null;
    this.broadcasters = [];
    this.currentBroadcasterId = '';
    this.requestBroadcastersList();
    this.is_viewing = false;
  }

  sendMessage(message: string) {
    this.streamingService.sendMessage(message, this.currentBroadcasterId, this.user_id);
    this.messages.push({ name: this.user_id, message });
    if (this.autoScrollEnabled) {
      this.scrollToBottom();
    }
  }

  sendReaction(reaction: string) {
    this.streamingService.sendReaction(reaction);
  }

  ngOnDestroy(): void {
    this.stopBroadcast();
  }

}