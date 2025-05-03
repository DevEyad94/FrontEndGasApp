import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, UserLoginDto, UserResponse } from '../models/user.model';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/Auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) {
      // Skip localStorage operations in server-side rendering
      return;
    }

    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(credentials: UserLoginDto): Observable<User> {
    return this.http.post<UserResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            if (this.isBrowser) {
              localStorage.setItem('currentUser', JSON.stringify(response.data));
              localStorage.setItem('token', response.data.token);
            }
            this.currentUserSubject.next(response.data);
            return response.data;
          } else {
            throw new Error(response.message || 'Login failed');
          }
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getUserInfo(): Observable<User> {
    if (!this.isAuthenticated()) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<UserResponse>(`${this.apiUrl}/me`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to get user info');
          }
        }),
        catchError(error => {
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => error);
        })
      );
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    return !!this.currentUserSubject.value && !!localStorage.getItem('token');
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role.includes(role);
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem('token');
  }
}
