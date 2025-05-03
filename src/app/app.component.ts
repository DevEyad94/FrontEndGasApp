import { Component, inject, PLATFORM_ID, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AuthService } from './shared/services/auth.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Gas Condensate Management';
  isLoggedIn = false;
  currentUser: User | null = null;
  showUserMenu = false;
  showMobileMenu = false;
  private authSubscription: Subscription | null = null;

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router
  ) {
    // Set the default language (do this first)
    this.translate.setDefaultLang('en');

    // If the browser's language is available, use it
    if (isPlatformBrowser(this.platformId)) {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang) {
        const langs = ['en', 'ar'];
        this.translate.use(langs.includes(browserLang) ? browserLang : 'en');
      } else {
        this.translate.use('en');
      }
      this.initializeDarkMode();
    }
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user || null;
      this.isLoggedIn = !!user;
      console.log('currentUser', this.currentUser);
      console.log('isLoggedIn', this.isLoggedIn);
      if (!this.isLoggedIn) {
        this.router.navigate(['/']);
      }
      if (this.isLoggedIn) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu(): void {
    console.log('Mobile menu toggling is now handled by HeaderComponent');
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
    this.showMobileMenu = false;
  }

  private initializeDarkMode(): void {
    // Check if dark mode preference exists in localStorage
    const darkModePreference = localStorage.getItem('color-scheme');

    // If preference exists, set dark mode accordingly
    if (darkModePreference === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (darkModePreference === 'light') {
      document.documentElement.classList.remove('dark');
    }
    // If no preference, check for system preference
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }
}
