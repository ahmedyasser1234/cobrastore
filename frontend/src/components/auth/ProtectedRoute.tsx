import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, UserRole } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  loginPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, loginPath = '/login' }) => {
  const { isAuthenticated, user } = useAuthStore();
  const hasToken = !!localStorage.getItem('token');

  // Check both store state and localStorage to prevent hydration race conditions
  if (!isAuthenticated && !hasToken) {
    return <Navigate to={loginPath} replace />;
  }


  // Wait for user data if we have a token but store is still rehydrating
  if (hasToken && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role.toLowerCase() as UserRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
