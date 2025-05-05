import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export function errorInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  console.log('🔍 Functional ErrorInterceptor running for:', request.url);
  const toast = inject(ToastService);

  // Debug - confirm toast service is injected
  console.log('💉 Toast service injected:', !!toast);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('🚨 Intercepted error:', error.status, error.url);
      console.log('📝 Error details:', error);

      if (error) {
        // Extract error message - handle various error formats
        let errorMessage = 'An unknown error occurred';

        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        console.log('📄 Extracted error message:', errorMessage);

        switch (error.status) {
          case 400:
            if (error.error && error.error.errors) {
              const modalStateErrors: string[] = [];
              for (const key in error.error.errors) {
                if (error.error.errors[key]) {
                  modalStateErrors.push(error.error.errors[key] as string);
                }
              }
              console.log('🔢 Modal state errors:', modalStateErrors);
              toast.error(modalStateErrors.join(', '));
              console.log('🔔 Toast error called with modal state errors');
              throw modalStateErrors;
            } else {
              console.log('🔴 400 error:', errorMessage);
              toast.error(errorMessage, error.status);
              console.log('🔔 Toast error called with status 400');
            }
            break;
          case 401:
            console.log('🔑 401 error:', errorMessage);
            toast.error(errorMessage || 'Unauthorized', error.status);
            console.log('🔔 Toast error called with status 401');
            break;
          case 404:
            console.log('🔍 404 error');
            toast.error(errorMessage || 'Resource not found', 404);
            console.log('🔔 Toast error called with status 404');
            // No router navigation here to avoid circular dependencies
            break;
          case 500:
            console.log('💥 500 error:', error.error);
            toast.error("Internal Server Error", error.status);
            console.log('🔔 Toast error called with status 500');
            break;
          default:
            console.log('❓ Other error:', error);
            toast.error(errorMessage || "Something unexpected went wrong!");
            console.log('🔔 Toast error called with general error');
            break;
        }
      }

      return throwError(() => error);
    })
  );
}
