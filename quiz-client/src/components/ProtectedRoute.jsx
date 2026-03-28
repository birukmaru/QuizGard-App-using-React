import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Spinner } from '@/components/ui';

/**
 * PrivateRoute - Protects routes that require authentication
 */
export function PrivateRoute({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * PublicRoute - Routes only accessible when NOT logged in
 * (e.g., login, register pages)
 */
export function PublicRoute({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  // Redirect to dashboard if already logged in
  if (isSignedIn) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
}

/**
 * AdminRoute - Protects routes that require admin privileges
 */
export function AdminRoute({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Check for admin role (this would typically come from your backend)
  // For now, we'll check Clerk's publicMetadata
  const isAdmin =
    user?.publicMetadata?.role === 'admin' ||
    user?.publicMetadata?.isAdmin === true;

  // Redirect to home if not an admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * GuestRoute - Alias for PublicRoute for semantic clarity
 */
export function GuestRoute({ children }) {
  return <PublicRoute>{children}</PublicRoute>;
}

/**
 * RoleRoute - Protects routes that require specific roles
 */
export function RoleRoute({ children, allowedRoles = [] }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  const userRole = user?.publicMetadata?.role;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
