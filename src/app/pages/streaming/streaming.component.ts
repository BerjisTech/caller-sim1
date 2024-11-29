import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamingService, Broadcaster } from '../../services/stream/streaming.service';
import { faker } from '@faker-js/faker';

@Component({
  selector: 'app-streaming',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './streaming.component.html',
  styleUrls: ['./streaming.component.scss'],
  providers: [StreamingService]
})
export class StreamingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('localVideo', { static: true }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: true }) remoteVideo!: ElementRef<HTMLVideoElement>;

  broadcasters: Broadcaster[] = [];
  is_broadcasting = false;
  is_viewing = false;
  error: string | null = null;
  userId: string;
  currentBroadcaster: Broadcaster | null = null;
  currentBroadcasterId!: string;
  private stream: MediaStream | null = null;

  constructor(private streamingService: StreamingService) {
    this.userId = `${faker.person.zodiacSign()}_${faker.animal.type()}`;
  }

  ngOnInit(): void {
    console.log('Component initialized');
    this.streamingService.broadcasters$.subscribe({
      next: (broadcasters) => {
        // check if broadcasters has currentBroadcasterId
        // Update current broadcaster info if we're viewing
        if (this.currentBroadcaster) {
          this.currentBroadcaster = broadcasters.find(b => b.id === this.currentBroadcaster?.id) || null;
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
          this.userId
        );

        this.is_broadcasting = true;
        console.log('Broadcasting started successfully');
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

    try {
      this.currentBroadcaster = this.broadcasters.find(b => b.id === broadcasterId) || null;
      this.currentBroadcasterId = broadcasterId;

      if (!this.remoteVideo) {
        throw new Error('Remote video element reference not initialized');
      }

      this.is_viewing = true;
      console.log('Joining stream for broadcaster:', broadcasterId);

      await this.streamingService.joinStream(
        broadcasterId,
        this.remoteVideo.nativeElement
      );

      console.log('Joined stream successfully');
    } catch (error: any) {
      console.error('Failed to join stream:', error);
      this.error = `Failed to join stream: ${error.message}`;
      this.is_viewing = false;
      this.currentBroadcaster = null;
      this.currentBroadcasterId = '';
    }
  }

  getBroadcasterByName(broadcaster_name: string): Broadcaster | undefined {
    console.log('Current broadcaster:', this.currentBroadcasterId);
    return this.broadcasters.find(b => b.name === broadcaster_name);
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
    this.currentBroadcaster = null;
    this.currentBroadcasterId = '';
    this.requestBroadcastersList();
    this.is_viewing = false;
  }

  ngOnDestroy(): void {
    this.stopBroadcast();
  }
}