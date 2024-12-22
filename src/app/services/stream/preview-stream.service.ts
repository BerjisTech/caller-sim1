// preview-stream.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

interface PreviewStream {
  stream: MediaStream;
  lastAccessed: number;
  connectionState: 'connecting' | 'connected' | 'failed' | 'closed';
}

@Injectable({
  providedIn: 'root'
})
export class PreviewStreamService {
  private readonly MAX_CONCURRENT_PREVIEWS = 4;
  private readonly PREVIEW_TIMEOUT = 30000; // 30 seconds
  private previewStreams = new Map<string, PreviewStream>();
  private previewQueue: string[] = [];
  
  private streamStateSubject = new BehaviorSubject<Map<string, PreviewStream>>(new Map());
  public streamState$ = this.streamStateSubject.asObservable();

  constructor() {
    // Periodically cleanup stale previews
    setInterval(() => this.cleanupStaleStreams(), 10000);
  }

  async requestPreview(broadcasterId: string, videoElement: HTMLVideoElement): Promise<void> {
    if (this.previewStreams.size >= this.MAX_CONCURRENT_PREVIEWS) {
      await this.queuePreviewRequest(broadcasterId);
    }

    try {
      const stream = await this.createPreviewStream();
      
      this.previewStreams.set(broadcasterId, {
        stream,
        lastAccessed: Date.now(),
        connectionState: 'connecting'
      });
      
      videoElement.srcObject = stream;
      await videoElement.play();
      
      this.updateStreamState(broadcasterId, 'connected');
      this.processQueue();
    } catch (error: any) {
      this.updateStreamState(broadcasterId, 'failed');
      throw new Error(`Failed to create preview: ${error.message}`);
    }
  }

  private async createPreviewStream(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 320 },
        height: { ideal: 240 },
        frameRate: { ideal: 15 }
      },
      audio: false
    });
  }

  private async queuePreviewRequest(broadcasterId: string): Promise<void> {
    this.previewQueue.push(broadcasterId);
    return new Promise((resolve) => {
      const checkQueue = setInterval(() => {
        if (this.previewStreams.size < this.MAX_CONCURRENT_PREVIEWS) {
          clearInterval(checkQueue);
          resolve();
        }
      }, 100);
    });
  }

  private updateStreamState(broadcasterId: string, state: PreviewStream['connectionState']): void {
    const stream = this.previewStreams.get(broadcasterId);
    if (stream) {
      stream.connectionState = state;
      this.streamStateSubject.next(new Map(this.previewStreams));
    }
  }

  private async processQueue(): Promise<void> {
    if (this.previewQueue.length > 0 && this.previewStreams.size < this.MAX_CONCURRENT_PREVIEWS) {
      const nextBroadcasterId = this.previewQueue.shift();
      if (nextBroadcasterId) {
        const videoElement = document.querySelector(`#preview-${nextBroadcasterId}`) as HTMLVideoElement;
        if (videoElement) {
          await this.requestPreview(nextBroadcasterId, videoElement);
        }
      }
    }
  }

  private cleanupStaleStreams(): void {
    const now = Date.now();
    this.previewStreams.forEach((preview, broadcasterId) => {
      if (now - preview.lastAccessed > this.PREVIEW_TIMEOUT) {
        this.stopPreview(broadcasterId);
      }
    });
  }

  public stopPreview(broadcasterId: string): void {
    const preview = this.previewStreams.get(broadcasterId);
    if (preview) {
      preview.stream.getTracks().forEach(track => track.stop());
      this.previewStreams.delete(broadcasterId);
      this.updateStreamState(broadcasterId, 'closed');
    }
  }

  public cleanup(): void {
    this.previewStreams.forEach((preview, broadcasterId) => {
      this.stopPreview(broadcasterId);
    });
    this.previewQueue = [];
  }
}