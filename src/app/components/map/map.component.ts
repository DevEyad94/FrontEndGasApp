import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZskService } from '../../shared/services/zsk.service';
import { GasField } from '../../models/gas-field.model';
import { environment } from '../../../environments/environment';
import { MapFilterComponent } from './map-filter.component';
import { DashboardService } from '../../shared/services/dashboard.service';
import { DashboardFilter, FieldData } from '../../models/dashboard.model';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MaintenanceType } from '../../models/maintenance-type.model';
import { GoogleMapsApiService } from '../../shared/services/google-maps-api.service';

declare const google: any;

// Extended GasField interface with dashboard data
interface ExtendedGasField extends GasField {
  productionRate?: number;
  extractionYear?: number;
  maintenanceType?: string;
  maintenanceCost?: number;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, MapFilterComponent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapElement!: ElementRef;

  fields: GasField[] = [];
  map: any;
  markers: any[] = [];

  // Dashboard data
  dashboardFields: FieldData[] = [];
  maintenanceTypes: { id: number, name: string }[] = [];
  fieldOptions: { value: number, label: string }[] = [];
  currentFilter: DashboardFilter = {};
  isDataLoaded = false;

  // Add zoom level property
  currentZoom = 7;

  constructor(
    private lookupService: ZskService,
    private dashboardService: DashboardService,
    private router: Router,
    private googleMapsApiService: GoogleMapsApiService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    forkJoin({
      fields: this.lookupService.getFields(),
      maintenanceTypes: this.lookupService.getMaintenanceTypes()
    }).subscribe({
      next: (result) => {
        console.log('Loaded maintenance types:', result.maintenanceTypes);

        this.fields = result.fields;

        // Prepare field options for the filter
        this.fieldOptions = this.fields.map(field => ({
          value: field.zFieldId,
          label: field.name
        }));

        // Set maintenance types
        this.maintenanceTypes = result.maintenanceTypes.map(type => ({
          id: type.zMaintenanceTypeId,
          name: type.name
        }));

        console.log('Mapped maintenance types:', this.maintenanceTypes);

        // Mark data as loaded
        this.isDataLoaded = true;

        // Load dashboard data after fields are loaded
        this.loadDashboardData();

        // No need to initialize map here as it's handled in ngAfterViewInit
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
      }
    });
  }

  ngAfterViewInit(): void {
    // Load Google Maps API using the service
    this.googleMapsApiService.loadApi()
      .then(() => {
        this.initializeMap();
      })
      .catch(error => {
        console.error('Error loading Google Maps API:', error);
      });
  }

  loadDashboardData(filter: DashboardFilter = {}): void {
    this.currentFilter = filter;
    this.dashboardService.getDashboardData(filter).subscribe({
      next: (data) => {
        this.dashboardFields = data.fieldData;
        if (this.map) {
          this.addMarkers();
        }
      },
      error: (error) => {
        console.error('Error fetching dashboard data:', error);
      }
    });
  }

  onFiltersChanged(filters: DashboardFilter): void {
    this.loadDashboardData(filters);
  }

  initializeMap(): void {
    if (!this.mapElement) {
      setTimeout(() => this.initializeMap(), 100);
      return;
    }

    // Make sure Google Maps API is available
    if (!(window as any).google || !(window as any).google.maps) {
      console.warn('Google Maps API not loaded yet, retrying...');
      setTimeout(() => this.initializeMap(), 300);
      return;
    }

    // Default map center (can be set to average of all fields if available)
    const defaultCenter = { lat: 23.6150, lng: 58.5912 }; // Oman coordinates

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: defaultCenter,
      zoom: this.currentZoom,
      mapTypeId: 'terrain',
      styles: this.getMapStyles(),
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      },
      fullscreenControl: true,
      streetViewControl: false,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: google.maps.ControlPosition.TOP_RIGHT
      }
    });

    // Add zoom change listener to keep our current zoom in sync
    this.map.addListener('zoom_changed', () => {
      this.currentZoom = this.map.getZoom();
    });

    if (this.fields.length > 0 || this.dashboardFields.length > 0) {
      this.addMarkers();
    }
  }

  addMarkers(): void {
    // Clear existing markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    const bounds = new google.maps.LatLngBounds();

    // Use dashboard fields if available (filtered data), otherwise use basic fields
    const fieldsToDisplay: ExtendedGasField[] = this.dashboardFields.length > 0 ?
      this.dashboardFields.map(f => ({
        zFieldId: f.fieldId,
        name: f.fieldName,
        latitude: f.latitude,
        longitude: f.longitude,
        productionRate: f.productionRate,
        extractionYear: f.extractionYear,
        maintenanceType: f.maintenanceType,
        maintenanceCost: f.maintenanceCost
      })) :
      this.fields;

    fieldsToDisplay.forEach(field => {
      if (field.latitude && field.longitude) {
        const position = { lat: field.latitude, lng: field.longitude };

        // Create marker
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

        // Create content for info window
        let infoContent = `
          <div class="p-2">
            <h3 class="font-bold text-lg">${field.name}</h3>
            <p>Field ID: ${field.zFieldId}</p>
            <p>Coordinates: ${field.latitude.toFixed(6)}, ${field.longitude.toFixed(6)}</p>`;

        // Add additional info if available from dashboard data
        if (field.productionRate !== undefined) {
          infoContent += `
            <p>Production Rate: ${field.productionRate} m³/day</p>
            <p>Extraction Year: ${field.extractionYear}</p>
            <p>Maintenance Type: ${field.maintenanceType}</p>
            <p>Maintenance Cost: $${field.maintenanceCost?.toFixed(2)}</p>
            <div class="mt-2 text-center">
              <button class="view-details-btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                      data-field-id="${field.zFieldId}">
                View Details
              </button>
            </div>`;
        }

        infoContent += `</div>`;

        // Info window setup
        const infoWindow = new google.maps.InfoWindow({
          content: infoContent
        });

        // Add click listener to marker
        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);

          // Add event listener for the "View Details" button after the info window is opened
          google.maps.event.addListener(infoWindow, 'domready', () => {
            const detailsButton = document.querySelector('.view-details-btn');
            if (detailsButton) {
              detailsButton.addEventListener('click', (event) => {
                const fieldId = (event.target as HTMLElement).getAttribute('data-field-id');
                this.navigateToFieldDetails(Number(fieldId));
              });
            }
          });
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

  navigateToFieldDetails(fieldId: number): void {
    this.router.navigate(['/field', fieldId]);
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

  zoomIn(): void {
    if (this.map) {
      this.currentZoom = Math.min(this.currentZoom + 1, 20);
      this.map.setZoom(this.currentZoom);
    }
  }

  zoomOut(): void {
    if (this.map) {
      this.currentZoom = Math.max(this.currentZoom - 1, 1);
      this.map.setZoom(this.currentZoom);
    }
  }

  resetZoom(): void {
    if (this.map) {
      this.currentZoom = 7;
      this.map.setZoom(this.currentZoom);

      // If we have markers, center the map to show all of them
      if (this.markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        this.markers.forEach(marker => {
          bounds.extend(marker.getPosition());
        });
        this.map.fitBounds(bounds);
      }
    }
  }
}
