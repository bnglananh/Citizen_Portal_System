import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { Procedure, ProcedureCategory } from '../models/procedure.model';
import { getAllowedFileExtensions } from '../constants/procedures.data';

@Injectable({
  providedIn: 'root'
})
export class ProcedureService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api';

  getCategories(): Observable<ProcedureCategory[]> {
    return this.http.get<ApiResponse<ProcedureCategory[]>>(`${this.baseUrl}/procedure-categories`).pipe(
      map(res => res.data || [])
    );
  }

  getProcedures(params?: { keyword?: string; categoryId?: number | null; page?: number; size?: number }): Observable<PageResponse<Procedure>> {
    let httpParams = new HttpParams();
    if (params?.keyword) {
      httpParams = httpParams.set('keyword', params.keyword);
    }
    if (params?.categoryId) {
      httpParams = httpParams.set('categoryId', params.categoryId.toString());
    }
    if (params?.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }

    return this.http.get<ApiResponse<PageResponse<Procedure>>>(`${this.baseUrl}/procedures`, { params: httpParams }).pipe(
      map(res => {
        const pageData = res.data;
        if (!pageData) {
          return { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, first: true, last: true };
        }
        // Normalize fields
        pageData.content = pageData.content.map(p => this.normalizeProcedure(p));
        return pageData;
      })
    );
  }

  getProcedureById(id: number): Observable<Procedure> {
    return this.http.get<ApiResponse<Procedure>>(`${this.baseUrl}/procedures/${id}`).pipe(
      map(res => this.normalizeProcedure(res.data))
    );
  }

  getProcedureByCode(code: string): Observable<Procedure> {
    return this.http.get<ApiResponse<Procedure>>(`${this.baseUrl}/procedures/code/${code}`).pipe(
      map(res => this.normalizeProcedure(res.data))
    );
  }

  // === ADMIN PROCEDURE & CATEGORY OPERATIONS ===

  getAllCategoriesForAdmin(): Observable<ProcedureCategory[]> {
    return this.http.get<ApiResponse<ProcedureCategory[]>>(`${this.baseUrl}/procedure-categories/admin/all`).pipe(
      map(res => res.data || [])
    );
  }

  createCategory(category: Partial<ProcedureCategory>): Observable<ProcedureCategory> {
    return this.http.post<ApiResponse<ProcedureCategory>>(`${this.baseUrl}/procedure-categories/admin`, category).pipe(
      map(res => res.data)
    );
  }

  updateCategory(id: number, category: Partial<ProcedureCategory>): Observable<ProcedureCategory> {
    return this.http.put<ApiResponse<ProcedureCategory>>(`${this.baseUrl}/procedure-categories/admin/${id}`, category).pipe(
      map(res => res.data)
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/procedure-categories/admin/${id}`).pipe(
      map(() => void 0)
    );
  }

  createProcedure(payload: any): Observable<Procedure> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/procedures/admin`, payload).pipe(
      map(res => this.normalizeProcedure(res.data))
    );
  }

  updateProcedure(id: number, payload: any): Observable<Procedure> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/procedures/admin/${id}`, payload).pipe(
      map(res => this.normalizeProcedure(res.data))
    );
  }

  deleteProcedure(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/procedures/admin/${id}`).pipe(
      map(() => void 0)
    );
  }

  private normalizeProcedure(p: any): Procedure {
    if (!p) return p;
    return {
      ...p,
      categoryId: p.category ? p.category.id : p.categoryId,
      categoryName: p.category ? p.category.name : p.categoryName,
      processingTimeDays: p.processingDurationDays !== undefined ? p.processingDurationDays : p.processingTimeDays,
      feeAmount: p.fee !== undefined ? Number(p.fee) : (p.feeAmount !== undefined ? p.feeAmount : 0),
      requiredDocuments: (p.requiredDocuments || []).map((doc: any) => {
        const docName = doc.documentName || doc.name || 'Tài liệu đính kèm';
        return {
          ...doc,
          documentName: docName,
          isRequired: doc.required !== undefined ? doc.required : (doc.isRequired !== undefined ? doc.isRequired : true),
          allowedExtensions: doc.allowedExtensions || getAllowedFileExtensions(docName)
        };
      })
    };
  }
}

