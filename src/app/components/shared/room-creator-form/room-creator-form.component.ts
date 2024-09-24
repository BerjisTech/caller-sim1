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

@Component({
  selector: 'app-room-creator-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './room-creator-form.component.html',
  styleUrl: './room-creator-form.component.scss',
})
export class RoomCreatorFormComponent implements OnInit {
  public roomForm: FormGroup;
  public room_id: string = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.roomForm = this.fb.group({
      room_id: [this.generateRoomId()], // Optional field for the room ID
      room_name: [''], // Optional field for the room name
      seats: [2, [Validators.required, Validators.min(1)]], // Seats required, at least 1
      is_private: [false], // Default to public
      password: [''], // Optional password for private rooms
    });
  }

  ngOnInit(): void {
    this.room_id = this.generateRoomId();
  }

  onSubmit() {
    if (this.roomForm.valid) {
      this.createRoom()
        .then(() => {
          const roomData = this.roomForm.value;
          this.router.navigate(['/lobby', roomData.room_id]);
        })
        .catch((error) => {
          console.error('Error creating room:', error);
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
}
