import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export function jwtInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  console.log('Functional JwtInterceptor running');
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // Only run in browser environment
  if (isBrowser) {
    // Get the user directly from localStorage instead of injecting AuthService
    const userString = localStorage.getItem('userInfo');

    if (userString) {
      try {
        const user = JSON.parse(userString);

        // If we have a user with a token, add the Authorization header
        if (user && user.token) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${user.token}`
            }
          });
        }
      } catch (error) {
        console.error('Error parsing user from localStorage', error);
      }
    }
  }

  return next(request);
}
