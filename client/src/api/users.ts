import api from './client';
import { ApiResponse, User } from '../types';

export interface UpdateProfilePayload {
  name?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const usersApi = {
  getProfile: () =>
    api.get<ApiResponse<{ user: User }>>('/users/profile'),

  updateProfile: (payload: UpdateProfilePayload) =>
    api.put<ApiResponse<{ user: User }>>('/users/profile', payload),
};
