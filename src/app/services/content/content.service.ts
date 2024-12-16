import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private darkModeSubsject = new BehaviorSubject<boolean>(false);
  public dark_mode$ = this.darkModeSubsject.asObservable();

  constructor() { }

  setDarkMode(value: boolean) {
    this.darkModeSubsject.next(value);
    // Save to local storage
    localStorage.setItem('darkMode', value ? 'true' : 'false');
  }

  getDarkMode() {
    // Check local storage
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode) {
      this.darkModeSubsject.next(darkMode === 'true');
    }
    return this.darkModeSubsject.value;
  }

  copyContent(content: string) {
    navigator.clipboard.writeText(content);
  }

  randomSeconds() {
    const min = 1;
    const max = 3;
    const random = Math.random() * (max - min) + min;
    return `${random}s`;
  }

  getRandomPosition() {
    // [style.left.%]
    return Math.random() * 100;
  }

  getRandomTailwindColorClass() {
    const colors = [
      'red-500',
      'yellow-500',
      'green-500',
      'blue-500',
      'indigo-500',
      'purple-500',
      'pink-500',
    ];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }
}
