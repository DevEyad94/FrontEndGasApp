import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GenericResponse } from '../models/pagination.model';
import { ZGender, zRelationship, ZZone, ZGraveType } from '../models/zsk.model';

@Injectable({
  providedIn: 'root',
})
export class ZskService {
  private baseUrl = environment.apiUrl + 'zsk/';

  constructor(private http: HttpClient) {}

  getGender(): Observable<GenericResponse<ZGender[]>> {
    return this.http.get<GenericResponse<ZGender[]>>(this.baseUrl + "Genders");
  }
  getZone(): Observable<GenericResponse<ZZone[]>> {
    return this.http.get<GenericResponse<ZZone[]>>(this.baseUrl + "Zones");
  }
  getRelationship(): Observable<GenericResponse<zRelationship[]>> {
    return this.http.get<GenericResponse<zRelationship[]>>(
      this.baseUrl + "Relationship"
    );
  }
  getGraveType(): Observable<GenericResponse<ZGraveType[]>> {
    return this.http.get<GenericResponse<ZGraveType[]>>(
      this.baseUrl + "GraveTypes"
    );
  }
}
