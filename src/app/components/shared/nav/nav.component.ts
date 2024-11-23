import { Component } from '@angular/core';
import { DarkModeComponent } from '../dark-mode/dark-mode.component';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [DarkModeComponent],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {

}
