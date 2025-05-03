import { Component, inject, PLATFORM_ID, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { FooterComponent } from './shared/footer/footer.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'GraveNew';

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Set the default language (do this first)
    translate.setDefaultLang('en');
    translate.use('en'); // Set an initial language to avoid undefined issues

    // Only access localStorage in the browser environment
    if (isPlatformBrowser(this.platformId)) {
      // First check if there's a saved preference in localStorage
      const savedLang = localStorage.getItem('preferredLanguage');
      if (savedLang && ['en', 'ar'].includes(savedLang)) {
        translate.use(savedLang);

        // Set document direction based on language
        if (savedLang === 'ar') {
          document.documentElement.dir = 'rtl';
          document.body.classList.add('rtl');
        } else {
          document.documentElement.dir = 'ltr';
          document.body.classList.remove('rtl');
        }
      } else {
        try {
          // Use browser language if available, otherwise use Arabic
          // const browserLang = translate.getBrowserLang();
          // const lang = browserLang && ['en', 'ar'].includes(browserLang) ? browserLang : 'ar';
          const lang = 'en';
          translate.use(lang);

          // Save this language preference
          localStorage.setItem('preferredLanguage', lang);

          // Set document direction based on language
          if (lang === 'en') {
            document.documentElement.dir = 'ltr';
            document.body.classList.remove('rtl');
          } else {
            document.documentElement.dir = 'rtl';
            document.body.classList.add('rtl');
          }
        } catch (error) {
          console.warn('Error setting language from browser:', error);
          // Fallback to Arabic on error
          translate.use('en');
        }
      }

      // Initialize dark mode from localStorage or system preference
      this.initializeDarkMode();
    } else {
      // Default to English on the server
      translate.use('en');
    }
  }

  private initializeDarkMode(): void {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // If no saved preference, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }
}
