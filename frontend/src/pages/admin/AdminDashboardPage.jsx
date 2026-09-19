import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AdminSidebar from '../../components/AdminSidebar';
import { getImageUrl } from '../../utils/imageUrl';
import api from '../../services/api';

export const AdminDashboardPage = () => {
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

  if (loading && !dashboardData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1015' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#daa520' }}>
          Loading Admin Control Center...
        </div>
        <Footer />
      </div>
    );
  }

  const counts = dashboardData?.counts || {};
  const owners = dashboardData?.owners || [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1015' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '2rem auto', padding: '0 1.5rem' }}>
        <div style={{
          display: 'flex',
          gap: '2rem',
          flexDirection: 'row',
          alignItems: 'flex-start',
        }}>
          <AdminSidebar />

          <section style={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.75rem',
            }}>
              <h1 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: '700', margin: 0, fontFamily: "'Poppins', sans-serif" }}>
                Admin Control Center
              </h1>
              <p style={{ color: '#9CA3AF', margin: '4px 0 0', fontSize: '0.9rem' }}>
                System-wide overview, salon metrics, and salon owner verification approvals
              </p>
            </div>

            {/* Metric Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}>
              <div style={{ backgroundColor: '#181920', border: '1px solid #2E303E', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Registered Users</div>
                <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>
                  {counts.totalUsers || 0}
                </div>
              </div>

              <div style={{ backgroundColor: '#181920', border: '1px solid #2E303E', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ color: '#daa520', fontSize: '0.85rem' }}>Salon Owners</div>
                <div style={{ color: '#daa520', fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>
                  {counts.totalOwners || 0}
                </div>
              </div>

              <div style={{ backgroundColor: '#181920', border: '1px solid #2E303E', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ color: '#3B82F6', fontSize: '0.85rem' }}>Active Salons</div>
                <div style={{ color: '#3B82F6', fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>
                  {counts.totalSalons || 0}
                </div>
              </div>

              <div style={{ backgroundColor: '#181920', border: '1px solid #2E303E', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ color: '#10B981', fontSize: '0.85rem' }}>Total Bookings</div>
                <div style={{ color: '#10B981', fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>
                  {counts.totalBookings || 0}
                </div>
              </div>
            </div>

            {message && (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                color: '#10B981',
                padding: '0.85rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
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
                padding: '0.85rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.9rem',
              }}>
                {error}
              </div>
            )}

            {/* Owner Approvals Table */}
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '1.5rem',
            }}>
              <h2 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 1.25rem' }}>
                Salon Owner Accounts & Approvals ({owners.length})
              </h2>

              {owners.length === 0 ? (
                <div style={{ color: '#9CA3AF', padding: '2rem', textAlign: 'center' }}>
                  No salon owners registered in the system.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #2E303E', color: '#9CA3AF', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Owner</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Contact</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {owners.map((owner) => {
                        const isVerified = (owner.Status || '').toLowerCase() === 'verified';
                        return (
                          <tr key={owner.id} style={{ borderBottom: '1px solid #2E303E', color: '#fff' }}>
                            <td style={{ padding: '1rem', color: '#daa520', fontWeight: '600' }}>#{owner.id}</td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img
                                  src={getImageUrl(owner.Img)}
                                  alt={owner.Name}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    backgroundColor: '#22232D',
                                  }}
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60';
                                  }}
                                />
                                <div>
                                  <div style={{ fontWeight: '600' }}>{owner.Name}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>@{owner.UserName}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <div>{owner.Email}</div>
                              <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>📞 {owner.PhoneNumber}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                textTransform: 'capitalize',
                                backgroundColor: isVerified ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                color: isVerified ? '#10B981' : '#F59E0B',
                              }}>
                                {owner.Status || 'unverified'}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              {isVerified ? (
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateOwnerStatus(owner.id, 'unverified')}
                                  style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid #EF4444',
                                    color: '#EF4444',
                                    padding: '5px 12px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Revoke Verification
                                </button>
                              ) : (
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateOwnerStatus(owner.id, 'verified')}
                                  style={{
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                    border: '1px solid #10B981',
                                    color: '#10B981',
                                    padding: '5px 12px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Approve & Verify
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboardPage;
