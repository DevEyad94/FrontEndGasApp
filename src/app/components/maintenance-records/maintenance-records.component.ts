import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GasService } from '../../services/gas.service';
import { ZskService } from '../../core/services/zsk.service';
import { FieldMaintenance, AddFieldMaintenanceDto, UpdateFieldMaintenanceDto, FieldMaintenanceFilter } from '../../models/field-maintenance.model';
import { GasField } from '../../models/gas-field.model';
import { MaintenanceType } from '../../models/maintenance-type.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-maintenance-records',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './maintenance-records.component.html',
  styleUrls: ['./maintenance-records.component.scss']
})
export class MaintenanceRecordsComponent implements OnInit {
  Math = Math;
  maintenanceRecords: FieldMaintenance[] = [];
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
    private lookupService: ZskService,
    private fb: FormBuilder
  ) { }

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
      zFieldId: [null, Validators.required]
    });

    this.filterForm = this.fb.group({
      search: [''],
      startDate: [''],
      endDate: [''],
      zMaintenanceTypeId: [null],
      zFieldId: [null],
      minCost: [null],
      maxCost: [null]
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadRecords();
    });
  }

  loadFilterOptions(): void {
    forkJoin({
      fields: this.lookupService.getFields(),
      maintenanceTypes: this.lookupService.getMaintenanceTypes()
    }).subscribe({
      next: (result) => {
        this.fields = result.fields;
        this.maintenanceTypes = result.maintenanceTypes;
      },
      error: (error) => {
        console.error('Error fetching filter options:', error);
      }
    });
  }

  loadRecords(): void {
    this.isLoading = true;
    const filters: FieldMaintenanceFilter = this.filterForm.value;

    this.gasService.getFieldMaintenancesWithFilter(
      filters,
      this.currentPage,
      this.pageSize,
      this.sortColumn,
      this.sortDirection
    ).subscribe({
      next: (response) => {
        this.maintenanceRecords = response.data;
        this.totalPages = response.totalPages;
        this.totalRecords = response.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching maintenance records:', error);
        this.isLoading = false;
      }
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

  toggleForm(): void {
    this.isFormVisible = !this.isFormVisible;
    if (this.isFormVisible && !this.isEditMode) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.recordForm.reset({
      fieldMaintenanceGuid: '',
      cost: 0,
      description: '',
      zMaintenanceTypeId: null,
      zFieldId: null
    });
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
        zFieldId: recordData.zFieldId
      };

      this.gasService.updateFieldMaintenance(updateData).subscribe({
        next: () => {
          this.onSubmitSuccess();
        },
        error: (error) => {
          console.error('Error updating maintenance record:', error);
          this.isSubmitting = false;
        }
      });
    } else {
      const newData: AddFieldMaintenanceDto = {
        fieldMaintenanceDate: recordData.fieldMaintenanceDate,
        cost: recordData.cost,
        description: recordData.description,
        zMaintenanceTypeId: recordData.zMaintenanceTypeId,
        zFieldId: recordData.zFieldId
      };

      this.gasService.addFieldMaintenance(newData).subscribe({
        next: () => {
          this.onSubmitSuccess();
        },
        error: (error) => {
          console.error('Error adding maintenance record:', error);
          this.isSubmitting = false;
        }
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
      fieldMaintenanceDate: this.formatDateForInput(record.fieldMaintenanceDate),
      cost: record.cost,
      description: record.description,
      zMaintenanceTypeId: record.zMaintenanceTypeId,
      zFieldId: record.zFieldId
    });
  }

  deleteRecord(record: FieldMaintenance): void {
    if (confirm(`Are you sure you want to delete this maintenance record for ${record.fieldName}?`)) {
      this.gasService.deleteFieldMaintenance(record.fieldMaintenanceGuid).subscribe({
        next: () => {
          this.loadRecords();
        },
        error: (error) => {
          console.error('Error deleting maintenance record:', error);
        }
      });
    }
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  getFieldName(fieldId: number): string {
    const field = this.fields.find(f => f.zFieldId === fieldId);
    return field ? field.name : 'Unknown';
  }

  getMaintenanceTypeName(typeId: number): string {
    const type = this.maintenanceTypes.find(t => t.zMaintenanceTypeId === typeId);
    return type ? type.name : 'Unknown';
  }

  // Helper method to mark all controls in a form group as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
