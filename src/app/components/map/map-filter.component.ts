import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DashboardFilter } from '../../models/dashboard.model';
import { TextInputComponent } from '../../shared/components/text-input/text-input.component';
import { ZskSelectComponent } from '../../shared/components/zsk/zsk-select.component';

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
export class MapFilterComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<DashboardFilter>();
  @Input() maintenanceTypes: { id: number, name: string }[] = [];
  @Input() fields: { value: number, label: string }[] = [];

  maintenanceTypeOptions: { value: any, label: string }[] = [];
  fieldOptions: { value: any, label: string }[] = [];
  yearOptions: { value: any, label: string }[] = [];

  filterForm!: FormGroup;
  years: number[] = [];
  showAdvancedFilters = false;

  constructor(private fb: FormBuilder) {
    // Generate list of years for dropdown (last 30 years)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 30; i++) {
      this.years.push(currentYear - i);
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.prepareOptions();
  }

  prepareOptions(): void {
    // Convert years to options format
    this.yearOptions = this.years.map(year => ({
      value: year,
      label: year.toString()
    }));

    // Convert maintenance types to options format
    this.maintenanceTypeOptions = this.maintenanceTypes.map(type => ({
      value: type.id,
      label: type.name
    }));

    // Fields are already in correct format
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
