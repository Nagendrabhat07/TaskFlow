import api from './client';
import { ApiResponse, Project, Pagination, ProjectFilters } from '../types';

export interface ProjectsData {
  projects: Project[];
  pagination: Pagination;
}

export interface ProjectData {
  project: Project;
  taskStats?: {
    todo: number;
    'in-progress': number;
    review: number;
    done: number;
    total: number;
  };
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  status?: string;
  color?: string;
}

export const projectsApi = {
  getAll: (filters?: ProjectFilters) =>
    api.get<ApiResponse<ProjectsData>>('/projects', { params: filters }),

  getById: (id: string) =>
    api.get<ApiResponse<ProjectData>>(`/projects/${id}`),

  create: (payload: CreateProjectPayload) =>
    api.post<ApiResponse<{ project: Project }>>('/projects', payload),

  update: (id: string, payload: Partial<CreateProjectPayload>) =>
    api.put<ApiResponse<{ project: Project }>>(`/projects/${id}`, payload),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/projects/${id}`),
};
