import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DarkModeComponent } from "../dark-mode/dark-mode.component";
import { AuthService } from '../../../services/user/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DarkModeComponent],
  providers: [AuthService],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent implements OnInit {

  public menu_width: number = 50;
  public page_width: number = window.innerWidth - this.menu_width;
  public expanded_menu: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user) => {
      console.log(user);
      if (!user) {
        console.log('no user');
        this.authService.logout();
      }
    });
  }

  toggleMenu() {
    this.expanded_menu = !this.expanded_menu;
    this.menu_width = this.expanded_menu ? 400 : 50;
    this.page_width = window.innerWidth - this.menu_width;
  }

}
