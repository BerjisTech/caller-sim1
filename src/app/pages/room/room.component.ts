import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DarkModeComponent } from "../../components/shared/dark-mode/dark-mode.component";

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DarkModeComponent],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
})
export class RoomComponent implements OnInit {
  public room_id: string = '';
  public streams: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  public video_sizes: {
    width: number; // grid-template-columns count
    height: number; // grid-template-rows count
  } = {
    width: 1,
    height: 1,
  };

  ngOnInit(): void {
    this.updateVideoSizes();
  }

  updateVideoSizes(): void {
    this.video_sizes = this.calculateVideoSizes();
  }

  calculateVideoSizes(): { width: number; height: number } {
    const num_streams = this.streams.length;

    const width = Math.ceil(Math.sqrt(num_streams)); // Dynamic column count
    const height = Math.ceil(num_streams / width);  // Dynamic row count

    return { width, height };
  }

  // Generate grid styles dynamically
  getGridStyles(): any {
    const columns = `repeat(${this.video_sizes.width}, 1fr)`;
    const rows = `repeat(${this.video_sizes.height}, 1fr)`;
    return {
      'grid-template-columns': columns,
      'grid-template-rows': rows,
    };
  }
}
