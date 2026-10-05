import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OwnerLayout from '../../components/OwnerLayout';
import { getImageUrl } from '../../utils/imageUrl';
import api from '../../services/api';

export const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Status selection per booking: { [bookingId]: { status: 'Accepted' | 'Rejected', reason: '' } }
  const [bookingActions, setBookingActions] = useState({});

  useEffect(() => {
    fetchDashboardData(selectedDate);
  }, []);

  const fetchDashboardData = async (date) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/owner/profile?date=${date}`);
      setProfileData(res.data);

      const initialActions = {};
      (res.data?.bookings || []).forEach((b) => {
        initialActions[b.id] = {
          status: (b.Status || '').toLowerCase() === 'rejected' ? 'Rejected' : 'Accepted',
          reason: '',
        };
      });
      setBookingActions(initialActions);
    } catch (err) {
      console.error('Failed to load owner dashboard:', err);
      setError('Unable to load owner dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSearch = (e) => {
    e.preventDefault();
    fetchDashboardData(selectedDate);
  };

  const handleActionChange = (bookingId, status) => {
    setBookingActions((prev) => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        status,
      },
    }));
  };

  const handleReasonChange = (bookingId, reason) => {
    setBookingActions((prev) => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        reason,
      },
    }));
  };

  const handleSubmitStatus = async (bookingId) => {
    const action = bookingActions[bookingId] || { status: 'Accepted', reason: '' };
    try {
      setActionLoadingId(bookingId);
      setMessage('');
      setError('');

      await api.patch(`/bookings/${bookingId}/status`, {
        status: action.status,
        reason: action.reason,
      });

      setMessage(`Appointment #${bookingId} marked as ${action.status}.`);
      await fetchDashboardData(selectedDate);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const owner = profileData?.owner;
  const salon = profileData?.salon;
  const bookings = profileData?.bookings || [];
  const services = profileData?.services || [];
  const needsSalon = profileData?.needsSalon;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <OwnerLayout activeMenu="profile" salon={salon}>
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

      {loading && !profileData ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#d4af37', fontSize: '1.2rem' }}>
          <i className="fas fa-spinner fa-spin"></i> Loading Owner Dashboard...
        </div>
      ) : needsSalon ? (
        <div className="owner-profile-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
          <h2 style={{ color: '#d4af37', marginBottom: '1rem' }}>No Salon Registered Yet</h2>
          <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
            Register your salon profile to start managing appointments and services.
          </p>
          <Link to="/owner/register-salon" className="owner-btn-edit-profile">
            Register Salon Now
          </Link>
        </div>
      ) : (
        <div className="owner-profile-card">
          {/* Top Profile Header matching Page 1 Screenshot 1 */}
          <div className="owner-profile-header">
            <img
              src={getImageUrl(salon?.Img || owner?.Img)}
              alt="Salon Emblem"
              className="owner-profile-image"
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&auto=format&fit=crop&q=80';
              }}
            />

            <div className="owner-profile-info">
              <h1>{owner?.Name || 'Salon Owner'}</h1>

              <div className="owner-profile-location">
                <i className="fas fa-map-marker-alt"></i>
                <span>
                  {salon?.Location || 'Address'}, {salon?.AreaName || ''}
                </span>
              </div>

              <div className="owner-profile-rating">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
                <span>4.5</span>
              </div>

              <div className="owner-profile-stats">
                <div className="owner-stat-item">
                  <div className="owner-stat-value">{bookings.length}</div>
                  <div className="owner-stat-label">Bookings</div>
                </div>
                <div className="owner-stat-item">
                  <div className="owner-stat-value">{services.length}</div>
                  <div className="owner-stat-label">Services</div>
                </div>
                <div className="owner-stat-item">
                  <div className="owner-stat-value">5</div>
                  <div className="owner-stat-label">Years Experience</div>
                </div>
              </div>
            </div>

            <div>
              <Link to="/owner/edit-salon" className="owner-btn-edit-profile">
                Edit Salon Profile
              </Link>
            </div>
          </div>

          {/* Details Section matching Page 1 Screenshot 1 */}
          <div className="owner-profile-details">
            <div className="owner-detail-card">
              <h3>Personal Information</h3>
              <div className="owner-detail-item">
                <span className="owner-detail-label">Email</span>
                <span className="owner-detail-value">{owner?.Email}</span>
              </div>
              <div className="owner-detail-item">
                <span className="owner-detail-label">Phone</span>
                <span className="owner-detail-value">{owner?.PhoneNumber}</span>
              </div>
              <div className="owner-detail-item">
                <span className="owner-detail-label">Joined</span>
                <span className="owner-detail-value">Sep 2026</span>
              </div>
            </div>

            <div className="owner-detail-card">
              <h3>Salon Details</h3>
              <div className="owner-detail-item">
                <span className="owner-detail-label">Salon Name</span>
                <span className="owner-detail-value">{salon?.Name}</span>
              </div>
              <div className="owner-detail-item">
                <span className="owner-detail-label">Address</span>
                <span className="owner-detail-value">
                  {salon?.Location}, {salon?.AreaName}
                </span>
              </div>
              <div className="owner-detail-item">
                <span className="owner-detail-label">Business Hours</span>
                <span className="owner-detail-value">
                  {salon?.OpenTime} to {salon?.CloseTime}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Bookings Section matching Page 1 Screenshot 1 */}
          <div className="owner-bookings-card">
            <h3>Recent Bookings</h3>

            <form className="owner-date-filter-form" onSubmit={handleDateSearch}>
              <input
                type="date"
                className="owner-date-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button type="submit" className="owner-search-btn">
                Search
              </button>
            </form>

            {bookings.length === 0 ? (
              <p className="owner-no-bookings">No bookings found</p>
            ) : (
              <div className="owner-bookings-list">
                {bookings.map((booking) => {
                  const currentAction = bookingActions[booking.id] || {
                    status: (booking.Status || '').toLowerCase() === 'rejected' ? 'Rejected' : 'Accepted',
                    reason: '',
                  };
                  const statusClass = (booking.Status || 'pending').toLowerCase();

                  return (
                    <div key={booking.id} className="owner-booking-item">
                      <div className="owner-booking-header">
                        <span className="owner-customer-name">
                          <i className="fas fa-user"></i>
                          <span>{booking.CustomerName || 'Customer'}</span>
                        </span>
                        <span className="owner-booking-date">
                          {formatDate(booking.BookingDate)}
                        </span>
                      </div>

                      <div className="owner-booking-details">
                        <div>
                          <span className="owner-service-name">
                            {booking.ServiceName || 'Service'}
                          </span>
                          <span className="owner-service-price">
                            ₹{booking.BillAmount || 0}
                          </span>
                        </div>

                        <div className="owner-booking-time">
                          <i className="far fa-clock"></i>
                          <span>{booking.TimeSlote}</span>
                        </div>

                        <div className={`owner-booking-status ${statusClass}`}>
                          {booking.Status || 'Pending'}
                        </div>
                      </div>

                      <form
                        className="owner-verify-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSubmitStatus(booking.id);
                        }}
                      >
                        <label>
                          <input
                            type="radio"
                            name={`status_${booking.id}`}
                            value="Accepted"
                            checked={currentAction.status === 'Accepted'}
                            onChange={() => handleActionChange(booking.id, 'Accepted')}
                          />
                          Accept
                        </label>

                        <label>
                          <input
                            type="radio"
                            name={`status_${booking.id}`}
                            value="Rejected"
                            checked={currentAction.status === 'Rejected'}
                            onChange={() => handleActionChange(booking.id, 'Rejected')}
                          />
                          Reject
                        </label>

                        {currentAction.status === 'Rejected' && (
                          <div style={{ width: '100%', marginTop: '6px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#aaaaaa' }}>
                              Write The Reason Here:
                            </span>
                            <textarea
                              placeholder="Write the Reason Here"
                              value={currentAction.reason}
                              onChange={(e) => handleReasonChange(booking.id, e.target.value)}
                              style={{
                                width: '100%',
                                minHeight: '50px',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #444',
                                backgroundColor: '#222',
                                color: '#fff',
                                fontSize: '0.9rem',
                                marginTop: '4px',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>
                        )}

                        <button
                          type="submit"
                          className="owner-verify-btn"
                          disabled={actionLoadingId === booking.id}
                        >
                          {actionLoadingId === booking.id ? 'Submitting...' : 'Submit'}
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </OwnerLayout>
  );
};

export default OwnerDashboardPage;
