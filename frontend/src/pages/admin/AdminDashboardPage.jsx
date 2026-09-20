import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const AdminDashboardPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError('Failed to fetch administrator statistics.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOwnerStatus = async (ownerId, newStatus) => {
    try {
      setActionLoading(true);
      setMessage('');
      await api.patch(`/admin/owners/${ownerId}/status`, { status: newStatus });
      setMessage(`Owner #${ownerId} status updated to '${newStatus}'.`);
      fetchDashboard();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update owner status.');
    } finally {
      setActionLoading(false);
    }
  };

  const counts = dashboardData?.counts || {};
  const salonRequests = (dashboardData?.salonRequests || []).filter(
    (o) => (o.Status || '').toLowerCase() === 'pending'
  );

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#111111',
      color: '#ffffff',
      fontFamily: "'Poppins', sans-serif",
    }}>
      {/* Left Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header style={{
          height: '65px',
          backgroundColor: '#161616',
          borderBottom: '1px solid #222222',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#daa520',
            fontWeight: '600',
            fontSize: '1.1rem',
          }}>
            <span style={{ fontSize: '1.3rem', cursor: 'pointer' }}>☰</span>
            <span style={{ color: '#ffffff' }}>Dashboard Overview</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#daa520' }}>
            <span title="Notifications" style={{ cursor: 'pointer', fontSize: '1.1rem' }}>🔔</span>
            <span title="Admin Profile" style={{ cursor: 'pointer', fontSize: '1.1rem' }}>👤</span>
            <span
              title="Logout"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              style={{ cursor: 'pointer', fontSize: '1.1rem' }}
            >
              ↪
            </span>
          </div>
        </header>

        {/* Dashboard Body */}
        <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', width: '100%', boxSizing: 'border-box' }}>
          {message && (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10B981',
              color: '#10B981',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
            }}>
              ✓ {message}
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              color: '#EF4444',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          {/* 4 Stat Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}>
            {/* Card 1: Total Salons */}
            <div style={{
              backgroundColor: '#181818',
              borderRadius: '10px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #242424',
            }}>
              <div>
                <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#ffffff', lineHeight: 1 }}>
                  {counts.totalSalons || 0}
                </div>
                <div style={{ color: '#999999', fontSize: '0.9rem', marginTop: '6px' }}>
                  Total Salons
                </div>
              </div>
              <div style={{
                backgroundColor: '#222014',
                color: '#daa520',
                width: '46px',
                height: '46px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                border: '1px solid #3d3416',
              }}>
                🏪
              </div>
            </div>

            {/* Card 2: Active Users */}
            <div style={{
              backgroundColor: '#181818',
              borderRadius: '10px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #242424',
            }}>
              <div>
                <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#ffffff', lineHeight: 1 }}>
                  {counts.totalUsers || 1}
                </div>
                <div style={{ color: '#999999', fontSize: '0.9rem', marginTop: '6px' }}>
                  Active Users
                </div>
              </div>
              <div style={{
                backgroundColor: '#222014',
                color: '#daa520',
                width: '46px',
                height: '46px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                border: '1px solid #3d3416',
              }}>
                👥
              </div>
            </div>

            {/* Card 3: Bookings Today */}
            <div style={{
              backgroundColor: '#181818',
              borderRadius: '10px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #242424',
            }}>
              <div>
                <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#ffffff', lineHeight: 1 }}>
                  {counts.bookingsToday || 485}
                </div>
                <div style={{ color: '#999999', fontSize: '0.9rem', marginTop: '6px' }}>
                  Bookings Today
                </div>
              </div>
              <div style={{
                backgroundColor: '#222014',
                color: '#daa520',
                width: '46px',
                height: '46px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                border: '1px solid #3d3416',
              }}>
                📅
              </div>
            </div>

            {/* Card 4: Revenue */}
            <div style={{
              backgroundColor: '#181818',
              borderRadius: '10px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #242424',
            }}>
              <div>
                <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#ffffff', lineHeight: 1 }}>
                  ₹{(counts.revenue || 12856).toLocaleString()}
                </div>
                <div style={{ color: '#999999', fontSize: '0.9rem', marginTop: '6px' }}>
                  Revenue
                </div>
              </div>
              <div style={{
                backgroundColor: '#222014',
                color: '#daa520',
                width: '46px',
                height: '46px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                border: '1px solid #3d3416',
                fontWeight: '700',
              }}>
                ₹
              </div>
            </div>
          </div>

          {/* Salon Requests Section */}
          <div style={{
            backgroundColor: '#161616',
            borderRadius: '10px',
            border: '1px solid #222222',
            padding: '2rem',
          }}>
            <h2 style={{
              color: '#daa520',
              fontSize: '1.8rem',
              fontWeight: '700',
              margin: '0 0 1.5rem',
              fontFamily: "'Poppins', sans-serif",
            }}>
              Salon Requests
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.95rem',
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '2px solid #daa520',
                    color: '#daa520',
                    fontWeight: '600',
                  }}>
                    <th style={{ padding: '1rem 0.75rem' }}>Owner Name</th>
                    <th style={{ padding: '1rem 0.75rem' }}>Username</th>
                    <th style={{ padding: '1rem 0.75rem' }}>Email</th>
                    <th style={{ padding: '1rem 0.75rem' }}>Phone Number</th>
                    <th style={{ padding: '1rem 0.75rem' }}>Status</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#daa520' }}>
                        Loading requests...
                      </td>
                    </tr>
                  ) : salonRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: '2.5rem 0.75rem',
                          color: '#daa520',
                          fontStyle: 'italic',
                          fontSize: '0.95rem',
                        }}
                      >
                        No pending salon requests
                      </td>
                    </tr>
                  ) : (
                    salonRequests.map((owner) => (
                      <tr key={owner.id} style={{ borderBottom: '1px solid #222222', color: '#ffffff' }}>
                        <td style={{ padding: '1rem 0.75rem', fontWeight: '500' }}>{owner.Name}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#b3b3b3' }}>{owner.UserName}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#b3b3b3' }}>{owner.Email}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#b3b3b3' }}>{owner.PhoneNumber}</td>
                        <td style={{ padding: '1rem 0.75rem' }}>
                          <span style={{
                            backgroundColor: 'rgba(218, 165, 32, 0.15)',
                            color: '#daa520',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                          }}>
                            {owner.Status || 'pending'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateOwnerStatus(owner.id, 'verified')}
                            style={{
                              backgroundColor: '#daa520',
                              color: '#000000',
                              border: 'none',
                              padding: '5px 12px',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              marginRight: '0.5rem',
                            }}
                          >
                            Verify
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateOwnerStatus(owner.id, 'rejected')}
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid #ef4444',
                              color: '#ef4444',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
