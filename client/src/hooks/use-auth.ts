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
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get current user
const { data: currentUser } = useQuery<User>({ 
  queryKey: ['/api/auth/me'], 
    retry: false,
    enabled: isInitialized,
  });
  
  // Login mutation
  const login = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await apiRequest('POST', '/api/auth/login', { username, password });
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
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
  
  // Logout mutation
  const logout = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.invalidateQueries();
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Logout failed',
        description: error.message || 'An error occurred during logout',
        variant: 'destructive',
      });
    },
  });
  
  // Check if user is authenticated on mount
  useEffect(() => {
        const loadUser = async () => {
      try {
        const response = await api.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
    setIsInitialized(true);
  }, []);
  


  // Check if the current user is an admin
  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);
  
  // Check if the current user is at least an analyst
  const isAnalyst = useCallback(() => {
    return currentUser?.role === 'admin' || currentUser?.role === 'analyst';
  }, [currentUser]);
  
  return {
    user: currentUser,
    isAuthenticated: !!currentUser,
    isLoading: loading,
    login,
    logout,
    isAdmin,
    isAnalyst,
}
}
