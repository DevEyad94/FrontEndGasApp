import { Directive, Input, ViewContainerRef, TemplateRef, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { User } from '../../models/user.model';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appIsAuth]',
  standalone: true
})
export class IsAuthDirective implements OnInit, OnDestroy {
  @Input() appIsAuth: boolean = true; // Default to showing only when authenticated
  private isVisible = false;
  private destroy$ = new Subject<void>();

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
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

    // Check if user is authenticated (has token)
    const isAuthenticated = !!user?.token;

    // Show element if:
    // - appIsAuth=true AND user is authenticated, OR
    // - appIsAuth=false AND user is NOT authenticated
    if ((this.appIsAuth && isAuthenticated) || (!this.appIsAuth && !isAuthenticated)) {
      if (!this.isVisible) {
        this.isVisible = true;
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      }
    } else if (this.isVisible) {
      this.isVisible = false;
      this.viewContainerRef.clear();
    }
  }
}
