import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService, AppNotification } from '../../core/services/notification.service';
import { ChatbotWidgetComponent } from '../../features/chatbot/chatbot-widget/chatbot-widget.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzLayoutModule,
    NzMenuModule,
    NzButtonModule,
    NzIconModule,
    NzDropdownModule,
    NzBadgeModule,
    NzAvatarModule,
    NzBreadCrumbModule,
    NzTagModule,
    NzInputModule,
    NzTooltipModule,
    ChatbotWidgetComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isCollapsed = false;
  searchQuery = '';
  unreadCount = 0;
  notifications: AppNotification[] = [];

  ngOnInit(): void {
    this.refreshNotifications();
  }

  onSearch(): void {
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim();
      if (this.isStaff || this.isAdmin) {
        this.router.navigate(['/staff/applications'], { queryParams: { search: q } });
      } else {
        this.router.navigate(['/citizen/applications'], { queryParams: { search: q } });
      }
    }
  }

  refreshNotifications(): void {
    if (this.authService.isAuthenticated()) {
      this.notificationService.getUnreadCount().subscribe({
        next: (count) => this.unreadCount = count,
        error: () => {}
      });

      this.notificationService.getRecentNotifications().subscribe({
        next: (list) => {
          this.notifications = list || [];
        },
        error: () => {}
      });
    }
  }

  onNotificationClick(noti: AppNotification): void {
    if (!noti.read) {
      this.notificationService.markAsRead(noti.id).subscribe({
        next: () => {
          noti.read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      });
    }

    if (noti.applicationId) {
      if (this.isStaff || this.isAdmin) {
        this.router.navigate(['/staff/applications', noti.applicationId, 'review']);
      } else {
        this.router.navigate(['/citizen/applications', noti.applicationId]);
      }
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
      }
    });
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  get isStaff(): boolean {
    return this.authService.hasRole('ROLE_STAFF');
  }

  get isCitizen(): boolean {
    return this.authService.hasRole('ROLE_CITIZEN') || (!this.isAdmin && !this.isStaff);
  }

  get portalTitle(): string {
    if (this.isAdmin) return 'CỔNG QUẢN TRỊ VIÊN';
    if (this.isStaff) return 'CỔNG CÁN BỘ NGHIỆP VỤ';
    return 'CỔNG DỊCH VỤ CÔNG DÂN';
  }

  get roleBadgeText(): string {
    if (this.isAdmin) return 'QUẢN TRỊ VIÊN';
    if (this.isStaff) return 'CÁN BỘ TIẾP NHẬN';
    return 'CÔNG DÂN';
  }

  get roleBadgeColor(): string {
    if (this.isAdmin) return '#C99A3C'; // Gold
    if (this.isStaff) return '#4A7C59'; // Forest green
    return '#1890FF'; // Blue for citizen
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
