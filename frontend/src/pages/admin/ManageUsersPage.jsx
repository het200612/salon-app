import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

export const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      // In Django reference, usermst holds all users and owners
      const res = await api.get('/admin/dashboard');
      if (res.data?.owners) {
        setUsers(res.data.owners);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Unable to load users list.');
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
          Manage Users & Owners
        </header>

        <main style={{ padding: '2rem', flex: 1 }}>
          <div style={{
            backgroundColor: '#161616',
            borderRadius: '10px',
            border: '1px solid #222222',
            padding: '2rem',
          }}>
            <h2 style={{ color: '#daa520', fontSize: '1.6rem', marginBottom: '1.5rem' }}>
              Registered Accounts
            </h2>

            {loading ? (
              <div style={{ color: '#daa520', textAlign: 'center', padding: '2rem' }}>Loading accounts...</div>
            ) : error ? (
              <div style={{ color: '#ef4444' }}>{error}</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #daa520', color: '#daa520' }}>
                    <th style={{ padding: '0.85rem' }}>ID</th>
                    <th style={{ padding: '0.85rem' }}>Name</th>
                    <th style={{ padding: '0.85rem' }}>Email</th>
                    <th style={{ padding: '0.85rem' }}>Role</th>
                    <th style={{ padding: '0.85rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #222222' }}>
                      <td style={{ padding: '0.85rem', color: '#daa520' }}>#{u.id}</td>
                      <td style={{ padding: '0.85rem' }}>{u.Name}</td>
                      <td style={{ padding: '0.85rem', color: '#aaa' }}>{u.Email}</td>
                      <td style={{ padding: '0.85rem' }}>{u.Usertype}</td>
                      <td style={{ padding: '0.85rem' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          backgroundColor: u.Status === 'verified' ? 'rgba(16,185,129,0.2)' : 'rgba(218,165,32,0.2)',
                          color: u.Status === 'verified' ? '#10b981' : '#daa520',
                        }}>
                          {u.Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageUsersPage;
