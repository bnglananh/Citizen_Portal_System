import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { AuthService } from '../../core/auth/auth.service';

interface ServiceCategory {
  id: number;
  name: string;
  icon: string;
  count: number;
  description: string;
  popularItems: string[];
}

interface FeaturedProcedure {
  id: number;
  code: string;
  name: string;
  categoryName: string;
  processingTime: string;
  feeText: string;
  isFullyOnline: boolean;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzCardModule,
    NzGridModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzBadgeModule,
    NzTabsModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private router = inject(Router);
  public authService = inject(AuthService);

  activeTab: 'procedure' | 'tracking' = 'procedure';
  searchQuery = '';
  trackingCode = '';

  quickKeywords = [
    'Đăng ký khai sinh',
    'Xác nhận tình trạng hôn nhân',
    'Đổi bằng lái xe',
    'Hộ kinh doanh',
    'Chứng thực bản sao điện tử',
    'Lý lịch tư pháp'
  ];

  stats = [
    {
      value: '99.6%',
      label: 'Tỷ lệ giải quyết đúng hạn',
      desc: 'Cam kết minh bạch, không để hồ sơ quá hạn',
      icon: 'check-circle',
      accentColor: '#2F5D45'
    },
    {
      value: '1,450+',
      label: 'Hồ sơ trực tuyến đã xử lý',
      desc: 'Tiếp nhận & trả kết quả hoàn tất trong năm 2026',
      icon: 'file-done',
      accentColor: '#C99A3C'
    },
    {
      value: '100%',
      label: 'Dịch vụ công trực tuyến',
      desc: 'Tiếp nhận và giải quyết toàn trình & một phần',
      icon: 'thunderbolt',
      accentColor: '#2F5D45'
    },
    {
      value: '< 24 giờ',
      label: 'Thời gian phản hồi ban đầu',
      desc: 'Phân công cán bộ chuyên môn thụ lý trong ngày',
      icon: 'clock-circle',
      accentColor: '#C99A3C'
    }
  ];

  categories: ServiceCategory[] = [
    {
      id: 1,
      name: 'Hộ tịch & Nhân thân',
      icon: 'solution',
      count: 14,
      description: 'Đăng ký khai sinh, kết hôn, khai tử, xác nhận tình trạng hôn nhân, cấp bản sao trích lục.',
      popularItems: ['Khai sinh toàn trình', 'Xác nhận hôn nhân', 'Trích lục hộ tịch']
    },
    {
      id: 2,
      name: 'Chứng thực & Sao y điện tử',
      icon: 'file-protect',
      count: 8,
      description: 'Chứng thực bản sao điện tử từ bản chính, chứng thực chữ ký, điểm chỉ trong các giao dịch dân sự.',
      popularItems: ['Sao y bản chính điện tử', 'Chứng thực chữ ký', 'Chứng thực hợp đồng']
    },
    {
      id: 4,
      name: 'Địa chính, Đất đai & Xây dựng',
      icon: 'home',
      count: 11,
      description: 'Xác nhận hiện trạng nhà đất, cấp phép cải tạo sửa chữa nhà ở riêng lẻ, trích lục bản đồ địa chính.',
      popularItems: ['Hiện trạng nhà đất', 'Cấp phép sửa chữa', 'Trích lục thửa đất']
    },
    {
      id: 3,
      name: 'Đăng ký Kinh doanh & Thuế',
      icon: 'shop',
      count: 6,
      description: 'Thành lập hộ kinh doanh cá thể, thay đổi thông tin đăng ký, tạm ngừng hoặc chấm dứt hoạt động.',
      popularItems: ['Thành lập hộ kinh doanh', 'Thay đổi giấy phép', 'Tạm ngừng kinh doanh']
    },
    {
      id: 5,
      name: 'Lao động, TB&XH & Bảo trợ',
      icon: 'heart',
      count: 9,
      description: 'Trợ cấp xã hội người cao tuổi, người khuyết tật, mai táng phí, bảo hiểm y tế hộ gia đình.',
      popularItems: ['Trợ cấp người cao tuổi', 'Trợ cấp khuyết tật', 'BHYT hộ gia đình']
    },
    {
      id: 6,
      name: 'Giao thông Vận tải & Lưu trú',
      icon: 'car',
      count: 7,
      description: 'Đổi giấy phép lái xe quốc gia, thông báo lưu trú trực tuyến, quản lý trật tự đô thị tại phường.',
      popularItems: ['Đổi GPLX sang PET', 'Khai báo tạm vắng', 'Đăng ký biển số']
    }
  ];

  steps = [
    {
      step: '01',
      title: 'Tra cứu & Chọn dịch vụ',
      desc: 'Tra cứu điều kiện, thành phần hồ sơ mẫu, mức lệ phí niêm yết và thời hạn giải quyết.',
      icon: 'search'
    },
    {
      step: '02',
      title: 'Điền tờ khai & Đính kèm',
      desc: 'Điền thông tin tờ khai trực tuyến, tải các giấy tờ đã số hóa từ máy tính hoặc điện thoại.',
      icon: 'cloud-upload'
    },
    {
      step: '03',
      title: 'Cán bộ thụ lý & Xử lý số',
      desc: 'Cán bộ thẩm định theo quy chuẩn, tự động gửi cập nhật trạng thái qua SMS / Thông báo.',
      icon: 'audit'
    },
    {
      step: '04',
      title: 'Nhận kết quả & Đánh giá',
      desc: 'Nhận kết quả điện tử có chữ ký số hoặc bưu điện chuyển tận nhà; đánh giá mức độ hài lòng.',
      icon: 'safety-certificate'
    }
  ];

  featuredProcedures: FeaturedProcedure[] = [
    {
      id: 1,
      code: 'TTHC-HT-01',
      name: 'Đăng ký khai sinh trực tuyến toàn trình',
      categoryName: 'Hộ tịch & Nhân thân',
      processingTime: '01 ngày làm việc',
      feeText: 'Miễn phí',
      isFullyOnline: true,
      description: 'Cấp Giấy khai sinh số và mã định danh cá nhân liên thông đăng ký cư trú và cấp thẻ BHYT cho trẻ em.'
    },
    {
      id: 4,
      code: 'TTHC-HT-04',
      name: 'Cấp Phiếu lý lịch tư pháp trực tuyến (Mẫu 01)',
      categoryName: 'Hộ tịch & Nhân thân',
      processingTime: '10 ngày làm việc',
      feeText: '200.000 VNĐ',
      isFullyOnline: true,
      description: 'Cấp Phiếu lý lịch tư pháp cho công dân phục vụ xin việc, du học, hành nghề hoặc định cư.'
    },
    {
      id: 2,
      code: 'TTHC-GT-02',
      name: 'Đổi giấy phép lái xe do ngành Giao thông vận tải cấp',
      categoryName: 'Giao thông vận tải',
      processingTime: '05 ngày làm việc',
      feeText: '135.000 VNĐ',
      isFullyOnline: false,
      description: 'Đổi GPLX ô tô/xe máy còn hạn hoặc quá hạn dưới 3 tháng sang thẻ nhựa PET chuẩn công nghệ số.'
    },
    {
      id: 3,
      code: 'TTHC-KD-03',
      name: 'Đăng ký thành lập Hộ kinh doanh cá thể',
      categoryName: 'Đăng ký kinh doanh',
      processingTime: '03 ngày làm việc',
      feeText: '100.000 VNĐ',
      isFullyOnline: false,
      description: 'Đăng ký hoạt động kinh doanh cho cá nhân hoặc hộ gia đình tại địa bàn Phường Tân Phú.'
    }
  ];

  notices = [
    {
      tag: 'Chuyển đổi số',
      title: 'Triển khai cấp bản sao điện tử từ sổ gốc có mã QR xác thực toàn quốc',
      date: '12/03/2026',
      summary: 'Bản sao điện tử được ký số của UBND Phường có giá trị pháp lý tương đương bản chính trên toàn lãnh thổ.'
    },
    {
      tag: 'Tiện ích công dân',
      title: 'Tích hợp thanh toán trực tuyến không dùng tiền mặt qua Cổng Dịch vụ công',
      date: '08/03/2026',
      summary: 'Người dân có thể thanh toán lệ phí hồ sơ tức thì qua quét mã VietQR, ví điện tử hoặc thẻ ATM nội địa.'
    },
    {
      tag: 'Lịch làm việc',
      title: 'Lịch tiếp công dân và tư vấn hồ sơ hành chính trực tiếp tại UBND Phường',
      date: '01/03/2026',
      summary: 'Phục vụ tiếp nhận từ Thứ 2 đến Thứ 6 (Sáng: 7h30 - 11h30, Chiều: 13h30 - 17h00) và Sáng Thứ 7.'
    }
  ];

  submitSearch(): void {
    if (this.activeTab === 'procedure') {
      const query = this.searchQuery.trim();
      this.router.navigate(['/procedures'], {
        queryParams: query ? { search: query } : {}
      });
    } else {
      const code = this.trackingCode.trim();
      this.router.navigate(['/tracking'], {
        queryParams: code ? { code } : {}
      });
    }
  }

  searchKeyword(kw: string): void {
    this.searchQuery = kw;
    this.activeTab = 'procedure';
    this.router.navigate(['/procedures'], {
      queryParams: { search: kw }
    });
  }

  navigateToCategory(catId: number): void {
    this.router.navigate(['/procedures'], {
      queryParams: { categoryId: catId }
    });
  }

  applyProcedure(procId: number): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/citizen/submit-application', procId]);
    } else {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: `/citizen/submit-application/${procId}` }
      });
    }
  }

  openChatbot(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-dvc-chatbot'));
    }
  }
}
