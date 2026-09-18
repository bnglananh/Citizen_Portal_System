import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { AuthService } from '../../../core/auth/auth.service';
import { User, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzTabsModule,
    NzAlertModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  isLoading = false;
  errorMessage = '';
  selectedTab = 0; // 0: Citizen, 1: Officer/Admin

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: (res) => {
        const user = res.data?.user;
        const fullName = user?.fullName || username;
        this.message.success(`Đăng nhập thành công! Chào mừng ${fullName}`);

        const roles = user?.roles || [];
        if (roles.includes('ROLE_ADMIN')) {
          this.router.navigate(['/admin/dashboard']);
        } else if (roles.includes('ROLE_STAFF')) {
          this.router.navigate(['/staff/dashboard']);
        } else {
          this.router.navigate(['/citizen/dashboard']);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        let msg = 'Tài khoản hoặc mật khẩu không chính xác, vui lòng thử lại.';
        if (err.status === 0) {
          msg = 'Không thể kết nối đến máy chủ Backend (Port 8080). Vui lòng khởi động lại Backend Spring Boot!';
        } else if (err.error?.message) {
          msg = err.error.message;
        }
        this.errorMessage = msg;
        this.message.error(msg);
      }
    });
  }

  fillQuickAccount(type: 'admin' | string = 'admin'): void {
    this.loginForm.patchValue({ username: 'admin', password: 'admin123' });
    this.selectedTab = 1;
  }
}
