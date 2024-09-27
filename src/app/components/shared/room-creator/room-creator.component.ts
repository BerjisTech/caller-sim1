import { Component } from '@angular/core';
import { SharedModule } from '../../../modules/shared/shared.module';
import { DarkModeComponent } from '../dark-mode/dark-mode.component';
import { TypingEffectComponent } from '../typing-effect/typing-effect.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoomCreatorFormComponent } from "../room-creator-form/room-creator-form.component";
import { CallManagementService } from '../../../services/call/call-management.service';
import { Room } from '../../../interfaces/call/room';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room-creator',
  standalone: true,
  imports: [CommonModule, DarkModeComponent, TypingEffectComponent, RoomCreatorFormComponent ],
  providers: [ReactiveFormsModule, FormsModule],
  templateUrl: './room-creator.component.html',
  styleUrl: './room-creator.component.scss',
})
export class RoomCreatorComponent {
  public active_rooms: Room[] = [];

  constructor(
    private callManagemnent: CallManagementService
  ) {}

  async ngOnInit() {
    this.active_rooms = await this.callManagemnent.getActiveRooms();
  }

}
