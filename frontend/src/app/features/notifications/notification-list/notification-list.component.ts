import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NotificationService, AppNotification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzTabsModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzEmptyModule,
    NzSpinModule,
    NzPaginationModule
  ],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private message = inject(NzMessageService);

  isLoading = signal<boolean>(true);
  selectedTab = 0; // 0: All, 1: Unread, 2: Read

  notifications: AppNotification[] = [];
  filteredList: AppNotification[] = [];
  pagedNotifications: AppNotification[] = [];

  // Pagination state
  pageIndex = 1;
  pageSize = 8;
  pageSizeOptions = [8, 16, 24];

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.notificationService.getMyNotifications(0, 100).subscribe({
      next: (res) => {
        this.notifications = res.content || [];
        this.filterList();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
    this.pageIndex = 1;
    this.filterList();
  }

  filterList(): void {
    if (this.selectedTab === 1) {
      this.filteredList = this.notifications.filter(n => !n.read);
    } else if (this.selectedTab === 2) {
      this.filteredList = this.notifications.filter(n => n.read);
    } else {
      this.filteredList = [...this.notifications];
    }
    this.updatePagedList();
  }

  updatePagedList(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedNotifications = this.filteredList.slice(start, end);
  }

  onPageIndexChange(newIndex: number): void {
    this.pageIndex = newIndex;
    this.updatePagedList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.pageIndex = 1;
    this.updatePagedList();
  }

  markAsRead(item: AppNotification): void {
    if (!item.read) {
      item.read = true;
      this.notificationService.markAsRead(item.id).subscribe({
        next: () => {
          this.filterList();
        }
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => (n.read = true));
        this.filterList();
        this.message.success('Đã đánh dấu tất cả thông báo là đã đọc.');
      },
      error: () => {
        this.message.error('Không thể cập nhật trạng thái thông báo.');
      }
    });
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}
