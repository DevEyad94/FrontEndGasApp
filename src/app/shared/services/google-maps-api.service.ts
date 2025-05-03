import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

// Define a custom interface for the window object with our callback
interface CustomWindow extends Window {
  googleMapsApiLoaded?: () => void;
  google?: {
    maps?: any;
  };
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsApiService {
  private readonly API_KEY = environment.googleMapsApiKey;
  private isLoaded = false;
  private loadingPromise: Promise<void> | null = null;
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  loadApi(): Promise<void> {
    // Skip loading the API on the server
    if (!this.isBrowser) {
      return Promise.resolve();
    }

    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise<void>((resolve, reject) => {
      const customWindow = window as CustomWindow;

      // If Google Maps API is already loaded, resolve immediately
      if (customWindow.google && customWindow.google.maps) {
        this.isLoaded = true;
        resolve();
        return;
      }

      // Create a callback for when the API loads
      const callbackName = 'googleMapsApiLoaded';
      customWindow[callbackName] = () => {
        this.isLoaded = true;
        resolve();
        delete customWindow[callbackName];
      };

      // Add the script tag to the document
      const script = document.createElement('script');
      // Explicitly set async and defer attributes before setting src
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.API_KEY}&callback=${callbackName}&libraries=places,marker&loading=async`;
      script.onerror = (error) => {
        reject(new Error('Failed to load Google Maps API: ' + error));
      };

      document.head.appendChild(script);
    });

    return this.loadingPromise;
  }
}
