// lib/axios.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';

// Track Token Expiry and Auto-Logout
let logoutTimer: ReturnType<typeof setTimeout> | null = null;

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

// Helper function to parse JWT token
function parseJwt(token: string): { exp: number } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function scheduleAutoLogout(token: string) {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return;

  const expiryTimeMs = decoded.exp * 1000 - Date.now();
  if (expiryTimeMs <= 0) {
    handleAutoLogout();
    return;
  }

  // Clear previous timer if any
  if (logoutTimer) clearTimeout(logoutTimer);

  logoutTimer = setTimeout(() => {
    handleAutoLogout();
  }, expiryTimeMs);
}

function handleAutoLogout() {
  removeToken();
  if (logoutTimer) clearTimeout(logoutTimer);
  delete api.defaults.headers.common['Authorization'];
  window.location.href = "/login";
}

// Extend AxiosInstance with custom methods
interface CustomAxiosInstance extends AxiosInstance {
  login: (credentials: { username: string; password: string }) => Promise<any>;
  logout: () => Promise<any>;
  getCurrentUser: () => Promise<any>;
}

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}) as CustomAxiosInstance;

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      if (error.response.status === 401) {
        removeToken();
        delete api.defaults.headers.common['Authorization'];
        if (logoutTimer) clearTimeout(logoutTimer);
        window.location.href = '/login';
      }

      const data = error.response.data as { message?: string };
      toast({
        title: 'Error',
        description: data?.message || 'An error occurred',
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
  const response = await api.post('/api/auth/login', credentials);
  const { token, user } = response.data;

  if (token) {
    setToken(token);
    scheduleAutoLogout(token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  return { token, user };
};

api.logout = async () => {
  try {
    const response = await api.post('/api/auth/logout');
    removeToken();
    delete api.defaults.headers.common['Authorization'];
    if (logoutTimer) clearTimeout(logoutTimer);
    return response.data;
  } catch (error) {
    // Even if logout fails on server, clean up client state
    removeToken();
    delete api.defaults.headers.common['Authorization'];
    if (logoutTimer) clearTimeout(logoutTimer);
    throw error;
  }
};

api.getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

// Initialize token on startup
const storedToken = getToken();
if (storedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
  scheduleAutoLogout(storedToken);
}

export default api;