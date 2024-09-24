import { Injectable } from '@angular/core';
import { defaultProfile, Profile } from '../../interfaces/user/profile';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor() {}

  async getUser(): Promise<Profile> {
    return defaultProfile;
  }
}
