import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  SUB_TAGS_FROM_SUGGESTED_TAGS,
  SUGGESTED_TAGS,
} from '../../../constants/constants';
import { CallManagementService } from '../../../services/call/call-management.service';
import { Room } from '../../../interfaces/call/room';

@Component({
  selector: 'app-room-creator-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './room-creator-form.component.html',
  styleUrl: './room-creator-form.component.scss',
})
export class RoomCreatorFormComponent implements OnInit {
  public rooms: Room[] = [];
  public searching_for_rooms: boolean = false;
  public roomForm: FormGroup;
  public room_id: string = '';
  public tags!: string;
  public tags_array: string[] = [];
  public sugested_tags: string[] = SUGGESTED_TAGS;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private callManagement: CallManagementService
  ) {
    this.roomForm = this.fb.group({
      room_id: [this.generateRoomId()], // Optional field for the room ID
      room_name: [''], // Optional field for the room name
      seats: [2, [Validators.required, Validators.min(1)]], // Seats required, at least 1
      is_private: [false], // Default to public
      password: [''], // Optional password for private rooms
      tags: [''], // Optional tags for the room
    });
  }

  ngOnInit(): void {
    this.room_id = this.generateRoomId();
  }

  async onSubmit() {
    this.searching_for_rooms = true;
    if (this.roomForm.valid) {
      // this.createRoom()
      //   .then(() => {
      //     const roomData = this.roomForm.value;
      //     this.router.navigate(['/lobby', roomData.room_id]);
      //   })
      //   .catch((error) => {
      //     console.error('Error creating room:', error);
      //   });
      await this.callManagement
        .searchRoomsByTags(this.tags_array)
        .then((rooms) => {
          console.log('Rooms found:', rooms);
          this.rooms = rooms;
          this.searching_for_rooms = false;

          // if room count is not 0 join random room otherwise create room with room name
          if (this.rooms.length > 0) {
            // this.router.navigate(['/lobby', this.rooms[0].room_id]);
          } else {
            this.createRoom().then(() => {
              const roomData = this.roomForm.value;
              // this.router.navigate(['/lobby', roomData.room_id]);
            });
          }
        })
        .catch((error) => {
          console.error('Error searching for rooms:', error);
          this.searching_for_rooms = false;
          // create room if no rooms found
          this.createRoom().then(() => {
            const roomData = this.roomForm.value;
            // this.router.navigate(['/lobby', roomData.room_id]);
          });
        });
    }
  }

  async createRoom() {
    if (this.roomForm.valid) {
      const roomData = this.roomForm.value;
      // Handle room creation logic here
      // console.log('Room created:', roomData);
    }
  }

  generateRoomId(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return `${result.substring(0, 3)}-${result.substring(
      4,
      8
    )}-${result.substring(8, 11)}`.toLowerCase();
  }

  addSeats() {
    this.roomForm.controls['seats'].setValue(
      this.roomForm.controls['seats'].value + 1
    );
  }

  removeSeats() {
    if (this.roomForm.controls['seats'].value > 1) {
      this.roomForm.controls['seats'].setValue(
        this.roomForm.controls['seats'].value - 1
      );
    }
  }

  updateTags() {
    this.tags_array = this.tags.split(',');
  }

  removeTag(tag: string) {
    this.tags_array = this.tags_array.filter((t) => t !== tag);
    this.tags = this.tags_array.join(',');

    // Check if tags_array has any array in SUGGESTED_TAGS and revert this.suggested_tags to SUGGESTED_TAGS is no items in tags_array exist in SUGGESTED_TAGS
    if (this.tags_array.length === 0) {
      this.sugested_tags = SUGGESTED_TAGS;
    } else {
      this.sugested_tags = this.sugested_tags.filter(
        (t) => !this.tags_array.includes(t)
      );
    }
  }

  addSuggestedTag(tag: string) {
    // Add if there are no tags or this tag does not exist
    if (!this.tags_array || !this.tags_array.includes(tag)) {
      this.tags_array.push(tag);
      this.tags = this.tags_array.join(',');
    }
    if (SUB_TAGS_FROM_SUGGESTED_TAGS[tag]) {
      this.sugested_tags = SUB_TAGS_FROM_SUGGESTED_TAGS[tag]
        .split(',')
        .map((t) => t.trim());
    } else {
      this.sugested_tags = SUGGESTED_TAGS;
    }
  }
}
