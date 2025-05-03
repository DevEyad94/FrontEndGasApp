import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LabelComponent } from '../label/label.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-zsk-select',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LabelComponent, TranslateModule],
  template: `
    <div class="relative">
      <!-- Input Label -->
      <app-label [label]="label" [required]="required" [for]="id"></app-label>

      <!-- Select Input -->
      <div class="input-container">
        <select
          [id]="id"
          [name]="name"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pdo-green focus:border-pdo-green dark:bg-gray-700 dark:text-white"
          style="height: 44px;"
          [ngClass]="{
            'border-red-500': formControl?.errors
          }"
          (change)="onSelectChange($event)"
          (blur)="onTouched()"
          [disabled]="disabled"
          [(ngModel)]="value"
        >
          <option [ngValue]="null">
            {{ placeholder | translate }}
          </option>
          <option *ngFor="let option of options" [ngValue]="option.value">
            {{ option.label | translate }}
          </option>
        </select>
      </div>

      <!-- Error Message -->
      <div *ngIf="formControl" class="mt-1 text-sm text-red-600">
        <!-- Required validation -->
        <span *ngIf="formControl.errors?.['required'] && formControl.touched">
          {{ "VALIDATION.REQUIRED" | translate }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .input-container {
      margin-bottom: 0.5rem;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ZskSelectComponent),
      multi: true
    }
  ]
})
export class ZskSelectComponent implements OnInit, ControlValueAccessor {
  @Input() label: string = '';
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() placeholder: string = 'Select an option';
  @Input() required: boolean = false;
  @Input() options: { value: any, label: string }[] = [];
  @Input() formControl: any;
  @Output() valueChanged = new EventEmitter<any>();

  value: any = null;
  disabled: boolean = false;

  // ControlValueAccessor implementation
  onChange: any = () => {};
  onTouched: any = () => {};

  constructor() {}

  ngOnInit(): void {}

  onSelectChange(event: Event): void {
    this.valueChanged.emit(this.value);
    this.onChange(this.value);
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.value = value;
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
}
