import { useEffect } from 'react';
import useAuthStore from '../stores/authStore';

// Provider component for initializing auth state
export const AuthProvider = ({ children }) => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return children;
};

// Hook to use auth store
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    // State
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    loading: store.loading,
    error: store.error,
    
    // Actions
    login: store.login,
    register: store.register,
    verifyEmail: store.verifyEmail,
    resendOTP: store.resendOTP,
    logout: store.logout,
    setUser: store.setUser,
    setLoading: store.setLoading,
    setError: store.setError,
    clearError: store.clearError,
    reset: store.reset,
    refreshUserProfile: store.refreshUserProfile,
  };
};