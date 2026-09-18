import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, ChangeDetectorRef } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { PaymentReceipt, PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-qr-payment',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzModalModule,
    NzDescriptionsModule
  ],
  templateUrl: './qr-payment.component.html',
  styleUrls: ['./qr-payment.component.scss']
})
export class QrPaymentComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private message = inject(NzMessageService);
  private cdr = inject(ChangeDetectorRef);

  @Input() applicationCode = '';
  @Input() procedureName = '';
  @Input() feeAmount = 0;
  @Input() citizenName = '';
  @Input() mode: 'card' | 'modal-trigger' = 'card';
  @Input() allowStaffConfirm = false;

  @Output() paymentStatusChanged = new EventEmitter<boolean>();

  isPaid = false;
  receipt: PaymentReceipt | null = null;
  isQrModalVisible = false;
  isReceiptModalVisible = false;
  isProcessing = false;

  // Bank transfer info
  readonly bankName = 'Vietcombank (VCB) - Kho bạc Nhà nước';
  readonly bankAccount = '0123 456 789';
  readonly accountHolder = 'UBND PHƯỜNG TÂN PHÚ - THU PHÍ TTHC';

  ngOnInit(): void {
    this.checkStatus();
  }

  checkStatus(): void {
    if (this.applicationCode) {
      this.isPaid = this.paymentService.isPaid(this.applicationCode);
      if (this.isPaid) {
        this.receipt = this.paymentService.getReceipt(this.applicationCode);
      }
      this.cdr.detectChanges();
    }
  }

  get qrUrl(): string {
    return this.paymentService.generateVietQrUrl(this.applicationCode, this.feeAmount);
  }

  get transferMemo(): string {
    return `DVC ${this.applicationCode}`;
  }

  openQrModal(): void {
    this.isQrModalVisible = true;
    this.cdr.detectChanges();
  }

  closeQrModal(): void {
    this.isQrModalVisible = false;
    this.cdr.detectChanges();
  }

  openReceiptModal(): void {
    this.receipt = this.paymentService.getReceipt(this.applicationCode);
    this.isReceiptModalVisible = true;
    this.cdr.detectChanges();
  }

  closeReceiptModal(): void {
    this.isReceiptModalVisible = false;
    this.cdr.detectChanges();
  }

  copyToClipboard(text: string, label: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.message.success(`Đã sao chép ${label}`);
    }).catch(() => {
      this.message.info(`Nội dung: ${text}`);
    });
  }

  confirmPayment(): void {
    this.isProcessing = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.receipt = this.paymentService.markAsPaid(
        this.applicationCode,
        this.procedureName,
        this.feeAmount,
        this.citizenName
      );
      this.isPaid = true;
      this.isProcessing = false;
      this.isQrModalVisible = false;
      this.message.success('Thanh toán lệ phí thành công! Đã phát hành biên lai điện tử.');
      this.paymentStatusChanged.emit(true);
      this.cdr.detectChanges();
    }, 400);
  }

  staffConfirmPaid(): void {
    this.confirmPayment();
  }
}
