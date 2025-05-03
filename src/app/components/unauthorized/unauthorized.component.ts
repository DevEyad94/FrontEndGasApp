import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div
      class="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12"
    >
      <div class="mx-auto max-w-2xl text-center">
        <h1
          class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
        >
          <span class="block text-arabic-green dark:text-arabic-green-light"
            >401</span
          >
          <span class="block mt-2">{{ 'UNAUTHORIZED.TITLE' | translate }}</span>
        </h1>
        <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          {{ 'UNAUTHORIZED.MESSAGE' | translate }}
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <a
            [routerLink]="['/dashboard']"
            class="rounded-md bg-arabic-green px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-arabic-green-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arabic-green"
          >
            {{ 'UNAUTHORIZED.GO_HOME' | translate }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class UnauthorizedComponent {

}
