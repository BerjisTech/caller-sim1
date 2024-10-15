import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private darkModeSubsject = new BehaviorSubject<boolean>(false);
  public dark_mode$ = this.darkModeSubsject.asObservable();

  constructor() {}

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
}
