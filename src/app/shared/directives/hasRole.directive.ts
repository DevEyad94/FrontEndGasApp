import {
  Directive,
  Input,
  ViewContainerRef,
  TemplateRef,
  OnInit,
  OnDestroy
} from "@angular/core";
import { take, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { AuthService } from "../services/auth.service";
import { User } from "../../models/user.model";

@Directive({
  selector: "[appHasRole]",
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  @Input() appHasRole: string[] = [];
  isVisible = false;
  private destroy$ = new Subject<void>();

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Initial check with user state
    console.log(this.appHasRole);
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.updateView.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(user: User | null | undefined): void {
    // Clear view initially
    this.viewContainerRef.clear();

    // Check if user is logged in and has a token
    if (user?.token) {
      // Check if any of the required roles match the user's roles
      if (this.appHasRole && this.appHasRole.length > 0) {
        console.log(user);

        // Check if user has any of the required roles
        const hasRequiredRole = this.appHasRole.some(role =>
          user.role.some((userRole: string) => userRole === role)
        );

        if (hasRequiredRole && !this.isVisible) {
          this.isVisible = true;
          this.viewContainerRef.createEmbeddedView(this.templateRef);
        }
      }
    } else if (this.isVisible) {
      // User is not logged in, hide content
      this.isVisible = false;
      this.viewContainerRef.clear();
    }
  }
}
