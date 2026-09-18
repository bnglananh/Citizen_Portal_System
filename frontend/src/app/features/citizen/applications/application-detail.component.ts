import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Application, ApplicationHistory } from '../../../core/models/application.model';
import { StatusTagComponent } from '../../../shared/components/status-tag/status-tag.component';
import { ApplicationTimelineComponent } from '../../../shared/components/application-timeline/application-timeline.component';
import { FileUploaderComponent } from '../../../shared/components/file-uploader/file-uploader.component';
import { QrPaymentComponent } from '../../../shared/components/qr-payment/qr-payment.component';
import { ApplicationService } from '../../../core/services/application.service';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzDescriptionsModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzTabsModule,
    NzAlertModule,
    NzBreadCrumbModule,
    NzSpinModule,
    StatusTagComponent,
    ApplicationTimelineComponent,
    FileUploaderComponent,
    QrPaymentComponent
  ],
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private message = inject(NzMessageService);
  private applicationService = inject(ApplicationService);
  private cdr = inject(ChangeDetectorRef);

  applicationId: number | null = null;
  isResubmitting = false;
  isLoading = true;
  supplementFiles: any[] = [];

  application: Application = {
    id: 0,
    applicationCode: '',
    procedureId: 0,
    procedureName: '',
    status: 'DRAFT',
    createdAt: ''
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.applicationId = +id;
        this.loadDetail(this.applicationId);
      }
    });
  }

  loadDetail(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.applicationService.getApplicationDetail(id).subscribe({
      next: (app) => {
        this.application = app;
        if (app.procedure && app.procedure.fee !== undefined && !this.application.feeAmount) {
          this.application.feeAmount = Number(app.procedure.fee);
        }
        this.loadHistory(id);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadHistory(id: number): void {
    this.applicationService.getApplicationHistory(id).subscribe({
      next: (history) => {
        if (history && history.length > 0) {
          this.application.history = history;
          this.cdr.detectChanges();
        }
      }
    });
  }

  downloadUrl(filePath?: string): string {
    return this.applicationService.getFileDownloadUrl(filePath);
  }

  onSupplementFilesChanged(files: any[]): void {
    this.supplementFiles = files;
  }

  submitRevision(): void {
    if (this.supplementFiles.length === 0) {
      this.message.warning('Vui lòng đính kèm ít nhất 1 tệp tài liệu bổ sung.');
      return;
    }

    if (!this.applicationId) return;

    this.isResubmitting = true;
    const file = this.supplementFiles[0]?.rawFile || this.supplementFiles[0]?.originFileObj || this.supplementFiles[0];

    const uploadAction$ = file instanceof File
      ? this.applicationService.uploadDocument(this.applicationId, file, file.name)
      : null;

    if (uploadAction$) {
      uploadAction$.subscribe({
        next: () => {
          this.callResubmit();
        },
        error: () => {
          this.callResubmit();
        }
      });
    } else {
      this.callResubmit();
    }
  }

  private callResubmit(): void {
    if (!this.applicationId) return;
    this.applicationService.resubmitApplication(this.applicationId, 'Đã bổ sung tài liệu theo yêu cầu').subscribe({
      next: (updated) => {
        this.application = updated;
        this.isResubmitting = false;
        this.message.success('Đã gửi bổ sung hồ sơ thành công! Cán bộ sẽ kiểm tra lại.');
        this.loadDetail(this.applicationId!);
      },
      error: (err) => {
        this.isResubmitting = false;
        this.message.error(err?.error?.message || 'Không thể gửi lại hồ sơ bổ sung');
      }
    });
  }
}
