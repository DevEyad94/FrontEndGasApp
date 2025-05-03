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
  ProductionRecord,
  AddProductionRecordDto,
  UpdateProductionRecordDto,
  ProductionRecordFilter
} from '../../models/production-record.model';
import { GasField } from '../../models/gas-field.model';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TextInputComponent } from '../../shared/components/text-input/text-input.component';
import { TextAreaComponent } from '../../shared/components/text-area/text-area.component';
import { DatePickerComponent } from '../../shared/components/date-picker/date-picker.component';
import { LabelComponent } from '../../shared/components/label/label.component';
import { ZskSelectComponent } from '../../shared/components/zsk/zsk-select.component';
import { Pagination } from '../../models/pagination.model';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-production-records',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextInputComponent,
    TextAreaComponent,
    DatePickerComponent,
    LabelComponent,
    ZskSelectComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './production-records.component.html',
  styleUrls: ['./production-records.component.scss']
})
export class ProductionRecordsComponent implements OnInit, OnDestroy {
  Math = Math;
  productionRecords: ProductionRecord[] = [];
  pagination: Pagination = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  };
  fields: GasField[] = [];
  recordForm!: FormGroup;
  filterForm!: FormGroup;
  isEditMode = false;
  selectedRecord: ProductionRecord | null = null;
  isLoading = false;
  isFormVisible = false;
  isSubmitting = false;

  // Sort
  sortColumn = 'dateOfProduction';
  sortDirection = 'desc';

  // File import
  selectedFile: File | null = null;
  importMessage = '';

  private subscriptions: Subscription[] = [];

  // Add property to store cached options
  private fieldOptions: {value: number, label: string}[] = [];

  // Delete confirmation properties
  showDeleteConfirmation = false;
  recordToDelete: ProductionRecord | null = null;

  constructor(
    private gasService: GasService,
    private zskService: ZskService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.initForms();

    // Load filter options
    this.loadFilterOptions();

    // Load records with a small delay to give the browser time to render the UI
    setTimeout(() => {
      this.loadRecords();
    }, 100);
  }

  initForms(): void {
    this.recordForm = this.fb.group({
      productionRecordGuid: [''],
      dateOfProduction: ['', Validators.required],
      productionOfCost: [0, [Validators.required, Validators.min(0)]],
      productionRate: [0, [Validators.required, Validators.min(0)]],
      zFieldId: [null, Validators.required]
    });

    this.filterForm = this.fb.group({
      search: [''],
      startDate: [''],
      endDate: [''],
      zFieldId: [null],
      minProductionRate: [null],
      maxProductionRate: [null],
      year: [null]
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
    this.zskService.getFields().subscribe({
      next: (fields) => {
        this.fields = fields;

        // Cache the options immediately
        this.fieldOptions = this.fields.map((field) => ({
          value: field.zFieldId,
          label: field.name,
        }));
      },
      error: (error) => {
        console.error('Error fetching fields:', error);
        this.toastService.error('Failed to load fields. Please try again later.');
      }
    });
  }

  loadRecords(): void {
    this.isLoading = true;
    const filters: ProductionRecordFilter = this.filterForm.value;

    this.gasService.getProductionRecordsWithFilter(
      filters,
      this.pagination.currentPage,
      this.pagination.itemsPerPage,
      this.sortColumn,
      this.sortDirection
    ).subscribe({
      next: (response) => {
        this.productionRecords = response.result.data || [];
        this.pagination = response.pagination;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching production records:', error);
        this.isLoading = false;
        this.toastService.error('Failed to load production records. Please try again later.');
      }
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
      productionRecordGuid: '',
      productionOfCost: 0,
      productionRate: 0,
      zFieldId: null
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
      const updateData: UpdateProductionRecordDto = {
        productionRecordGuid: recordData.productionRecordGuid,
        dateOfProduction: recordData.dateOfProduction,
        productionOfCost: recordData.productionOfCost,
        productionRate: recordData.productionRate,
        zFieldId: recordData.zFieldId
      };

      this.gasService.updateProductionRecord(updateData).subscribe({
        next: () => {
          this.onSubmitSuccess('Production record updated successfully!');
        },
        error: (error) => {
          console.error('Error updating record:', error);
          this.isSubmitting = false;
          this.toastService.error('Failed to update production record. Please try again.');
        }
      });
    } else {
      const newData: AddProductionRecordDto = {
        dateOfProduction: recordData.dateOfProduction,
        productionOfCost: recordData.productionOfCost,
        productionRate: recordData.productionRate,
        zFieldId: recordData.zFieldId
      };

      this.gasService.addProductionRecord(newData).subscribe({
        next: () => {
          this.onSubmitSuccess('Production record added successfully!');
        },
        error: (error) => {
          console.error('Error adding record:', error);
          this.isSubmitting = false;
          this.toastService.error('Failed to add production record. Please try again.');
        }
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

  editRecord(record: ProductionRecord): void {
    this.isEditMode = true;
    this.selectedRecord = record;

    // Set form visible without toggling if not already visible
    if (!this.isFormVisible) {
      this.isFormVisible = true;
    }

    this.recordForm.patchValue({
      productionRecordGuid: record.productionRecordGuid,
      dateOfProduction: this.formatDateForInput(record.dateOfProduction),
      productionOfCost: record.productionOfCost,
      productionRate: record.productionRate,
      zFieldId: record.zFieldId
    });
  }

  showDeleteConfirmationDialog(record: ProductionRecord): void {
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

  deleteRecord(record: ProductionRecord): void {
    this.showDeleteConfirmationDialog(record);
  }

  performDeleteRecord(record: ProductionRecord): void {
    this.gasService.deleteProductionRecord(record.productionRecordGuid).subscribe({
      next: () => {
        this.loadRecords();
        this.toastService.success(`Production record for ${record.fieldName} has been deleted.`);
      },
      error: (error) => {
        console.error('Error deleting record:', error);
        this.toastService.error('Failed to delete production record. Please try again.');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.toastService.warning('Please select a file first.');
      return;
    }

    this.isLoading = true;
    this.importMessage = '';

    this.gasService.importProductionRecords(this.selectedFile).subscribe({
      next: (count) => {
        this.importMessage = `Successfully imported ${count} records.`;
        this.loadRecords();
        this.isLoading = false;
        this.selectedFile = null;
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        this.toastService.success(`Successfully imported ${count} production records.`);
      },
      error: (error) => {
        console.error('Error importing records:', error);
        this.importMessage = 'Error importing records. Please check the file format.';
        this.isLoading = false;
        this.toastService.error('Failed to import records. Please check the file format and try again.');
      }
    });
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  getFieldName(fieldId: number): string {
    const field = this.fields.find(f => f.zFieldId === fieldId);
    return field ? field.name : 'Unknown';
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

  // Helper methods for select options
  getFieldOptions() {
    return this.fieldOptions;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
