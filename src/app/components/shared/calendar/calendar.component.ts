import { Component, Input, OnInit } from '@angular/core';
import { DAYS_OF_WEEK } from '../../../constants/constants';
import { CalendarEvent } from '../../../interfaces/translation/terms';
import { CalendarService } from '../../../services/call/calendar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})

export class CalendarComponent implements OnInit {
  @Input() mini_calendar: boolean = false;

  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();
  currentMonthName: string = new Date().toLocaleString('default', { month: 'long' });
  daysInMonth: Date[] = [];
  events: CalendarEvent[] = [];
  daysOfWeek: string[] = DAYS_OF_WEEK;

  constructor(private calendarService: CalendarService) { }

  ngOnInit(): void {
    this.loadMonth(this.currentYear, this.currentMonth);
    this.events = this.calendarService.getEvents();
  }

  loadMonth(year: number, month: number): void {
    this.daysInMonth = this.generateCalendarGrid(year, month);
  }

  generateCalendarGrid(year: number, month: number): Date[] {
    const daysInMonth = this.calendarService.getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();
    const leadingEmptyDays = Array(firstDay).fill(null);
    return [...leadingEmptyDays, ...daysInMonth];
  }

  getEventsForDay(date: Date): CalendarEvent[] {
    if (!date) return [];
    return this.events.filter(event => this.isSameDay(new Date(event.date), date));
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }

  isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  addEvent(): void {
    const newEvent: CalendarEvent = {
      id: Date.now(),
      title: 'New Event',
      date: new Date(),
      description: 'Description of the event'
    };
    this.calendarService.addEvent(newEvent);
    this.events = this.calendarService.getEvents();
  }

  removeEvent(eventId: number): void {
    this.calendarService.removeEvent(eventId);
    this.events = this.calendarService.getEvents();
  }

  updateEvent(event: CalendarEvent): void {
    this.calendarService.updateEvent(event);
    this.events = this.calendarService.getEvents();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentYear++;
      this.currentMonth = 0;
    } else {
      this.currentMonth++;
    }
    this.currentMonthName = new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
    this.loadMonth(this.currentYear, this.currentMonth);
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentYear--;
      this.currentMonth = 11;
    } else {
      this.currentMonth--;
    }
    this.currentMonthName = new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
    this.loadMonth(this.currentYear, this.currentMonth);
  }
}
