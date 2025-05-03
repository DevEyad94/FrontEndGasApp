import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-toast-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h2 class="text-xl mb-4">Toast Testing</h2>
      <div class="flex flex-col gap-2">
        <button class="px-4 py-2 bg-green-500 text-white rounded" (click)="showSuccess()">
          Success Toast
        </button>
        <button class="px-4 py-2 bg-red-500 text-white rounded" (click)="showError()">
          Error Toast
        </button>
        <button class="px-4 py-2 bg-blue-500 text-white rounded" (click)="showInfo()">
          Info Toast
        </button>
        <button class="px-4 py-2 bg-yellow-500 text-white rounded" (click)="showWarning()">
          Warning Toast
        </button>
        <div class="mt-8">
          <h3 class="text-lg mb-2">HTTP Error Tests</h3>
          <div class="flex flex-col gap-2">
            <button class="px-4 py-2 bg-purple-500 text-white rounded" (click)="trigger404Error()">
              Trigger 404 Error (httpstat.us)
            </button>
            <button class="px-4 py-2 bg-purple-500 text-white rounded" (click)="trigger500Error()">
              Trigger 500 Error (httpstat.us)
            </button>
            <button class="px-4 py-2 bg-purple-500 text-white rounded" (click)="trigger401Error()">
              Trigger 401 Error (httpstat.us)
            </button>
            <button class="px-4 py-2 bg-purple-700 text-white rounded" (click)="triggerJSONPlaceholder404()">
              404 Error (JSONPlaceholder)
            </button>
            <button class="px-4 py-2 bg-red-700 text-white rounded" (click)="throwError()">
              Manual Error
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ToastTestComponent {
  private toastService = inject(ToastService);
  private http = inject(HttpClient);

  showSuccess(): void {
    console.log('Manual success toast');
    this.toastService.success('This is a success message', 'Success');
  }

  showError(): void {
    console.log('Manual error toast');
    this.toastService.error('This is an error message', 404);
  }

  showInfo(): void {
    console.log('Manual info toast');
    this.toastService.info('This is an info message', 'Information');
  }

  showWarning(): void {
    console.log('Manual warning toast');
    this.toastService.warning('This is a warning message', 'Warning');
  }

  // HTTP Error Tests - these should be caught by the interceptor
  trigger404Error(): void {
    // Don't catch the error to allow the interceptor to handle it
    console.log('Triggering 404 error from httpstat.us');
    this.http.get('https://httpstat.us/404').subscribe({
      error: (err) => console.log('Error in component:', err)
    });
  }

  trigger500Error(): void {
    // Don't catch the error to allow the interceptor to handle it
    console.log('Triggering 500 error from httpstat.us');
    this.http.get('https://httpstat.us/500').subscribe({
      error: (err) => console.log('Error in component:', err)
    });
  }

  trigger401Error(): void {
    // Don't catch the error to allow the interceptor to handle it
    console.log('Triggering 401 error from httpstat.us');
    this.http.get('https://httpstat.us/401').subscribe({
      error: (err) => console.log('Error in component:', err)
    });
  }

  triggerJSONPlaceholder404(): void {
    // Alternative API for testing
    console.log('Triggering 404 error from JSONPlaceholder');
    this.http.get('https://jsonplaceholder.typicode.com/posts/999999').subscribe({
      error: (err) => console.log('Error in component:', err)
    });
  }

  throwError(): void {
    // Manually throw an error
    console.log('Manually throwing error');
    throw new Error('This is a manually thrown error');
  }
}
