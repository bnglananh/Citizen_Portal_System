import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { Application, ApplicationStatus } from '../models/application.model';

export interface StaffActionPayload {
  action: 'RECEIVE' | 'PROCESS' | 'REQUEST_REVISION' | 'REJECT' | 'COMPLETE' | string;
  comments?: string;
  rejectionReason?: string;
  revisionNotes?: string;
  resultSummary?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/staff/applications';

  getStaffApplications(params?: {
    status?: ApplicationStatus | string;
    keyword?: string;
    page?: number;
    size?: number;
  }): Observable<PageResponse<Application>> {
    let httpParams = new HttpParams();
    if (params?.status && params.status !== 'ALL') {
      httpParams = httpParams.set('status', params.status);
    }
    if (params?.keyword) {
      httpParams = httpParams.set('keyword', params.keyword);
    }
    if (params?.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }

    return this.http.get<ApiResponse<PageResponse<any>>>(this.baseUrl, { params: httpParams }).pipe(
      map(res => {
        const pageData = res.data || { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, first: true, last: true };
        pageData.content = (pageData.content || []).map((app: any) => this.normalizeStaffApplication(app));
        return pageData;
      })
    );
  }

  performActionSimple(applicationId: number, payload: StaffActionPayload): Observable<Application> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${applicationId}/action-simple`, payload).pipe(
      map(res => this.normalizeStaffApplication(res.data))
    );
  }

  performActionWithFile(applicationId: number, payload: StaffActionPayload, resultFile?: File): Observable<Application> {
    if (!resultFile) {
      return this.performActionSimple(applicationId, payload);
    }

    const formData = new FormData();
    const dataBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    formData.append('data', dataBlob);
    formData.append('resultFile', resultFile);

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${applicationId}/action`, formData).pipe(
      map(res => this.normalizeStaffApplication(res.data))
    );
  }

  private normalizeStaffApplication(app: any): Application {
    if (!app) return app;
    return {
      ...app,
      procedureId: app.procedure ? app.procedure.id : app.procedureId,
      procedureName: app.procedure ? app.procedure.name : app.procedureName,
      citizenName: app.applicantName || (app.citizen ? app.citizen.fullName : app.citizenName),
      citizenPhone: app.applicantPhone || (app.citizen ? app.citizen.phoneNumber : app.citizenPhone),
      citizenIdCard: app.applicantIdCard || (app.citizen ? (app.citizen.identityCardNumber || app.citizen.citizenIdCard) : app.citizenIdCard),
      history: (app.historyList || app.history || []).map((h: any) => ({
        ...h,
        actionBy: h.performerName || h.actionBy || 'Cán bộ thụ lý',
        comment: h.notes || h.comment || h.action
      }))
    };
  }
}
