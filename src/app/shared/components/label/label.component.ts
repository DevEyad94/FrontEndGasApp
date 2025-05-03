import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './label.component.html',
  styleUrl: './label.component.scss'
})
export class LabelComponent {
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() for: string = '';
}
