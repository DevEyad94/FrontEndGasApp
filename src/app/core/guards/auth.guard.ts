import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserInfo } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Check if user is logged in using the improved isLoggedIn method
    if (this.authService.isLoggedIn()) {
      // Check if route has specific roles required
      const roles = route.data['roles'] as Array<string>;
      if (roles && roles.length > 0) {
        // Check if user has required roles
        const hasRole = this.authService.roleMatch(roles);
        if (!hasRole) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }
      // No specific roles required, just authenticated
      return true;
    }

    // Not logged in, redirect to login with return URL
    this.router.navigate(['/admin/login'], {
      queryParams: {
        returnUrl: state.url !== '/dashboard/default' ? state.url : null
      }
    });
    return false;
  }
}
