import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#111111',
      color: '#ffffff',
      fontFamily: "'Poppins', sans-serif",
    }}>
      <AdminSidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          height: '65px',
          backgroundColor: '#161616',
          borderBottom: '1px solid #222222',
          display: 'flex',
          alignItems: 'center',
          padding: '0 2rem',
          color: '#daa520',
          fontWeight: '600',
        }}>
          Security & Password
        </header>

        <main style={{ padding: '2rem', flex: 1 }}>
          <div style={{
            backgroundColor: '#161616',
            borderRadius: '10px',
            border: '1px solid #222222',
            padding: '2rem',
            maxWidth: '540px',
          }}>
            <h2 style={{ color: '#daa520', fontSize: '1.6rem', marginBottom: '1.5rem' }}>
              Change Admin Password
            </h2>

            {message && (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem',
              }}>
                ✓ {message}
              </div>
            )}

            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.4rem' }}>Current Password</label>
                <input
                  type="password"
                  required
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.4rem' }}>New Password</label>
                <input
                  type="password"
                  required
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.4rem' }}>Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#daa520',
                  color: '#000',
                  border: 'none',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminChangePasswordPage;
