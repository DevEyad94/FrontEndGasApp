import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZskService } from '../../shared/services/zsk.service';
import { GasField } from '../../models/gas-field.model';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapElement!: ElementRef;

  fields: GasField[] = [];
  map: any;
  markers: any[] = [];

  constructor(private lookupService: ZskService) { }

  ngOnInit(): void {
    this.loadGasFields();
  }

  ngAfterViewInit(): void {
    // Load Google Maps script dynamically
    if (!document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      // Define global initMap function
      (window as any).initMap = () => {
        this.initializeMap();
      };
    } else {
      // If script already loaded, initialize map directly
      this.initializeMap();
    }
  }

  loadGasFields(): void {
    this.lookupService.getFields().subscribe({
      next: (fields) => {
        this.fields = fields;
        if (this.map) {
          this.addMarkers();
        }
      },
      error: (error) => {
        console.error('Error fetching gas fields:', error);
      }
    });
  }

  initializeMap(): void {
    if (!this.mapElement) {
      setTimeout(() => this.initializeMap(), 100);
      return;
    }

    // Default map center (can be set to average of all fields if available)
    const defaultCenter = { lat: 23.6150, lng: 58.5912 }; // Oman coordinates

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: defaultCenter,
      zoom: 7,
      mapTypeId: 'terrain',
      styles: this.getMapStyles()
    });

    if (this.fields.length > 0) {
      this.addMarkers();
    }
  }

  addMarkers(): void {
    // Clear existing markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    const bounds = new google.maps.LatLngBounds();

    this.fields.forEach(field => {
      if (field.latitude && field.longitude) {
        const position = { lat: field.latitude, lng: field.longitude };
        const marker = new google.maps.Marker({
          position,
          map: this.map,
          title: field.name,
          animation: google.maps.Animation.DROP,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4CAF50',
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: '#FFFFFF'
          }
        });

        // Info window setup
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-bold text-lg">${field.name}</h3>
              <p>Field Name: ${field.name}</p>
              <p>Coordinates: ${field.latitude.toFixed(6)}, ${field.longitude.toFixed(6)}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);
        });

        this.markers.push(marker);
        bounds.extend(position);
      }
    });

    // Adjust map to show all markers
    if (this.markers.length > 0) {
      this.map.fitBounds(bounds);
    }
  }

  getMapStyles(): any[] {
    // Custom map styles for better visibility
    return [
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [
          { color: '#e9e9e9' },
          { lightness: 17 }
        ]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [
          { color: '#f5f5f5' },
          { lightness: 20 }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
          { color: '#f5f5f5' },
          { lightness: 21 }
        ]
      },
      {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#333333' }
        ]
      }
    ];
  }
}
