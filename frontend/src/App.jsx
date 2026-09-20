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
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Salon Pages
import SalonDetailsPage from './pages/salon/SalonDetailsPage';
import BookingPage from './pages/salon/BookingPage';

// User Dashboard Pages (Phase 5)
import UserProfilePage from './pages/user/UserProfilePage';
import BookingHistoryPage from './pages/user/BookingHistoryPage';
import EditProfilePage from './pages/user/EditProfilePage';
import ChangePasswordPage from './pages/user/ChangePasswordPage';

// Owner Dashboard Pages (Phase 6)
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import RegisterSalonPage from './pages/owner/RegisterSalonPage';
import EditSalonPage from './pages/owner/EditSalonPage';
import ManageServicesPage from './pages/owner/ManageServicesPage';
import UploadImagesPage from './pages/owner/UploadImagesPage';

// Admin Dashboard Pages (Phase 7)
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageCitiesPage from './pages/admin/ManageCitiesPage';
import ManageAreasPage from './pages/admin/ManageAreasPage';
import ManageAdminServicesPage from './pages/admin/ManageServicesPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminChangePasswordPage from './pages/admin/AdminChangePasswordPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/salon/:id" element={<SalonDetailsPage />} />

          {/* User Protected Routes */}
          <Route
            path="/salon/:id/book"
            element={
              <ProtectedRoute role="user">
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute role="user">
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/bookings"
            element={
              <ProtectedRoute role="user">
                <BookingHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/edit-profile"
            element={
              <ProtectedRoute role="user">
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/change-password"
            element={
              <ProtectedRoute role="user">
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          {/* Owner Protected Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute role="owner">
                <OwnerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/register-salon"
            element={
              <ProtectedRoute role="owner">
                <RegisterSalonPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/edit-salon"
            element={
              <ProtectedRoute role="owner">
                <EditSalonPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/services"
            element={
              <ProtectedRoute role="owner">
                <ManageServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/images"
            element={
              <ProtectedRoute role="owner">
                <UploadImagesPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cities"
            element={
              <ProtectedRoute role="admin">
                <ManageCitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/areas"
            element={
              <ProtectedRoute role="admin">
                <ManageAreasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute role="admin">
                <ManageAdminServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <ManageUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute role="admin">
                <AdminBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute role="admin">
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/change-password"
            element={
              <ProtectedRoute role="admin">
                <AdminChangePasswordPage />
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
