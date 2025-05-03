import { Injectable, Renderer2, RendererFactory2, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private renderer: Renderer2;
  private toastContainer: HTMLElement | null = null;
  private isBrowser: boolean;
  private ngZone: NgZone;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    this.ngZone = inject(NgZone);
    console.log('Toast service initialized, isBrowser:', this.isBrowser);
  }

  private createToastContainer(): HTMLElement {
    if (!this.isBrowser) {
      console.log('⛔ Not running in browser, skipping toast creation');
      // Return a dummy element when not in browser
      return this.renderer.createElement('div');
    }

    if (!this.toastContainer) {
      console.log('📦 Creating toast container');
      this.toastContainer = this.renderer.createElement('div');
      this.renderer.setAttribute(this.toastContainer, 'class', 'fixed top-4 right-4 z-50 space-y-2');
      this.renderer.setAttribute(this.toastContainer, 'id', 'toast-container');

      // Run inside ngZone to ensure change detection
      this.ngZone.run(() => {
        if (document && document.body) {
          console.log('📌 Appending toast container to document body');
          this.renderer.appendChild(document.body, this.toastContainer);
        } else {
          console.log('⚠️ Document body not available');
        }
      });
    }
    // Non-null assertion as we ensure toastContainer is created above
    return this.toastContainer!;
  }

  success(message: string, title?: string): void {
    console.log('✅ Success toast called:', message, title);
    this.showToast(message, title, 'success');
  }

  error(message: string, status?: number): void {
    console.log('🔴 Error toast called:', message, status);
    const title = status ? `Error ${status}` : 'Error';
    this.showToast(message, title, 'error');
  }

  info(message: string, title?: string): void {
    console.log('ℹ️ Info toast called:', message, title);
    this.showToast(message, title, 'info');
  }

  warning(message: string, title?: string): void {
    console.log('⚠️ Warning toast called:', message, title);
    this.showToast(message, title, 'warning');
  }

  private showToast(message: string, title?: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    if (!this.isBrowser) {
      console.log('⛔ Not showing toast because not in browser');
      return;
    }

    console.log('🔔 Showing toast:', { message, title, type });
    const container = this.createToastContainer();
    console.log('📦 Toast container element:', container);

    // Map type to icon and color
    let iconClass = '';
    let bgClass = '';
    let iconHTML = '';

    // Check if document language is Arabic/RTL
    const isRTL = document?.documentElement?.dir === 'rtl' ||
                 document?.documentElement?.lang === 'ar' ||
                 document?.body?.classList.contains('rtl');

    const rtlClass = isRTL ? 'rtl' : '';
    const marginClass = isRTL ? 'ml-3' : 'mr-3';

    switch (type) {
      case 'success':
        bgClass = 'bg-pdo-green-light';
        iconHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" /></svg>';
        break;
      case 'error':
        bgClass = 'bg-red-500';
        iconHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" /></svg>';
        break;
      case 'info':
        bgClass = 'bg-blue-500';
        iconHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" /></svg>';
        break;
      case 'warning':
        bgClass = 'bg-yellow-500';
        iconHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" /></svg>';
        break;
    }

    // Create toast element with new design
    const toastEl = this.renderer.createElement('div');
    this.renderer.setAttribute(
      toastEl,
      'class',
      `flex w-full max-w-md items-center p-4 mb-4 rounded-lg shadow-lg
      transition-all duration-300 ease-in-out transform
      bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
      ${type === 'success' ? 'border border-pdo-green/20' : ''} ${rtlClass}`
    );

    // Icon container
    const iconContainer = this.renderer.createElement('div');
    this.renderer.setAttribute(iconContainer, 'class', `flex-shrink-0 ${bgClass} text-white p-2 rounded-full ${marginClass}`);

    // Set icon HTML
    iconContainer.innerHTML = iconHTML;

    // Content container
    const contentDiv = this.renderer.createElement('div');
    this.renderer.setAttribute(contentDiv, 'class', 'flex-1');

    // Add title if provided
    if (title) {
      const titleEl = this.renderer.createElement('h3');
      this.renderer.setAttribute(titleEl, 'class', 'font-medium text-gray-900 dark:text-gray-100');
      const titleText = this.renderer.createText(title);
      this.renderer.appendChild(titleEl, titleText);
      this.renderer.appendChild(contentDiv, titleEl);
    }

    // Add message
    const messageEl = this.renderer.createElement('div');
    this.renderer.setAttribute(messageEl, 'class', 'text-sm text-gray-600 dark:text-gray-300');
    const messageText = this.renderer.createText(message);
    this.renderer.appendChild(messageEl, messageText);
    this.renderer.appendChild(contentDiv, messageEl);

    // Close button
    const closeBtn = this.renderer.createElement('button');
    this.renderer.setAttribute(
      closeBtn,
      'class',
      `${isRTL ? 'mr-auto' : 'ml-auto'} -mx-1.5 -my-1.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none`
    );

    const closeIcon = this.renderer.createElement('span');
    closeIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
    this.renderer.appendChild(closeBtn, closeIcon);

    // Add event listener for close button
    this.renderer.listen(closeBtn, 'click', () => {
      this.removeToast(toastEl);
    });

    // Append children to toast
    if (isRTL) {
      // For RTL: close button, content, icon
      this.renderer.appendChild(toastEl, closeBtn);
      this.renderer.appendChild(toastEl, contentDiv);
      this.renderer.appendChild(toastEl, iconContainer);
    } else {
      // For LTR: icon, content, close button (default)
      this.renderer.appendChild(toastEl, iconContainer);
      this.renderer.appendChild(toastEl, contentDiv);
      this.renderer.appendChild(toastEl, closeBtn);
    }

    // Add to container
    this.renderer.appendChild(container, toastEl);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeToast(toastEl);
    }, 5000);
  }

  private removeToast(toastEl: HTMLElement): void {
    if (this.toastContainer?.contains(toastEl)) {
      this.renderer.addClass(toastEl, 'opacity-0');
      this.renderer.addClass(toastEl, '-translate-x-full');

      setTimeout(() => {
        if (this.toastContainer?.contains(toastEl)) {
          this.renderer.removeChild(this.toastContainer, toastEl);
        }
      }, 300);
    }
  }
}
