import React, { useState } from 'react';
import { Project } from '../../types';
import { projectsApi } from '../../api/projects';
import toast from 'react-hot-toast';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
];

interface ProjectFormProps {
  project?: Project;
  onSuccess: (project: Project) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'active',
    color: project?.color || '#6366f1',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      let res;
      if (project) {
        res = await projectsApi.update(project._id, form);
        toast.success('Project updated successfully');
      } else {
        res = await projectsApi.create(form);
        toast.success('Project created successfully');
      }
      if (res.data.success && res.data.data) {
        onSuccess(res.data.data.project);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to save project';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="project-name" className="label">Project Name *</label>
        <input
          id="project-name"
          type="text"
          className="input"
          placeholder="Enter project name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="project-description" className="label">Description</label>
        <textarea
          id="project-description"
          className="input resize-none"
          rows={3}
          placeholder="Describe the project goals..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="project-status" className="label">Status</label>
        <select
          id="project-status"
          className="select"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as any })}
        >
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div>
        <label className="label">Project Color</label>
        <div className="flex gap-2 flex-wrap">
          {PROJECT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                form.color === color
                  ? 'border-white scale-110'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setForm({ ...form, color })}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
