import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class DateFormatterService {
  constructor(
    private datePipe: DatePipe,
    private translateService: TranslateService
  ) {}

  /**
   * Format a date with the current locale
   * @param date The date to format
   * @param format The format string (default: 'mediumDate')
   * @returns The formatted date string
   */
  formatDate(date: Date | string | number, format: string = 'mediumDate'): string {
    return this.datePipe.transform(date, format, undefined, this.translateService.currentLang) || '';
  }

  /**
   * Format a date as short date (e.g., 1/2/2020)
   */
  formatShortDate(date: Date | string | number): string {
    return this.formatDate(date, 'shortDate');
  }

  /**
   * Format a date as long date (e.g., January 2, 2020)
   */
  formatLongDate(date: Date | string | number): string {
    return this.formatDate(date, 'longDate');
  }

  /**
   * Format a date with time (e.g., Jan 2, 2020, 1:30:15 PM)
   */
  formatDateTime(date: Date | string | number): string {
    return this.formatDate(date, 'medium');
  }

  formatDateForAPI(dateString: string): string {
    const date = new Date(dateString);
    // Set to noon to avoid timezone issues
    date.setHours(12, 0, 0, 0);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }
}
