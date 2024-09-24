import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {}

  notify(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) {
    console.log(`${type.toUpperCase()}: ${message}`);
  }
}
