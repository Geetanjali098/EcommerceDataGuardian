// lib/axios.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';


//Track Token Expiry and Auto-Logout
let logoutTimer: ReturnType<typeof setTimeout> | null = null;

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
  window.location.href = "/login";
}
// This function checks if the token is valid and schedules auto logout

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
  baseURL:import.meta.env.VITE_API_BASE_URL|| 'http://localhost:5000',
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

// add a helper function to parse JWT token
// This function extracts the expiration time from a JWT token
function parseJwt(token: string): { exp: number } | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));
    return decoded;
  } catch {
    return null;
  }
}


// Add auth methods to the api instance
api.login = async (credentials: { username: string; password: string }) => {
  const response = await api.post('/auth/login', credentials);
  setToken(response.data.token);
   scheduleAutoLogout( response.data.token); // ✅ Set the timer here
  return response.data.user;
};

api.logout = () => {
  removeToken();
  return api.post('/auth/logout');
};

api.getCurrentUser = async () => {
  return api.get('/auth/me');
};

const storedToken = getToken();
if (storedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
  scheduleAutoLogout(storedToken); // ✅ Set timer on page reload
}
// Automatically set the Authorization header if token exists

export default api;