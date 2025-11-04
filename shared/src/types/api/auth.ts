// Authentication API types
import type { User } from '../entities/user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  nickname?: string;
  position?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
