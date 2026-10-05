import React, { useState, useEffect } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
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
      const all = res.data.allServices || [];
      const selected = res.data.selectedServices || [];
      setAllServices(all);
      setSelectedServices(selected);
      if (all.length > 0 && !selectedServiceId) {
        setSelectedServiceId(all[0].id);
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

  const handleDeleteService = async (serviceId, serviceName) => {
    if (!window.confirm(`Are you sure you want to remove "${serviceName}" from your salon offerings?`)) {
      return;
    }

    try {
      setError('');
      setMessage('');
      await api.delete(`/owner/services/${serviceId}`);
      setMessage(`"${serviceName}" removed from your salon.`);
      fetchServicesData();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove service.');
    }
  };

  return (
    <OwnerLayout activeMenu="services">
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{
          color: '#d4af37',
          textAlign: 'center',
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '25px',
        }}>
          Select Services
        </h1>

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

        {/* Add Service Card matching SelectServices.html */}
        <div style={{
          backgroundColor: '#1e1e1e',
          padding: '30px',
          borderRadius: '10px',
          border: '1px solid #d4af37',
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.2)',
          marginBottom: '2.5rem',
        }}>
          <form onSubmit={handleAddOrUpdateService}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{
                color: '#fff',
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
              }}>
                ServiceName:
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d4af37',
                  backgroundColor: '#2d2d2d',
                  color: '#fff',
                  borderRadius: '5px',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              >
                {allServices.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.ServiceName}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{
                color: '#fff',
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
              }}>
                Price (₹):
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Enter price in ₹"
                required
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d4af37',
                  backgroundColor: '#2d2d2d',
                  color: '#fff',
                  borderRadius: '5px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: '#d4af37',
                color: '#121212',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1rem',
                width: '100%',
                fontWeight: 'bold',
                marginTop: '10px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b39030';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#d4af37';
              }}
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>

        {/* Existing Services Table */}
        <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '600', marginBottom: '1rem' }}>
          Current Salon Offerings ({selectedServices.length})
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#d4af37', padding: '2rem' }}>
            <i className="fas fa-spinner fa-spin"></i> Loading services...
          </div>
        ) : selectedServices.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
            No services added yet. Use the form above to add your first salon service.
          </div>
        ) : (
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '10px',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #d4af37', color: '#d4af37' }}>
                  <th style={{ padding: '14px 18px' }}>Service Name</th>
                  <th style={{ padding: '14px 18px' }}>Price</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedServices.map((svc) => (
                  <tr key={svc.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                    <td style={{ padding: '14px 18px', fontWeight: '500', color: '#fff' }}>
                      {svc.ServiceName}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#d4af37', fontWeight: '700' }}>
                      ₹{svc.Price}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteService(svc.id, svc.ServiceName)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
};

export default ManageServicesPage;
