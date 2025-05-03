import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GasService } from '../../services/gas.service';
import { ZskService } from '../../core/services/zsk.service';
import { ProductionRecord, AddProductionRecordDto, UpdateProductionRecordDto, ProductionRecordFilter } from '../../models/production-record.model';
import { GasField } from '../../models/gas-field.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-production-records',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './production-records.component.html',
  styleUrls: ['./production-records.component.scss']
})
export class ProductionRecordsComponent implements OnInit {
  Math = Math;
  productionRecords: ProductionRecord[] = [];
  fields: GasField[] = [];
  recordForm!: FormGroup;
  filterForm!: FormGroup;
  isEditMode = false;
  selectedRecord: ProductionRecord | null = null;
  isLoading = false;
  isFormVisible = false;
  isSubmitting = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalRecords = 0;

  // Sort
  sortColumn = 'dateOfProduction';
  sortDirection = 'desc';

  // File import
  selectedFile: File | null = null;
  importMessage = '';

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

    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadRecords();
    });
  }

  loadFilterOptions(): void {
    this.lookupService.getFields().subscribe({
      next: (fields) => {
        this.fields = fields;
      },
      error: (error) => {
        console.error('Error fetching fields:', error);
      }
    });
  }

  loadRecords(): void {
    this.isLoading = true;
    const filters: ProductionRecordFilter = this.filterForm.value;

    this.gasService.getProductionRecordsWithFilter(
      filters,
      this.currentPage,
      this.pageSize,
      this.sortColumn,
      this.sortDirection
    ).subscribe({
      next: (response) => {
        this.productionRecords = response.data;
        this.totalPages = response.totalPages;
        this.totalRecords = response.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching production records:', error);
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
          this.onSubmitSuccess();
        },
        error: (error) => {
          console.error('Error updating record:', error);
          this.isSubmitting = false;
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
          this.onSubmitSuccess();
        },
        error: (error) => {
          console.error('Error adding record:', error);
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

  editRecord(record: ProductionRecord): void {
    this.isEditMode = true;
    this.selectedRecord = record;
    this.isFormVisible = true;

    this.recordForm.patchValue({
      productionRecordGuid: record.productionRecordGuid,
      dateOfProduction: this.formatDateForInput(record.dateOfProduction),
      productionOfCost: record.productionOfCost,
      productionRate: record.productionRate,
      zFieldId: record.zFieldId
    });
  }

  deleteRecord(record: ProductionRecord): void {
    if (confirm(`Are you sure you want to delete the production record for ${record.fieldName}?`)) {
      this.gasService.deleteProductionRecord(record.productionRecordGuid).subscribe({
        next: () => {
          this.loadRecords();
        },
        error: (error) => {
          console.error('Error deleting record:', error);
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
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
      },
      error: (error) => {
        console.error('Error importing records:', error);
        this.importMessage = 'Error importing records. Please check the file format.';
        this.isLoading = false;
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
}
