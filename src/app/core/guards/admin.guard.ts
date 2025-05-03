import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // First check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    // Then check role permissions
    const roles = route.data['roles'] as Array<string>;
    if (!roles || !roles.length) {
      return true; // No specific roles required
    }

    // Check roles against user roles
    const hasRole = this.authService.roleMatch(roles);
    if (hasRole) {
      return true;
    } else {
      this.router.navigate(['/dashboard/default']);
      return false;
    }
  }
}
