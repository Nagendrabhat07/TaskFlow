import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Project, Task, TaskStatus } from '../types';
import { projectsApi, ProjectData } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import TaskForm from '../components/forms/TaskForm';
import ProjectForm from '../components/forms/ProjectForm';
import { Loading, ErrorState, EmptyState } from '../components/ui/States';
import { StatusBadge, PriorityBadge } from '../components/ui/Badges';
import { Plus, ArrowLeft, Edit2, Trash2, Calendar, User, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjectDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectsApi.getById(id),
        tasksApi.getAll({ project: id, limit: 100 })
      ]);
      
      if (projectRes.data.success && projectRes.data.data) {
        setProjectData(projectRes.data.data);
      }
      if (tasksRes.data.success && tasksRes.data.data) {
        setTasks(tasksRes.data.data.tasks);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Project not found.');
      } else {
        setError('Failed to load project details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleDeleteTaskConfirm = async () => {
    if (!deleteTaskId) return;
    setIsDeleting(true);
    try {
      await tasksApi.delete(deleteTaskId);
      toast.success('Task deleted successfully');
      setTasks(tasks.filter(t => t._id !== deleteTaskId));
      
      // Update stats optimistically (simple approach)
      fetchProjectDetails(); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
      setDeleteTaskId(null);
    }
  };

  const handleDeleteProjectConfirm = async () => {
    if (!deleteProjectId) return;
    setIsDeleting(true);
    try {
      await projectsApi.delete(deleteProjectId);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
      setIsDeleting(false);
      setDeleteProjectId(null);
    }
  };

  const onTaskFormSuccess = () => {
    setIsTaskFormOpen(false);
    fetchProjectDetails(); // Refresh to get updated stats and tasks
  };

  const onProjectFormSuccess = (savedProject: Project) => {
    setIsProjectFormOpen(false);
    if (projectData) {
      setProjectData({ ...projectData, project: savedProject });
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await tasksApi.update(taskId, { status: newStatus });
      if (res.data.success && res.data.data) {
        setTasks(tasks.map(t => t._id === taskId ? res.data.data!.task : t));
        toast.success('Task status updated');
        // Simple optimistic stats update could go here, but re-fetching is safer for this demo
        fetchProjectDetails();
      }
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  if (isLoading) return <Loading fullPage />;
  if (error || !projectData) return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Link to="/projects" className="inline-flex items-center text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
      </Link>
      <ErrorState message={error || 'Project not found'} onRetry={fetchProjectDetails} />
    </div>
  );

  const { project, taskStats } = projectData;
  const progressPercentage = taskStats && taskStats.total > 0 
    ? Math.round((taskStats.done / taskStats.total) * 100) 
    : 0;

  // Group tasks by status for a simple Kanban view
  const columns: { id: TaskStatus; label: string; tasks: Task[] }[] = [
    { id: 'todo', label: 'To Do', tasks: tasks.filter(t => t.status === 'todo') },
    { id: 'in-progress', label: 'In Progress', tasks: tasks.filter(t => t.status === 'in-progress') },
    { id: 'review', label: 'Review', tasks: tasks.filter(t => t.status === 'review') },
    { id: 'done', label: 'Done', tasks: tasks.filter(t => t.status === 'done') },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between">
        <Link to="/projects" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
        <div className="flex gap-2">
          <button onClick={() => setIsProjectFormOpen(true)} className="btn-secondary py-1.5 px-3">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Project
          </button>
          <button onClick={() => setDeleteProjectId(project._id)} className="btn-danger py-1.5 px-3">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </button>
        </div>
      </div>

      <div className="card border-t-4" style={{ borderTopColor: project.color }}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                <StatusBadge status={project.status} type="project" />
              </div>
              <p className="text-slate-400">{project.description || 'No description provided.'}</p>
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Owner: <span className="text-slate-200">{project.owner.name}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Created: <span className="text-slate-200">{format(new Date(project.createdAt), 'MMM d, yyyy')}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {project.members.slice(0, 3).map((member) => (
                    <div key={member._id} className="w-6 h-6 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[10px] font-bold text-white" title={member.name}>
                      {member.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <span>{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 md:w-64 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">Progress</span>
              <span className="text-sm font-bold text-white">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 mb-4">
              <div className="bg-primary-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            {taskStats && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total:</span>
                  <span className="text-slate-300 font-medium">{taskStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Done:</span>
                  <span className="text-green-400 font-medium">{taskStats.done}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary-400" /> Tasks
          </h2>
          <button onClick={handleCreateTask} className="btn-primary py-1.5 text-sm">
            <Plus className="w-4 h-4 mr-1" /> Add Task
          </button>
        </div>

        {tasks.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="w-12 h-12" />}
            title="No tasks in this project"
            description="Create your first task to start making progress."
            action={<button onClick={handleCreateTask} className="btn-primary mt-2">Create Task</button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {columns.map(col => (
              <div key={col.id} className="bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col min-h-[400px]">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900 rounded-t-xl">
                  <h3 className="font-medium text-slate-200">{col.label}</h3>
                  <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium">
                    {col.tasks.length}
                  </span>
                </div>
                
                <div className="p-2 space-y-2 overflow-y-auto flex-1">
                  {col.tasks.map(task => (
                    <div key={task._id} className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-lg hover:border-slate-600 transition-colors group">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h4 className="text-sm font-medium text-white line-clamp-2">{task.title}</h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleEditTask(task)} className="p-1 text-slate-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteTaskId(task._id)} className="p-1 text-slate-400 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <PriorityBadge priority={task.priority} />
                        
                        <div className="flex gap-1">
                          <select 
                            className="bg-transparent text-xs text-slate-400 border border-slate-700 rounded p-1 cursor-pointer hover:border-slate-500 focus:outline-none"
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task._id, e.target.value as TaskStatus)}
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  {col.tasks.length === 0 && (
                    <div className="h-20 flex items-center justify-center text-sm text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <TaskForm
          task={editingTask}
          projectId={project._id}
          onSuccess={onTaskFormSuccess}
          onCancel={() => setIsTaskFormOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isProjectFormOpen}
        onClose={() => setIsProjectFormOpen(false)}
        title="Edit Project"
      >
        <ProjectForm
          project={project}
          onSuccess={onProjectFormSuccess}
          onCancel={() => setIsProjectFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleDeleteTaskConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={!!deleteProjectId}
        onClose={() => setDeleteProjectId(null)}
        onConfirm={handleDeleteProjectConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${project?.name}"? All associated tasks will be permanently removed. This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjectDetails;
