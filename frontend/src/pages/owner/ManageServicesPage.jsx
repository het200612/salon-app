import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import OwnerSidebar from '../../components/OwnerSidebar';
import api from '../../services/api';

export const ManageServicesPage = () => {
  const [allServices, setAllServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServicesData();
  }, []);

  const fetchServicesData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/owner/services');
      setAllServices(res.data.allServices || []);
      setSelectedServices(res.data.selectedServices || []);
      if (res.data.allServices?.length > 0) {
        setSelectedServiceId(res.data.allServices[0].id);
      }
    } catch (err) {
      console.error('Failed to load owner services:', err);
      setError('Unable to load service catalog.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateService = async (e) => {
    e.preventDefault();
    if (!selectedServiceId || !servicePrice) return;

    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await api.post('/owner/services', {
        serviceId: selectedServiceId,
        price: servicePrice,
      });

      setMessage(res.data?.message || 'Service saved successfully.');
      setServicePrice('');
      fetchServicesData();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service.');
    } finally {
      setSubmitting(false);
    }
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
          <OwnerSidebar />

          <section style={{ flex: 1, minWidth: 0 }}>
            {/* Add / Edit Service Form */}
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
            }}>
              <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.5rem' }}>
                Manage Salon Services
              </h1>
              <p style={{ color: '#9CA3AF', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
                Add services from the master catalog and set your custom pricing
              </p>

              {message && (
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  color: '#10B981',
                  padding: '0.85rem',
                  borderRadius: '6px',
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
                  borderRadius: '6px',
                  marginBottom: '1.25rem',
                  fontSize: '0.9rem',
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleAddOrUpdateService} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: '2 1 240px' }}>
                  <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                    Select Master Service
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
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
                  >
                    {allServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.ServiceName}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: '1 1 160px' }}>
                  <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                    Custom Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 350"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
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

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: '#daa520',
                    color: '#121212',
                    padding: '0.75rem 1.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    height: '46px',
                  }}
                >
                  {submitting ? 'Saving...' : 'Add / Update Service'}
                </button>
              </form>
            </div>

            {/* Currently Offered Services Table */}
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '1.5rem',
            }}>
              <h2 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 1.25rem' }}>
                Active Salon Services ({selectedServices.length})
              </h2>

              {loading ? (
                <div style={{ color: '#daa520', padding: '2rem', textAlign: 'center' }}>Loading services...</div>
              ) : selectedServices.length === 0 ? (
                <div style={{ color: '#9CA3AF', padding: '2rem', textAlign: 'center' }}>
                  No services added to your salon yet. Select a service above to add it.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #2E303E', color: '#9CA3AF', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Service Name</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedServices.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #2E303E', color: '#fff' }}>
                        <td style={{ padding: '1rem', color: '#daa520', fontWeight: '600' }}>#{s.id}</td>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{s.ServiceName}</td>
                        <td style={{ padding: '1rem', color: '#10B981', fontWeight: '700', fontSize: '1.05rem' }}>
                          ₹{s.Price}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setSelectedServiceId(s.ServiceMstId);
                              setServicePrice(s.Price);
                            }}
                            style={{
                              backgroundColor: '#22232D',
                              border: '1px solid #2E303E',
                              color: '#daa520',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            Edit Price
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ManageServicesPage;
