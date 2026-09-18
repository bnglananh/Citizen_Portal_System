import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AuthService } from '../../../core/auth/auth.service';
import { FileUploaderComponent } from '../../../shared/components/file-uploader/file-uploader.component';
import { QrPaymentComponent } from '../../../shared/components/qr-payment/qr-payment.component';
import { Procedure, RequiredDocument } from '../../../core/models/procedure.model';
import { ApplicationService } from '../../../core/services/application.service';
import { ProcedureService } from '../../../core/services/procedure.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-submit-application',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzCardModule,
    NzStepsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzDescriptionsModule,
    NzCheckboxModule,
    NzResultModule,
    NzSpinModule,
    FileUploaderComponent,
    QrPaymentComponent
  ],
  templateUrl: './submit-application.component.html',
  styleUrls: ['./submit-application.component.scss']
})
export class SubmitApplicationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private applicationService = inject(ApplicationService);
  private procedureService = inject(ProcedureService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private message = inject(NzMessageService);
  private cdr = inject(ChangeDetectorRef);

  currentStep = 0;
  isSubmitting = false;
  isCompleted = false;
  generatedAppCode = '';
  selectedFiles: File[] = [];

  procedure: Procedure = {
    id: 1,
    categoryId: 1,
    categoryName: 'Hộ tịch - Tư pháp',
    code: 'TTHC-HT-01',
    name: 'Đăng ký khai sinh trực tuyến toàn trình',
    processingTimeDays: 1,
    feeAmount: 0,
    active: true,
    requiredDocuments: [
      { id: 1, procedureId: 1, documentName: 'Giấy chứng sinh (Bản scan/ảnh chụp)', isRequired: true },
      { id: 2, procedureId: 1, documentName: 'CCCD của cha và mẹ', isRequired: true },
      { id: 3, procedureId: 1, documentName: 'Giấy chứng nhận kết hôn của cha mẹ', isRequired: false }
    ]
  };

  step1Form: FormGroup = this.fb.group({
    citizenName: ['', [Validators.required]],
    citizenIdCard: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
    citizenPhone: ['', [Validators.required]],
    citizenEmail: ['', [Validators.required, Validators.email]],
    citizenAddress: ['', [Validators.required]]
  });

  step2Form: FormGroup = this.fb.group({
    receivingOffice: ['Ủy ban nhân dân Phường Tân Phú, TP. Hồ Chí Minh', [Validators.required]],
    requestDetails: ['Đề nghị giải quyết thủ tục đăng ký trực tuyến theo đúng quy định.', [Validators.required]],
    receiveMethod: ['ONLINE_AND_POST', [Validators.required]],
    deliveryAddress: [''],
    note: ['']
  });

  uploadedDocuments: any[] = [];
  uploadedDocMap: { [docKey: string]: { file: File, name: string, size: number, reqDoc: RequiredDocument } } = {};
  agreeTerms = false;

  ngOnInit(): void {
    // 1. Fill profile data if user is logged in
    const user = this.authService.currentUser();
    if (user) {
      this.step1Form.patchValue({
        citizenName: user.fullName || user.username,
        citizenIdCard: user.citizenIdCard || user.identityCardNumber || '',
        citizenPhone: user.phoneNumber || '',
        citizenEmail: user.email || '',
        citizenAddress: user.address || ''
      });
      if (user.address) {
        this.step2Form.patchValue({ deliveryAddress: user.address });
      }
    }

    // 2. Read procedureId if navigated from a procedure card
    this.route.paramMap.subscribe(params => {
      const procId = params.get('procedureId');
      if (procId) {
        this.procedureService.getProcedureById(+procId).subscribe({
          next: (proc) => {
            if (proc) {
              this.procedure = proc;
              this.uploadedDocMap = {};
              this.uploadedDocuments = [];
              this.selectedFiles = [];
            }
          },
          error: () => {
            // Keep default procedure
          }
        });
      }
    });
  }

  nextStep(): void {
    if (this.currentStep === 0) {
      if (this.step1Form.invalid) {
        Object.values(this.step1Form.controls).forEach(c => c.markAsDirty());
        return;
      }
    } else if (this.currentStep === 1) {
      if (this.step2Form.invalid) {
        Object.values(this.step2Form.controls).forEach(c => c.markAsDirty());
        return;
      }
    } else if (this.currentStep === 2) {
      // Validate all required documents are uploaded
      const requiredDocs = (this.procedure.requiredDocuments || []).filter(d => d.isRequired);
      const missingDoc = requiredDocs.find(d => {
        const key = d.id ? `${d.id}` : d.documentName;
        return !this.uploadedDocMap[key];
      });

      if (missingDoc) {
        this.message.error(`Vui lòng tải lên tài liệu bắt buộc: "${missingDoc.documentName}"`);
        return;
      }

      if (this.uploadedDocuments.length === 0) {
        this.message.warning('Vui lòng tải lên ít nhất một tệp giấy tờ đính kèm.');
        return;
      }
    }
    this.currentStep++;
  }

  prevStep(): void {
    this.currentStep--;
  }

  onDocFileChange(doc: RequiredDocument, file: File | null): void {
    const key = doc.id ? `${doc.id}` : doc.documentName;
    if (file) {
      this.uploadedDocMap[key] = {
        file: file,
        name: file.name,
        size: file.size,
        reqDoc: doc
      };
    } else {
      delete this.uploadedDocMap[key];
    }
    this.uploadedDocuments = Object.values(this.uploadedDocMap).map(item => ({
      name: item.name,
      size: item.size,
      docName: item.reqDoc.documentName,
      file: item.file
    }));
    this.selectedFiles = this.uploadedDocuments.map(d => d.file);
  }

  submitApplication(): void {
    if (!this.agreeTerms) {
      this.message.error('Vui lòng tích chọn cam kết tính chính xác của hồ sơ trước khi nộp.');
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    // 1. Create Draft in backend
    const draftPayload = {
      procedureId: this.procedure.id,
      applicantName: this.step1Form.value.citizenName,
      applicantPhone: this.step1Form.value.citizenPhone,
      applicantEmail: this.step1Form.value.citizenEmail,
      applicantIdCard: this.step1Form.value.citizenIdCard,
      applicantAddress: this.step1Form.value.citizenAddress,
      formData: JSON.stringify(this.step2Form.value)
    };

    this.applicationService.createDraft(draftPayload).subscribe({
      next: (draft) => {
        const appId = draft.id;

        // 2. Upload documents per required slot
        const uploadEntries = Object.values(this.uploadedDocMap);
        const uploadTasks = uploadEntries.map(entry => {
          return this.applicationService.uploadDocument(
            appId,
            entry.file,
            entry.reqDoc.documentName,
            entry.reqDoc.id
          ).pipe(
            catchError((err) => {
              console.error('Failed to upload file for doc:', entry.reqDoc.documentName, err);
              return of(null);
            })
          );
        });

        const afterUploads = uploadTasks.length > 0 ? forkJoin(uploadTasks) : of([]);

        afterUploads.subscribe({
          next: () => {
            // 3. Submit application (DRAFT -> SUBMITTED)
            this.applicationService.submitApplication(appId).subscribe({
              next: (submittedApp) => {
                this.isSubmitting = false;
                this.isCompleted = true;
                this.generatedAppCode = submittedApp.applicationCode;
                this.message.success('Nộp hồ sơ trực tuyến thành công! Mã hồ sơ: ' + submittedApp.applicationCode);
                this.cdr.detectChanges();
                
                // Nếu thủ tục miễn phí thì chuyển hướng sau 3 giây, nếu có phí thì giữ lại để người dân thanh toán QR
                if (!this.procedure.feeAmount || this.procedure.feeAmount === 0) {
                  setTimeout(() => {
                    this.router.navigate(['/citizen/applications']);
                  }, 3000);
                }
              },
              error: (err) => {
                this.isSubmitting = false;
                const msg = err.error?.message || 'Có lỗi khi nộp hồ sơ. Vui lòng thử lại.';
                this.message.error(msg);
                this.cdr.detectChanges();
              }
            });
          },
          error: () => {
            this.isSubmitting = false;
            this.message.error('Có lỗi khi tải lên tài liệu đính kèm.');
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'Không thể tạo hồ sơ trên máy chủ Backend. Vui lòng kiểm tra lại dịch vụ Backend.';
        this.message.error(msg);
        this.cdr.detectChanges();
      }
    });
  }
}
