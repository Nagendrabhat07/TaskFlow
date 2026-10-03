import React from 'react';
import { TaskStatus, TaskPriority, ProjectStatus } from '../../types';
import { CheckCircle2, Clock, Eye, Circle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: TaskStatus | ProjectStatus;
  type?: 'task' | 'project';
}

const taskStatusConfig: Record<TaskStatus, { label: string; className: string; icon: React.ReactNode }> = {
  todo: {
    label: 'To Do',
    className: 'badge-todo',
    icon: <Circle className="w-3 h-3" />,
  },
  'in-progress': {
    label: 'In Progress',
    className: 'badge-in-progress',
    icon: <Clock className="w-3 h-3" />,
  },
  review: {
    label: 'Review',
    className: 'badge-review',
    icon: <Eye className="w-3 h-3" />,
  },
  done: {
    label: 'Done',
    className: 'badge-done',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

const projectStatusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'badge-active' },
  'on-hold': { label: 'On Hold', className: 'badge-on-hold' },
  completed: { label: 'Completed', className: 'badge-completed' },
  archived: { label: 'Archived', className: 'badge-archived' },
};

const priorityConfig: Record<TaskPriority, { label: string; className: string; icon: React.ReactNode }> = {
  low: { label: 'Low', className: 'badge-low', icon: null },
  medium: { label: 'Medium', className: 'badge-medium', icon: null },
  high: { label: 'High', className: 'badge-high', icon: <AlertCircle className="w-3 h-3" /> },
  urgent: { label: 'Urgent', className: 'badge-urgent', icon: <AlertCircle className="w-3 h-3" /> },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'task' }) => {
  if (type === 'project') {
    const config = projectStatusConfig[status as ProjectStatus];
    return <span className={config?.className || 'badge'}>{config?.label || status}</span>;
  }
  const config = taskStatusConfig[status as TaskStatus];
  return (
    <span className={config?.className || 'badge'}>
      {config?.icon}
      {config?.label || status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const config = priorityConfig[priority];
  return (
    <span className={config?.className || 'badge'}>
      {config?.icon}
      {config?.label || priority}
    </span>
  );
};
