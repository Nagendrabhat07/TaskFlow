import api from './client';
import { ApiResponse, User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<AuthData>>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthData>>('/auth/login', payload),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout'),

  getMe: () =>
    api.get<ApiResponse<{ user: User }>>('/auth/me'),
};
