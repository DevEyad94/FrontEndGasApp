import { Component, OnInit, Output, EventEmitter, Input, forwardRef, HostBinding, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder: string = 'Select date';
  @Input() required: boolean = false;
  @Input() errorMessage: string = '';
  @Output() dateSelected = new EventEmitter<Date>();

  showDatepicker: boolean = false;
  selectedDate: Date | null = null;
  displayValue: string = '';
  disabled: boolean = false;
  touched: boolean = false;
  hasErrors: boolean = false;

  // RTL support
  isRtl: boolean = false;

  // View mode
  viewMode: 'days' | 'months' | 'years' = 'days';
  decadeStart: number = Math.floor(new Date().getFullYear() / 10) * 10;
  displayedYears: number[] = [];

  // Calendar state
  currentMonth: Date = new Date();
  weeks: Array<Array<Day>> = [];
  weekdays: string[] = [];
  months: string[] = [];

  // For month/year dropdowns
  currentMonthIndex: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  availableYears: number[] = [];
  yearRange: number = 20; // Years to show in dropdown

  // Translation keys
  private readonly dayKeys = [
    'DATE_PICKER.DAYS.SUNDAY',
    'DATE_PICKER.DAYS.MONDAY',
    'DATE_PICKER.DAYS.TUESDAY',
    'DATE_PICKER.DAYS.WEDNESDAY',
    'DATE_PICKER.DAYS.THURSDAY',
    'DATE_PICKER.DAYS.FRIDAY',
    'DATE_PICKER.DAYS.SATURDAY'
  ];

  private readonly monthKeys = [
    'DATE_PICKER.MONTHS.JANUARY',
    'DATE_PICKER.MONTHS.FEBRUARY',
    'DATE_PICKER.MONTHS.MARCH',
    'DATE_PICKER.MONTHS.APRIL',
    'DATE_PICKER.MONTHS.MAY',
    'DATE_PICKER.MONTHS.JUNE',
    'DATE_PICKER.MONTHS.JULY',
    'DATE_PICKER.MONTHS.AUGUST',
    'DATE_PICKER.MONTHS.SEPTEMBER',
    'DATE_PICKER.MONTHS.OCTOBER',
    'DATE_PICKER.MONTHS.NOVEMBER',
    'DATE_PICKER.MONTHS.DECEMBER'
  ];

  // ControlValueAccessor implementation
  onChange: any = () => {};
  onTouched: any = () => {
    this.touched = true;
  };

  constructor(private translateService: TranslateService, private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (this.showDatepicker && !this.elementRef.nativeElement.contains(event.target)) {
      this.showDatepicker = false;
    }
  }

  ngOnInit(): void {
    this.setupLanguage();
    this.generateAvailableYears();
    this.generateDisplayedYears();
    this.generateCalendar();

    // Listen for language changes
    this.translateService.onLangChange.subscribe(() => {
      this.setupLanguage();
      this.generateCalendar();
    });
  }

  setupLanguage(): void {
    const currentLang = this.translateService.currentLang;
    this.isRtl = currentLang === 'ar';

    // Translate weekdays
    this.weekdays = this.dayKeys.map(key => this.translateService.instant(key));

    // Translate months
    this.months = this.monthKeys.map(key => this.translateService.instant(key));

    // Update display value if we have a selected date
    if (this.selectedDate) {
      this.updateDisplayValue();
    }
  }

  toggleDatepicker(event?: Event): void {
    if (event) {
      event.stopPropagation(); // Prevent immediate closing when opening
    }
    this.showDatepicker = !this.showDatepicker;
    if (this.showDatepicker) {
      // When opening, update current month to selected date or current date
      this.currentMonth = this.selectedDate || new Date();
      this.currentMonthIndex = this.currentMonth.getMonth();
      this.currentYear = this.currentMonth.getFullYear();
      this.viewMode = 'days';
      this.generateCalendar();
    }
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from the previous month's last days to fill the first week
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysInMonth = lastDay.getDate();

    // Create a new date array
    this.weeks = [];
    let week: Day[] = [];

    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - startingDayOfWeek + i + 1);
      week.push({
        date: prevDate,
        day: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: this.isToday(prevDate),
        isSelected: this.isSelected(prevDate)
      });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      week.push({
        date: date,
        day: i,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        isSelected: this.isSelected(date)
      });

      if (week.length === 7) {
        this.weeks.push(week);
        week = [];
      }
    }

    // Add next month's days
    if (week.length > 0) {
      const daysToAdd = 7 - week.length;
      for (let i = 1; i <= daysToAdd; i++) {
        const nextDate = new Date(year, month + 1, i);
        week.push({
          date: nextDate,
          day: i,
          isCurrentMonth: false,
          isToday: this.isToday(nextDate),
          isSelected: this.isSelected(nextDate)
        });
      }
      this.weeks.push(week);
    }
  }

  generateAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - Math.floor(this.yearRange / 2);
    const endYear = currentYear + Math.ceil(this.yearRange / 2);

    this.availableYears = [];
    for (let year = startYear; year <= endYear; year++) {
      this.availableYears.push(year);
    }
  }

  generateDisplayedYears(): void {
    this.displayedYears = [];
    // Show 12 years - 4 columns x 3 rows
    for (let i = 0; i < 12; i++) {
      this.displayedYears.push(this.decadeStart + i);
    }
  }

  onMonthChange(): void {
    this.currentMonth = new Date(this.currentYear, this.currentMonthIndex, 1);
    this.generateCalendar();
  }

  onYearChange(): void {
    this.currentMonth = new Date(this.currentYear, this.currentMonthIndex, 1);
    this.generateCalendar();
  }

  prevMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.currentMonthIndex = this.currentMonth.getMonth();
    this.currentYear = this.currentMonth.getFullYear();
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.currentMonthIndex = this.currentMonth.getMonth();
    this.currentYear = this.currentMonth.getFullYear();
    this.generateCalendar();
  }

  selectDate(day: Day): void {
    // Create a date with the time set to noon to avoid timezone issues
    const selectedDate = new Date(day.date);
    selectedDate.setHours(12, 0, 0, 0);

    this.selectedDate = selectedDate;
    this.updateDisplayValue();
    this.dateSelected.emit(this.selectedDate);
    this.onChange(this.selectedDate);
    this.onTouched();
    this.showDatepicker = false;
    this.generateCalendar(); // Update calendar to show selected date
  }

  clearDate(): void {
    this.selectedDate = null;
    this.displayValue = '';
    this.dateSelected.emit(null as any);
    this.onChange(null);
    this.showDatepicker = false;
  }

  setToday(): void {
    const today = new Date();
    // Set to noon to avoid timezone issues
    today.setHours(12, 0, 0, 0);

    this.selectedDate = today;
    this.updateDisplayValue();
    this.dateSelected.emit(this.selectedDate);
    this.onChange(this.selectedDate);
    this.onTouched();
    this.showDatepicker = false;
    this.generateCalendar();
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    // Compare only year, month, and day, ignoring time
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  private isSelected(date: Date): boolean {
    if (!this.selectedDate) return false;
    // Compare only year, month, and day, ignoring time
    return date.getDate() === this.selectedDate.getDate() &&
           date.getMonth() === this.selectedDate.getMonth() &&
           date.getFullYear() === this.selectedDate.getFullYear();
  }

  private updateDisplayValue(): void {
    if (this.selectedDate) {
      this.displayValue = this.formatDate(this.selectedDate);
    } else {
      this.displayValue = '';
    }
  }

  private formatDate(date: Date): string {
    // Create a new date object to avoid modifying the original date
    const d = new Date(date);
    // Set to noon to avoid timezone issues
    d.setHours(12, 0, 0, 0);

    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    if (value) {
      try {
        // Handle both Date objects and string inputs
        let dateObj = value instanceof Date ? new Date(value) : new Date(value);

        // Set to noon to avoid timezone issues
        dateObj.setHours(12, 0, 0, 0);

        // Check if the date is valid
        if (!isNaN(dateObj.getTime())) {
          this.selectedDate = dateObj;
          this.updateDisplayValue();
          this.generateCalendar();
        } else {
          console.warn('Invalid date value:', value);
          this.selectedDate = null;
          this.displayValue = '';
        }
      } catch (error) {
        console.error('Error parsing date:', error);
        this.selectedDate = null;
        this.displayValue = '';
      }
    } else {
      this.selectedDate = null;
      this.displayValue = '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // View mode switching
  switchToMonthView(): void {
    this.viewMode = 'months';
  }

  switchToYearView(): void {
    this.decadeStart = Math.floor(this.currentYear / 10) * 10;
    this.generateDisplayedYears();
    this.viewMode = 'years';
  }

  switchToDayView(): void {
    this.viewMode = 'days';
  }

  // Year navigation in month view
  prevYear(): void {
    this.currentYear--;
    this.currentMonth = new Date(this.currentYear, this.currentMonthIndex, 1);
    this.generateCalendar();
  }

  nextYear(): void {
    this.currentYear++;
    this.currentMonth = new Date(this.currentYear, this.currentMonthIndex, 1);
    this.generateCalendar();
  }

  // Decade navigation in year view
  prevDecade(): void {
    this.decadeStart -= 10;
    this.generateDisplayedYears();
  }

  nextDecade(): void {
    this.decadeStart += 10;
    this.generateDisplayedYears();
  }

  // Selection in different views
  selectMonth(monthIndex: number): void {
    this.currentMonthIndex = monthIndex;
    this.currentMonth = new Date(this.currentYear, this.currentMonthIndex, 1);
    this.generateCalendar();
    this.viewMode = 'days';
  }

  selectYear(year: number): void {
    this.currentYear = year;
    this.currentMonth = new Date(this.currentYear, this.currentMonthIndex, 1);
    this.generateCalendar();
    this.viewMode = 'months';
  }
}

interface Day {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}
