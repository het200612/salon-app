import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected User Dashboard Routes (Phase 5) */}
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute role="user">
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-primary)' }}>
                  <h2>User Dashboard & Profile (Phase 5)</h2>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/salon/:id"
            element={
              <ProtectedRoute role="user">
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-primary)' }}>
                  <h2>Salon Details & Booking (Phase 5)</h2>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Protected Owner Dashboard Routes (Phase 6) */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute role="owner">
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-primary)' }}>
                  <h2>Owner Dashboard (Phase 6)</h2>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Dashboard Routes (Phase 7) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-primary)' }}>
                  <h2>Admin Dashboard (Phase 7)</h2>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
