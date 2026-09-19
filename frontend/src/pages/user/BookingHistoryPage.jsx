import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import UserSidebar from '../../components/UserSidebar';
import api from '../../services/api';

export const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null });
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/user/bookings');
      setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError('Failed to fetch your appointment history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = (booking) => {
    setCancelError('');
    setCancelModal({ open: true, booking });
  };

  const closeCancelModal = () => {
    setCancelModal({ open: false, booking: null });
    setCancelError('');
  };

  const handleCancelBooking = async () => {
    if (!cancelModal.booking) return;

    try {
      setCancelLoading(true);
      setCancelError('');
      await api.patch(`/bookings/${cancelModal.booking.id}/cancel`);

      setSuccessMessage('Appointment cancelled successfully.');
      closeCancelModal();
      fetchBookings();

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel appointment. Please verify the cancellation policy.';
      setCancelError(msg);
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    let bg = 'rgba(245, 158, 11, 0.15)';
    let color = '#F59E0B';
    let border = 'rgba(245, 158, 11, 0.3)';

    if (s === 'confirmed' || s === 'approved') {
      bg = 'rgba(16, 185, 129, 0.15)';
      color = '#10B981';
      border = 'rgba(16, 185, 129, 0.3)';
    } else if (s === 'cancelled' || s === 'rejected') {
      bg = 'rgba(239, 68, 68, 0.15)';
      color = '#EF4444';
      border = 'rgba(239, 68, 68, 0.3)';
    } else if (s === 'completed') {
      bg = 'rgba(59, 130, 246, 0.15)';
      color = '#3B82F6';
      border = 'rgba(59, 130, 246, 0.3)';
    }

    return (
      <span style={{
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '600',
        textTransform: 'capitalize',
        display: 'inline-block',
      }}>
        {status}
      </span>
    );
  };

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
          {/* User Sidebar */}
          <UserSidebar />

          {/* Bookings Table View */}
          <section style={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              <h1 style={{
                color: '#fff',
                fontSize: '1.6rem',
                fontWeight: '700',
                margin: 0,
                fontFamily: "'Poppins', sans-serif",
              }}>
                My Appointments & History
              </h1>
              <p style={{ color: '#9CA3AF', margin: '4px 0 0', fontSize: '0.9rem' }}>
                Track your active appointments and review past salon visits
              </p>
            </div>

            {/* Notification alert */}
            {successMessage && (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                color: '#10B981',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontWeight: '500',
              }}>
                ✓ {successMessage}
              </div>
            )}

            {/* Bookings List Card */}
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '1.5rem',
              overflowX: 'auto',
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#daa520' }}>
                  Loading appointment records...
                </div>
              ) : error ? (
                <div style={{ color: '#EF4444', textAlign: 'center', padding: '2rem' }}>{error}</div>
              ) : bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9CA3AF' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗓️</div>
                  <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Bookings Yet</h3>
                  <p>You haven't scheduled any appointments yet. Explore salons to book your first slot!</p>
                </div>
              ) : (
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                }}>
                  <thead>
                    <tr style={{
                      borderBottom: '2px solid #2E303E',
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                    }}>
                      <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Salon</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Service</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Time Slot</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const isPendingOrConfirmed =
                        booking.Status?.toLowerCase() === 'pending' ||
                        booking.Status?.toLowerCase() === 'confirmed';

                      return (
                        <tr
                          key={booking.id}
                          style={{
                            borderBottom: '1px solid #2E303E',
                            color: '#F4F4F6',
                            transition: 'background-color 0.2s',
                          }}
                        >
                          <td style={{ padding: '1rem', fontWeight: '600', color: '#daa520' }}>
                            #{booking.id}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: '600', color: '#fff' }}>{booking.SalonName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{booking.Location}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>{booking.ServiceName || 'Hair Styling'}</td>
                          <td style={{ padding: '1rem' }}>
                            {new Date(booking.BookingDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              backgroundColor: '#22232D',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                            }}>
                              {booking.TimeSlote}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontWeight: '600', color: '#10B981' }}>
                            ₹{booking.BillAmount}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {getStatusBadge(booking.Status)}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            {isPendingOrConfirmed ? (
                              <button
                                onClick={() => openCancelModal(booking)}
                                style={{
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid #EF4444',
                                  color: '#EF4444',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#EF4444';
                                  e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                  e.currentTarget.style.color = '#EF4444';
                                }}
                              >
                                Cancel
                              </button>
                            ) : (
                              <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Cancellation Modal with strict 3-hour rule notice */}
      {cancelModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#181920',
            border: '1px solid #2E303E',
            borderRadius: '12px',
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          }}>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 0.75rem' }}>
              Cancel Appointment
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 1rem' }}>
              Are you sure you want to cancel your booking at{' '}
              <strong style={{ color: '#daa520' }}>{cancelModal.booking?.SalonName}</strong> on{' '}
              <strong style={{ color: '#fff' }}>
                {new Date(cancelModal.booking?.BookingDate).toLocaleDateString()}
              </strong>{' '}
              at <strong style={{ color: '#fff' }}>{cancelModal.booking?.TimeSlote}</strong>?
            </p>

            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#F59E0B',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
            }}>
              ⚠️ <strong>Policy:</strong> Appointments can only be cancelled at least <strong>3 hours</strong> prior to the scheduled slot time.
            </div>

            {cancelError && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #EF4444',
                color: '#EF4444',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}>
                {cancelError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={closeCancelModal}
                disabled={cancelLoading}
                style={{
                  padding: '0.6rem 1.25rem',
                  backgroundColor: '#22232D',
                  border: '1px solid #2E303E',
                  color: '#E5E7EB',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                style={{
                  padding: '0.6rem 1.25rem',
                  backgroundColor: '#EF4444',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: cancelLoading ? 'not-allowed' : 'pointer',
                  opacity: cancelLoading ? 0.7 : 1,
                }}
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default BookingHistoryPage;
