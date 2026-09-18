import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatbotWidgetComponent } from '../../features/chatbot/chatbot-widget/chatbot-widget.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzButtonModule,
    NzIconModule,
    NzDropdownModule,
    NzBadgeModule,
    NzAvatarModule,
    NzBreadCrumbModule,
    NzTagModule,
    NzDividerModule,
    NzDrawerModule,
    ChatbotWidgetComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isMobileMenuOpen = false;
  unreadCount = 0;

  notifications: Array<{ id: number; title: string; time: string; read: boolean }> = [];

  constructor() {
    this.refreshNotifications();
  }

  refreshNotifications(): void {
    if (this.authService.isAuthenticated()) {
      this.notificationService.getUnreadCount().subscribe({
        next: (count) => this.unreadCount = count,
        error: () => {}
      });
      this.notificationService.getRecentNotifications().subscribe({
        next: (list) => {
          if (list && list.length > 0) {
            this.notifications = list.map(n => ({
              id: n.id,
              title: n.title,
              time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
              read: n.read
            }));
          }
        },
        error: () => {}
      });
    }
  }

  get isStaffOrAdmin(): boolean {
    return this.authService.hasRole('ROLE_STAFF') || this.authService.hasRole('ROLE_ADMIN');
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  openMobileMenu(): void {
    this.isMobileMenuOpen = true;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }
}

