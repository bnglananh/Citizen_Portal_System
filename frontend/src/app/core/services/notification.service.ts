import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, PageResponse } from '../models/api-response.model';

export interface AppNotification {
  id: number;
  applicationId?: number;
  applicationCode?: string;
  title: string;
  content: string;
  notificationType: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/notifications';

  getMyNotifications(page = 0, size = 10): Observable<PageResponse<AppNotification>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<AppNotification>>>(this.baseUrl, { params }).pipe(
      map(res => res.data || { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, first: true, last: true })
    );
  }

  getRecentNotifications(): Observable<AppNotification[]> {
    return this.http.get<ApiResponse<AppNotification[]>>(`${this.baseUrl}/recent`).pipe(
      map(res => res.data || [])
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<ApiResponse<{ unreadCount: number }>>(`${this.baseUrl}/unread-count`).pipe(
      map(res => res.data?.unreadCount || 0)
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/read`, {}).pipe(
      map(() => void 0)
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/read-all`, {}).pipe(
      map(() => void 0)
    );
  }
}
