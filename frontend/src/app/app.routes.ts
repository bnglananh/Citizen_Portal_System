import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  // 1. AUTH ROUTES
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
    ],
  },

  // 2. CITIZEN & PUBLIC ROUTES (Main Portal)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'procedures',
        loadComponent: () =>
          import('./features/procedures/procedure-list/procedure-list.component').then(
            (m) => m.ProcedureListComponent
          ),
      },
      {
        path: 'procedures/:id',
        loadComponent: () =>
          import('./features/procedures/procedure-detail/procedure-detail.component').then(
            (m) => m.ProcedureDetailComponent
          ),
      },
      {
        path: 'tracking',
        loadComponent: () =>
          import('./features/public-tracking/public-tracking.component').then(
            (m) => m.PublicTrackingComponent
          ),
      },
      {
        path: 'faq',
        loadComponent: () =>
          import('./features/faq/faq-public.component').then(
            (m) => m.FaqPublicComponent
          ),
      },
      {
        path: 'notifications',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/notifications/notification-list/notification-list.component').then(
            (m) => m.NotificationListComponent
          ),
      },
    ],
  },

  // 3. CITIZEN PORTAL ROUTES (Unified Workspace Sidebar)
  {
    path: 'citizen',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/citizen/dashboard/citizen-dashboard.component').then(
            (m) => m.CitizenDashboardComponent
          ),
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/citizen/applications/my-applications.component').then(
            (m) => m.MyApplicationsComponent
          ),
      },
      {
        path: 'applications/:id',
        loadComponent: () =>
          import('./features/citizen/applications/application-detail.component').then(
            (m) => m.ApplicationDetailComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/citizen/profile/citizen-profile.component').then(
            (m) => m.CitizenProfileComponent
          ),
      },
      {
        path: 'submit-application/:procedureId',
        loadComponent: () =>
          import('./features/citizen/submit-application/submit-application.component').then(
            (m) => m.SubmitApplicationComponent
          ),
      },
      {
        path: 'submit-application',
        loadComponent: () =>
          import('./features/citizen/submit-application/submit-application.component').then(
            (m) => m.SubmitApplicationComponent
          ),
      },
    ],
  },

  // 3. STAFF PORTAL ROUTES
  {
    path: 'staff',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_STAFF', 'ROLE_ADMIN'] },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/staff/dashboard/staff-dashboard.component').then(
            (m) => m.StaffDashboardComponent
          ),
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/staff/applications/staff-applications.component').then(
            (m) => m.StaffApplicationsComponent
          ),
      },
      {
        path: 'applications/:id/review',
        loadComponent: () =>
          import('./features/staff/application-review/staff-application-review.component').then(
            (m) => m.StaffApplicationReviewComponent
          ),
      },
    ],
  },

  // 4. ADMIN PORTAL ROUTES
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/user-management.component').then(
            (m) => m.UserManagementComponent
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories/category-management.component').then(
            (m) => m.CategoryManagementComponent
          ),
      },
      {
        path: 'procedures',
        loadComponent: () =>
          import('./features/admin/procedures/procedure-management.component').then(
            (m) => m.ProcedureManagementComponent
          ),
      },
      {
        path: 'faqs',
        loadComponent: () =>
          import('./features/admin/faqs/faq-management.component').then(
            (m) => m.FaqManagementComponent
          ),
      },
      {
        path: 'chatbot',
        loadComponent: () =>
          import('./features/admin/chatbot/chatbot-settings.component').then(
            (m) => m.ChatbotSettingsComponent
          ),
      },
    ],
  },

  // 5. WILDCARD FALLBACK
  {
    path: '**',
    redirectTo: '',
  },
];
