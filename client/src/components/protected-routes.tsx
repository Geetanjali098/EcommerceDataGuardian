import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles = [] }: ProtectedRouteProps): React.ReactElement | null {
  const { user, isLoading, isAuthenticated } = useAuth();
   const [location, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Save current route before redirecting to login
        sessionStorage.setItem('redirectUrl', location);
        navigate('/login');
      } else if (roles.length > 0 && (!user || !roles.includes(user.role))) {
        navigate('/unauthorized');
      }
    }
  }, [user, isAuthenticated, isLoading, navigate, roles, location]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
      <div className="animate-pulse text-primary">Loading...
      </div>;
      </div>
  }

  if (!isAuthenticated || (roles.length > 0 && (!user || !roles.includes(user.role)))) {
    return null; // Block UI while redirect happens
  }

  return <>{children}</>;
}

