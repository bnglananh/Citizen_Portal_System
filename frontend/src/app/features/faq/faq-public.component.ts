import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { catchError, finalize, of, timeout } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { FaqService, FaqItemDto } from '../../core/services/faq.service';

const DEFAULT_PUBLIC_FAQS: FaqItemDto[] = [
  {
    id: 1,
    question: 'Tôi cần chuẩn bị giấy tờ gì khi đăng ký khai sinh trực tuyến?',
    answer: 'Bạn cần chuẩn bị: (1) Giấy chứng sinh do bệnh viện/trung tâm y tế cấp, (2) CCCD của người nộp hồ sơ, (3) Giấy chứng nhận kết hôn của cha mẹ (nếu có). Tất cả tài liệu tải lên dưới dạng file ảnh (JPG, PNG) hoặc PDF rõ nét.',
    category: 'Hộ tịch & Tư pháp',
    orderIndex: 1,
    active: true
  },
  {
    id: 2,
    question: 'Thời gian xử lý hồ sơ cấp Giấy xác nhận tình trạng hôn nhân là bao lâu?',
    answer: 'Thời gian xử lý theo quy định là không quá 03 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ. Trường hợp cần xác minh thêm thì không quá 10 ngày làm việc.',
    category: 'Hộ tịch & Tư pháp',
    orderIndex: 2,
    active: true
  },
  {
    id: 3,
    question: 'Hồ sơ bị yêu cầu bổ sung thì tôi phải làm thế nào?',
    answer: 'Khi cán bộ yêu cầu bổ sung, bạn sẽ nhận được thông báo kèm lý do chi tiết. Hãy vào mục "Hồ sơ của tôi", chọn hồ sơ cần bổ sung, tải lên các tài liệu còn thiếu và bấm "Nộp lại hồ sơ".',
    category: 'Hồ sơ & Quy trình',
    orderIndex: 3,
    active: true
  },
  {
    id: 4,
    question: 'Bộ phận Tiếp nhận & Trả kết quả làm việc vào những khung giờ nào?',
    answer: 'Thời gian tiếp nhận và trả kết quả: Từ Thứ Hai đến Thứ Sáu (Sáng 07:30 - 11:30, Chiều 13:30 - 17:00) và Sáng Thứ Bảy (07:30 - 11:30). Nghỉ chiều Thứ Bảy, Chủ Nhật và ngày Lễ/Tết.',
    category: 'Thông tin chung',
    orderIndex: 4,
    active: true
  },
  {
    id: 5,
    question: 'Làm thế nào để tra cứu tiến độ hồ sơ khi không có tài khoản?',
    answer: 'Bạn có thể sử dụng chức năng "Tra cứu hồ sơ" công khai trên thanh menu, sau đó nhập chính xác Mã hồ sơ (VD: HS2026xxxxxx) in trên giấy tiếp nhận để xem toàn bộ lịch sử thẩm định.',
    category: 'Thông tin chung',
    orderIndex: 5,
    active: true
  }
];

@Component({
  selector: 'app-faq-public',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzCollapseModule,
    NzTabsModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzEmptyModule
  ],
  template: `
    <div class="faq-page-container">
      <div class="faq-hero-banner">
        <h2>HƯỚNG DẪN & CÂU HỎI THƯỜNG GẶP</h2>
        <p>Giải đáp thắc mắc về quy trình nộp hồ sơ, tài khoản định danh VNeID và theo dõi kết quả tại UBND Phường Tân Phú, TP. Hồ Chí Minh</p>
      </div>

      <div class="faq-card">
        @if (categories.length > 0) {
          <nz-tabs nzCentered class="faq-tabs">
            @for (cat of categories; track cat) {
              <nz-tab [nzTitle]="cat">
                <nz-collapse nzAccordion class="faq-collapse">
                  @for (faq of groupedFaqs[cat]; track faq.id; let first = $first) {
                    <nz-collapse-panel [nzHeader]="faq.question" [nzActive]="first">
                      <p>{{ faq.answer }}</p>
                    </nz-collapse-panel>
                  }
                </nz-collapse>
              </nz-tab>
            }
          </nz-tabs>
        } @else if (isLoading) {
          <div class="loading-box">
            <nz-spin nzSimple nzTip="Đang tải danh mục câu hỏi thường gặp..."></nz-spin>
          </div>
        } @else {
          <nz-empty nzNotFoundContent="Chưa có câu hỏi thường gặp nào"></nz-empty>
        }
      </div>
    </div>
  `,
  styles: [`
    .faq-page-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 4rem;
    }
    .faq-hero-banner {
      background: linear-gradient(135deg, #2F5D45 0%, #1E3B2C 100%);
      color: #fff;
      border-radius: var(--dvc-radius-lg);
      padding: 2.5rem 2rem;
      text-align: center;
      margin-bottom: 1.5rem;
      h2 { color: #fff; font-size: 1.4rem; font-weight: 700; margin: 0 0 0.35rem; }
      p { color: rgba(255, 255, 255, 0.85); font-size: 0.875rem; margin: 0; }
    }
    .faq-card {
      background: #FFFFFF;
      border-radius: var(--dvc-radius-lg);
      border: 1px solid var(--dvc-border-color);
      padding: 2rem;
      box-shadow: var(--dvc-shadow-sm);
    }
    .loading-box {
      text-align: center;
      padding: 3rem 0;
    }
    .faq-collapse {
      margin-top: 1rem;
      background: transparent;
      border: none;
      ::ng-deep .ant-collapse-item {
        border: 1px solid var(--dvc-border-color);
        border-radius: var(--dvc-radius-sm);
        margin-bottom: 0.75rem;
        background: #FAF7F2;
      }
      ::ng-deep .ant-collapse-header {
        font-weight: 600;
        font-size: 0.9375rem;
        color: var(--dvc-text-primary);
        padding: 0.85rem 1.25rem !important;
      }
      ::ng-deep .ant-collapse-content-box {
        background: #FFFFFF;
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--dvc-text-secondary);
        padding: 1rem 1.25rem;
      }
    }
  `]
})
export class FaqPublicComponent implements OnInit {
  private faqService = inject(FaqService);

  isLoading = false;
  categories: string[] = [];
  groupedFaqs: Record<string, FaqItemDto[]> = {};

  ngOnInit(): void {
    // 1. Render default FAQs immediately (0ms delay)
    this.groupFaqs(DEFAULT_PUBLIC_FAQS);

    // 2. Fetch fresh FAQs in the background
    this.faqService.getPublicFaqs().pipe(
      timeout(3500),
      catchError(() => of(DEFAULT_PUBLIC_FAQS)),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (faqs) => {
        if (faqs && faqs.length > 0) {
          this.groupFaqs(faqs);
        }
      }
    });
  }

  private groupFaqs(list: FaqItemDto[]): void {
    this.groupedFaqs = {};
    for (const f of list) {
      const cat = f.category || 'Thông tin chung';
      if (!this.groupedFaqs[cat]) {
        this.groupedFaqs[cat] = [];
      }
      this.groupedFaqs[cat].push(f);
    }
    this.categories = Object.keys(this.groupedFaqs);
  }
}
