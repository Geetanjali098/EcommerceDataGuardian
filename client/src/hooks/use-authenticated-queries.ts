
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from './use-auth';

export function useAuthenticatedQuery<T>(
  queryKey: string[],
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  return useQuery<T>({
    queryKey,
    enabled: isAuthenticated && !authLoading && (options?.enabled !== false),
    queryFn: async () => {
      const url = queryKey[0];
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/login';
        }
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || 'Request failed');
      }

      return response.json();
    },
    ...options,
  });
}