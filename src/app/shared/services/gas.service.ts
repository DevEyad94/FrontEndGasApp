import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ProductionRecord,
  AddProductionRecordDto,
  UpdateProductionRecordDto,
  ProductionRecordFilter,
} from '../../models/production-record.model';
import {
  FieldMaintenance,
  AddFieldMaintenanceDto,
  UpdateFieldMaintenanceDto,
  FieldMaintenanceFilter,
} from '../../models/field-maintenance.model';
import {
  GenericResponse,
  PaginatedResult,
} from '../../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class GasService {
  private apiUrl = `${environment.apiUrl}Gas/`;

  constructor(private http: HttpClient) {}

  // Production Records
  getProductionRecords(
    pageNumber: number = 1,
    pageSize: number = 10,
    sortColumn: string = 'dateOfProduction',
    sortDirection: string = 'desc'
  ): Observable<PaginatedResult<GenericResponse<ProductionRecord[]> | null>> {
    const paginatedResult: PaginatedResult<GenericResponse<ProductionRecord[]> | null> =
      new PaginatedResult<GenericResponse<ProductionRecord[]> | null>();

    let params = new HttpParams();

    if (pageNumber != null && pageSize != null) {
      params = params.append('PageNumber', pageNumber.toString());
      params = params.append('PageSize', pageSize.toString());
    }

    if (sortColumn) {
      params = params.append('SortColumn', sortColumn);
    }

    if (sortDirection) {
      params = params.append('SortDirection', sortDirection);
    }

    return this.http
      .get<GenericResponse<ProductionRecord[]>>(
        `${this.apiUrl}productionrecord`,
        { observe: 'response', params }
      )
      .pipe(
        map((response: any) => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') != null) {
            paginatedResult.pagination = JSON.parse(
              response.headers.get('Pagination')
            );
          }
          return paginatedResult;
        })
      );
  }

  getProductionRecordsWithFilter(
    filter: ProductionRecordFilter,
    pageNumber: number = 1,
    pageSize: number = 10,
    sortColumn: string = 'dateOfProduction',
    sortDirection: string = 'desc'
  ): Observable<PaginatedResult<GenericResponse<ProductionRecord[]>>> {
    const paginatedResult: PaginatedResult<GenericResponse<ProductionRecord[]>> =
      new PaginatedResult<GenericResponse<ProductionRecord[]>>();

    let params = new HttpParams();

    if (pageNumber != null && pageSize != null) {
      params = params.append('PageNumber', pageNumber.toString());
      params = params.append('PageSize', pageSize.toString());
    }

    if (sortColumn) {
      params = params.append('SortColumn', sortColumn);
    }

    if (sortDirection) {
      params = params.append('SortDirection', sortDirection);
    }

    if (filter.search) params = params.append('search', filter.search);
    if (filter.startDate) params = params.append('StartDate', filter.startDate);
    if (filter.endDate) params = params.append('EndDate', filter.endDate);
    if (filter.zFieldId)
      params = params.append('zFieldId', filter.zFieldId.toString());
    if (filter.minProductionRate)
      params = params.append(
        'MinProductionRate',
        filter.minProductionRate.toString()
      );
    if (filter.maxProductionRate)
      params = params.append(
        'MaxProductionRate',
        filter.maxProductionRate.toString()
      );
    if (filter.year) params = params.append('Year', filter.year.toString());

    return this.http
      .get<GenericResponse<ProductionRecord[]>>(
        `${this.apiUrl}productionrecord/filter`,
        { observe: 'response', params }
      )
      .pipe(
        map((response: any) => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') != null) {
            paginatedResult.pagination = JSON.parse(
              response.headers.get('Pagination')
            );
          }
          return paginatedResult;
        })
      );
  }

  getProductionRecord(id: string): Observable<GenericResponse<ProductionRecord>> {
    return this.http
      .get<GenericResponse<ProductionRecord>>(
        `${this.apiUrl}productionrecord/${id}`
      );
  }

  addProductionRecord(
    record: AddProductionRecordDto
  ): Observable<GenericResponse<ProductionRecord>> {
    return this.http
      .post<GenericResponse<ProductionRecord>>(
        `${this.apiUrl}productionrecord`,
        record
      );
  }

  updateProductionRecord(
    record: UpdateProductionRecordDto
  ): Observable<GenericResponse<ProductionRecord>> {
    return this.http
      .put<GenericResponse<ProductionRecord>>(
        `${this.apiUrl}productionrecord`,
        record
      );
  }

  deleteProductionRecord(id: string): Observable<GenericResponse<ProductionRecord[]>> {
    return this.http
      .delete<GenericResponse<ProductionRecord[]>>(
        `${this.apiUrl}productionrecord/${id}`
      );
  }

  importProductionRecords(file: File): Observable<GenericResponse<number>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<GenericResponse<number>>(
        `${this.apiUrl}productionrecord/import`,
        formData
      );
  }

  // Field Maintenance
  getFieldMaintenances(
    pageNumber: number = 1,
    pageSize: number = 10,
    sortColumn: string = 'fieldMaintenanceDate',
    sortDirection: string = 'desc'
  ): Observable<PaginatedResult<GenericResponse<FieldMaintenance[]> | null>> {
    const paginatedResult: PaginatedResult<GenericResponse<FieldMaintenance[]> | null> =
      new PaginatedResult<GenericResponse<FieldMaintenance[]> | null>();

    let params = new HttpParams();

    if (pageNumber != null && pageSize != null) {
      params = params.append('PageNumber', pageNumber.toString());
      params = params.append('PageSize', pageSize.toString());
    }

    if (sortColumn) {
      params = params.append('SortColumn', sortColumn);
    }

    if (sortDirection) {
      params = params.append('SortDirection', sortDirection);
    }

    return this.http
      .get<GenericResponse<FieldMaintenance[]>>(
        `${this.apiUrl}fieldmaintenance`,
        { observe: 'response', params }
      )
      .pipe(
        map((response: any) => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') != null) {
            paginatedResult.pagination = JSON.parse(
              response.headers.get('Pagination')
            );
          }
          return paginatedResult;
        })
      );
  }

  getFieldMaintenancesWithFilter(
    filter: FieldMaintenanceFilter,
    pageNumber: number = 1,
    pageSize: number = 10,
    sortColumn: string = 'fieldMaintenanceDate',
    sortDirection: string = 'desc'
  ): Observable<PaginatedResult<GenericResponse<FieldMaintenance[] | null>>> {
    const paginatedResult: PaginatedResult<GenericResponse<FieldMaintenance[] | null>> =
      new PaginatedResult<GenericResponse<FieldMaintenance[] | null>>();

    let params = new HttpParams();

    if (pageNumber != null && pageSize != null) {
      params = params.append('PageNumber', pageNumber.toString());
      params = params.append('PageSize', pageSize.toString());
    }

    if (sortColumn) {
      params = params.append('SortColumn', sortColumn);
    }

    if (sortDirection) {
      params = params.append('SortDirection', sortDirection);
    }

    if (filter.search) params = params.append('search', filter.search);
    if (filter.startDate) params = params.append('StartDate', filter.startDate);
    if (filter.endDate) params = params.append('EndDate', filter.endDate);
    if (filter.zMaintenanceTypeId)
      params = params.append(
        'zMaintenanceTypeId',
        filter.zMaintenanceTypeId.toString()
      );
    if (filter.zFieldId)
      params = params.append('zFieldId', filter.zFieldId.toString());
    if (filter.minCost)
      params = params.append('MinCost', filter.minCost.toString());
    if (filter.maxCost)
      params = params.append('MaxCost', filter.maxCost.toString());

    return this.http
      .get<GenericResponse<FieldMaintenance[] | null>>(
        `${this.apiUrl}fieldmaintenance/filter`,
        { observe: 'response', params }
      )
      .pipe(
        map((response: any) => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') != null) {
            paginatedResult.pagination = JSON.parse(
              response.headers.get('Pagination')
            );
          }
          return paginatedResult;
        })
      );
  }

  getFieldMaintenance(id: string): Observable<GenericResponse<FieldMaintenance>> {
    return this.http
      .get<GenericResponse<FieldMaintenance>>(
        `${this.apiUrl}fieldmaintenance/${id}`
      );
  }

  addFieldMaintenance(
    maintenance: AddFieldMaintenanceDto
  ): Observable<GenericResponse<FieldMaintenance>> {
    return this.http
      .post<GenericResponse<FieldMaintenance>>(
        `${this.apiUrl}fieldmaintenance`,
        maintenance
      );
  }

  updateFieldMaintenance(
    maintenance: UpdateFieldMaintenanceDto
  ): Observable<GenericResponse<FieldMaintenance>> {
    return this.http
      .put<GenericResponse<FieldMaintenance>>(
        `${this.apiUrl}fieldmaintenance`,
        maintenance
      );
  }

  deleteFieldMaintenance(id: string): Observable<GenericResponse<FieldMaintenance[]>> {
    return this.http
      .delete<GenericResponse<FieldMaintenance[]>>(
        `${this.apiUrl}fieldmaintenance/${id}`
      );
  }

  getDisabledMonths(): Observable<GenericResponse<{ year: number; disabledMonths: number[] }[]>> {
    return this.http.get<GenericResponse<{ year: number; disabledMonths: number[] }[]>>(
      `${this.apiUrl}productionrecord/disabledmonths`
    );
  }
}
