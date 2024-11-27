import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { StreamingService } from '../../services/stream/streaming.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-streaming',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './streaming.component.html',
  styleUrls: ['./streaming.component.scss'],
  providers: [StreamingService], // Ensure the service is available
})
export class StreamingComponent implements OnInit {
  @ViewChild('localVideo', { static: true }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: false }) remoteVideo?: ElementRef<HTMLVideoElement>;
  public broadcasters: Array<{ id: string; name?: string }> = [];

  constructor(private streamingService: StreamingService) { }

  ngOnInit(): void {
    this.streamingService.getAvailableBroadcasters()
    this.broadcasters = this.streamingService.broadcasters;
  }

  async startBroadcast(): Promise<void> {
    if (this.localVideo) {
      await this.streamingService.startBroadcaster(this.localVideo.nativeElement);
    }
  }

  async joinStream(broadcasterId: string): Promise<void> {
    if (this.remoteVideo) {
      await this.streamingService.joinStream(broadcasterId, this.remoteVideo.nativeElement);
    }
  }
}
