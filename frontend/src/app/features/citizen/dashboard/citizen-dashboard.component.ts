import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AuthService } from '../../../core/auth/auth.service';
import { DashboardService, DashboardSummary } from '../../../core/services/dashboard.service';
import { ApplicationService } from '../../../core/services/application.service';
import { Application } from '../../../core/models/application.model';
import { StatusTagComponent } from '../../../shared/components/status-tag/status-tag.component';

@Component({
  selector: 'app-citizen-dashboard',
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
    NzSpinModule,
    StatusTagComponent
  ],
  templateUrl: './citizen-dashboard.component.html',
  styleUrls: ['./citizen-dashboard.component.scss']
})
export class CitizenDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private applicationService = inject(ApplicationService);

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

  recentApps: Application[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.dashboardService.getCitizenStats().subscribe({
      next: (data) => {
        if (data) {
          this.stats.set(data);
        }
      },
      error: () => {}
    });

    this.applicationService.getMyApplications(undefined, 0, 5).subscribe({
      next: (res) => {
        this.recentApps = res.content || [];
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
