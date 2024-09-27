import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Room } from '../../interfaces/call/room';

@Injectable({
  providedIn: 'root'
})
export class CallManagementService {

  constructor(
    private http: HttpClient
  ) { }

  async getActiveRooms(): Promise<Room[]> {
    const base_url = window.location.origin;
    const active_rooms: Room[] = await firstValueFrom(
      this.http.get<Room[]>(`${base_url}/api/rooms/active`)
    );
    return active_rooms;
  }

  async searchRoomsByTags(tags: string[]): Promise<Room[]> {
    const base_url = window.location.origin;
    const active_rooms: Room[] = await firstValueFrom(
      this.http.post<Room[]>(`${base_url}/api/rooms/tags`, { tags })
    );
    return active_rooms;
  }
}
