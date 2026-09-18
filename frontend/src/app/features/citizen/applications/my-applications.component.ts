import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Application, ApplicationStatus } from '../../../core/models/application.model';
import { StatusTagComponent } from '../../../shared/components/status-tag/status-tag.component';
import { ApplicationService } from '../../../core/services/application.service';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzBadgeModule,
    NzEmptyModule,
    NzSpinModule,
    StatusTagComponent
  ],
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.scss']
})
export class MyApplicationsComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private cdr = inject(ChangeDetectorRef);

  searchQuery = '';
  selectedTab = 0;
  isLoading = false;

  applications: Application[] = [];
  filteredApplications: Application[] = [];

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.applicationService.getMyApplications().subscribe({
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

  onTabChange(index: number): void {
    this.selectedTab = index;
    this.filterApps();
  }

  filterApps(): void {
    this.filteredApplications = this.applications.filter(app => {
      let matchTab = true;
      if (this.selectedTab === 1) {
        matchTab = app.status === 'SUBMITTED';
      } else if (this.selectedTab === 2) {
        matchTab = app.status === 'RECEIVED' || app.status === 'PROCESSING' || app.status === 'RESUBMITTED';
      } else if (this.selectedTab === 3) {
        matchTab = app.status === 'NEED_REVISION';
      } else if (this.selectedTab === 4) {
        matchTab = app.status === 'COMPLETED';
      } else if (this.selectedTab === 5) {
        matchTab = app.status === 'REJECTED';
      }

      const query = this.searchQuery.trim().toLowerCase();
      const matchQuery = !query ||
        app.applicationCode.toLowerCase().includes(query) ||
        app.procedureName.toLowerCase().includes(query);

      return matchTab && matchQuery;
    });
  }

  getRevisionCount(): number {
    return this.applications.filter(a => a.status === 'NEED_REVISION').length;
  }
}
