import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, of, timeout } from 'rxjs';
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
import { FaqService, FaqItemDto } from '../../../core/services/faq.service';

@Component({
  selector: 'app-faq-management',
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
  templateUrl: './faq-management.component.html',
  styleUrls: ['./faq-management.component.scss']
})
export class FaqManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private message = inject(NzMessageService);
  private faqService = inject(FaqService);
  private cdr = inject(ChangeDetectorRef);

  searchQuery = '';
  faqs: FaqItemDto[] = [];
  filteredFaqs: FaqItemDto[] = [];

  pageIndex = 1;
  pageSize = 10;
  totalFaqs = 0;

  isModalVisible = false;
  isEditing = false;
  currentId: number | null = null;
  isLoading = false;

  faqForm: FormGroup = this.fb.group({
    category: ['Hồ sơ & Thủ tục', [Validators.required]],
    question: ['', [Validators.required]],
    answer: ['', [Validators.required]],
    orderNum: [1, [Validators.required]]
  });

  ngOnInit(): void {
    this.loadFaqs();
  }

  loadFaqs(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.faqService.searchFaqs(this.searchQuery, this.pageIndex - 1, this.pageSize).pipe(
      timeout(5000),
      catchError(() => of({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 10, first: true, last: true })),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.faqs = res.content || [];
        this.filteredFaqs = this.faqs;
        this.totalFaqs = res.totalElements || this.faqs.length;
        this.cdr.detectChanges();
      }
    });
  }

  filterFaqs(): void {
    this.pageIndex = 1;
    this.loadFaqs();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentId = null;
    this.faqForm.reset({ category: 'Hồ sơ & Thủ tục', orderNum: this.faqs.length + 1 });
    this.isModalVisible = true;
  }

  openEditModal(faq: FaqItemDto): void {
    this.isEditing = true;
    this.currentId = faq.id;
    this.faqForm.patchValue({
      category: faq.category || 'Hồ sơ & Thủ tục',
      question: faq.question,
      answer: faq.answer,
      orderNum: faq.orderIndex || 1
    });
    this.isModalVisible = true;
  }

  toggleActive(faq: FaqItemDto): void {
    if (faq.active) {
      this.faqService.deleteFaq(faq.id).subscribe({
        next: () => {
          faq.active = false;
          this.message.success('Đã ẩn câu hỏi FAQ');
        },
        error: () => {
          this.message.error('Không thể cập nhật trạng thái');
        }
      });
    } else {
      this.faqService.updateFaq(faq.id, {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        orderIndex: faq.orderIndex,
        active: true
      }).subscribe({
        next: () => {
          faq.active = true;
          this.message.success('Đã kích hoạt câu hỏi FAQ');
        },
        error: () => {
          this.message.error('Không thể kích hoạt FAQ');
        }
      });
    }
  }

  saveFaq(): void {
    if (this.faqForm.invalid) {
      Object.values(this.faqForm.controls).forEach(c => c.markAsDirty());
      return;
    }

    this.isLoading = true;
    const val = this.faqForm.value;
    const payload = {
      question: val.question.trim(),
      answer: val.answer.trim(),
      category: val.category,
      orderIndex: val.orderNum,
      active: true
    };

    if (this.isEditing && this.currentId) {
      this.faqService.updateFaq(this.currentId, payload).subscribe({
        next: () => {
          this.message.success('Cập nhật câu hỏi FAQ thành công!');
          this.isLoading = false;
          this.isModalVisible = false;
          this.loadFaqs();
        },
        error: (err) => {
          this.message.error(err?.error?.message || 'Cập nhật FAQ thất bại');
          this.isLoading = false;
        }
      });
    } else {
      this.faqService.createFaq(payload).subscribe({
        next: () => {
          this.message.success('Tạo mới câu hỏi FAQ thành công!');
          this.isLoading = false;
          this.isModalVisible = false;
          this.loadFaqs();
        },
        error: (err) => {
          this.message.error(err?.error?.message || 'Tạo mới FAQ thất bại');
          this.isLoading = false;
        }
      });
    }
  }
}
