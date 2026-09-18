import { Injectable } from '@angular/core';

export interface PaymentReceipt {
  receiptCode: string;
  applicationCode: string;
  procedureName: string;
  amount: number;
  citizenName: string;
  paidAt: string;
  paymentMethod: string;
  bankName: string;
  accountNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly STORAGE_KEY = 'DVC_PAYMENT_RECORDS';

  private getStoredPayments(): Record<string, PaymentReceipt> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveStoredPayments(records: Record<string, PaymentReceipt>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save payment records', e);
    }
  }

  isPaid(applicationCode: string): boolean {
    if (!applicationCode) return false;
    const records = this.getStoredPayments();
    return !!records[applicationCode];
  }

  getReceipt(applicationCode: string): PaymentReceipt | null {
    if (!applicationCode) return null;
    const records = this.getStoredPayments();
    return records[applicationCode] || null;
  }

  markAsPaid(
    applicationCode: string,
    procedureName: string,
    amount: number,
    citizenName: string,
    paymentMethod: string = 'VietQR / Chuyển khoản ngân hàng'
  ): PaymentReceipt {
    const records = this.getStoredPayments();
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const receiptCode = `BL-${applicationCode}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    const receipt: PaymentReceipt = {
      receiptCode,
      applicationCode,
      procedureName,
      amount,
      citizenName: citizenName || 'Công dân nộp hồ sơ',
      paidAt: dateStr,
      paymentMethod,
      bankName: 'Vietcombank (VCB) - Kho bạc Nhà nước',
      accountNumber: '0123 456 789'
    };

    records[applicationCode] = receipt;
    this.saveStoredPayments(records);
    return receipt;
  }

  generateVietQrUrl(applicationCode: string, amount: number): string {
    const cleanCode = encodeURIComponent(`DVC ${applicationCode}`);
    const accountName = encodeURIComponent('UBND PHUONG TAN PHU');
    return `https://api.vietqr.io/image/970436-0123456789-compact2.png?amount=${amount}&addInfo=${cleanCode}&accountName=${accountName}`;
  }
}
