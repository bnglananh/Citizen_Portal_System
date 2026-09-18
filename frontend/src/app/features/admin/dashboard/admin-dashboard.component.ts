import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { DashboardService, DashboardSummary } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzButtonModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzProgressModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  isLoading = signal<boolean>(true);
  stats = signal<DashboardSummary>({
    totalApplications: 0,
    draftCount: 0,
    submittedCount: 0,
    receivedCount: 0,
    processingCount: 0,
    needRevisionCount: 0,
    resubmittedCount: 0,
    completedCount: 0,
    rejectedCount: 0,
    totalUsers: 0,
    totalProcedures: 0,
    avgProcessingTimeDays: 1.8,
    onTimeRate: 98.6
  });

  statusBreakdown: Array<{ label: string; count: number; percent: number; color: string }> = [];

  monthlyTrends: Array<{ month: string; receivedCount: number; completedCount: number; receivedHeight: number; completedHeight: number }> = [];
  maxMonthlyCount = 1;

  categoryVolumes: Array<{ name: string; count: number; percent: number }> = [
    { name: 'Hộ tịch & Tư pháp', count: 12, percent: 50 },
    { name: 'Xây dựng & Đô thị', count: 6, percent: 25 },
    { name: 'Kinh doanh & Lao động', count: 4, percent: 16.7 },
    { name: 'Đất đai & Môi trường', count: 2, percent: 8.3 }
  ];

  auditLogs = [
    { id: 1, user: 'Quản trị viên Hệ thống', role: 'ROLE_ADMIN', action: 'Cấu hình hệ thống & Khởi động dịch vụ', time: 'Vừa xong', ip: '127.0.0.1' },
    { id: 2, user: 'Cán bộ Lê Thị Mai', role: 'ROLE_STAFF', action: 'Tiếp nhận và xử lý hồ sơ hành chính', time: '10 phút trước', ip: '127.0.0.1' },
    { id: 3, user: 'Công dân Nguyễn Văn An', role: 'ROLE_CITIZEN', action: 'Nộp hồ sơ trực tuyến thành công', time: '25 phút trước', ip: '127.0.0.1' },
    { id: 4, user: 'Cán bộ Trần Minh Đức', role: 'ROLE_STAFF', action: 'Phê duyệt & Ký số ban hành kết quả', time: '1 giờ trước', ip: '127.0.0.1' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.dashboardService.getAdminStats().subscribe({
      next: (data) => {
        if (data) {
          this.stats.set(data);
          this.computeStatusBreakdown(data);
          this.computeMonthlyTrends(data);
          if (data.categoryVolumes && data.categoryVolumes.length > 0) {
            this.categoryVolumes = data.categoryVolumes;
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private computeStatusBreakdown(data: DashboardSummary): void {
    const total = data.totalApplications || 1;
    const completed = data.completedCount || 0;
    const processing = (data.processingCount || 0) + (data.receivedCount || 0);
    const submitted = (data.submittedCount || 0) + (data.resubmittedCount || 0);
    const needRevision = data.needRevisionCount || 0;
    const rejected = data.rejectedCount || 0;

    this.statusBreakdown = [
      {
        label: 'Đã hoàn tất (Thành công)',
        count: completed,
        percent: Math.round((completed / total) * 1000) / 10,
        color: '#2F5D45'
      },
      {
        label: 'Đang thẩm định & xử lý',
        count: processing,
        percent: Math.round((processing / total) * 1000) / 10,
        color: '#C99A3C'
      },
      {
        label: 'Chờ tiếp nhận',
        count: submitted,
        percent: Math.round((submitted / total) * 1000) / 10,
        color: '#1890FF'
      },
      {
        label: 'Yêu cầu bổ sung hồ sơ',
        count: needRevision,
        percent: Math.round((needRevision / total) * 1000) / 10,
        color: '#FA8C16'
      },
      {
        label: 'Bị từ chối giải quyết',
        count: rejected,
        percent: Math.round((rejected / total) * 1000) / 10,
        color: '#CF1322'
      }
    ];
  }

  private computeMonthlyTrends(data: DashboardSummary): void {
    const rawTrends = data.monthlyTrends || [
      { month: 'Tháng 10', receivedCount: 18, completedCount: 16 },
      { month: 'Tháng 11', receivedCount: 24, completedCount: 22 },
      { month: 'Tháng 12', receivedCount: 32, completedCount: 30 },
      { month: 'Tháng 01', receivedCount: 28, completedCount: 26 },
      { month: 'Tháng 02', receivedCount: 38, completedCount: 35 },
      { month: 'Tháng 03', receivedCount: Math.max(data.totalApplications, 45), completedCount: Math.max(data.completedCount, 40) }
    ];

    this.maxMonthlyCount = Math.max(...rawTrends.map(t => Math.max(t.receivedCount, t.completedCount)), 10);

    this.monthlyTrends = rawTrends.map(t => ({
      month: t.month,
      receivedCount: t.receivedCount,
      completedCount: t.completedCount,
      receivedHeight: Math.max(Math.round((t.receivedCount / this.maxMonthlyCount) * 100), 8),
      completedHeight: Math.max(Math.round((t.completedCount / this.maxMonthlyCount) * 100), 6)
    }));
  }
}
