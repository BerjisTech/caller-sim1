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
  }

  getDarkMode() {
    return this.darkModeSubsject.value;
  }
}
