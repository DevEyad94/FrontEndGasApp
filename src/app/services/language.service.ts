import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private _language = new BehaviorSubject<string>('en');
  language$ = this._language.asObservable();

  constructor(private translate: TranslateService) {
    // Initialize with browser language or default to English
    const browserLang = this.translate.getBrowserLang();
    const defaultLang = browserLang && ['en', 'ar'].includes(browserLang) ? browserLang : 'en';
    this.setLanguage(localStorage.getItem('preferred_language') || defaultLang);
  }

  get currentLanguage(): string {
    return this._language.getValue();
  }

  setLanguage(lang: string): void {
    if (['en', 'ar'].includes(lang)) {
      this.translate.use(lang);
      localStorage.setItem('preferred_language', lang);
      this._language.next(lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }

  toggleLanguage(): void {
    const newLang = this.currentLanguage === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }
}
