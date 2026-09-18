import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { User } from '../models/user.model';

export interface CreateAdminUserRequest {
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  identityCardNumber?: string;
  password?: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = '/api/admin/users';

  getUsers(search?: string, role?: string, page: number = 0, size: number = 10): Observable<PageResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (role && role !== 'ALL') {
      params = params.set('role', role);
    }

    return this.http.get<ApiResponse<PageResponse<any>>>(this.baseUrl, { params }).pipe(
      map(res => {
        const pageData = res.data;
        const mappedContent: User[] = (pageData.content || []).map((u: any) => ({
          id: u.id,
          username: u.username,
          fullName: u.fullName,
          email: u.email,
          phoneNumber: u.phoneNumber,
          citizenIdCard: u.identityCardNumber || u.citizenIdCard,
          identityCardNumber: u.identityCardNumber,
          roles: u.roles || [],
          enabled: u.active !== undefined ? u.active : (u.enabled !== undefined ? u.enabled : true),
          active: u.active !== undefined ? u.active : true,
          createdAt: u.createdAt
        }));

        return {
          ...pageData,
          content: mappedContent
        };
      })
    );
  }

  createUser(payload: CreateAdminUserRequest): Observable<User> {
    return this.http.post<ApiResponse<any>>(this.baseUrl, payload).pipe(
      map(res => res.data)
    );
  }

  toggleUserStatus(userId: number): Observable<User> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/${userId}/toggle-status`, {}).pipe(
      map(res => res.data)
    );
  }

  updateUserRoles(userId: number, roles: string[]): Observable<User> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${userId}/roles`, { roles }).pipe(
      map(res => res.data)
    );
  }

  resetPassword(userId: number, newPassword?: string): Observable<string> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${userId}/reset-password`, { newPassword }).pipe(
      map(res => res.data?.newPassword || res.message)
    );
  }
}
