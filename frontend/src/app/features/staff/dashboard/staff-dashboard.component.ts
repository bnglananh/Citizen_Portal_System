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
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { Application } from '../../../core/models/application.model';
import { StatusTagComponent } from '../../../shared/components/status-tag/status-tag.component';
import { DashboardService, DashboardSummary } from '../../../core/services/dashboard.service';
import { StaffService } from '../../../core/services/staff.service';

@Component({
  selector: 'app-staff-dashboard',
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
    NzAlertModule,
    StatusTagComponent
  ],
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.scss']
})
export class StaffDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private staffService = inject(StaffService);

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
    rejectedCount: 0
  });

  urgentApplications: Application[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.dashboardService.getStaffStats().subscribe({
      next: (data) => {
        if (data) {
          this.stats.set(data);
        }
      },
      error: () => {}
    });

    this.staffService.getStaffApplications({ page: 0, size: 5 }).subscribe({
      next: (res) => {
        this.urgentApplications = res.content || [];
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
