import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DashboardResponse } from '../../models/dashboard.model';
import { DashboardFilter } from '../../models/dashboard.model';
import { GenericResponse } from '../../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = `${environment.apiUrl}Dashboard`;

  constructor(private http: HttpClient) { }

  getDashboardData(filter: DashboardFilter = {}): Observable<DashboardResponse> {
    let params = new HttpParams();

    if (filter.minProductionRate !== undefined && filter.minProductionRate !== null) {
      params = params.set('MinProductionRate', filter.minProductionRate.toString());
    }

    if (filter.maxProductionRate !== undefined && filter.maxProductionRate !== null) {
      params = params.set('MaxProductionRate', filter.maxProductionRate.toString());
    }

    if (filter.extractionYear !== undefined && filter.extractionYear !== null) {
      params = params.set('ExtractionYear', filter.extractionYear.toString());
    }

    if (filter.fromYear !== undefined && filter.fromYear !== null) {
      params = params.set('FromYear', filter.fromYear.toString());
    }

    if (filter.toYear !== undefined && filter.toYear !== null) {
      params = params.set('ToYear', filter.toYear.toString());
    }

    if (filter.maintenanceTypeId !== undefined && filter.maintenanceTypeId !== null) {
      params = params.set('MaintenanceTypeId', filter.maintenanceTypeId.toString());
    }

    if (filter.minCost !== undefined && filter.minCost !== null) {
      params = params.set('MinCost', filter.minCost.toString());
    }

    if (filter.maxCost !== undefined && filter.maxCost !== null) {
      params = params.set('MaxCost', filter.maxCost.toString());
    }

    if (filter.fieldId !== undefined && filter.fieldId !== null) {
      params = params.set('FieldId', filter.fieldId.toString());
    }

    return this.http.get<GenericResponse<DashboardResponse>>(this.baseUrl, { params }).pipe(
      map(response => response.data)
    );
  }

  exportDashboardData(filter: DashboardFilter = {}, format: 'pdf' | 'excel'): Observable<Blob> {
    let params = new HttpParams();

    // Set format parameter
    params = params.set('format', format);

    // Add filter parameters
    if (filter.minProductionRate !== undefined && filter.minProductionRate !== null) {
      params = params.set('MinProductionRate', filter.minProductionRate.toString());
    }

    if (filter.maxProductionRate !== undefined && filter.maxProductionRate !== null) {
      params = params.set('MaxProductionRate', filter.maxProductionRate.toString());
    }

    if (filter.extractionYear !== undefined && filter.extractionYear !== null) {
      params = params.set('ExtractionYear', filter.extractionYear.toString());
    }

    if (filter.fromYear !== undefined && filter.fromYear !== null) {
      params = params.set('FromYear', filter.fromYear.toString());
    }

    if (filter.toYear !== undefined && filter.toYear !== null) {
      params = params.set('ToYear', filter.toYear.toString());
    }

    if (filter.maintenanceTypeId !== undefined && filter.maintenanceTypeId !== null) {
      params = params.set('MaintenanceTypeId', filter.maintenanceTypeId.toString());
    }

    if (filter.minCost !== undefined && filter.minCost !== null) {
      params = params.set('MinCost', filter.minCost.toString());
    }

    if (filter.maxCost !== undefined && filter.maxCost !== null) {
      params = params.set('MaxCost', filter.maxCost.toString());
    }

    if (filter.fieldId !== undefined && filter.fieldId !== null) {
      params = params.set('FieldId', filter.fieldId.toString());
    }

    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  getYears(): Observable<number[]> {
    return this.http.get<GenericResponse<{ year: number }[]>>(`${environment.apiUrl}Gas/years`).pipe(
      map(response => response.data.map(item => item.year))
    );
  }
}
