import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-text-area',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    LabelComponent,
  ],
  templateUrl: './text-area.component.html',
  styleUrl: './text-area.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextAreaComponent),
      multi: true,
    },
  ],
})
export class TextAreaComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() rows: number = 4;
  @Input() cols: number = 0;
  @Input() maxLength: number | null = null;
  @Input() errorMessage: string = '';
  @Input() showError: boolean = false;
  @Input() formControl: any; // For validation in template
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

  onTextareaChange(event: Event): void {
    const textareaElement = event.target as HTMLTextAreaElement;
    this.value = textareaElement.value;
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
