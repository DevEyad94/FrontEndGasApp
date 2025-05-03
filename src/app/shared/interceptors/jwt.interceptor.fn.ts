import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

export function jwtInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  console.log('Functional JwtInterceptor running');
  const authService = inject(AuthService);

  let currentUser: any = null;

  // Get the current user synchronously
  authService.currentUser$
    .pipe(take(1))
    .subscribe(user => {
      currentUser = user;
    });

  // If we have a user with a token, add the Authorization header
  if (currentUser && currentUser.token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.token}`
      }
    });
  }

  return next(request);
}
