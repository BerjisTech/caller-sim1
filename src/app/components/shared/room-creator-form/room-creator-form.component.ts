import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
    this.roomForm = this.fb.group({
      room_id: [Math.random().toString(36).substring(7)], // Optional field for the room ID
      room_name: [''], // Optional field for the room name
      seats: [1, [Validators.required, Validators.min(1)]], // Seats required, at least 1
      is_private: [false], // Default to public
      password: [''], // Optional password for private rooms
    });
  }

  ngOnInit(): void {
    this.room_id = Math.random().toString(36).substring(7);
  }

  onSubmit() {
    if (this.roomForm.valid) {
      const roomData = this.roomForm.value;
      // Handle room creation logic here
      console.log('Room created:', roomData);
    }
  }

  createRoom(event: Event) {
    event.preventDefault();
    if (this.roomForm.valid) {
      const roomData = this.roomForm.value;
      // Handle room creation logic here
      console.log('Room created:', roomData);
    }
  }
}
