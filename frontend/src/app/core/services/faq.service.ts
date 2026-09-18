import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { ApiResponse, PageResponse } from '../models/api-response.model';

export interface FaqItemDto {
  id: number;
  question: string;
  answer: string;
  category?: string;
  orderIndex?: number;
  active?: boolean;
  createdAt?: string;
}

export interface CreateFaqDto {
  question: string;
  answer: string;
  category?: string;
  orderIndex?: number;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private http = inject(HttpClient);
  private baseUrl = '/api/faqs';

  private cachedPublicFaqs: FaqItemDto[] | null = null;

  getPublicFaqs(forceRefresh: boolean = false): Observable<FaqItemDto[]> {
    if (this.cachedPublicFaqs && !forceRefresh) {
      return of(this.cachedPublicFaqs);
    }
    return this.http.get<ApiResponse<FaqItemDto[]>>(`${this.baseUrl}/public`).pipe(
      map(res => {
        const list = res.data || [];
        if (list.length > 0) {
          this.cachedPublicFaqs = list;
        }
        return list;
      })
    );
  }

  searchFaqs(keyword?: string, page: number = 0, size: number = 10): Observable<PageResponse<FaqItemDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (keyword && keyword.trim()) {
      params = params.set('keyword', keyword.trim());
    }

    return this.http.get<ApiResponse<PageResponse<FaqItemDto>>>(this.baseUrl, { params }).pipe(
      map(res => res.data)
    );
  }

  getFaqById(id: number): Observable<FaqItemDto> {
    return this.http.get<ApiResponse<FaqItemDto>>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  createFaq(dto: CreateFaqDto): Observable<FaqItemDto> {
    return this.http.post<ApiResponse<FaqItemDto>>(`${this.baseUrl}/admin`, dto).pipe(
      map(res => res.data)
    );
  }

  updateFaq(id: number, dto: CreateFaqDto): Observable<FaqItemDto> {
    return this.http.put<ApiResponse<FaqItemDto>>(`${this.baseUrl}/admin/${id}`, dto).pipe(
      map(res => res.data)
    );
  }

  deleteFaq(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/admin/${id}`).pipe(
      map(() => void 0)
    );
  }
}
