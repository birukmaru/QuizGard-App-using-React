import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser, useClerk, useAuth } from '@clerk/clerk-react';

/**
 * AuthContext provides additional app-specific auth state on top of Clerk
 * Clerk handles authentication, this context handles app-specific user data
 */
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const { user, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();

  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile from our backend
  const fetchUserProfile = useCallback(async () => {
    if (!isSignedIn || !user) return null;

    try {
      setLoading(true);
      const { userApi } = await import('@/lib/api');
      const profile = await userApi.getProfile();
      setUserProfile(profile);
      return profile;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, user]);

  // Fetch user stats
  const fetchUserStats = useCallback(async () => {
    if (!isSignedIn) return null;

    try {
      const { userApi } = await import('@/lib/api');
      const stats = await userApi.getStats();
      setUserStats(stats);
      return stats;
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
      return null;
    }
  }, [isSignedIn]);

  // Check if user has admin role
  const isAdmin = userProfile?.role === 'admin' || userProfile?.isAdmin === true;

  // Sign out handler
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setUserProfile(null);
      setUserStats(null);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  }, [signOut]);

  // Get auth token for API requests
  const getAuthToken = useCallback(async () => {
    try {
      return await getToken();
    } catch (err) {
      console.error('Failed to get auth token:', err);
      return null;
    }
  }, [getToken]);

  // Fetch profile and stats when user signs in
  useEffect(() => {
    if (isSignedIn && user) {
      fetchUserProfile();
      fetchUserStats();
    } else {
      setUserProfile(null);
      setUserStats(null);
    }
  }, [isSignedIn, user, fetchUserProfile, fetchUserStats]);

  const value = {
    // Clerk state
    user,
    clerkLoaded,
    isSignedIn,

    // App-specific state
    userProfile,
    userStats,
    loading,
    error,
    isAdmin,

    // Actions
    fetchUserProfile,
    fetchUserStats,
    signOut: handleSignOut,
    getAuthToken,

    // Computed
    displayName: userProfile?.name || user?.fullName || user?.username || 'User',
    avatarUrl: userProfile?.avatar || user?.imageUrl || null,
    email: user?.primaryEmailAddress?.emailAddress || userProfile?.email || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
