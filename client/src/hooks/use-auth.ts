import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';

interface User {
  id: number;
  username: string;
  role: string;
  name: string;
  email: string;
  avatarUrl: string;
}


export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(true);
  const [loading, setLoading] = useState(false);
  
// Get current user
  const { data: currentUser, isLoading: queryLoading , error } = useQuery<User>({ 
    queryKey: ['/api/auth/me'], 
    retry: false,
    enabled: isInitialized && !!localStorage.getItem('token'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  // 5 minutes
    

   // Handle authentication errors
  useEffect(() => {
    if (error && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [error]);
  
  // Login mutation
  const login = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await apiRequest('POST', '/api/auth/login', { username, password });
      return res.json();
    },
    //  Handle successful login
    onSuccess: (data) => {
      //  Save JWT token
      const token = data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('role', data.user.role);

  //  Set Axios default Authorization header
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
      queryClient.setQueryData(['/api/auth/me'], data.user);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.user.name}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });

   // Google authentication mutation
  const googleAuth = useMutation({
    mutationFn: async ({ idToken, role }: { idToken: string; role: string }) => {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: idToken, role }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Google authentication failed' }));
        throw new Error(errorData.message || 'Google authentication failed');
      }

        return response.json();
    },
    onSuccess: (data) => {
      // Save JWT token and role
      const token = data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('role', data.user.role);

      // Set Axios default Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update query cache with user data
      queryClient.setQueryData(['/api/auth/me'], data.user);

      toast({
        title: 'Google Sign-In successful',
        description: `Welcome, ${data.user.name}!`,
      });
    },
    onError: (error: any) => {
      console.error('Google auth error:', error);
      toast({
        title: 'Google Sign-In failed',
        description: error.message || 'Google authentication failed',
        variant: 'destructive',
      });
    },
  });

  
  // Logout mutation
  const logout = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', {});
      return res.json();
    },
    onSuccess: () => {
            // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Clear Axios authorization header
      delete api.defaults.headers.common['Authorization'];
      
      // Clear query cache
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.clear();
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
    },
    onError: (error: any) => {
          // Even if logout fails on server, clear client-side data
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.clear();
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
    },
  });
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
if (storedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}
    setIsInitialized(true);
    setLoading(false);
  }, []);
  
// Update loading state based on query loading and initialization
  const isLoading = loading || (!isInitialized) || (queryLoading && !!localStorage.getItem('token'));

  // Check if the current user is an admin
  const isAdmin = useCallback(() => {
    return currentUser?.role === 'admin';
  }, [currentUser]);
  
  // Check if the current user is at least an analyst
  const isAnalyst = useCallback(() => {
    return currentUser?.role === 'admin' || currentUser?.role === 'analyst';
  }, [currentUser]);
  
  return {
    user: currentUser,
    isAuthenticated: !!currentUser,
    isLoading: loading || queryLoading,
    login,
    googleAuth,
    logout,
    isAdmin,
    isAnalyst,
  };
}
