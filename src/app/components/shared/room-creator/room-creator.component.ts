import { Component } from '@angular/core';
import { SharedModule } from '../../../modules/shared/shared.module';
import { DarkModeComponent } from '../dark-mode/dark-mode.component';
import { TypingEffectComponent } from '../typing-effect/typing-effect.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoomCreatorFormComponent } from "../room-creator-form/room-creator-form.component";

@Component({
  selector: 'app-room-creator',
  standalone: true,
  imports: [DarkModeComponent, TypingEffectComponent, RoomCreatorFormComponent],
  providers: [ReactiveFormsModule, FormsModule],
  templateUrl: './room-creator.component.html',
  styleUrl: './room-creator.component.scss',
})
export class RoomCreatorComponent {}
