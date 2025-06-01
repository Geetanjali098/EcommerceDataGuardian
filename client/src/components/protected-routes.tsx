// components/protected-route.tsx
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles = [] }: ProtectedRouteProps): React.ReactElement | null {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Store current route for redirect after login
        sessionStorage.setItem('redirectUrl', location.pathname);
        navigate('/login');
      } else if (roles.length > 0 && !roles.includes(user.role)) {
        navigate('/unauthorized');
      }
    }
  }, [user, isLoading, navigate, roles, location]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || (roles.length > 0 && !roles.includes(user.role))) {
    return null; // Redirect will happen in useEffect
  }

  return <>{children}</>;
}
