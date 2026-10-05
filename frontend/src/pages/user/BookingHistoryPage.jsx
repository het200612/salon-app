import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/UserLayout';
import api from '../../services/api';

export const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState('');

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

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      setCancellingId(bookingId);
      setMessage('');
      setError(null);
      await api.patch(`/bookings/${bookingId}/cancel`);
      setMessage('Appointment cancelled successfully.');
      await fetchBookings();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to cancel appointment. Note: Appointments can only be cancelled at least 3 hours before the scheduled time slot.';
      setError(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <UserLayout activeMenu="bookings">
      <div className="user-booking-history-container">
        <h1 className="user-booking-history-title">Booking History</h1>

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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#d4af37', fontSize: '1.2rem' }}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading booking history...
          </div>
        ) : bookings.length === 0 ? (
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px dashed #333',
            borderRadius: '12px',
            padding: '4rem 2rem',
            textAlign: 'center',
            color: '#888888',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗓️</div>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Bookings Yet</h3>
            <p>You have not made any appointments yet.</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const statusLower = (booking.Status || '').toLowerCase();
            const isPending = statusLower === 'pending';

            return (
              <div key={booking.id} className="user-booking-card">
                <div className="user-booking-info">
                  <div className="user-booking-date">
                    <i className="fas fa-calendar-week"></i>
                    <span>: {formatDate(booking.BookingDate)}</span>
                  </div>

                  <div className="user-booking-time">
                    <i className="fas fa-clock"></i>
                    <span>: {booking.TimeSlote}</span>
                  </div>

                  <div className="user-booking-service">
                    <i className="fas fa-cut"></i>
                    <span>: {booking.ServiceName || 'Hair Styling'}</span>
                  </div>

                  <div className="user-booking-salon">
                    <i className="fas fa-store"></i>
                    <span>: {booking.SalonName}</span>
                  </div>

                  <div>
                    <span className={`user-booking-status ${statusLower}`}>
                      Status : {booking.Status || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="user-booking-more">
                  <div className="user-booking-price">
                    ₹{booking.BillAmount || 0}
                  </div>

                  {isPending && (
                    <button
                      type="button"
                      className="user-cancel-btn"
                      disabled={cancellingId === booking.id}
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </UserLayout>
  );
};

export default BookingHistoryPage;
