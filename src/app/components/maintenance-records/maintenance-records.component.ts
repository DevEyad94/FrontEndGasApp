import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { GasService } from '../../shared/services/gas.service';
import { ZskService } from '../../shared/services/zsk.service';
import {
  FieldMaintenance,
  AddFieldMaintenanceDto,
  UpdateFieldMaintenanceDto,
  FieldMaintenanceFilter,
} from '../../models/field-maintenance.model';
import { GasField } from '../../models/gas-field.model';
import { MaintenanceType } from '../../models/maintenance-type.model';
import { forkJoin } from 'rxjs';
import { TextInputComponent } from '../../shared/components/text-input/text-input.component';
import { TextAreaComponent } from '../../shared/components/text-area/text-area.component';
import { DatePickerComponent } from '../../shared/components/date-picker/date-picker.component';
import { LabelComponent } from '../../shared/components/label/label.component';
import { ZskSelectComponent } from '../../shared/components/zsk/zsk-select.component';
import { Pagination } from '../../core/models/pagination.model';

@Component({
  selector: 'app-maintenance-records',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextInputComponent,
    TextAreaComponent,
    DatePickerComponent,
    LabelComponent,
    ZskSelectComponent,
  ],
  templateUrl: './maintenance-records.component.html',
  styleUrls: ['./maintenance-records.component.scss'],
})
export class MaintenanceRecordsComponent implements OnInit {
  Math = Math;
  maintenanceRecords: FieldMaintenance[] = [];
  pagination: Pagination = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  };
  fields: GasField[] = [];
  maintenanceTypes: MaintenanceType[] = [];
  recordForm!: FormGroup;
  filterForm!: FormGroup;
  isEditMode = false;
  selectedRecord: FieldMaintenance | null = null;
  isLoading = false;
  isFormVisible = false;
  isSubmitting = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalRecords = 0;

  // Sort
  sortColumn = 'fieldMaintenanceDate';
  sortDirection = 'desc';

  constructor(
    private gasService: GasService,
    private zskService: ZskService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadFilterOptions();
    this.loadRecords();
  }

  initForms(): void {
    this.recordForm = this.fb.group({
      fieldMaintenanceGuid: [''],
      fieldMaintenanceDate: ['', Validators.required],
      cost: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      zMaintenanceTypeId: [null, Validators.required],
      zFieldId: [null, Validators.required],
    });

    this.filterForm = this.fb.group({
      search: [''],
      startDate: [''],
      endDate: [''],
      zMaintenanceTypeId: [null],
      zFieldId: [null],
      minCost: [null],
      maxCost: [null],
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadRecords();
    });
  }

  loadFilterOptions(): void {
    forkJoin({
      fields: this.zskService.getFields(),
      maintenanceTypes: this.zskService.getMaintenanceTypes(),
    }).subscribe({
      next: (result) => {
        this.fields = result.fields;
        this.maintenanceTypes = result.maintenanceTypes;
      },
      error: (error) => {
        console.error('Error fetching filter options:', error);
      },
    });
  }

  loadRecords(): void {
    this.isLoading = true;
    const filters: FieldMaintenanceFilter = this.filterForm.value;

    this.gasService
      .getFieldMaintenancesWithFilter(
        filters,
        this.pagination.currentPage,
        this.pagination.itemsPerPage
      )
      .subscribe({
        next: (response) => {
          this.pagination = response.pagination;
          this.maintenanceRecords = response.result.data || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching maintenance records:', error);
          this.isLoading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRecords();
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadRecords();
  }

  toggleForm(isNew: boolean | null = false): void {
    this.isFormVisible = !this.isFormVisible;
    this.resetForm();

    if (isNew == true) {
      console.log('Reset Form');
    }
  }

  resetForm(): void {
    this.recordForm.reset({
      fieldMaintenanceGuid: '',
      cost: 0,
      description: '',
      zMaintenanceTypeId: null,
      zFieldId: null,
    });
    console.log(this.recordForm.value);

    this.isEditMode = false;
    this.selectedRecord = null;
  }

  onSubmit(): void {
    if (this.recordForm.invalid) {
      this.markFormGroupTouched(this.recordForm);
      return;
    }

    this.isSubmitting = true;
    const recordData = this.recordForm.value;

    if (this.isEditMode && this.selectedRecord) {
      const updateData: UpdateFieldMaintenanceDto = {
        fieldMaintenanceGuid: recordData.fieldMaintenanceGuid,
        fieldMaintenanceDate: recordData.fieldMaintenanceDate,
        cost: recordData.cost,
        description: recordData.description,
        zMaintenanceTypeId: recordData.zMaintenanceTypeId,
        zFieldId: recordData.zFieldId,
      };

      this.gasService.updateFieldMaintenance(updateData).subscribe({
        next: () => {
          this.onSubmitSuccess();
        },
        error: (error) => {
          console.error('Error updating maintenance record:', error);
          this.isSubmitting = false;
        },
      });
    } else {
      const newData: AddFieldMaintenanceDto = {
        fieldMaintenanceDate: recordData.fieldMaintenanceDate,
        cost: recordData.cost,
        description: recordData.description,
        zMaintenanceTypeId: recordData.zMaintenanceTypeId,
        zFieldId: recordData.zFieldId,
      };

      this.gasService.addFieldMaintenance(newData).subscribe({
        next: () => {
          this.onSubmitSuccess();
        },
        error: (error) => {
          console.error('Error adding maintenance record:', error);
          this.isSubmitting = false;
        },
      });
    }
  }

  onSubmitSuccess(): void {
    this.loadRecords();
    this.resetForm();
    this.isFormVisible = false;
    this.isSubmitting = false;
  }

  editRecord(record: FieldMaintenance): void {
    this.isEditMode = true;
    this.selectedRecord = record;
    this.isFormVisible = true;

    this.recordForm.patchValue({
      fieldMaintenanceGuid: record.fieldMaintenanceGuid,
      fieldMaintenanceDate: this.formatDateForInput(
        record.fieldMaintenanceDate
      ),
      cost: record.cost,
      description: record.description,
      zMaintenanceTypeId: record.zMaintenanceTypeId,
      zFieldId: record.zFieldId,
    });
  }

  deleteRecord(record: FieldMaintenance): void {
    if (
      confirm(
        `Are you sure you want to delete this maintenance record for ${record.fieldName}?`
      )
    ) {
      this.gasService
        .deleteFieldMaintenance(record.fieldMaintenanceGuid)
        .subscribe({
          next: () => {
            this.loadRecords();
          },
          error: (error) => {
            console.error('Error deleting maintenance record:', error);
          },
        });
    }
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  getFieldName(fieldId: number): string {
    const field = this.fields.find((f) => f.zFieldId === fieldId);
    return field ? field.name : 'Unknown';
  }

  getMaintenanceTypeName(typeId: number): string {
    const type = this.maintenanceTypes.find(
      (t) => t.zMaintenanceTypeId === typeId
    );
    return type ? type.name : 'Unknown';
  }

  // Helper method to mark all controls in a form group as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Helper methods for select options
  getMaintenanceTypeOptions() {
    return this.maintenanceTypes.map((type) => ({
      value: type.zMaintenanceTypeId,
      label: type.name,
    }));
  }

  getFieldOptions() {
    return this.fields.map((field) => ({
      value: field.zFieldId,
      label: field.name,
    }));
  }
}
