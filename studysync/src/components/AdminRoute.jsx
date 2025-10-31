import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const token = authService.getAccessToken();
  const parseJwt = (t) => {
    try {
      const base64Url = t.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload);
    } catch { return {}; }
  };

  const claims = token ? parseJwt(token) : {};
  const rolesClaim = user?.role || user?.roles || claims.role || claims.roles || claims.authorities || claims.scopes;
  const rolesArray = Array.isArray(rolesClaim) ? rolesClaim : (rolesClaim ? [rolesClaim] : []);
  const isAdmin = rolesArray.some((r) => String(r).toUpperCase().includes('ADMIN'));

  if (!isAdmin) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default AdminRoute;


