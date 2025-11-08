import React from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * GuestFriendlyRoute - Allows access to both authenticated users and guests
 * Use this for pages that should be accessible without authentication
 * but may have enhanced features for logged-in users
 */
const GuestFriendlyRoute = ({ children }) => {
  const { loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Render the component regardless of authentication status
  return children;
};

export default GuestFriendlyRoute;
