import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Determine the base API URL based on the environment
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // In browser environment
    if (import.meta.env.VITE_NODE_ENV === 'production') {
      return import.meta.env.VITE_API_URL || '';
    }
    // Development environment - use relative URLs with proxy
    return '';
  }
  // Server-side (not used in this app)
  return '';
};

const API_BASE_URL = getApiBaseUrl();

interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  avatar?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const queryClient = useQueryClient();

  // Query to get current user
  const { data: user, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      if (!token) throw new Error('No token');
      const url = API_BASE_URL ? `${API_BASE_URL}/api/auth/me` : '/api/auth/me';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to get user');
      return response.json();
    },
    enabled: !!token,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/auth/login` : '/api/auth/login';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      localStorage.setItem('token', data.token);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const url = API_BASE_URL ? `${API_BASE_URL}/api/auth/register` : '/api/auth/register';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      localStorage.setItem('token', data.token);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const login = async (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password });
  };

  const register = async (userData: RegisterData) => {
    return registerMutation.mutateAsync(userData);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    queryClient.clear();
    window.location.reload();
  };

  const isAuthenticated = !!token && !!user;
  const isLoading = isUserLoading || loginMutation.isPending || registerMutation.isPending;

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        token,
        login,
        register,
        logout,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};