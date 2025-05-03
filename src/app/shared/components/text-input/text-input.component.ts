import { Component, OnInit, Output, EventEmitter, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, LabelComponent],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true
    }
  ]
})
export class TextInputComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() type: string = 'text';
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() errorMessage: string = '';
  @Input() showError: boolean = false;
  @Input() inputMode:
  | "none"
  | "text"
  | "tel"
  | "url"
  | "email"
  | "numeric"
  | "decimal"
  | "search"
  | null = "text";

  @Output() valueChanged = new EventEmitter<string>();

  value: string = '';
  disabled: boolean = false;
  touched: boolean = false;
  hasErrors: boolean = false;

  // ControlValueAccessor implementation
  onChange: any = () => {};
  onTouched: any = () => {
    this.touched = true;
  };

  constructor() {}

  ngOnInit(): void {}

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.value = inputElement.value;
    this.valueChanged.emit(this.value);
    this.onChange(this.value);
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.value = value || '';
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
