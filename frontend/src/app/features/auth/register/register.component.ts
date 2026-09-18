import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { AuthService } from '../../../core/auth/auth.service';

// Custom validator for password confirmation
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.parent) return null;
  const password = control.parent.get('password')?.value;
  const confirm = control.value;
  return password === confirm ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzAlertModule,
    NzStepsModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  currentStep = 0; // 0: Form, 1: OTP verification
  isLoading = false;
  isSendingOtp = false;
  hasSentOtpAtLeastOnce = false;

  // OTP State
  otpCode = '';
  countdownSeconds = 0;
  private timerInterval: any = null;

  registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    citizenIdCard: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^(0[3|5|7|8|9])+([0-9]{8})$/)]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.minLength(4)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, confirmPasswordValidator]],
    agreeTerms: [false, [Validators.requiredTrue]]
  });

  ngOnDestroy(): void {
    this.clearTimer();
  }

  startCountdown(seconds: number = 60): void {
    this.clearTimer();
    this.countdownSeconds = seconds;
    this.cdr.detectChanges();
    this.timerInterval = setInterval(() => {
      this.countdownSeconds--;
      this.cdr.detectChanges();
      if (this.countdownSeconds <= 0) {
        this.clearTimer();
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  onRequestOtp(): void {
    if (this.registerForm.invalid) {
      Object.values(this.registerForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isSendingOtp = true;
    this.cdr.detectChanges();
    const formVal = this.registerForm.value;

    this.authService.sendRegisterOtp({
      email: formVal.email,
      username: formVal.username,
      fullName: formVal.fullName,
      identityCardNumber: formVal.citizenIdCard
    }).subscribe({
      next: (res) => {
        this.isSendingOtp = false;
        this.hasSentOtpAtLeastOnce = true;
        this.currentStep = 1;
        this.otpCode = '';
        this.startCountdown(60);
        this.message.success(res.message || 'Mã xác thực OTP đã được gửi tới Gmail của bạn!');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSendingOtp = false;
        const msg = err.error?.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại thông tin.';
        
        // Nếu mã OTP đã được gửi trước đó và đang trong thời gian chờ (cooldown), vẫn chuyển sang Bước 2 để người dùng nhập mã từ Gmail
        if (msg.toLowerCase().includes('đợi') || msg.toLowerCase().includes('giây') || this.hasSentOtpAtLeastOnce) {
          this.hasSentOtpAtLeastOnce = true;
          this.currentStep = 1;
          this.startCountdown(45);
          this.message.info('Mã OTP đã được gửi tới Gmail của bạn. Vui lòng kiểm tra hộp thư và nhập mã.');
        } else {
          this.message.error(msg);
        }
        this.cdr.detectChanges();
      }
    });
  }

  resendOtp(): void {
    if (this.countdownSeconds > 0 || this.isSendingOtp) return;
    const formVal = this.registerForm.value;

    this.isSendingOtp = true;
    this.cdr.detectChanges();
    this.authService.sendRegisterOtp({
      email: formVal.email,
      username: formVal.username,
      fullName: formVal.fullName,
      identityCardNumber: formVal.citizenIdCard
    }).subscribe({
      next: (res) => {
        this.isSendingOtp = false;
        this.startCountdown(60);
        this.message.success(res.message || 'Đã gửi lại mã OTP mới tới Gmail của bạn!');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSendingOtp = false;
        const msg = err.error?.message || 'Gửi lại mã OTP thất bại.';
        this.message.error(msg);
        this.cdr.detectChanges();
      }
    });
  }

  onBackToStep0(): void {
    this.currentStep = 0;
    this.otpCode = '';
    this.clearTimer();
    this.cdr.detectChanges();
  }

  onVerifyAndRegister(): void {
    if (!this.otpCode || this.otpCode.trim().length !== 6) {
      this.message.warning('Vui lòng nhập đầy đủ mã OTP 6 chữ số được gửi tới Gmail');
      return;
    }

    this.isLoading = true;
    const formVal = this.registerForm.value;
    const req = {
      username: formVal.username.trim(),
      password: formVal.password,
      fullName: formVal.fullName.trim(),
      email: formVal.email.trim(),
      phoneNumber: formVal.phoneNumber.trim(),
      identityCardNumber: formVal.citizenIdCard.trim(),
      address: formVal.address.trim(),
      otp: this.otpCode.trim()
    };

    this.authService.register(req).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearTimer();
        this.message.success('Xác thực OTP & Đăng ký tài khoản thành công! Đang chuyển hướng...');
        this.router.navigate(['/citizen/dashboard']);
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Xác thực OTP thất bại. Vui lòng kiểm tra lại mã xác nhận.';
        this.message.error(msg);
      }
    });
  }
}
