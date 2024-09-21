import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContentService } from '../../../services/content/content.service';

@Component({
  selector: 'app-dark-mode',
  standalone: true,
  imports: [],
  templateUrl: './dark-mode.component.html',
  styleUrl: './dark-mode.component.scss',
})
export class DarkModeComponent {
  public dark_mode: boolean = false;

  public darkModeSubscription!: Subscription;
  constructor(private contentService: ContentService) {
    this.darkModeSubscription = this.contentService.dark_mode$.subscribe({
      next: (value) => {
        this.dark_mode = value;
        if (value) {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      },
    });
  }

  toggleDarkMode() {
    this.contentService.setDarkMode(!this.dark_mode);
  }
}
