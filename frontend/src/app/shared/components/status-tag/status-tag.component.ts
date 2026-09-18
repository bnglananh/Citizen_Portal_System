import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [CommonModule, NzTagModule, NzIconModule],
  templateUrl: './status-tag.component.html',
  styleUrls: ['./status-tag.component.scss']
})
export class StatusTagComponent {
  @Input() status: string = 'DRAFT';
  @Input() size: 'small' | 'default' | 'large' = 'default';

  getStatusConfig(status: string) {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'DRAFT':
        return { label: 'Bản nháp', class: 'status-draft', icon: 'edit' };
      case 'SUBMITTED':
        return { label: 'Đã nộp', class: 'status-submitted', icon: 'send' };
      case 'RECEIVED':
        return { label: 'Đã tiếp nhận', class: 'status-received', icon: 'inbox' };
      case 'PROCESSING':
        return { label: 'Đang xử lý', class: 'status-processing', icon: 'sync', spin: true };
      case 'NEED_REVISION':
        return { label: 'Cần bổ sung', class: 'status-revision', icon: 'exclamation-circle' };
      case 'RESUBMITTED':
        return { label: 'Đã nộp lại', class: 'status-resubmitted', icon: 'redo' };
      case 'COMPLETED':
        return { label: 'Đã hoàn tất', class: 'status-completed', icon: 'check-circle' };
      case 'REJECTED':
        return { label: 'Bị từ chối', class: 'status-rejected', icon: 'close-circle' };
      default:
        return { label: status || 'Không xác định', class: 'status-draft', icon: 'question-circle' };
    }
  }
}
