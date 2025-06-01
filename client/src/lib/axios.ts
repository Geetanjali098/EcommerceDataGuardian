// lib/axios.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';

// Utility functions for token management
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

// Extend AxiosInstance with custom methods
interface CustomAxiosInstance extends AxiosInstance {
  login: (credentials: { username: string; password: string }) => Promise<any>;
  logout: () => Promise<any>;
  getCurrentUser: () => Promise<any>;
}

// Create axios instance
const api = axios.create({
  baseURL:import.meta.env.VITE_API_BASE_URL|| 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}) as CustomAxiosInstance;

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const token =  localStorage.getItem('token') || getToken();
    if (!token) {
      // If no token is found, redirect to login
      window.location.href = '/login';
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const { toast } = useToast();
    
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid
        removeToken();
        window.location.href = '/login';
      }
      
      const data = error.response.data as { message?: string };
      const errorMessage = data?.message || 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Network Error',
        description: 'Could not connect to the server',
        variant: 'destructive',
      });
    }
    
    return Promise.reject(error);
  }
);

// Add auth methods to the api instance
api.login = async (credentials: { username: string; password: string }) => {
  const response = await api.post('/auth/login', credentials);
  setToken(response.data.token);
  return response.data.user;
};

api.logout = () => {
  removeToken();
  return api.post('/auth/logout');
};

api.getCurrentUser = async () => {
  return api.get('/auth/me');
};

export default api;