export type UserRole = 'ROLE_CITIZEN' | 'ROLE_STAFF' | 'ROLE_ADMIN';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  citizenIdCard?: string;
  identityCardNumber?: string;
  address?: string;
  roles: UserRole[];
  enabled?: boolean;
  active?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  user: User;
}
