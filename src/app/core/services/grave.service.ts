import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GenericResponse, PaginatedResult } from '../models/pagination.model';
import { Grave } from '../models/grave.model';
import { GraveImagePost, GravePost } from '../models/grave-post.model';
import { DateFormatterService } from '../../shared/date-formatter.service';
@Injectable({
  providedIn: 'root',
})
export class GraveService {
  private baseUrl = environment.apiUrl + 'grave/';

  constructor(
    private http: HttpClient,
    private dateFormatter: DateFormatterService
  ) {}

  getGravePaginationWithFilter(
    page?: number,
    itemsPerPage?: number,
    withImg: boolean = true,
    search?: string,
    // sortColumn?: string,
    // sortDirection?: string,
    zGenderId?: number,
    zZoneId?: number,
    zGraveTypeId?: number,
    dateOfBirth?: string,
    dateOfDeath?: string
  ): Observable<PaginatedResult<GenericResponse<Grave[]> | null>> {
    const paginatedResult: PaginatedResult<GenericResponse<Grave[]> | null> =
      new PaginatedResult<GenericResponse<Grave[]> | null>();

    // console.log(zGenderId, zZoneId, zGraveTypeId, dateOfBirth, dateOfDeath);
    let params = new HttpParams();

    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page.toString());
      params = params.append('pageSize', itemsPerPage.toString());
    }

    if (withImg !== undefined) {
      params = params.append('withImg', withImg.toString());
    }

    if (search != null) {
      params = params.append('Search', search);
    }

    // if (sortColumn) {
    //   params = params.append('SortColumn', sortColumn);
    // }

    // if (sortDirection) {
    //   params = params.append('SortDirection', sortDirection);
    // }

    if (zGenderId !== null) {
      params = params.append('zGenderId', zGenderId!.toString());
    }

    if (zZoneId !== null) {
      params = params.append('zZoneId', zZoneId!.toString());
    }

    // console.log(zGraveTypeId?.toString().length);

    if (zGraveTypeId!.toString().length > 0) {
      params = params.append('zGraveTypeId', zGraveTypeId!.toString());
    }

    if (dateOfBirth !== null) {
      params = params.append(
        'DateOfBirth',
        this.dateFormatter.formatDateForAPI(dateOfBirth!)
      );
    }

    if (dateOfDeath !== null) {
      params = params.append(
        'DateOfDeath',
        this.dateFormatter.formatDateForAPI(dateOfDeath!)
      );
    }

    return this.http
      .get<GenericResponse<Grave[]> | null>(this.baseUrl + 'GravesWithFilter', {
        observe: 'response',
        params,
      })
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

  getGraveById(graveId: string): Observable<GenericResponse<Grave>> {
    return this.http.get<GenericResponse<Grave>>(`${this.baseUrl}${graveId}`);
  }

  getQRDownload(graveId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}QrGenerator/${graveId}`, {
      responseType: 'blob',
    });
  }

  postGrave(data: GravePost): Observable<GenericResponse<Grave>> {
    return this.http.post<GenericResponse<Grave>>(this.baseUrl, data);
  }

  putGrave(data: GravePost): Observable<GenericResponse<Grave>> {
    return this.http.put<GenericResponse<Grave>>(this.baseUrl, data);
  }

  postImg(img: GraveImagePost): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', img.file);
    return this.http.post(
      this.baseUrl + `ImageUpload/${img.graveId}`,
      formData
    );
  }

  postDeathCertificateImg(img: GraveImagePost): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', img.file);
    return this.http.post(
      this.baseUrl + `DeathCertificateUpload/${img.graveId}`,
      formData
    );
  }

  postBodyReceiptCertificateImg(img: GraveImagePost): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', img.file);
    return this.http.post(
      this.baseUrl + `BodyReceiptCertificateUpload/${img.graveId}`,
      formData
    );
  }
}
