import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

export const AdminChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (formData.currentPassword && formData.currentPassword === formData.newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setMessage('Administrator password updated successfully.');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout headerTitle="Dashboard Overview" activeMenu="change-password">
      {message && <div className="admin-banner-success">✓ {message}</div>}
      {error && <div className="admin-banner-error">⚠ {error}</div>}

      <div className="admin-form-container">
        <form className="admin-form-box" onSubmit={handleSubmit} autoComplete="off">
          <h2 className="admin-form-title">Change Password</h2>

          <div className="admin-form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              required
              placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              required
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
              }
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
            />
          </div>

          <button type="submit" className="admin-btn-save" disabled={loading}>
            {loading ? 'Updating...' : 'Save'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminChangePasswordPage;
