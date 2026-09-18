import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { AuthResponse, User, UserRole } from '../models/user.model';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = '/api/auth';

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.initAuthState();
  }

  private initAuthState(): void {
    const token = this.tokenService.getToken();
    if (token) {
      const storedUser = localStorage.getItem('current_user');
      if (storedUser) {
        try {
          const user: User = JSON.parse(storedUser);
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
        } catch {
          this.logout();
        }
      }
    }
  }

  login(credentials: { username?: string; usernameOrEmail?: string; password: string }): Observable<ApiResponse<AuthResponse>> {
    const payload = {
      usernameOrEmail: credentials.usernameOrEmail || credentials.username,
      password: credentials.password,
    };
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, payload).pipe(
      tap((res) => {
        if (res.data) {
          this.setCurrentUser(res.data.user, res.data.accessToken);
        }
      })
    );
  }

  sendRegisterOtp(data: { email: string; username?: string; fullName?: string; identityCardNumber?: string }): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/send-register-otp`, data);
  }

  register(data: any): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, data).pipe(
      tap((res) => {
        if (res.data) {
          this.setCurrentUser(res.data.user, res.data.accessToken);
        }
      })
    );
  }

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>('/api/users/me').pipe(
      tap((res) => {
        if (res.data) {
          const updated = { ...this.currentUser(), ...res.data };
          this.currentUser.set(updated);
          localStorage.setItem('current_user', JSON.stringify(updated));
        }
      })
    );
  }

  setCurrentUser(user: User, token: string): void {
    if (user) {
      if (user.identityCardNumber && !user.citizenIdCard) {
        user.citizenIdCard = user.identityCardNumber;
      }
      if (user.active !== undefined && user.enabled === undefined) {
        user.enabled = user.active;
      }
    }
    this.tokenService.setToken(token);
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  logout(): void {
    this.tokenService.removeToken();
    localStorage.removeItem('current_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUser();
    return user ? user.roles.includes(role) : false;
  }
}
