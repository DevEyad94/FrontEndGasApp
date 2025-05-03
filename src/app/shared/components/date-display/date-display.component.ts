import { Component, Input } from '@angular/core';
import { DateFormatterService } from '../../date-formatter.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="date-container">
      <div *ngIf="date">
        <div>Short: {{ dateFormatter.formatShortDate(date) }}</div>
        <div>Long: {{ dateFormatter.formatLongDate(date) }}</div>
        <div>Date Time: {{ dateFormatter.formatDateTime(date) }}</div>
        <div *ngIf="customFormat">Custom: {{ dateFormatter.formatDate(date, customFormat) }}</div>
      </div>
    </div>
  `,
  styles: [`
    .date-container {
      padding: 10px;
    }
  `]
})
export class DateDisplayComponent {
  @Input() date: Date | string | number = new Date();
  @Input() customFormat: string = '';

  constructor(public dateFormatter: DateFormatterService) {}
}
