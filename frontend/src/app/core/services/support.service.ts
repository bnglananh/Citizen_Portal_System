import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { SupportConversation, SupportMessage } from '../models/support.model';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/support';

  // === CITIZEN ENDPOINTS ===

  /**
   * Lấy hoặc tạo mới cuộc trò chuyện hỗ trợ khẩn cấp của công dân (hệ thống tự random cán bộ phụ trách)
   */
  getCurrentCitizenConversation(): Observable<SupportConversation> {
    return this.http.get<ApiResponse<SupportConversation>>(`${this.baseUrl}/citizen/current`).pipe(
      map(res => res.data)
    );
  }

  /**
   * Lấy danh sách tin nhắn của cuộc trò chuyện (Công dân)
   */
  getCitizenMessages(conversationId: number): Observable<SupportMessage[]> {
    return this.http.get<ApiResponse<SupportMessage[]>>(`${this.baseUrl}/citizen/conversations/${conversationId}/messages`).pipe(
      map(res => res.data || [])
    );
  }

  /**
   * Công dân gửi tin nhắn (kèm text và tùy chọn tệp đính kèm tài liệu/ảnh)
   */
  sendCitizenMessage(conversationId: number, content: string, file?: File | null): Observable<SupportMessage> {
    const formData = new FormData();
    if (content) {
      formData.append('content', content);
    }
    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.post<ApiResponse<SupportMessage>>(
      `${this.baseUrl}/citizen/conversations/${conversationId}/messages`,
      formData
    ).pipe(
      map(res => res.data)
    );
  }

  /**
   * Công dân đóng/kết thúc phiên hỗ trợ
   */
  resolveCitizenConversation(conversationId: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/citizen/conversations/${conversationId}/resolve`, {}).pipe(
      map(() => void 0)
    );
  }

  // === STAFF ENDPOINTS ===

  /**
   * Cán bộ lấy danh sách các phiên hỗ trợ được phân công cho mình
   */
  getStaffAssignedConversations(): Observable<SupportConversation[]> {
    return this.http.get<ApiResponse<SupportConversation[]>>(`${this.baseUrl}/staff/conversations`).pipe(
      map(res => res.data || [])
    );
  }

  /**
   * Cán bộ lấy danh sách tin nhắn của một cuộc trò chuyện
   */
  getStaffMessages(conversationId: number): Observable<SupportMessage[]> {
    return this.http.get<ApiResponse<SupportMessage[]>>(`${this.baseUrl}/staff/conversations/${conversationId}/messages`).pipe(
      map(res => res.data || [])
    );
  }

  /**
   * Cán bộ gửi tin nhắn phản hồi (kèm text và file)
   */
  sendStaffMessage(conversationId: number, content: string, file?: File | null): Observable<SupportMessage> {
    const formData = new FormData();
    if (content) {
      formData.append('content', content);
    }
    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.post<ApiResponse<SupportMessage>>(
      `${this.baseUrl}/staff/conversations/${conversationId}/messages`,
      formData
    ).pipe(
      map(res => res.data)
    );
  }

  /**
   * Cán bộ đánh dấu hoàn tất phiên hỗ trợ
   */
  resolveStaffConversation(conversationId: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/staff/conversations/${conversationId}/resolve`, {}).pipe(
      map(() => void 0)
    );
  }
}
