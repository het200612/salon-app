import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import OwnerSidebar from '../../components/OwnerSidebar';
import { getImageUrl } from '../../utils/imageUrl';
import api from '../../services/api';

export const OwnerDashboardPage = () => {
  const [profileData, setProfileData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDashboardData(selectedDate);
  }, [selectedDate]);

  const fetchDashboardData = async (date) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/owner/profile?date=${date}`);
      setProfileData(res.data);
    } catch (err) {
      console.error('Failed to load owner dashboard:', err);
      setError('Unable to load owner dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setActionLoading(true);
      setMessage('');
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      setMessage(`Appointment #${bookingId} marked as ${newStatus}.`);
      fetchDashboardData(selectedDate);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !profileData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1015' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#daa520' }}>
          Loading Salon Dashboard...
        </div>
        <Footer />
      </div>
    );
  }

  const needsSalon = profileData?.needsSalon;
  const salon = profileData?.salon;
  const bookings = profileData?.bookings || [];
  const services = profileData?.services || [];
  const images = profileData?.images || [];

  const pendingCount = bookings.filter((b) => b.Status?.toLowerCase() === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.Status?.toLowerCase() === 'confirmed').length;

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
          {/* Owner Sidebar */}
          <OwnerSidebar salon={salon} />

          {/* Main Owner Portal Content */}
          <section style={{ flex: 1, minWidth: 0 }}>
            {needsSalon ? (
              /* Prompt to register salon */
              <div style={{
                backgroundColor: '#181920',
                border: '1px solid #2E303E',
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏪</div>
                <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.75rem' }}>
                  Register Your Salon
                </h2>
                <p style={{ color: '#9CA3AF', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                  Welcome! Before accepting customer appointments, you need to configure your salon profile, working hours, and capacity.
                </p>
                <Link
                  to="/owner/register-salon"
                  style={{
                    backgroundColor: '#daa520',
                    color: '#121212',
                    padding: '0.9rem 2rem',
                    borderRadius: '8px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'inline-block',
                    boxShadow: '0 4px 12px rgba(218, 165, 32, 0.4)',
                  }}
                >
                  Create Salon Profile
                </Link>
              </div>
            ) : (
              <>
                {/* Salon Overview Banner */}
                <div style={{
                  backgroundColor: '#181920',
                  border: '1px solid #2E303E',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <img
                      src={getImageUrl(salon?.Img)}
                      alt={salon?.Name}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '2px solid #daa520',
                      }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div>
                      <h1 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: '700', margin: 0 }}>
                        {salon?.Name}
                      </h1>
                      <p style={{ color: '#9CA3AF', margin: '3px 0 0', fontSize: '0.85rem' }}>
                        📍 {salon?.Location}, {salon?.AreaName} | 🕒 {salon?.OpenTime} - {salon?.CloseTime} | 🪑 {salon?.NumberOfSeats} Seats
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/owner/edit-salon"
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '6px',
                      backgroundColor: '#22232D',
                      border: '1px solid #2E303E',
                      color: '#daa520',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                    }}
                  >
                    ✏️ Edit Salon
                  </Link>
                </div>

                {/* Metric Summary Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.75rem',
                }}>
                  <div style={{ backgroundColor: '#181920', border: '1px solid #2E303E', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Today's Bookings</div>
                    <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>
                      {bookings.length}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#181920', border: '1px solid #2E303E', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ color: '#F59E0B', fontSize: '0.85rem' }}>Pending Requests</div>
                    <div style={{ color: '#F59E0B', fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>
                      {pendingCount}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#181920', border: '1px solid #2E303E', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ color: '#10B981', fontSize: '0.85rem' }}>Confirmed Slots</div>
                    <div style={{ color: '#10B981', fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>
                      {confirmedCount}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#181920', border: '1px solid #2E303E', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ color: '#daa520', fontSize: '0.85rem' }}>Active Services</div>
                    <div style={{ color: '#daa520', fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>
                      {services.length}
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

                {/* Appointments Schedule Table */}
                <div style={{
                  backgroundColor: '#181920',
                  border: '1px solid #2E303E',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1.25rem',
                  }}>
                    <h2 style={{ color: '#fff', fontSize: '1.3rem', margin: 0 }}>
                      Appointment Schedule
                    </h2>

                    {/* Date Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Date:</span>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{
                          backgroundColor: '#22232D',
                          border: '1px solid #2E303E',
                          color: '#fff',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>
                  </div>

                  {bookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9CA3AF' }}>
                      <p>No appointments booked for this date.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{
                            borderBottom: '2px solid #2E303E',
                            color: '#9CA3AF',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                          }}>
                            <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Service</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Time Slot</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Bill</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((b) => (
                            <tr key={b.id} style={{ borderBottom: '1px solid #2E303E', color: '#fff' }}>
                              <td style={{ padding: '1rem', color: '#daa520', fontWeight: '600' }}>#{b.id}</td>
                              <td style={{ padding: '1rem' }}>
                                <div style={{ fontWeight: '600' }}>{b.CustomerName}</div>
                                <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>📞 {b.CustomerPhone}</div>
                              </td>
                              <td style={{ padding: '1rem' }}>{b.ServiceName}</td>
                              <td style={{ padding: '1rem' }}>
                                <span style={{ backgroundColor: '#22232D', padding: '3px 8px', borderRadius: '4px' }}>
                                  {b.TimeSlote}
                                </span>
                              </td>
                              <td style={{ padding: '1rem', color: '#10B981', fontWeight: '600' }}>₹{b.BillAmount}</td>
                              <td style={{ padding: '1rem' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  backgroundColor: b.Status === 'confirmed' ? 'rgba(16,185,129,0.15)' : b.Status === 'cancelled' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                  color: b.Status === 'confirmed' ? '#10B981' : b.Status === 'cancelled' ? '#EF4444' : '#F59E0B',
                                }}>
                                  {b.Status}
                                </span>
                              </td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>
                                {b.Status === 'pending' && (
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                                      style={{
                                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                        border: '1px solid #10B981',
                                        color: '#10B981',
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                      }}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                                      style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                        border: '1px solid #EF4444',
                                        color: '#EF4444',
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                      }}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                                {b.Status === 'confirmed' && (
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => handleUpdateStatus(b.id, 'completed')}
                                    style={{
                                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                      border: '1px solid #3B82F6',
                                      color: '#3B82F6',
                                      padding: '4px 10px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                    }}
                                  >
                                    Mark Completed
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OwnerDashboardPage;
