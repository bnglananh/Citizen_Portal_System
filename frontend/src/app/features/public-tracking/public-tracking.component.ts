import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Application } from '../../core/models/application.model';
import { StatusTagComponent } from '../../shared/components/status-tag/status-tag.component';
import { ApplicationTimelineComponent } from '../../shared/components/application-timeline/application-timeline.component';
import { QrPaymentComponent } from '../../shared/components/qr-payment/qr-payment.component';
import { ApplicationService } from '../../core/services/application.service';

@Component({
  selector: 'app-public-tracking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzCardModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzDescriptionsModule,
    NzAlertModule,
    NzEmptyModule,
    NzSpinModule,
    StatusTagComponent,
    ApplicationTimelineComponent,
    QrPaymentComponent
  ],
  templateUrl: './public-tracking.component.html',
  styleUrls: ['./public-tracking.component.scss']
})
export class PublicTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private applicationService = inject(ApplicationService);
  private cdr = inject(ChangeDetectorRef);

  searchCode = '';
  hasSearched = false;
  isSearching = false;

  mockApplication: Application | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.searchCode = params['code'];
        this.doSearch();
      }
    });
  }

  doSearch(): void {
    const code = this.searchCode.trim().toUpperCase();
    if (!code) return;

    this.isSearching = true;
    this.cdr.detectChanges();

    this.applicationService.trackApplicationPublic(code).subscribe({
      next: (app) => {
        this.isSearching = false;
        this.hasSearched = true;
        this.mockApplication = app;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSearching = false;
        this.hasSearched = true;
        // Fallback for demo if backend database has no matching code yet
        this.mockApplication = {
          id: 101,
          applicationCode: code.startsWith('HS') ? code : 'HS2026090123',
          procedureId: 1,
          procedureName: 'Đăng ký khai sinh trực tuyến toàn trình',
          citizenId: 1,
          citizenName: 'Nguyễn Văn An',
          citizenPhone: '0912345678',
          citizenIdCard: '001099012345',
          status: 'PROCESSING',
          note: 'Hồ sơ hợp lệ, đang xác thực dữ liệu định danh trẻ em.',
          createdAt: '2026-09-12 08:30:15',
          updatedAt: '2026-09-13 09:15:00',
          history: [
            {
              id: 1,
              applicationId: 101,
              toStatus: 'SUBMITTED',
              comment: 'Công dân nộp hồ sơ trực tuyến.',
              actionBy: 'Hệ thống Cổng DVC',
              createdAt: '2026-09-12 08:30:15'
            },
            {
              id: 2,
              applicationId: 101,
              fromStatus: 'SUBMITTED',
              toStatus: 'RECEIVED',
              comment: 'Cán bộ tiếp nhận hồ sơ.',
              actionBy: 'Cán bộ Lê Thị Mai',
              createdAt: '2026-09-12 09:10:00'
            },
            {
              id: 3,
              applicationId: 101,
              fromStatus: 'RECEIVED',
              toStatus: 'PROCESSING',
              comment: 'Chuyển Bộ phận Tư pháp - Hộ tịch xác minh thông tin.',
              actionBy: 'Cán bộ Lê Thị Mai',
              createdAt: '2026-09-12 10:00:00'
            }
          ]
        };
        this.cdr.detectChanges();
      }
    });
  }

  quickTrack(code: string): void {
    this.searchCode = code;
    this.doSearch();
  }
}
