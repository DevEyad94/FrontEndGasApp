import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { GasField, GasFieldResponse } from '../../models/gas-field.model';
import { MaintenanceType, MaintenanceTypeResponse } from '../../models/maintenance-type.model';

@Injectable({
  providedIn: 'root'
})
export class ZskService {
  private apiUrl = `${environment.apiUrl}Zsk/`;

  constructor(private http: HttpClient) { }

  getFields(): Observable<GasField[]> {
    return this.http.get<GasFieldResponse>(`${this.apiUrl}zFields`)
      .pipe(map(response => response.data));
  }

  getMaintenanceTypes(): Observable<MaintenanceType[]> {
    return this.http.get<MaintenanceTypeResponse>(`${this.apiUrl}zMaintenanceTypes`)
      .pipe(map(response => response.data));
  }
}
