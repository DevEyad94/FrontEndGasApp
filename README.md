# GraveNew

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Components

### Date Picker

The application includes a reusable date picker component with standard and month-year only modes.

#### Standard Date Picker

```html
<app-date-picker
  [placeholder]="'Select date'"
  [required]="true"
  [errorMessage]="'Date is required'"
  formControlName="dateField"
></app-date-picker>
```

#### Month-Year Only Date Picker

To use the date picker in month-year only mode (without day selection):

```html
<app-date-picker
  [placeholder]="'Select month and year'"
  [required]="true"
  [monthYearOnly]="true"
  [errorMessage]="'Month and year are required'"
  formControlName="monthYearField"
></app-date-picker>
```

In month-year only mode, the selected date will always be set to the first day of the selected month.

#### Disabling Specific Months and Years

You can disable specific month-year combinations using the `disabledDates` input:

```html
<app-date-picker
  [placeholder]="'Select month and year'"
  [monthYearOnly]="true"
  [disabledDates]="disabledDateRanges"
  formControlName="restrictedDateField"
></app-date-picker>
```

In your component:

```typescript
import { DisabledDateRange } from 'path/to/date-picker.component';

export class MyComponent implements OnInit {
  disabledDateRanges: DisabledDateRange[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getAvailableDates().subscribe(data => {
      // Process API data into DisabledDateRange format
      this.disabledDateRanges = this.processApiData(data);
    });
  }

  private processApiData(apiData: any[]): DisabledDateRange[] {
    // Example mapping from API data to disabled date ranges
    return apiData.map(item => {
      return {
        year: item.year,
        // Different ways to specify disabled dates:
        
        // Option 1: Disable a specific month in a year
        month: item.monthIndex, // Single month (0-11)
        
        // Option 2: Disable a range of months in a year
        // startMonth: item.startMonth,
        // endMonth: item.endMonth,
        
        // Option 3: Disable an entire year (omit month, startMonth, endMonth)
      };
    });
  }
}
```

Here are examples of different `DisabledDateRange` configurations:

```typescript
// Disable entire year 2023
{ year: 2023 }

// Disable January 2024 only
{ year: 2024, month: 0 }

// Disable January through March 2024
{ year: 2024, startMonth: 0, endMonth: 2 }

// Disable specific non-consecutive months (January, March, December) in 2024
{ year: 2024, months: [0, 2, 11] }
```

Disabled months and years will be visually indicated and cannot be selected by the user.
