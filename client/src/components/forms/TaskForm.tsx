import React, { useState, useEffect } from 'react';
import { Task, Project } from '../../types';
import { tasksApi } from '../../api/tasks';
import { projectsApi } from '../../api/projects';
import toast from 'react-hot-toast';

interface TaskFormProps {
  task?: Task;
  projectId?: string; // Pre-select project if opened from project view
  onSuccess: (task: Task) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, projectId, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    project: task?.project?._id || projectId || '',
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const res = await projectsApi.getAll({ limit: 100 });
        if (res.data.success && res.data.data) {
          setProjects(res.data.data.projects);
          // If no project selected and we have projects, select first one
          if (!form.project && res.data.data!.projects.length > 0) {
            setForm(prev => ({ ...prev, project: res.data.data!.projects[0]._id }));
          }
        }
      } catch (err) {
        toast.error('Failed to load projects');
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [form.project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.project) {
      toast.error('Title and Project are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      let res;
      if (task) {
        res = await tasksApi.update(task._id, form);
        toast.success('Task updated successfully');
      } else {
        res = await tasksApi.create(form);
        toast.success('Task created successfully');
      }
      if (res.data.success && res.data.data) {
        onSuccess(res.data.data.task);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to save task';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="task-title" className="label">Task Title *</label>
        <input
          id="task-title"
          type="text"
          className="input"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="task-project" className="label">Project *</label>
        <select
          id="task-project"
          className="select"
          value={form.project}
          onChange={(e) => setForm({ ...form, project: e.target.value })}
          required
          disabled={isLoadingProjects || !!projectId}
        >
          <option value="" disabled>Select a project</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="task-description" className="label">Description</label>
        <textarea
          id="task-description"
          className="input resize-none"
          rows={3}
          placeholder="Add more details..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="task-status" className="label">Status</label>
          <select
            id="task-status"
            className="select"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as any })}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="task-priority" className="label">Priority</label>
          <select
            id="task-priority"
            className="select"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
