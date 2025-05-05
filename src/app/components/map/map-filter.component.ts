import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DashboardFilter } from '../../models/dashboard.model';
import { TextInputComponent } from '../../shared/components/text-input/text-input.component';
import { ZskSelectComponent } from '../../shared/components/zsk/zsk-select.component';
import { DashboardService } from '../../shared/services/dashboard.service';

@Component({
  selector: 'app-map-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TextInputComponent,
    ZskSelectComponent
  ],
  templateUrl: './map-filter.component.html',
  styleUrls: ['./map-filter.component.scss']
})
export class MapFilterComponent implements OnInit, OnChanges {
  @Output() filtersChanged = new EventEmitter<DashboardFilter>();
  @Input() maintenanceTypes: { id: number, name: string }[] = [];
  @Input() fields: { value: number, label: string }[] = [];

  maintenanceTypeOptions: { value: any, label: string }[] = [];
  fieldOptions: { value: any, label: string }[] = [];
  yearOptions: { value: any, label: string }[] = [];

  filterForm!: FormGroup;
  showAdvancedFilters = false;

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadYears();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['maintenanceTypes'] && this.maintenanceTypes) {
      this.prepareMaintenanceTypeOptions();
    }

    if (changes['fields'] && this.fields) {
      this.prepareFieldOptions();
    }
  }

  loadYears(): void {
    this.dashboardService.getYears().subscribe({
      next: (years) => {
        this.yearOptions = years.map(year => ({
          value: year,
          label: year.toString()
        }));
      },
      error: (error) => {
        console.error('Error loading years:', error);
      }
    });
  }

  prepareMaintenanceTypeOptions(): void {
    console.log('Setting maintenance type options:', this.maintenanceTypes);
    this.maintenanceTypeOptions = this.maintenanceTypes.map(type => ({
      value: type.id,
      label: type.name
    }));
  }

  prepareFieldOptions(): void {
    console.log('Setting field options:', this.fields);
    this.fieldOptions = this.fields;
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      minProductionRate: [null],
      maxProductionRate: [null],
      extractionYear: [null],
      fromYear: [null],
      toYear: [null],
      maintenanceTypeId: [null],
      minCost: [null],
      maxCost: [null],
      fieldId: [null]
    });

    // Subscribe to form value changes
    this.filterForm.valueChanges.subscribe(values => {
      this.filtersChanged.emit(values);
    });
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  clearFilters(): void {
    this.filterForm.reset();
  }
}
