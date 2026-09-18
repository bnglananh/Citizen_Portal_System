import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NzIconModule],
  template: `
    <div class="auth-page-wrapper">
      <div class="auth-header">
        <a routerLink="/" class="gov-brand-link">
          <div class="brand-crest">
            <i nz-icon nzType="safety-certificate" nzTheme="outline"></i>
          </div>
          <div class="brand-titles">
            <span class="main-title">HỆ THỐNG DỊCH VỤ CÔNG PHƯỜNG TÂN PHÚ</span>
            <span class="sub-title">ỦY BAN NHÂN DÂN PHƯỜNG TÂN PHÚ - TP. HỒ CHÍ MINH</span>
          </div>
        </a>
      </div>

      <div class="auth-card-container">
        <router-outlet></router-outlet>
      </div>

      <div class="auth-footer">
        <p>© 2026 Cổng Dịch vụ công UBND Phường Tân Phú, TP. Hồ Chí Minh.</p>
        <a routerLink="/" class="back-home-link">
          <i nz-icon nzType="arrow-left" nzTheme="outline"></i> Quay lại trang chủ
        </a>
      </div>

    </div>
  `,
  styles: [`
    .auth-page-wrapper {
      min-height: 100vh;
      background: radial-gradient(circle at 50% 20%, #FAF7F2 0%, #E8E2D4 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 2rem 1rem;
    }

    .auth-header {
      .gov-brand-link {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        text-decoration: none;

        .brand-crest {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #2F5D45 0%, #1A3427 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #E6C875;
          font-size: 1.75rem;
          box-shadow: 0 4px 12px rgba(47, 93, 69, 0.25);
        }

        .brand-titles {
          display: flex;
          flex-direction: column;

          .main-title {
            font-size: 1.15rem;
            font-weight: 700;
            color: #1C1C1A;
            letter-spacing: 0.5px;
          }

          .sub-title {
            font-size: 0.725rem;
            font-weight: 600;
            color: #2F5D45;
            letter-spacing: 0.75px;
          }
        }
      }
    }

    .auth-card-container {
      width: 100%;
      max-width: 460px;
      margin: 1.5rem 0;
    }

    .auth-footer {
      text-align: center;
      font-size: 0.8125rem;
      color: #6E6D68;

      p {
        margin-bottom: 0.5rem;
      }

      .back-home-link {
        color: #2F5D45;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        transition: color 0.2s;

        &:hover {
          color: #C99A3C;
        }
      }
    }
  `]
})
export class AuthLayoutComponent {}
