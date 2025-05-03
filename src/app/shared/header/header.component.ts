import { Component, AfterViewInit, Inject, PLATFORM_ID, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HasRoleDirective } from '../directives/hasRole.directive';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    HasRoleDirective
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit, OnInit, OnDestroy {
  currentLang: string = 'en';
  isBrowser: boolean;
  darkMode: boolean = false;
  isMobileMenuOpen: boolean = false;
  isLoggedIn: boolean = false;
  private destroy$ = new Subject<void>();

  // Add a MediaQueryList property to track system dark mode preference
  private prefersColorSchemeMedia?: MediaQueryList;

  get languageLabel(): string {
    return this.currentLang !== 'en' ? 'English' : 'عربي';
  }

  constructor(
    private translateService: TranslateService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Get language from localStorage if in browser environment
    if (this.isBrowser) {
      const savedLang = localStorage.getItem('preferredLanguage');
      if (savedLang && ['en', 'ar'].includes(savedLang)) {
        this.translateService.use(savedLang);
        this.currentLang = savedLang;
      } else {
        this.currentLang = this.translateService.currentLang || 'en';
      }

      // Initialize dark mode from localStorage or system preference
      this.initializeDarkMode();
    } else {
      // On server, use English as default since we can't get the current language reliably
      this.currentLang = 'ar';
    }
  }

  ngOnInit(): void {
    // Subscribe to auth state
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user?.token;
      });
  }

  // Handle window resize events
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // If we're in a browser environment and the window width is desktop-sized
    if (this.isBrowser && window.innerWidth >= 1024) { // 1024px is the 'lg' breakpoint in Tailwind
      if (this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
        if (this.isBrowser) {
          document.body.classList.remove('overflow-hidden');
        }
      }
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    if (this.isBrowser) {
      if (this.isMobileMenuOpen) {
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
      }
    }

    console.log('Mobile menu toggled:', this.isMobileMenuOpen);
  }

  closeMobileMenu(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;

      if (this.isBrowser) {
        document.body.classList.remove('overflow-hidden');
      }

      console.log('Mobile menu closed');
    }
  }

  switchLanguage(): void {
    // Toggle between English and Arabic
    const newLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.translateService.use(newLang);
    this.currentLang = newLang;

    // Only use localStorage in browser environment
    if (this.isBrowser) {
      localStorage.setItem('preferredLanguage', newLang);

      // If switching to Arabic, add RTL class to document, otherwise remove it
      if (newLang === 'ar') {
        document.documentElement.dir = 'rtl';
        document.body.classList.add('rtl');
      } else {
        document.documentElement.dir = 'ltr';
        document.body.classList.remove('rtl');
      }
    }
  }

  initializeDarkMode(): void {
    if (!this.isBrowser) return;

    // Check system preference directly
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.prefersColorSchemeMedia = prefersDark;

    // Set dark mode based on system preference
    this.darkMode = prefersDark.matches;
    this.applyDarkMode(this.darkMode);

    // Add listener for system preference changes
    this.prefersColorSchemeMedia.addEventListener('change', (e) => {
      this.darkMode = e.matches;
      this.applyDarkMode(this.darkMode);
    });
  }

  // Helper method to apply dark mode changes
  private applyDarkMode(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Remove toggleDarkMode as it's no longer needed, but keep the method signature
  // as empty to avoid breaking any existing references
  toggleDarkMode(): void {
    // Do nothing - dark mode now follows system preference
  }

  ngAfterViewInit(): void {
    // Only manipulate DOM in browser environment
    if (!this.isBrowser) return;

    // Desktop product dropdown toggle
    const productDropdownToggle = document.getElementById('product-dropdown-toggle');
    const productDropdown = document.getElementById('product-dropdown');

    // Desktop product dropdown toggle
    if (productDropdownToggle && productDropdown) {
      productDropdownToggle.addEventListener('click', () => {
        productDropdown.classList.toggle('hidden');
        const isExpanded = productDropdownToggle.getAttribute('aria-expanded') === 'true';
        productDropdownToggle.setAttribute('aria-expanded', (!isExpanded).toString());
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (event) => {
        if (!productDropdownToggle.contains(event.target as Node) &&
            !productDropdown.contains(event.target as Node)) {
          productDropdown.classList.add('hidden');
          productDropdownToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Clean up the media query listener when component is destroyed
    if (this.isBrowser && this.prefersColorSchemeMedia) {
      this.prefersColorSchemeMedia.removeEventListener('change', (e) => {
        this.darkMode = e.matches;
        this.applyDarkMode(this.darkMode);
      });
    }

    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
    // Navigate to home page after logout
    this.router.navigate(['/']);
    // window.location.href = '/'; // Using window.location to force a full page reload
  }
}
