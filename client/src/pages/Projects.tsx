import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';
import { projectsApi } from '../api/projects';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import ProjectForm from '../components/forms/ProjectForm';
import { Loading, ErrorState, EmptyState } from '../components/ui/States';
import { StatusBadge } from '../components/ui/Badges';
import { Plus, Search, FolderKanban, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await projectsApi.getAll({ search: searchTerm });
      if (res.data.success && res.data.data) {
        setProjects(res.data.data.projects);
      }
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleCreate = () => {
    setEditingProject(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await projectsApi.delete(deleteId);
      toast.success('Project deleted successfully');
      setProjects(projects.filter(p => p._id !== deleteId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const onFormSuccess = (savedProject: Project) => {
    setIsFormOpen(false);
    if (editingProject) {
      setProjects(projects.map(p => p._id === savedProject._id ? savedProject : p));
    } else {
      setProjects([savedProject, ...projects]);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm">Manage your team's projects and workspaces.</p>
        </div>
        <button onClick={handleCreate} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
            className="input pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProjects} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-12 h-12" />}
          title={searchTerm ? "No matching projects found" : "No projects yet"}
          description={searchTerm ? "Try adjusting your search query." : "Create your first project to start organizing tasks."}
          action={!searchTerm && (
            <button onClick={handleCreate} className="btn-primary mt-2">
              Create Project
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link 
              key={project._id}
              to={`/projects/${project._id}`}
              className="card hover:border-primary-500/50 transition-colors group flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${project.color}20` }}>
                    <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white line-clamp-1 group-hover:text-primary-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleEdit(project, e)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteClick(project._id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-slate-400 mb-6 line-clamp-2 flex-1">
                {project.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                <StatusBadge status={project.status} type="project" />
                
                <div className="flex items-center -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-primary-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white z-10" title={project.owner.name}>
                    {project.owner.name.charAt(0)}
                  </div>
                  {project.members.filter(m => m._id !== project.owner._id).slice(0, 2).map((member, i) => (
                    <div key={member._id} className={`w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white z-${9-i}`} title={member.name}>
                      {member.name.charAt(0)}
                    </div>
                  ))}
                  {project.members.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-medium text-slate-300 z-0">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
      >
        <ProjectForm
          project={editingProject}
          onSuccess={onFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated tasks will be permanently removed. This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Projects;
