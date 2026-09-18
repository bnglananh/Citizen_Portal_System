import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { User } from '../../../core/models/user.model';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTagModule,
    NzSwitchModule,
    NzModalModule,
    NzFormModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private adminService = inject(AdminService);

  searchQuery = '';
  selectedRoleFilter: string = 'ALL';

  users: User[] = [];
  filteredUsers: User[] = [];

  pageIndex = 1;
  pageSize = 10;
  totalUsers = 0;

  isModalVisible = false;
  isEditing = false;
  currentUserId: number | null = null;
  isLoading = false;

  userForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(4)]],
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required]],
    citizenIdCard: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
    role: ['ROLE_CITIZEN', [Validators.required]],
    password: ['']
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getUsers(this.searchQuery, this.selectedRoleFilter, this.pageIndex - 1, this.pageSize).subscribe({
      next: (res) => {
        this.users = res.content || [];
        this.filteredUsers = this.users;
        this.totalUsers = res.totalElements || this.users.length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterUsers(): void {
    this.pageIndex = 1;
    this.loadUsers();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentUserId = null;
    this.userForm.reset({ role: 'ROLE_CITIZEN' });
    this.userForm.get('username')?.enable();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalVisible = true;
  }

  openEditModal(user: User): void {
    this.isEditing = true;
    this.currentUserId = user.id;
    this.userForm.patchValue({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      citizenIdCard: user.citizenIdCard,
      role: user.roles && user.roles.length > 0 ? user.roles[0] : 'ROLE_CITIZEN'
    });
    this.userForm.get('username')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalVisible = true;
  }

  toggleUserStatus(user: User): void {
    this.adminService.toggleUserStatus(user.id).subscribe({
      next: (updated) => {
        user.enabled = updated.active !== undefined ? updated.active : !user.enabled;
        user.active = user.enabled;
        this.message.success(`Đã ${user.enabled ? 'mở khóa' : 'khóa'} tài khoản ${user.username}`);
      },
      error: () => {
        this.message.error('Không thể thay đổi trạng thái tài khoản');
      }
    });
  }

  resetUserPassword(user: User): void {
    this.adminService.resetPassword(user.id).subscribe({
      next: (msg) => {
        this.message.success(msg || 'Đã đặt lại mật khẩu về mặc định');
      },
      error: () => {
        this.message.error('Không thể đặt lại mật khẩu');
      }
    });
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      Object.values(this.userForm.controls).forEach(c => c.markAsDirty());
      return;
    }

    this.isLoading = true;
    const formVal = this.userForm.getRawValue();

    if (this.isEditing && this.currentUserId) {
      this.adminService.updateUserRoles(this.currentUserId, [formVal.role]).subscribe({
        next: () => {
          this.message.success('Cập nhật người dùng thành công!');
          this.isLoading = false;
          this.isModalVisible = false;
          this.loadUsers();
        },
        error: (err) => {
          this.message.error(err?.error?.message || 'Cập nhật người dùng thất bại');
          this.isLoading = false;
        }
      });
    } else {
      this.adminService.createUser({
        username: formVal.username,
        fullName: formVal.fullName,
        email: formVal.email,
        phoneNumber: formVal.phoneNumber,
        identityCardNumber: formVal.citizenIdCard,
        password: formVal.password,
        roles: [formVal.role]
      }).subscribe({
        next: () => {
          this.message.success('Thêm mới người dùng thành công!');
          this.isLoading = false;
          this.isModalVisible = false;
          this.loadUsers();
        },
        error: (err) => {
          this.message.error(err?.error?.message || 'Thêm người dùng thất bại');
          this.isLoading = false;
        }
      });
    }
  }
}
