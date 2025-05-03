import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import {
  GenericResponse
} from '../../core/models/user.model';
import { Router } from '@angular/router';
import { User, UserLoginDto } from '../../models/user.model';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.apiUrl + 'auth/';
  private currentUserSource = new ReplaySubject<User | undefined | null>(1); // Buffer size of 1
  currentUser$ = this.currentUserSource.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadCurrentUser();
  }

  login(model: UserLoginDto): Observable<any> {
    return this.http
      .post<GenericResponse<User>>(this.baseUrl + 'login', model)
      .pipe(
        map((response: GenericResponse<User>) => {
          const user = response;
          if (user.data) {
            if (this.isBrowser) {
              localStorage.setItem('userInfo', JSON.stringify(user.data));
            }
            this.setCurrentUser(user.data);
          }
          return response;
        })
      );
  }

  loadCurrentUser(): void {
    if (!this.isBrowser) {
      this.currentUserSource.next(null);
      return;
    }

    const userString = localStorage.getItem('userInfo');
    if (!userString) {
      this.currentUserSource.next(null);
      return;
    }

    const user: User = JSON.parse(userString);

    if (user.token && !this.tokenExpired(user.token)) {
      this.setCurrentUser(user);
    } else {
      this.logout();
    }
  }

  tokenExpired(token: string): boolean {
    try {
      const expiry = JSON.parse(atob(token.split('.')[1])).exp;
      return Math.floor(new Date().getTime() / 1000) >= expiry;
    } catch {
      return true;
    }
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('userInfo');
    }
    this.currentUserSource.next(null);
    this.router.navigate(['/']);
  }

  // register(register: UserRegister): Observable<any> {
  //   return this.http.post(this.baseUrl + 'register', register);
  // }

  setCurrentUser(user: User): void {
    this.currentUserSource.next(user);
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const userString = localStorage.getItem('userInfo');
    if (!userString) return false;

    const user: User = JSON.parse(userString);
    return !!user.token && !this.tokenExpired(user.token);
  }

  resetPassword(userLogin: UserLoginDto): Observable<any> {
    return this.http.post(this.baseUrl + 'RestPassword', userLogin);
  }

  // changePassword(changePassword: ChangePassword): Observable<any> {
  //   return this.http.post(this.baseUrl + 'ChangePassword', changePassword);
  // }

  userExists(userName: string): Observable<any> {
    return this.http.get(this.baseUrl + 'UserExists/' + userName);
  }

  roleMatch(allowedRoles: string[]): boolean {
    let isMatch = false;
    if (allowedRoles) {
      let userInfo: User | undefined | null;
      this.currentUser$.pipe(take(1)).subscribe((user) => {
        userInfo = user;
        if (userInfo?.token) {
          allowedRoles.forEach((r) => {
            const roles = user?.role as any[];
            if (roles && roles.find((e) => e === r)) {
              isMatch = true;
            }
          });
        }
      });
    }
    return isMatch;
  }
}
