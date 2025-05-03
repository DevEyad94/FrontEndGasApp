import { Injectable, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

@Injectable()
export class CustomTitleStrategy extends TitleStrategy implements OnDestroy {
  private currentTitle: string | undefined;
  private destroy$ = new Subject<void>();

  constructor(
    private readonly title: Title,
    private translateService: TranslateService
  ) {
    super();

    // Subscribe to language changes to update the title
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.currentTitle) {
          const translatedTitle = this.translateService.instant(this.currentTitle);
          this.title.setTitle(translatedTitle);
        }
      });
  }

  override updateTitle(routerState: RouterStateSnapshot): void {
    const title = this.buildTitle(routerState);
    this.currentTitle = title;

    if (title) {
      // Use synchronous translation to avoid potential circular dependencies
      const translatedTitle = this.translateService.instant(title);
      this.title.setTitle(translatedTitle);
    } else {
      // Set default app title
      const defaultTitle = this.translateService.instant('APP.TITLE');
      this.title.setTitle(defaultTitle);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
