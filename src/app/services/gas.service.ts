import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  ProductionRecord,
  AddProductionRecordDto,
  UpdateProductionRecordDto,
  ProductionRecordFilter,
  PagedResponse,
  ServiceResponse
} from '../models/production-record.model';
import {
  FieldMaintenance,
  AddFieldMaintenanceDto,
  UpdateFieldMaintenanceDto,
  FieldMaintenanceFilter
} from '../models/field-maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class GasService {
  private apiUrl = `${environment.apiUrl}Gas/`;

  constructor(private http: HttpClient) { }

  // Production Records
  getProductionRecords(pageNumber: number = 1, pageSize: number = 10,
    sortColumn: string = 'dateOfProduction', sortDirection: string = 'desc'): Observable<PagedResponse<ProductionRecord>> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString())
      .set('SortColumn', sortColumn)
      .set('SortDirection', sortDirection);

    return this.http.get<ServiceResponse<PagedResponse<ProductionRecord>>>(`${this.apiUrl}productionrecord`, { params })
      .pipe(map(response => response.data));
  }

  getProductionRecordsWithFilter(filter: ProductionRecordFilter, pageNumber: number = 1, pageSize: number = 10,
    sortColumn: string = 'dateOfProduction', sortDirection: string = 'desc'): Observable<PagedResponse<ProductionRecord>> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString())
      .set('SortColumn', sortColumn)
      .set('SortDirection', sortDirection);

    if (filter.search) params = params.set('search', filter.search);
    if (filter.startDate) params = params.set('StartDate', filter.startDate);
    if (filter.endDate) params = params.set('EndDate', filter.endDate);
    if (filter.zFieldId) params = params.set('zFieldId', filter.zFieldId.toString());
    if (filter.minProductionRate) params = params.set('MinProductionRate', filter.minProductionRate.toString());
    if (filter.maxProductionRate) params = params.set('MaxProductionRate', filter.maxProductionRate.toString());
    if (filter.year) params = params.set('Year', filter.year.toString());

    return this.http.get<ServiceResponse<PagedResponse<ProductionRecord>>>(`${this.apiUrl}/productionrecord/filter`, { params })
      .pipe(map(response => response.data));
  }

  getProductionRecord(id: string): Observable<ProductionRecord> {
    return this.http.get<ServiceResponse<ProductionRecord>>(`${this.apiUrl}productionrecord/${id}`)
      .pipe(map(response => response.data));
  }

  addProductionRecord(record: AddProductionRecordDto): Observable<ProductionRecord> {
    return this.http.post<ServiceResponse<ProductionRecord>>(`${this.apiUrl}productionrecord`, record)
      .pipe(map(response => response.data));
  }

  updateProductionRecord(record: UpdateProductionRecordDto): Observable<ProductionRecord> {
    return this.http.put<ServiceResponse<ProductionRecord>>(`${this.apiUrl}productionrecord`, record)
      .pipe(map(response => response.data));
  }

  deleteProductionRecord(id: string): Observable<ProductionRecord[]> {
    return this.http.delete<ServiceResponse<ProductionRecord[]>>(`${this.apiUrl}productionrecord/${id}`)
      .pipe(map(response => response.data));
  }

  importProductionRecords(file: File): Observable<number> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ServiceResponse<number>>(`${this.apiUrl}productionrecord/import`, formData)
      .pipe(map(response => response.data));
  }

  // Field Maintenance
  getFieldMaintenances(pageNumber: number = 1, pageSize: number = 10,
    sortColumn: string = 'fieldMaintenanceDate', sortDirection: string = 'desc'): Observable<PagedResponse<FieldMaintenance>> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString())
      .set('SortColumn', sortColumn)
      .set('SortDirection', sortDirection);

    return this.http.get<ServiceResponse<PagedResponse<FieldMaintenance>>>(`${this.apiUrl}fieldmaintenance`, { params })
      .pipe(map(response => response.data));
  }

  getFieldMaintenancesWithFilter(filter: FieldMaintenanceFilter, pageNumber: number = 1, pageSize: number = 10,
    sortColumn: string = 'fieldMaintenanceDate', sortDirection: string = 'desc'): Observable<PagedResponse<FieldMaintenance>> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString())
      .set('SortColumn', sortColumn)
      .set('SortDirection', sortDirection);

    if (filter.search) params = params.set('search', filter.search);
    if (filter.startDate) params = params.set('StartDate', filter.startDate);
    if (filter.endDate) params = params.set('EndDate', filter.endDate);
    if (filter.zMaintenanceTypeId) params = params.set('zMaintenanceTypeId', filter.zMaintenanceTypeId.toString());
    if (filter.zFieldId) params = params.set('zFieldId', filter.zFieldId.toString());
    if (filter.minCost) params = params.set('MinCost', filter.minCost.toString());
    if (filter.maxCost) params = params.set('MaxCost', filter.maxCost.toString());

    return this.http.get<ServiceResponse<PagedResponse<FieldMaintenance>>>(`${this.apiUrl}fieldmaintenance/filter`, { params })
      .pipe(map(response => response.data));
  }

  getFieldMaintenance(id: string): Observable<FieldMaintenance> {
    return this.http.get<ServiceResponse<FieldMaintenance>>(`${this.apiUrl}fieldmaintenance/${id}`)
      .pipe(map(response => response.data));
  }

  addFieldMaintenance(maintenance: AddFieldMaintenanceDto): Observable<FieldMaintenance> {
    return this.http.post<ServiceResponse<FieldMaintenance>>(`${this.apiUrl}fieldmaintenance`, maintenance)
      .pipe(map(response => response.data));
  }

  updateFieldMaintenance(maintenance: UpdateFieldMaintenanceDto): Observable<FieldMaintenance> {
    return this.http.put<ServiceResponse<FieldMaintenance>>(`${this.apiUrl}fieldmaintenance`, maintenance)
      .pipe(map(response => response.data));
  }

  deleteFieldMaintenance(id: string): Observable<FieldMaintenance[]> {
    return this.http.delete<ServiceResponse<FieldMaintenance[]>>(`${this.apiUrl}fieldmaintenance/${id}`)
      .pipe(map(response => response.data));
  }
}
