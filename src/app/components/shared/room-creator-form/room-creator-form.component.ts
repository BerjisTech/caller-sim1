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
import { SignalingService } from '../../../services/realtime/signaling.service';
import { Profile } from '../../../interfaces/user/profile';
import { faker } from '@faker-js/faker';

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
  public name: string = '';
  public tags!: string;
  public tags_array: string[] = [];
  public sugested_tags: string[] = SUGGESTED_TAGS;
  public profile: Profile = {
    user_id: Math.random().toString(36).substring(7),
    is_anonymous: true,
    is_authenticated: false,
    is_superuser: false,
    is_staff: false,
    username: faker.internet.userName(),
    email: faker.internet.email(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    full_name: faker.person.fullName(),
    avatar: faker.image.avatar(),
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private callManagement: CallManagementService,
    private signalingService: SignalingService
  ) {
    this.roomForm = this.fb.group({
      name: [this.generateRoomId()], // Optional field for the room ID
      seats: [2, [Validators.required, Validators.min(1)]], // Seats required, at least 1
      is_private: [false], // Default to public
      password: [''], // Optional password for private rooms
      tags: [''], // Optional tags for the room
    });
  }

  async ngOnInit() {
    this.name = this.generateRoomId();
    await this.callManagement.getProfile('12345').then((profile) => {
      if (profile) {
        this.profile = profile;
        this.profile.is_anonymous = false;
        this.profile.is_authenticated = true;
        this.profile.is_superuser = true;
        this.profile.is_staff = true;
      }
    });
  }

  async joinRoom(event: Event) {
    event.preventDefault();
    this.searching_for_rooms = true;
    if (this.roomForm.valid) {
      await this.callManagement
        .searchRoomsByTags(this.tags_array)
        .then((rooms) => {
          this.rooms = rooms;

          // if room count is not 0 join random room otherwise create room with room name
          if (this.rooms.length > 0) {
            // Join random room
            let room =
              this.rooms[Math.floor(Math.random() * this.rooms.length)];
            this.router.navigate(['/lobby', room.name]);
          } else {
            this.hostRoom(event);
          }

          this.searching_for_rooms = false;
        })
        .catch((error) => {
          console.error('Error searching for rooms:', error);
          this.searching_for_rooms = false;
          // create room if no rooms found
          this.createRoom().then(() => {
            const roomData = this.roomForm.value;
            this.router.navigate(['/lobby', roomData.name]);
          });
        });
    }
  }

  async hostRoom(event: Event) {
    event.preventDefault();
    if (this.roomForm.valid) {
      await this.createRoom().then(() => {
        const roomData = this.roomForm.value;
        this.router.navigate(['/lobby', roomData.name]);
      });
    }
  }

  async createRoom() {
    if (this.roomForm.valid) {
      const roomData = this.roomForm.value;
      // Pass the tags_array directly, which will contain the tags in array form
      roomData.tags = this.tags_array.length > 0 ? this.tags_array : [''];
      await this.callManagement.createRoom(roomData, this.profile).then(() => {
        this.signalingService.createRoom(roomData.name, this.profile.user_id);
      });
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
