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

  getRandomTailwindColorClass(type: 'text' | 'bg') {
    const colors = [
      `${type}-red-500`,
      `${type}-yellow-500`,
      `${type}-green-500`,
      `${type}-blue-500`,
      `${type}-indigo-500`,
      `${type}-purple-500`,
      `${type}-pink-500`,
    ];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }
}
