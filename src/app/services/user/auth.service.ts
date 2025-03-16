// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private apiUrl = environment.api.url;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')!));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { user: { email, password } })
      .pipe(map(response => {
        // store user details and jwt token in local storage
        localStorage.setItem('currentUser', JSON.stringify(response.data));
        localStorage.setItem('r3_token', response.token);
        this.currentUserSubject.next(response.data);
        return response;
      }));
  }

  register(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/signup`, { user: { email, password } })
      .pipe(map(response => {
        localStorage.setItem('currentUser', JSON.stringify(response.data));
        localStorage.setItem('r3_token', response.token);
        this.currentUserSubject.next(response.data);
        return response;
      }));
  }

  googleAuth() {
    // Open Google OAuth URL in a popup
    const width = 500;
    const height = 600;
    const left = (screen.width / 2) - (width / 2);
    const top = (screen.height / 2) - (height / 2);

    window.open(
      `${this.apiUrl}/auth/google_oauth2`,
      'google_login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  }

  githubAuth() {
    // Open GitHub OAuth URL in a popup
    const width = 500;
    const height = 600;
    const left = (screen.width / 2) - (width / 2);
    const top = (screen.height / 2) - (height / 2);

    window.open(
      `${this.apiUrl}/auth/github`,
      'github_login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  }

  handleOAuthCallback(response: any) {
    if (response.data && response.token) {
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      localStorage.setItem('r3_token', response.token);
      this.currentUserSubject.next(response.data);
    }
  }

  logout() {
    this.http.delete(`${this.apiUrl}/logout`).pipe(
      map(() => {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
      })
    );
    // Send to /
    window.location.href = '/';
  }
}