export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: User;
  members: User[];
  status: ProjectStatus;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: Project;
  assignedTo?: User;
  createdBy: User;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  project?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus | '';
  page?: number;
  limit?: number;
}
