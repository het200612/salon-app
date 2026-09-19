import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ role, children }) => {
  const { isAuthenticated, role: userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        color: 'var(--color-primary)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    const normalizedUserRole = (userRole || '').toLowerCase();
    const isAllowed = allowedRoles.some((r) => r.toLowerCase() === normalizedUserRole);

    if (!isAllowed) {
      // Redirect to correct dashboard based on current role
      if (normalizedUserRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (normalizedUserRole === 'owner') return <Navigate to="/owner/dashboard" replace />;
      return <Navigate to="/user/profile" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
