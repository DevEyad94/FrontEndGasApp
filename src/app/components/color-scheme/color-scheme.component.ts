import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ColorSwatch {
  colorClass: string;
  name: string;
  hex: string;
}

@Component({
  selector: 'app-color-scheme',
  templateUrl: './color-scheme.component.html',
  styleUrls: ['./color-scheme.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ColorSchemeComponent {
  primaryColors: ColorSwatch[] = [
    { colorClass: 'bg-pdo-green', name: 'Green', hex: '#1CA14E' },
    { colorClass: 'bg-pdo-green-light', name: 'Green Light', hex: '#25BB5A' },
    { colorClass: 'bg-pdo-green-dark', name: 'Green Dark', hex: '#167A3B' },
    { colorClass: 'bg-pdo-red', name: 'Red', hex: '#E73C3E' },
    { colorClass: 'bg-pdo-red-light', name: 'Red Light', hex: '#FF4A4C' },
    { colorClass: 'bg-pdo-red-dark', name: 'Red Dark', hex: '#C52C2E' },
  ];

  neutralColors: ColorSwatch[] = [
    { colorClass: 'bg-pdo-black', name: 'Black', hex: '#000000' },
    { colorClass: 'bg-pdo-white border', name: 'White', hex: '#FFFFFF' },
    { colorClass: 'bg-gray-200', name: 'Gray Light', hex: '#E5E7EB' },
    { colorClass: 'bg-gray-500', name: 'Gray Medium', hex: '#6B7280' },
    { colorClass: 'bg-gray-800', name: 'Gray Dark', hex: '#1F2937' },
  ];
}
