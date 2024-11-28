import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamingService, Broadcaster } from '../../services/stream/streaming.service';
import { faker } from '@faker-js/faker';

@Component({
  selector: 'app-streaming',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './streaming.component.html',
  styleUrls: ['./streaming.component.scss'],
  providers: [StreamingService], // Ensure the service is available
})
export class StreamingComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  
  broadcasters: Broadcaster[] = [];
  is_broadcasting = false;
  isViewing = false;
  userId: string;

  constructor(private streamingService: StreamingService) {
    this.userId = `${faker.person.zodiacSign()}_${faker.animal.type()}`;
  }

  ngOnInit(): void {
    this.streamingService.broadcasters$.subscribe(
      broadcasters => {
        console.log('Received broadcasters:', broadcasters);
        this.broadcasters = broadcasters;
      }
    );
  }

  async startBroadcast(): Promise<void> {
    try {
      if (!this.localVideo) {
        throw new Error('Local video element not found');
      }

      await this.streamingService.startBroadcaster(
        this.localVideo.nativeElement,
        this.userId
      );
      
      this.is_broadcasting = true;
      console.log('Broadcasting started successfully');
    } catch (error) {
      console.error('Failed to start broadcasting:', error);
      alert('Failed to start broadcasting. Please check your camera and microphone permissions.');
    }
  }

  async joinStream(broadcasterId: string): Promise<void> {
    try {
      if (!this.remoteVideo) {
        throw new Error('Remote video element not found');
      }

      await this.streamingService.joinStream(
        broadcasterId,
        this.remoteVideo.nativeElement
      );
      
      this.isViewing = true;
      console.log('Joined stream successfully');
    } catch (error) {
      console.error('Failed to join stream:', error);
      alert('Failed to join stream. Please try again.');
    }
  }

  stopBroadcast(): void {
    this.streamingService.cleanup();
    this.is_broadcasting = false;
  }

  ngOnDestroy(): void {
    this.streamingService.cleanup();
  }
}