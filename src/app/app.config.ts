import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
  LOCALE_ID,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions, Router, NavigationEnd, TitleStrategy } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
  Title,
} from '@angular/platform-browser';
import { HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  DATE_PIPE_DEFAULT_OPTIONS,
  DatePipe,
  registerLocaleData,
  ViewportScroller,
} from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';
import localeAr from '@angular/common/locales/ar';
import { errorInterceptor } from './shared/interceptors/error.interceptor.fn';
import { jwtInterceptor } from './shared/interceptors/jwt.interceptor.fn';
import { ToastService } from './shared/services/toast.service';
import { filter } from 'rxjs/operators';
import { CustomTitleStrategy } from './core/services/title.strategy';

// Register locale data
registerLocaleData(localeEn);
registerLocaleData(localeFr);
registerLocaleData(localeAr);

export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Function to initialize smooth scrolling
export function initSmoothScrolling(router: Router) {
  return () => {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Use setTimeout to ensure this runs after Angular's view has been fully updated
      setTimeout(() => {
        // Use smooth scrolling
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }, 0);
    });

    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withViewTransitions()
      // No longer need withInMemoryScrolling since we're manually handling it
    ),
    // Use our custom title strategy
    { provide: TitleStrategy, useClass: CustomTitleStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: initSmoothScrolling,
      deps: [Router],
      multi: true
    },
    provideClientHydration(withEventReplay()),
    // Provide HTTP client with interceptors using the modern API
    provideHttpClient(
      withFetch(),
      withInterceptors([
        // Order matters here - jwt should run before error handler
        jwtInterceptor,
        errorInterceptor
      ])
    ),
    // Register ToastService
    ToastService,
    // Make DatePipe available application-wide
    DatePipe,
    // Provide global locale for date formatting
    { provide: LOCALE_ID, useValue: 'en' },
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: {
        dateFormat: 'yyyy/MM/dd', // You can customize this format
        timezone: 'UTC', // Optional: set timezone
      },
    },
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient],
        },
        defaultLanguage: 'en',
      })
    ),
  ],
};
