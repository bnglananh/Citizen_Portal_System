import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NzNotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        notification.error('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại.');
        authService.logout();
      } else if (error.status === 403) {
        notification.error('Từ chối truy cập', 'Bạn không có quyền thực hiện thao tác này.');
      } else if (error.status === 409 || error.status === 422) {
        notification.warning('Lỗi nghiệp vụ', error.error?.message || 'Thao tác không hợp lệ.');
      } else if (error.status === 500) {
        notification.error('Lỗi máy chủ', 'Hệ thống đang gặp sự cố, vui lòng thử lại sau.');
      }

      return throwError(() => error);
    })
  );
};
