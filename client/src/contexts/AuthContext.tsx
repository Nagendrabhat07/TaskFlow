/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('taskflow_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('taskflow_token')
  );
  const [isLoading, setIsLoading] = useState(true);

  const setAuthData = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem('taskflow_user', JSON.stringify(u));
    localStorage.setItem('taskflow_token', t);
  };

  const clearAuthData = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('taskflow_user');
    localStorage.removeItem('taskflow_token');
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('taskflow_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await authApi.getMe();
        if (res.data.success && res.data.data) {
          setUser(res.data.data.user);
        } else {
          clearAuthData();
        }
      } catch {
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };
    verifyToken();
  }, [clearAuthData]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.data.success && res.data.data) {
      setAuthData(res.data.data.user, res.data.data.token);
      toast.success(`Welcome back, ${res.data.data.user.name}!`);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    if (res.data.success && res.data.data) {
      setAuthData(res.data.data.user, res.data.data.token);
      toast.success('Account created successfully!');
    }
  };

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    clearAuthData();
    toast.success('Signed out successfully');
  }, [clearAuthData]);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('taskflow_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
