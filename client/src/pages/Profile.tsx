import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../api/users';
import { User as UserIcon, Mail, Shield, Calendar, Key, Save } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  const [form, setForm] = useState({
    name: user?.name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (form.newPassword && !form.currentPassword) {
      toast.error('Current password is required to set a new password');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = { name: form.name };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      
      const res = await usersApi.updateProfile(payload);
      
      if (res.data.success && res.data.data) {
        updateUser(res.data.data.user);
        toast.success('Profile updated successfully');
        setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">My Profile</h1>
        <p className="text-slate-400 text-sm">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="card text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-4xl font-bold text-white mb-4 border-4 border-slate-950 shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg font-semibold text-white">{user.name}</h2>
            <p className="text-slate-400 text-sm mb-4">{user.email}</p>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
              <Shield className="w-3.5 h-3.5" />
              {user.role === 'admin' ? 'Administrator' : 'User'}
            </div>
          </div>
          
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-white border-b border-slate-800 pb-2 mb-3">Account Details</h3>
            
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Joined {format(new Date(user.createdAt), 'MMM yyyy')}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-primary-400" /> General Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="label">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      className="input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="label">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      className="input opacity-70 cursor-not-allowed"
                      value={user.email}
                      disabled
                      title="Email cannot be changed"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary-400" /> Change Password
                </h3>
                <p className="text-xs text-slate-400 mb-4">Leave these fields blank if you don't want to change your password.</p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="label">Current Password</label>
                    <input
                      id="currentPassword"
                      type="password"
                      className="input"
                      value={form.currentPassword}
                      onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="newPassword" className="label">New Password</label>
                      <input
                        id="newPassword"
                        type="password"
                        className="input"
                        value={form.newPassword}
                        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="label">Confirm New Password</label>
                      <input
                        id="confirmPassword"
                        type="password"
                        className="input"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
