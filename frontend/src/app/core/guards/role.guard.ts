import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data?.['roles'] as UserRole[] | undefined;
  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  const user = authService.currentUser();
  if (user && expectedRoles.some((role) => user.roles.includes(role))) {
    return true;
  }

  // Không đủ quyền -> điều hướng về trang chủ
  router.navigate(['/']);
  return false;
};
