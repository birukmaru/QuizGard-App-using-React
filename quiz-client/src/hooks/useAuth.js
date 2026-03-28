import { useState, useCallback, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useAuthContext } from '@/context/AuthContext';

/**
 * Hook for managing authentication state and operations
 */
export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useClerkAuth();
  const authContext = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth token for API requests
  const getAuthToken = useCallback(async () => {
    try {
      return await getToken();
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [getToken]);

  // Check if user has specific role
  const hasRole = useCallback(
    (role) => {
      return user?.publicMetadata?.role === role;
    },
    [user]
  );

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return (
      hasRole('admin') ||
      user?.publicMetadata?.isAdmin === true ||
      authContext?.isAdmin
    );
  }, [user, hasRole, authContext]);

  return {
    // State
    user,
    isLoaded,
    isSignedIn,
    loading,
    error,
    isAdmin: isAdmin(),

    // User data
    userId: user?.id,
    email: user?.primaryEmailAddress?.emailAddress,
    fullName: user?.fullName,
    avatarUrl: user?.imageUrl,
    createdAt: user?.createdAt,

    // Metadata
    publicMetadata: user?.publicMetadata,
    unsafeMetadata: user?.unsafeMetadata,

    // Actions
    getAuthToken,
    hasRole,
    isAdmin,
    setLoading,
    setError,
    clearError: () => setError(null),
  };
}

export default useAuth;
