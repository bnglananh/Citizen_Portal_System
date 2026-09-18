import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { Application, ApplicationDocument, ApplicationHistory, ApplicationStatus } from '../models/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/applications';

  createDraft(data: {
    procedureId: number;
    applicantName?: string;
    applicantPhone?: string;
    applicantEmail?: string;
    applicantIdCard?: string;
    applicantAddress?: string;
    formData?: string;
  }): Observable<Application> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/draft`, data).pipe(
      map(res => this.normalizeApplication(res.data))
    );
  }

  uploadDocument(
    applicationId: number,
    file: File,
    documentName?: string,
    requiredDocumentId?: number
  ): Observable<ApplicationDocument> {
    const formData = new FormData();
    formData.append('file', file);
    if (documentName) formData.append('documentName', documentName);
    if (requiredDocumentId) formData.append('requiredDocumentId', requiredDocumentId.toString());

    return this.http.post<ApiResponse<ApplicationDocument>>(`${this.baseUrl}/${applicationId}/documents`, formData).pipe(
      map(res => res.data)
    );
  }

  deleteDocument(applicationId: number, documentId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${applicationId}/documents/${documentId}`).pipe(
      map(() => void 0)
    );
  }

  submitApplication(applicationId: number): Observable<Application> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${applicationId}/submit`, {}).pipe(
      map(res => this.normalizeApplication(res.data))
    );
  }

  resubmitApplication(applicationId: number, revisionNotes?: string): Observable<Application> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${applicationId}/resubmit`, { revisionNotes }).pipe(
      map(res => this.normalizeApplication(res.data))
    );
  }

  getMyApplications(status?: ApplicationStatus | string, page = 0, size = 10): Observable<PageResponse<Application>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (status && status !== 'ALL') {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<PageResponse<any>>>(`${this.baseUrl}/my`, { params }).pipe(
      map(res => {
        const pageData = res.data || { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, first: true, last: true };
        pageData.content = (pageData.content || []).map((app: any) => this.normalizeApplication(app));
        return pageData;
      })
    );
  }

  getApplicationDetail(id: number): Observable<Application> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${id}`).pipe(
      map(res => this.normalizeApplication(res.data))
    );
  }

  getApplicationHistory(id: number): Observable<ApplicationHistory[]> {
    return this.http.get<ApiResponse<ApplicationHistory[]>>(`${this.baseUrl}/${id}/history`).pipe(
      map(res => res.data || [])
    );
  }

  trackApplicationPublic(code: string): Observable<Application> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/public/track/${code}`).pipe(
      map(res => this.normalizeApplication(res.data))
    );
  }

  getFileDownloadUrl(filePath?: string): string {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return `${this.baseUrl}/download?filePath=${encodeURIComponent(filePath)}`;
  }

  private normalizeApplication(app: any): Application {
    if (!app) return app;
    return {
      ...app,
      procedureId: app.procedure ? app.procedure.id : app.procedureId,
      procedureName: app.procedure ? app.procedure.name : app.procedureName,
      feeAmount: app.fee !== undefined ? Number(app.fee) : (app.procedure?.fee !== undefined ? Number(app.procedure.fee) : (app.feeAmount || 0)),
      citizenName: app.applicantName || (app.citizen ? app.citizen.fullName : app.citizenName),
      citizenPhone: app.applicantPhone || (app.citizen ? app.citizen.phoneNumber : app.citizenPhone),
      citizenIdCard: app.applicantIdCard || (app.citizen ? (app.citizen.identityCardNumber || app.citizen.citizenIdCard) : app.citizenIdCard),
      history: (app.historyList || app.history || []).map((h: any) => ({
        ...h,
        actionBy: h.performerName || h.actionBy || 'Hệ thống',
        comment: h.notes || h.comment || h.action
      }))
    };
  }
}
