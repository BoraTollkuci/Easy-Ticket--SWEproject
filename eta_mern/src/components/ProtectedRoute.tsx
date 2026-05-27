import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireUser?: boolean;
  requireBusman?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireUser = false,
  requireBusman = false,
  redirectTo
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002c2b]"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'busman') {
      return <Navigate to="/busman/dashboard" replace />;
    } else if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/auth" replace />;
    }
  }

  if (requireUser && user?.role !== 'user') {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'busman') {
      return <Navigate to="/busman/dashboard" replace />;
    } else {
      return <Navigate to="/auth" replace />;
    }
  }

  if (requireBusman && user?.role !== 'busman') {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'user') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/auth" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;