import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { Project, Task } from '../types';
import { Loading, ErrorState, EmptyState } from '../components/ui/States';
import { StatusBadge, PriorityBadge } from '../components/ui/Badges';
import { LayoutDashboard, CheckSquare, FolderKanban, Plus } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        projectsApi.getAll({ limit: 4 }),
        tasksApi.getAll({ limit: 5 })
      ]);
      
      if (projectsRes.data.success && projectsRes.data.data) {
        setProjects(projectsRes.data.data.projects);
      }
      if (tasksRes.data.success && tasksRes.data.data) {
        setTasks(tasksRes.data.data.tasks);
      }
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <Loading fullPage />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  // Calculate simple stats
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const pendingTasks = tasks.filter(t => ['todo', 'in-progress'].includes(t.status)).length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-400 text-sm">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/projects" className="btn-secondary">View Projects</Link>
          <Link to="/tasks" className="btn-primary">
            <Plus className="w-4 h-4" />
            New Task
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-primary-950/50 to-slate-900 border-primary-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-900/50 rounded-lg text-primary-400">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Active Projects</p>
              <p className="text-2xl font-bold text-white">{activeProjects}</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-blue-950/50 to-slate-900 border-blue-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-900/50 rounded-lg text-blue-400">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Pending Tasks</p>
              <p className="text-2xl font-bold text-white">{pendingTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-green-950/50 to-slate-900 border-green-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-900/50 rounded-lg text-green-400">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Completed Tasks</p>
              <p className="text-2xl font-bold text-white">{completedTasks}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-primary-400 hover:text-primary-300">View all</Link>
          </div>
          
          <div className="flex-1">
            {projects.length === 0 ? (
              <EmptyState 
                title="No projects yet" 
                description="Get started by creating your first project."
                icon={<FolderKanban className="w-8 h-8" />}
              />
            ) : (
              <div className="space-y-3">
                {projects.map(project => (
                  <Link 
                    key={project._id} 
                    to={`/projects/${project._id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 hover:bg-slate-800 transition-colors border border-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                      <div>
                        <p className="text-sm font-medium text-white">{project.name}</p>
                        <p className="text-xs text-slate-500">Updated {format(new Date(project.updatedAt), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <StatusBadge status={project.status} type="project" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm text-primary-400 hover:text-primary-300">View all</Link>
          </div>
          
          <div className="flex-1">
            {tasks.length === 0 ? (
              <EmptyState 
                title="No tasks yet" 
                description="Create a task to start tracking your work."
                icon={<CheckSquare className="w-8 h-8" />}
              />
            ) : (
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task._id} className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/50">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-white line-clamp-1">{task.title}</p>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.project.color }} />
                        <span className="text-xs text-slate-400 truncate max-w-[120px]">{task.project.name}</span>
                      </div>
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
