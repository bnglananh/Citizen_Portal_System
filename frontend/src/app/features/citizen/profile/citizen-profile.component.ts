import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-citizen-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzDescriptionsModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzModalModule,
    NzFormModule,
    NzInputModule
  ],
  templateUrl: './citizen-profile.component.html',
  styleUrls: ['./citizen-profile.component.scss']
})
export class CitizenProfileComponent {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);

  isPasswordModalVisible = false;
  isEditProfileModalVisible = false;
  isLoading = false;

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmNewPassword: ['', [Validators.required]]
  });

  profileForm: FormGroup = this.fb.group({
    fullName: [this.authService.currentUser()?.fullName || 'Nguyễn Văn An', [Validators.required]],
    phoneNumber: [this.authService.currentUser()?.phoneNumber || '0912345678', [Validators.required]],
    email: [this.authService.currentUser()?.email || 'nguyenvanan@gmail.com', [Validators.required, Validators.email]],
    address: [this.authService.currentUser()?.address || 'Số 45 Đường Vườn Lài, Phường Tân Phú, TP. Hồ Chí Minh', [Validators.required]]
  });

  openChangePassword(): void {
    this.passwordForm.reset();
    this.isPasswordModalVisible = true;
  }

  savePassword(): void {
    if (this.passwordForm.invalid) {
      Object.values(this.passwordForm.controls).forEach(c => c.markAsDirty());
      return;
    }
    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmNewPassword) {
      this.message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.isPasswordModalVisible = false;
      this.message.success('Đổi mật khẩu tài khoản thành công!');
    }, 600);
  }

  openEditProfile(): void {
    this.isEditProfileModalVisible = true;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.isEditProfileModalVisible = false;
      this.message.success('Cập nhật thông tin cá nhân thành công!');
    }, 500);
  }
}
