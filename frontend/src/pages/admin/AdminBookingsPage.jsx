import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

export const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data?.todayBookings) {
        setBookings(res.data.todayBookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
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
          Bookings Overview
        </header>

        <main style={{ padding: '2rem', flex: 1 }}>
          <div style={{
            backgroundColor: '#161616',
            borderRadius: '10px',
            border: '1px solid #222222',
            padding: '2rem',
          }}>
            <h2 style={{ color: '#daa520', fontSize: '1.6rem', marginBottom: '1.5rem' }}>
              Today's Appointments ({bookings.length})
            </h2>

            {loading ? (
              <div style={{ color: '#daa520', textAlign: 'center', padding: '2rem' }}>Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div style={{ color: '#aaa', padding: '2rem', textAlign: 'center' }}>No bookings scheduled for today.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #daa520', color: '#daa520' }}>
                    <th style={{ padding: '0.85rem' }}>ID</th>
                    <th style={{ padding: '0.85rem' }}>Customer</th>
                    <th style={{ padding: '0.85rem' }}>Salon</th>
                    <th style={{ padding: '0.85rem' }}>Service</th>
                    <th style={{ padding: '0.85rem' }}>Time</th>
                    <th style={{ padding: '0.85rem' }}>Amount</th>
                    <th style={{ padding: '0.85rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #222222' }}>
                      <td style={{ padding: '0.85rem', color: '#daa520' }}>#{b.id}</td>
                      <td style={{ padding: '0.85rem' }}>{b.UserName}</td>
                      <td style={{ padding: '0.85rem' }}>{b.SalonName}</td>
                      <td style={{ padding: '0.85rem' }}>{b.ServiceName}</td>
                      <td style={{ padding: '0.85rem' }}>{b.TimeSlote}</td>
                      <td style={{ padding: '0.85rem', color: '#10b981' }}>₹{b.BillAmount}</td>
                      <td style={{ padding: '0.85rem' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          backgroundColor: b.Status === 'confirmed' ? 'rgba(16,185,129,0.2)' : 'rgba(218,165,32,0.2)',
                          color: b.Status === 'confirmed' ? '#10b981' : '#daa520',
                        }}>
                          {b.Status}
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

export default AdminBookingsPage;
