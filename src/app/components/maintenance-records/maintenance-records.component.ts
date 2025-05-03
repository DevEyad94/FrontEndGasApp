import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { forkJoin, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TextInputComponent } from '../../shared/components/text-input/text-input.component';
import { TextAreaComponent } from '../../shared/components/text-area/text-area.component';
import { DatePickerComponent } from '../../shared/components/date-picker/date-picker.component';
import { LabelComponent } from '../../shared/components/label/label.component';
import { ZskSelectComponent } from '../../shared/components/zsk/zsk-select.component';
import { Pagination } from '../../models/pagination.model';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { HasRoleDirective } from '../../shared/directives/hasRole.directive';
import { Roles } from '../../core/enum/roles.enum';

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
    ConfirmDialogComponent,
    HasRoleDirective,
  ],
  templateUrl: './maintenance-records.component.html',
  styleUrls: ['./maintenance-records.component.scss'],
})
export class MaintenanceRecordsComponent implements OnInit, OnDestroy {
  Math = Math;
  roleEnum = Roles;
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


  // Sort
  sortColumn = 'fieldMaintenanceDate';
  sortDirection = 'desc';

  private subscriptions: Subscription[] = [];

  // Add property to store cached options
  private maintenanceTypeOptions: {value: number, label: string}[] = [];
  private fieldOptions: {value: number, label: string}[] = [];

  // Delete confirmation properties
  showDeleteConfirmation = false;
  recordToDelete: FieldMaintenance | null = null;

  constructor(
    private gasService: GasService,
    private zskService: ZskService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForms();

    // First load basic options
    this.loadFilterOptions();

    // Load records with a small delay to give the browser time to render the UI
    setTimeout(() => {
      this.loadRecords();
    }, 100);
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

    const filterSubscription = this.filterForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.pagination.currentPage = 1;
        this.loadRecords();
      });

    this.subscriptions.push(filterSubscription);
  }

  loadFilterOptions(): void {
    forkJoin({
      fields: this.zskService.getFields(),
      maintenanceTypes: this.zskService.getMaintenanceTypes(),
    }).subscribe({
      next: (result) => {
        this.fields = result.fields;
        this.maintenanceTypes = result.maintenanceTypes;

        // Cache the options immediately
        this.maintenanceTypeOptions = this.maintenanceTypes.map((type) => ({
          value: type.zMaintenanceTypeId,
          label: type.name,
        }));

        this.fieldOptions = this.fields.map((field) => ({
          value: field.zFieldId,
          label: field.name,
        }));
      },
      error: (error) => {
        console.error('Error fetching filter options:', error);
        this.toastService.error('Failed to load filter options. Please try again later.');
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
          this.toastService.error('Failed to load maintenance records. Please try again later.');
        },
      });
  }

  onPageChange(page: number): void {
    this.pagination.currentPage = page;
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

    if (this.isFormVisible && !this.isEditMode) {
      this.resetForm();
    } else if (!this.isFormVisible) {
      this.resetForm();
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

    this.isEditMode = false;
    this.selectedRecord = null;
  }

  onSubmit(): void {
    if (this.recordForm.invalid) {
      this.markFormGroupTouched(this.recordForm);
      this.toastService.warning('Please fill in all required fields correctly.');
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
          this.onSubmitSuccess('Maintenance record updated successfully!');
        },
        error: (error) => {
          console.error('Error updating maintenance record:', error);
          this.isSubmitting = false;
          this.toastService.error('Failed to update maintenance record. Please try again.');
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
          this.onSubmitSuccess('Maintenance record added successfully!');
        },
        error: (error) => {
          console.error('Error adding maintenance record:', error);
          this.isSubmitting = false;
          this.toastService.error('Failed to add maintenance record. Please try again.');
        },
      });
    }
  }

  onSubmitSuccess(message: string): void {
    this.loadRecords();
    this.resetForm();
    this.isFormVisible = false;
    this.isSubmitting = false;
    this.toastService.success(message);
  }

  editRecord(record: FieldMaintenance): void {
    this.isEditMode = true;
    this.selectedRecord = record;

    // Set form visible without toggling if not already visible
    if (!this.isFormVisible) {
      this.isFormVisible = true;
    }

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

  showDeleteConfirmationDialog(record: FieldMaintenance): void {
    this.recordToDelete = record;
    this.showDeleteConfirmation = true;
  }

  onConfirmDelete(): void {
    if (this.recordToDelete) {
      this.performDeleteRecord(this.recordToDelete);
    }
    this.showDeleteConfirmation = false;
    this.recordToDelete = null;
  }

  onCancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.recordToDelete = null;
  }

  deleteRecord(record: FieldMaintenance): void {
    this.showDeleteConfirmationDialog(record);
  }

  performDeleteRecord(record: FieldMaintenance): void {
    this.gasService
      .deleteFieldMaintenance(record.fieldMaintenanceGuid)
      .subscribe({
        next: () => {
          this.loadRecords();
          this.toastService.success(`Maintenance record for ${record.fieldName} has been deleted.`);
        },
        error: (error) => {
          console.error('Error deleting maintenance record:', error);
          this.toastService.error('Failed to delete maintenance record. Please try again.');
        },
      });
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
    return this.maintenanceTypeOptions;
  }

  getFieldOptions() {
    return this.fieldOptions;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
