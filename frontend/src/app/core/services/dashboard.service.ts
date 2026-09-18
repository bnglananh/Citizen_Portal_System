import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface MonthlyTrend {
  month: string;
  receivedCount: number;
  completedCount: number;
}

export interface CategoryVolume {
  name: string;
  count: number;
  percent: number;
}

export interface DashboardSummary {
  totalApplications: number;
  draftCount: number;
  submittedCount: number;
  receivedCount: number;
  processingCount: number;
  needRevisionCount: number;
  resubmittedCount: number;
  completedCount: number;
  rejectedCount: number;
  totalUsers?: number;
  totalProcedures?: number;
  avgProcessingTimeDays?: number;
  onTimeRate?: number;
  statusDistribution?: Record<string, number>;
  monthlyTrends?: MonthlyTrend[];
  categoryVolumes?: CategoryVolume[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/dashboard';

  getCitizenStats(): Observable<DashboardSummary> {
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.baseUrl}/citizen`).pipe(
      map(res => res.data)
    );
  }

  getStaffStats(): Observable<DashboardSummary> {
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.baseUrl}/staff`).pipe(
      map(res => res.data)
    );
  }

  getAdminStats(): Observable<DashboardSummary> {
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.baseUrl}/admin`).pipe(
      map(res => res.data)
    );
  }
}
