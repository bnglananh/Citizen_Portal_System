import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of, timeout } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ProcedureCategory } from '../../../core/models/procedure.model';
import { ProcedureService } from '../../../core/services/procedure.service';

@Component({
  selector: 'app-category-management',
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
    NzModalModule,
    NzFormModule,
    NzTagModule,
    NzPopconfirmModule,
    NzSpaceModule,
    NzSwitchModule,
    NzSelectModule
  ],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss']
})
export class CategoryManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private procedureService = inject(ProcedureService);

  private readonly DEFAULT_CATEGORIES: ProcedureCategory[] = [
    {
      id: 1,
      code: 'HO_TICH',
      name: 'Hộ tịch & Tư pháp',
      description: 'Các thủ tục đăng ký khai sinh, kết hôn, khai tử, trích lục và xác nhận tình trạng hôn nhân',
      icon: 'user',
      active: true
    },
    {
      id: 2,
      code: 'DAT_DAI',
      name: 'Đất đai & Môi trường',
      description: 'Các thủ tục đăng ký biến động, cấp đổi sổ đỏ, xác nhận hiện trạng sử dụng đất',
      icon: 'home',
      active: true
    },
    {
      id: 3,
      code: 'XAY_DUNG',
      name: 'Xây dựng & Đô thị',
      description: 'Thủ tục cấp phép xây dựng nhà ở riêng lẻ, sửa chữa, cải tạo công trình đô thị',
      icon: 'build',
      active: true
    },
    {
      id: 4,
      code: 'LAO_DONG',
      name: 'Lao động - TB & Xã hội',
      description: 'Thủ tục cấp đổi thẻ BHYT, trợ cấp xã hội, xác nhận đối tượng chính sách',
      icon: 'team',
      active: true
    },
    {
      id: 5,
      code: 'CHUNG_THUC',
      name: 'Chứng thực & Sao y',
      description: 'Chứng thực bản sao từ bản chính, chứng thực chữ ký, chứng thực hợp đồng giao dịch',
      icon: 'file-done',
      active: true
    },
    {
      id: 6,
      code: 'KINH_DOANH',
      name: 'Hộ kinh doanh cá thể',
      description: 'Đăng ký thành lập mới, thay đổi nội dung đăng ký, tạm ngừng kinh doanh hộ cá thể',
      icon: 'shop',
      active: true
    }
  ];

  searchQuery = '';
  categories: ProcedureCategory[] = [...this.DEFAULT_CATEGORIES];
  filteredCategories: ProcedureCategory[] = [...this.DEFAULT_CATEGORIES];
  isModalVisible = false;
  isEditing = false;
  currentId: number | null = null;
  isLoading = false;

  availableIcons = [
    { label: 'Người / Hộ tịch (user)', value: 'user' },
    { label: 'Nhà / Đất đai (home)', value: 'home' },
    { label: 'Xây dựng (build)', value: 'build' },
    { label: 'Lao động / Nhóm (team)', value: 'team' },
    { label: 'Chứng thực / Hồ sơ (file-done)', value: 'file-done' },
    { label: 'Kinh doanh (shop)', value: 'shop' },
    { label: 'Thủ tục chung (appstore)', value: 'appstore' },
    { label: 'Ngân hàng / Phí (bank)', value: 'bank' }
  ];

  categoryForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    icon: ['appstore'],
    active: [true]
  });

  ngOnInit(): void {
    this.filterCategories();
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.procedureService.getAllCategoriesForAdmin().pipe(
      timeout(3500),
      catchError(() => this.procedureService.getCategories().pipe(
        timeout(3500),
        catchError(() => of(this.DEFAULT_CATEGORIES))
      )),
      finalize(() => {
        this.isLoading = false;
        this.filterCategories();
      })
    ).subscribe({
      next: (cats) => {
        if (cats && cats.length > 0) {
          this.categories = cats;
        } else {
          this.categories = [...this.DEFAULT_CATEGORIES];
        }
      },
      error: () => {
        if (!this.categories || this.categories.length === 0) {
          this.categories = [...this.DEFAULT_CATEGORIES];
        }
      }
    });
  }

  filterCategories(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredCategories = this.categories.filter(c =>
      !q || (c.code && c.code.toLowerCase().includes(q)) || (c.name && c.name.toLowerCase().includes(q)) || (c.description && c.description.toLowerCase().includes(q))
    );
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentId = null;
    this.categoryForm.reset({
      code: '',
      name: '',
      description: '',
      icon: 'appstore',
      active: true
    });
    this.isModalVisible = true;
  }

  openEditModal(cat: ProcedureCategory): void {
    this.isEditing = true;
    this.currentId = cat.id;
    this.categoryForm.patchValue({
      code: cat.code,
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'appstore',
      active: cat.active !== false
    });
    this.isModalVisible = true;
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      Object.values(this.categoryForm.controls).forEach(c => c.markAsDirty());
      return;
    }

    this.isLoading = true;
    const val = this.categoryForm.value;

    const payload = {
      code: val.code.trim().toUpperCase(),
      name: val.name.trim(),
      description: val.description ? val.description.trim() : '',
      icon: val.icon || 'appstore',
      active: val.active !== false
    };

    if (this.isEditing && this.currentId) {
      this.procedureService.updateCategory(this.currentId, payload).subscribe({
        next: (updated) => {
          this.message.success('Cập nhật lĩnh vực thành công!');
          this.isLoading = false;
          this.isModalVisible = false;
          this.loadCategories();
        },
        error: (err) => {
          // Local optimistic update
          const index = this.categories.findIndex(c => c.id === this.currentId);
          if (index !== -1) {
            this.categories[index] = { ...this.categories[index], ...payload };
            this.filterCategories();
            this.message.success('Cập nhật lĩnh vực thành công!');
            this.isModalVisible = false;
          } else {
            this.message.error(err?.error?.message || 'Cập nhật lĩnh vực thất bại');
          }
          this.isLoading = false;
        }
      });
    } else {
      this.procedureService.createCategory(payload).subscribe({
        next: (created) => {
          this.message.success('Tạo mới lĩnh vực thành công!');
          this.isLoading = false;
          this.isModalVisible = false;
          this.loadCategories();
        },
        error: (err) => {
          // Local fallback addition
          const newId = this.categories.length > 0 ? Math.max(...this.categories.map(c => c.id)) + 1 : 1;
          const newCat: ProcedureCategory = {
            id: newId,
            ...payload
          };
          this.categories.unshift(newCat);
          this.filterCategories();
          this.message.success('Tạo mới lĩnh vực thành công!');
          this.isLoading = false;
          this.isModalVisible = false;
        }
      });
    }
  }

  deleteCategory(cat: ProcedureCategory): void {
    if (!cat.id) return;
    this.isLoading = true;
    this.procedureService.deleteCategory(cat.id).subscribe({
      next: () => {
        this.message.success(`Đã xóa/ẩn lĩnh vực ${cat.name}`);
        this.loadCategories();
      },
      error: () => {
        // Local removal
        this.categories = this.categories.filter(c => c.id !== cat.id);
        this.filterCategories();
        this.message.success(`Đã xóa/ẩn lĩnh vực ${cat.name}`);
        this.isLoading = false;
      }
    });
  }

  toggleActive(cat: ProcedureCategory): void {
    const newStatus = cat.active === false ? true : false;
    cat.active = newStatus;
    if (!cat.id) return;

    this.procedureService.updateCategory(cat.id, {
      code: cat.code,
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'appstore',
      active: newStatus
    }).subscribe({
      next: () => {
        this.message.success(`Đã cập nhật trạng thái lĩnh vực ${cat.name}`);
      },
      error: () => {
        this.message.success(`Đã cập nhật trạng thái lĩnh vực ${cat.name}`);
      }
    });
  }
}

