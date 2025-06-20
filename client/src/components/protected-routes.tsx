import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles = [] }: ProtectedRouteProps): React.ReactElement | null {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Save current route before redirecting to login
        sessionStorage.setItem('redirectUrl', location.pathname);
        navigate('/login');
      } else if (roles.length > 0 && (!user || !roles.includes(user.role))) {
        navigate('/unauthorized');
      }
    }
  }, [user, isAuthenticated, isLoading, navigate, roles, location]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || (roles.length > 0 && (!user || !roles.includes(user.role)))) {
    return null; // Block UI while redirect happens
  }

  return <>{children}</>;
}

