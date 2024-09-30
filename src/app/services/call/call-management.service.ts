import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Room } from '../../interfaces/call/room';
import { defaultProfile, Profile } from '../../interfaces/user/profile';

@Injectable({
  providedIn: 'root',
})
export class CallManagementService {
  constructor(private http: HttpClient) {}

  async getProfile(profile_id: string): Promise<Profile> {
    const base_url = window.location.origin;
    try {
      const profile: Profile = await firstValueFrom(
        this.http.get<Profile>(`${base_url}/api/profiles/${profile_id}`)
      );
      return profile;
    } catch (error: any) {
      // Check if the error message contains "Couldn't find Profile"
      if (error?.error?.message?.includes("Couldn't find Profile")) {
        console.warn(
          `Profile with id ${profile_id} not found, returning default profile.`
        );
        return defaultProfile;
      } else {
        // Log any other unexpected errors
        console.error('An unexpected error occurred:', error);
        return defaultProfile;
      }
    }
  }

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
      this.http.get<Room[]>(`${base_url}/api/rooms/tags`, {
        params: {
          tags: tags.join(','),
        },
      })
    );
    return active_rooms;
  }

  async createRoom(room_data: Room, room_host: Profile): Promise<Room> {
    const base_url = window.location.origin;
    const new_room: Room = await firstValueFrom(
      this.http.post<Room>(`${base_url}/api/rooms`, { room_data, room_host })
    );
    return new_room;
  }

  async getRoom(name: string): Promise<Room> {
    const base_url = window.location.origin;
    const room: Room = await firstValueFrom(
      this.http.get<Room>(`${base_url}/api/rooms/${name}`)
    );
    return room;
  }
}
