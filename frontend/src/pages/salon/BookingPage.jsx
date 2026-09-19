import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';

export const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState(todayStr);
  const [salonData, setSalonData] = useState(null);
  const [slots, setSlots] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSlotsAndServices(bookingDate);
  }, [id, bookingDate]);

  const fetchSlotsAndServices = async (date) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/salons/${id}/slots?date=${date}`);
      setSalonData(res.data.salon);
      setSlots(res.data.slots || []);
      setServices(res.data.services || []);
      if (res.data.slots?.length > 0 && !selectedSlot) {
        setSelectedSlot(res.data.slots[0]);
      }
    } catch (err) {
      console.error('Failed to load slots/services:', err);
      setError('Failed to retrieve available slots for this salon.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service) => {
    if (selectedServices.some((s) => s.id === service.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const totalAmount = selectedServices.reduce((sum, s) => sum + Number(s.price || 0), 0);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedSlot) {
      setError('Please select an appointment time slot.');
      return;
    }

    if (selectedServices.length === 0) {
      setError('Please select at least one service for your appointment.');
      return;
    }

    try {
      setSubmitting(true);
      // Django reference creates one booking per service or a combined slot booking.
      // Our backend createBooking accepts service_ids array or single serviceId
      await api.post('/bookings', {
        salon_id: id,
        booking_date: bookingDate,
        time_slot: selectedSlot,
        service_ids: selectedServices.map((s) => s.id),
        total_amount: totalAmount,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/user/bookings');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1015' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '800px', width: '100%', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        <div style={{
          backgroundColor: '#181920',
          border: '1px solid #2E303E',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #2E303E',
            marginBottom: '1.75rem',
          }}>
            <div>
              <span style={{ color: '#daa520', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
                Instant Reservation
              </span>
              <h1 style={{
                color: '#fff',
                fontSize: '1.8rem',
                fontWeight: '700',
                margin: '4px 0 0',
                fontFamily: "'Poppins', sans-serif",
              }}>
                Book Appointment
              </h1>
              {salonData && (
                <p style={{ color: '#9CA3AF', margin: '4px 0 0', fontSize: '0.9rem' }}>
                  At <strong style={{ color: '#fff' }}>{salonData.name}</strong> (Stations: {salonData.numberOfSeats})
                </p>
              )}
            </div>

            <Link
              to={`/salon/${id}`}
              style={{
                color: '#9CA3AF',
                fontSize: '0.9rem',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #2E303E',
              }}
            >
              ← Back to Details
            </Link>
          </div>

          {success && (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10B981',
              color: '#10B981',
              padding: '1.25rem',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '1.5rem',
              fontSize: '1.05rem',
              fontWeight: '600',
            }}>
              🎉 Appointment confirmed! Redirecting to your bookings...
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              color: '#EF4444',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitBooking}>
            {/* Step 1: Date & Time */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}>
              {/* Date Picker */}
              <div>
                <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Select Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#22232D',
                    border: '1px solid #2E303E',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Time Slot Picker */}
              <div>
                <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Select Time Slot
                </label>
                <select
                  required
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#22232D',
                    border: '1px solid #2E303E',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {slots.length === 0 ? (
                    <option value="">No slots available</option>
                  ) : (
                    slots.map((slot, idx) => (
                      <option key={idx} value={slot}>
                        {slot}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Step 2: Choose Services */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Select Desired Services
              </label>

              {services.length === 0 ? (
                <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>No services available for this salon.</p>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  paddingRight: '6px',
                }}>
                  {services.map((srv) => {
                    const isChecked = selectedServices.some((s) => s.id === srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => handleServiceToggle(srv)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          backgroundColor: isChecked ? 'rgba(218, 165, 32, 0.12)' : '#22232D',
                          border: isChecked ? '1px solid #daa520' : '1px solid #2E303E',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent onClick
                            style={{
                              accentColor: '#daa520',
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                            }}
                          />
                          <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '500' }}>
                            {srv.serviceName}
                          </span>
                        </div>
                        <span style={{ color: '#10B981', fontWeight: '700', fontSize: '0.95rem' }}>
                          ₹{srv.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bill Summary */}
            <div style={{
              backgroundColor: '#22232D',
              border: '1px solid #2E303E',
              borderRadius: '10px',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Total Payable Amount</div>
                <div style={{ color: '#E5E7EB', fontSize: '0.85rem' }}>
                  ({selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected)
                </div>
              </div>
              <div style={{ color: '#daa520', fontSize: '1.6rem', fontWeight: '700' }}>
                ₹{totalAmount}
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={submitting || services.length === 0}
              style={{
                width: '100%',
                backgroundColor: '#daa520',
                color: '#121212',
                padding: '1rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(218, 165, 32, 0.4)',
                transition: 'all 0.2s',
              }}
            >
              {submitting ? 'Confirming Appointment...' : 'Confirm Appointment Now'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
