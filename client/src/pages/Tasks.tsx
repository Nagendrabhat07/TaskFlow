import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { tasksApi } from '../api/tasks';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import TaskForm from '../components/forms/TaskForm';
import { Loading, ErrorState, EmptyState } from '../components/ui/States';
import { StatusBadge, PriorityBadge } from '../components/ui/Badges';
import { Plus, Search, CheckSquare, Edit2, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await tasksApi.getAll({ 
        search: searchTerm,
        status: statusFilter as any,
        priority: priorityFilter as any,
        limit: 100 // simplified pagination for UI
      });
      if (res.data.success && res.data.data) {
        setTasks(res.data.data.tasks);
      }
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, priorityFilter]);

  const handleCreate = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await tasksApi.delete(deleteId);
      toast.success('Task deleted successfully');
      setTasks(tasks.filter(t => t._id !== deleteId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const onFormSuccess = (savedTask: Task) => {
    setIsFormOpen(false);
    if (editingTask) {
      setTasks(tasks.map(t => t._id === savedTask._id ? savedTask : t));
    } else {
      fetchTasks(); // Refresh to ensure proper population of relations
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">All Tasks</h1>
          <p className="text-slate-400 text-sm">Manage and track tasks across all your projects.</p>
        </div>
        <button onClick={handleCreate} className="btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="input pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select 
              className="select w-full sm:w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          <select 
            className="select w-full sm:w-auto"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTasks} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-12 h-12" />}
          title={searchTerm || statusFilter || priorityFilter ? "No matching tasks found" : "No tasks yet"}
          description={searchTerm || statusFilter || priorityFilter ? "Try adjusting your filters." : "Create your first task to get started."}
          action={!(searchTerm || statusFilter || priorityFilter) && (
            <button onClick={handleCreate} className="btn-primary mt-2">
              Create Task
            </button>
          )}
        />
      ) : (
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td className="max-w-[200px]">
                    <p className="font-medium text-white truncate" title={task.title}>{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-slate-500 truncate" title={task.description}>{task.description}</p>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.project.color }} />
                      <span className="truncate max-w-[120px]">{task.project.name}</span>
                    </div>
                  </td>
                  <td><StatusBadge status={task.status} /></td>
                  <td><PriorityBadge priority={task.priority} /></td>
                  <td className="text-slate-400 text-sm whitespace-nowrap">
                    {format(new Date(task.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(task)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteId(task._id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <TaskForm
          task={editingTask}
          onSuccess={onFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Tasks;
