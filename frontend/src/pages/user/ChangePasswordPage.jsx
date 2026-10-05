import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../components/UserLayout';
import api from '../../services/api';

export const ChangePasswordPage = () => {
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

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError(
        'New password must be at least 8 characters with uppercase, lowercase, digit, and special symbol (@$!%*?&).'
      );
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        oldPassword: formData.currentPassword,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setMessage('Your password has been changed successfully.');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout activeMenu="change-password">
      <div className="user-edit-container">
        <h2 className="user-edit-title">Change Password</h2>

        {message && (
          <div style={{
            backgroundColor: 'rgba(46, 204, 113, 0.15)',
            border: '1px solid #2ecc71',
            color: '#2ecc71',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.95rem',
          }}>
            ✓ {message}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.95rem',
          }}>
            ⚠ {error}
          </div>
        )}

        <form className="user-edit-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="user-edit-group">
            <label htmlFor="currentPassword">Current Password:</label>
            <input
              id="currentPassword"
              type="password"
              required
              placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData((p) => ({ ...p, currentPassword: e.target.value }))
              }
            />
          </div>

          <div className="user-edit-group">
            <label htmlFor="newPassword">New Password:</label>
            <input
              id="newPassword"
              type="password"
              required
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData((p) => ({ ...p, newPassword: e.target.value }))
              }
            />
          </div>

          <div className="user-edit-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((p) => ({ ...p, confirmPassword: e.target.value }))
              }
            />
          </div>

          <button type="submit" className="user-save-btn" disabled={loading}>
            {loading ? 'Updating Password...' : 'Save Password'}
          </button>

          <Link to="/user/profile" className="user-back-btn">
            Go Back To Profile
          </Link>
        </form>
      </div>
    </UserLayout>
  );
};

export default ChangePasswordPage;
