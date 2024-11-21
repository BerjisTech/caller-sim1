import { Injectable } from '@angular/core';

export interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private events: CalendarEvent[] = [
    {
      id: 0,
      title: 'Linguists meetup, volcun consulate',
      date: new Date(2024, 7, 7),
      description: 'string'
    }
  ];

  constructor() { }

  getEvents(): CalendarEvent[] {
    return this.events;
  }

  addEvent(event: CalendarEvent): void {
    this.events.push(event);
  }

  removeEvent(eventId: number): void {
    this.events = this.events.filter(event => event.id !== eventId);
  }

  updateEvent(updatedEvent: CalendarEvent): void {
    const index = this.events.findIndex(event => event.id === updatedEvent.id);
    if (index !== -1) {
      this.events[index] = updatedEvent;
    }
  }

  getDaysInMonth(year: number, month: number): Date[] {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }
}
