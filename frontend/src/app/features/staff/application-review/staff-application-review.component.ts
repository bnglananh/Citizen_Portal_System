import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Application, ApplicationStatus } from '../../../core/models/application.model';
import { StatusTagComponent } from '../../../shared/components/status-tag/status-tag.component';
import { ApplicationTimelineComponent } from '../../../shared/components/application-timeline/application-timeline.component';
import { QrPaymentComponent } from '../../../shared/components/qr-payment/qr-payment.component';
import { ApplicationService } from '../../../core/services/application.service';
import { StaffService } from '../../../core/services/staff.service';

@Component({
  selector: 'app-staff-application-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzCardModule,
    NzDescriptionsModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSpinModule,
    StatusTagComponent,
    ApplicationTimelineComponent,
    QrPaymentComponent
  ],
  templateUrl: './staff-application-review.component.html',
  styleUrls: ['./staff-application-review.component.scss']
})
export class StaffApplicationReviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private applicationService = inject(ApplicationService);
  private staffService = inject(StaffService);
  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);

  applicationId = 101;
  selectedDocIndex = 0;

  isRevisionModalVisible = false;
  isRejectModalVisible = false;
  isApproveModalVisible = false;
  isLoading = false;

  actionForm: FormGroup = this.fb.group({
    reason: ['', [Validators.required, Validators.minLength(10)]]
  });

  application: Application = {
    id: 0,
    applicationCode: '',
    procedureId: 0,
    procedureName: '',
    status: 'SUBMITTED',
    createdAt: ''
  };

  isImage(filePath?: string, fileType?: string): boolean {
    if (fileType && fileType.startsWith('image/')) return true;
    if (!filePath) return false;
    const lower = filePath.toLowerCase();
    return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp');
  }

  isPdf(filePath?: string, fileType?: string): boolean {
    if (fileType && fileType.includes('pdf')) return true;
    if (!filePath) return false;
    return filePath.toLowerCase().endsWith('.pdf');
  }

  getSafePdfUrl(filePath?: string): SafeResourceUrl {
    const url = this.downloadUrl(filePath);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.applicationId = +id;
        this.loadApplicationDetail();
      }
    });
  }

  loadApplicationDetail(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.applicationService.getApplicationDetail(this.applicationId).subscribe({
      next: (app) => {
        this.isLoading = false;
        if (app) {
          this.application = app;
          if (app.procedure && app.procedure.fee !== undefined && !this.application.feeAmount) {
            this.application.feeAmount = Number(app.procedure.fee);
          }
        }
        this.loadHistory();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadHistory(): void {
    this.applicationService.getApplicationHistory(this.applicationId).subscribe({
      next: (history) => {
        if (history && history.length > 0) {
          this.application.history = history;
          this.cdr.detectChanges();
        }
      }
    });
  }

  // 1. Tiếp nhận hồ sơ
  receiveApplication(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.staffService.performActionSimple(this.applicationId, {
      action: 'RECEIVE',
      comments: 'Cán bộ kiểm tra tính hợp lệ và tiếp nhận hồ sơ.'
    }).subscribe({
      next: (updatedApp) => {
        this.isLoading = false;
        this.application.status = 'RECEIVED';
        if (updatedApp.history) this.application.history = updatedApp.history;
        this.message.success('Đã tiếp nhận hồ sơ thành công!');
        this.loadApplicationDetail();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.application.status = 'RECEIVED';
        this.addHistory('RECEIVED', 'Cán bộ kiểm tra tính hợp lệ và tiếp nhận hồ sơ.');
        this.message.success('Đã tiếp nhận hồ sơ thành công!');
        this.cdr.detectChanges();
      }
    });
  }

  // 2. Bắt đầu xử lý
  startProcessing(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.staffService.performActionSimple(this.applicationId, {
      action: 'PROCESS',
      comments: 'Chuyển cán bộ chuyên trách thụ lý và xử lý nghiệp vụ.'
    }).subscribe({
      next: (updatedApp) => {
        this.isLoading = false;
        this.application.status = 'PROCESSING';
        if (updatedApp.history) this.application.history = updatedApp.history;
        this.message.info('Hồ sơ đã chuyển sang trạng thái Đang xử lý.');
        this.loadApplicationDetail();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.application.status = 'PROCESSING';
        this.addHistory('PROCESSING', 'Chuyển cán bộ chuyên trách thụ lý và xử lý nghiệp vụ.');
        this.message.info('Hồ sơ đã chuyển sang trạng thái Đang xử lý.');
        this.cdr.detectChanges();
      }
    });
  }

  processApplication(): void {
    this.startProcessing();
  }

  // 3. Yêu cầu bổ sung
  openRevisionModal(): void {
    this.actionForm.reset();
    this.isRevisionModalVisible = true;
  }

  submitRevisionRequest(): void {
    if (this.actionForm.invalid) {
      Object.values(this.actionForm.controls).forEach(c => c.markAsDirty());
      return;
    }
    const reason = this.actionForm.value.reason;
    this.isLoading = true;
    this.cdr.detectChanges();

    this.staffService.performActionSimple(this.applicationId, {
      action: 'REQUEST_REVISION',
      revisionNotes: reason,
      comments: reason
    }).subscribe({
      next: (updatedApp) => {
        this.isLoading = false;
        this.isRevisionModalVisible = false;
        this.application.status = 'NEED_REVISION';
        this.application.note = reason;
        if (updatedApp.history) this.application.history = updatedApp.history;
        this.message.warning('Đã gửi thông báo yêu cầu công dân bổ sung hồ sơ!');
        this.loadApplicationDetail();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.isRevisionModalVisible = false;
        this.application.status = 'NEED_REVISION';
        this.application.note = reason;
        this.addHistory('NEED_REVISION', `Yêu cầu bổ sung: ${reason}`);
        this.message.warning('Đã gửi thông báo yêu cầu công dân bổ sung hồ sơ!');
        this.cdr.detectChanges();
      }
    });
  }

  // 4. Từ chối hồ sơ
  openRejectModal(): void {
    this.actionForm.reset();
    this.isRejectModalVisible = true;
    this.cdr.detectChanges();
  }

  submitReject(): void {
    if (this.actionForm.invalid) {
      Object.values(this.actionForm.controls).forEach(c => c.markAsDirty());
      return;
    }
    const reason = this.actionForm.value.reason;
    this.isLoading = true;
    this.cdr.detectChanges();

    this.staffService.performActionSimple(this.applicationId, {
      action: 'REJECT',
      rejectionReason: reason,
      comments: reason
    }).subscribe({
      next: (updatedApp) => {
        this.isLoading = false;
        this.isRejectModalVisible = false;
        this.application.status = 'REJECTED';
        this.application.note = reason;
        if (updatedApp.history) this.application.history = updatedApp.history;
        this.message.error('Đã từ chối giải quyết hồ sơ!');
        this.loadApplicationDetail();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.isRejectModalVisible = false;
        this.application.status = 'REJECTED';
        this.application.note = reason;
        this.addHistory('REJECTED', `Từ chối hồ sơ vì lý do: ${reason}`);
        this.message.error('Đã từ chối giải quyết hồ sơ!');
        this.cdr.detectChanges();
      }
    });
  }

  // 5. Phê duyệt hoàn tất
  openApproveModal(): void {
    this.isApproveModalVisible = true;
    this.cdr.detectChanges();
  }

  submitApproval(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.staffService.performActionSimple(this.applicationId, {
      action: 'COMPLETE',
      resultSummary: 'Lãnh đạo cơ quan đã ký số phê duyệt kết quả giải quyết TTHC.',
      comments: 'Hoàn tất xử lý'
    }).subscribe({
      next: (updatedApp) => {
        this.isLoading = false;
        this.isApproveModalVisible = false;
        this.application.status = 'COMPLETED';
        if (updatedApp.history) this.application.history = updatedApp.history;
        this.message.success('Phê duyệt hoàn tất hồ sơ thành công! Bản điện tử đã được ban hành.');
        this.loadApplicationDetail();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.isApproveModalVisible = false;
        this.application.status = 'COMPLETED';
        this.addHistory('COMPLETED', 'Lãnh đạo cơ quan đã ký số phê duyệt kết quả giải quyết TTHC.');
        this.message.success('Phê duyệt hoàn tất hồ sơ thành công! Bản điện tử đã được ban hành.');
        this.cdr.detectChanges();
      }
    });
  }

  downloadUrl(filePath?: string): string {
    return this.applicationService.getFileDownloadUrl(filePath);
  }

  private addHistory(toStatus: ApplicationStatus, comment: string): void {
    if (!this.application.history) this.application.history = [];
    this.application.history.push({
      id: Date.now(),
      applicationId: this.application.id,
      toStatus: toStatus,
      comment: comment,
      actionBy: 'Cán bộ Tiếp nhận',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
  }
}
