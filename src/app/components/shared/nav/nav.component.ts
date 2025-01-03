import { Component } from '@angular/core';
import { DarkModeComponent } from '../dark-mode/dark-mode.component';
import { LoginComponent } from "../../auth/login/login.component";

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [DarkModeComponent, LoginComponent],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {

}
