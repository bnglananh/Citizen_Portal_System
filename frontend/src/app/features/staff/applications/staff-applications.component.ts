import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Application, ApplicationStatus } from '../../../core/models/application.model';
import { StatusTagComponent } from '../../../shared/components/status-tag/status-tag.component';
import { StaffService } from '../../../core/services/staff.service';

@Component({
  selector: 'app-staff-applications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzCardModule,
    NzTableModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzTabsModule,
    NzSpinModule,
    StatusTagComponent
  ],
  templateUrl: './staff-applications.component.html',
  styleUrls: ['./staff-applications.component.scss']
})
export class StaffApplicationsComponent implements OnInit {
  private staffService = inject(StaffService);
  private cdr = inject(ChangeDetectorRef);

  searchQuery = '';
  selectedStatus: ApplicationStatus | 'ALL' = 'ALL';
  selectedCategory: string = 'ALL';
  isLoading = false;

  applications: Application[] = [];
  filteredApplications: Application[] = [];

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.staffService.getStaffApplications({
      status: this.selectedStatus,
      keyword: this.searchQuery.trim() || undefined
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.applications = res.content || [];
        this.filterApps();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.filterApps();
        this.cdr.detectChanges();
      }
    });
  }

  filterApps(): void {
    this.filteredApplications = this.applications.filter(app => {
      const matchStatus = this.selectedStatus === 'ALL' || app.status === this.selectedStatus;
      const query = this.searchQuery.trim().toLowerCase();
      const matchQuery = !query ||
        app.applicationCode.toLowerCase().includes(query) ||
        app.procedureName.toLowerCase().includes(query) ||
        (app.citizenName || '').toLowerCase().includes(query);

      return matchStatus && matchQuery;
    });
  }

  applyFilters(): void {
    this.loadApplications();
  }

  setStatusTab(status: ApplicationStatus | 'ALL'): void {
    this.selectedStatus = status;
    this.loadApplications();
  }
}
