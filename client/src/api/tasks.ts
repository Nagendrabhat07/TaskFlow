import api from './client';
import { ApiResponse, Task, Pagination, TaskFilters } from '../types';

export interface TasksData {
  tasks: Task[];
  pagination: Pagination;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  project: string;
  assignedTo?: string | null;
  dueDate?: string | null;
  tags?: string[];
}

export const tasksApi = {
  getAll: (filters?: TaskFilters) =>
    api.get<ApiResponse<TasksData>>('/tasks', { params: filters }),

  getById: (id: string) =>
    api.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`),

  create: (payload: CreateTaskPayload) =>
    api.post<ApiResponse<{ task: Task }>>('/tasks', payload),

  update: (id: string, payload: Partial<CreateTaskPayload>) =>
    api.put<ApiResponse<{ task: Task }>>(`/tasks/${id}`, payload),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/tasks/${id}`),
};
