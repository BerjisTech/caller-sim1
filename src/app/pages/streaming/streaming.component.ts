import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamingService, Broadcaster } from '../../services/stream/streaming.service';
import { faker } from '@faker-js/faker';

@Component({
  selector: 'app-streaming',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="streaming-container">
      <div class="broadcaster-list">
        <h2>Available Broadcasters</h2>
        <div *ngIf="broadcasters.length === 0" class="no-broadcasters">
          No active broadcasters
        </div>
        <ul>
          <li *ngFor="let broadcaster of broadcasters">
            <span>Broadcaster: {{ broadcaster.name || broadcaster.id }}</span>
            <button (click)="joinStream(broadcaster.id)" 
                    [disabled]="is_broadcasting">Join Stream</button>
          </li>
        </ul>
      </div>

      <div class="video-section">
        <div class="local-video-container">
          <h3>Your Video</h3>
          <video #localVideo 
                 autoplay 
                 muted 
                 playsinline 
                 [style.display]="is_broadcasting ? 'block' : 'none'"></video>
          <div *ngIf="error" class="error-message">{{ error }}</div>
        </div>
        
        <div class="remote-video-container" *ngIf="is_viewing">
          <h3>Remote Stream</h3>
          <video #remoteVideo autoplay playsinline></video>
        </div>
      </div>

      <div class="controls">
        <button (click)="startBroadcast()" 
                [disabled]="is_broadcasting || is_viewing">
          {{ is_broadcasting ? 'Broadcasting...' : 'Start Broadcasting' }}
        </button>
        <button (click)="stopBroadcast()" 
                *ngIf="is_broadcasting">
          Stop Broadcasting
        </button>
      </div>
    </div>
  `,
  styles: [`
    .streaming-container {
      padding: 20px;
    }
    
    .video-section {
      display: flex;
      gap: 20px;
      margin: 20px 0;
    }
    
    video {
      width: 100%;
      max-width: 400px;
      background: #000;
      border-radius: 8px;
    }
    
    .error-message {
      color: red;
      margin-top: 10px;
    }
    
    .controls {
      display: flex;
      gap: 10px;
    }
    
    button {
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class StreamingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('localVideo', { static: true }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  broadcasters: Broadcaster[] = [];
  is_broadcasting = false;
  is_viewing = false;
  error: string | null = null;
  userId: string;
  private stream: MediaStream | null = null;

  constructor(private streamingService: StreamingService) {
    this.userId = `${faker.person.zodiacSign()}_${faker.animal.type()}`;
  }

  ngOnInit(): void {
    console.log('Component initialized');
    this.streamingService.broadcasters$.subscribe((broadcasters) => {
      try {
        this.broadcasters = broadcasters;
        console.log('Received broadcasters in component:', broadcasters);
      } catch (error: any) {
        console.error('Failed to update broadcasters:', error);
      }
    })

    // Explicitly request broadcasters on init
    this.streamingService.getAvailableBroadcasters();
  }

  ngAfterViewInit(): void {
    if (this.localVideo) {
      console.log('Local video element initialized');
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

      // First try to get the stream directly
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        console.log('Media stream obtained:', this.stream);
        this.localVideo.nativeElement.srcObject = this.stream;

        // Wait for the video to be ready
        await new Promise<void>((resolve) => {
          this.localVideo.nativeElement.onloadedmetadata = () => resolve();
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

      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
    }
  }

  async joinStream(broadcasterId: string): Promise<void> {
    this.error = null;

    try {
      if (!this.remoteVideo) {
        throw new Error('Remote video element not found');
      }

      await this.streamingService.joinStream(
        broadcasterId,
        this.remoteVideo.nativeElement
      );

      this.is_viewing = true;
      console.log('Joined stream successfully');
    } catch (error: any) {
      console.error('Failed to join stream:', error);
      this.error = `Failed to join stream: ${error.message}`;
      this.is_viewing = false;
    }
  }

  stopBroadcast(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.localVideo) {
      this.localVideo.nativeElement.srcObject = null;
    }

    this.streamingService.cleanup();
    this.is_broadcasting = false;
    this.error = null;
  }

  ngOnDestroy(): void {
    this.stopBroadcast();
  }
}