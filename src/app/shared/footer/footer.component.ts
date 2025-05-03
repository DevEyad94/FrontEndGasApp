import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common'; 
import packageJson from "../../../../package.json";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  currentLang: string = 'en';
  public version: string = packageJson.version;

  constructor(private translateService: TranslateService) { }

  ngOnInit(): void {
    // Get current language
    this.currentLang = this.translateService.currentLang;

    // Subscribe to language changes
    this.translateService.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });
  }

  get isArabic(): boolean {
    return this.currentLang === 'ar';
  }
}
