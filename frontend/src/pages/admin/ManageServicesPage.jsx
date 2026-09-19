import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

export const ManageServicesPage = () => {
  const [services, setServices] = useState([]);
  const [serviceName, setServiceName] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/services');
      setServices(res.data || []);
    } catch (err) {
      console.error('Failed to load services:', err);
      setError('Unable to load master services.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      if (editingService) {
        await api.put(`/admin/services/${editingService.id}`, {
          serviceName: serviceName.trim(),
        });
        setMessage('Service updated successfully.');
        setEditingService(null);
      } else {
        await api.post('/admin/services', {
          serviceName: serviceName.trim(),
        });
        setMessage(`Service '${serviceName.trim()}' added.`);
      }

      setServiceName('');
      fetchServices();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setServiceName(service.ServiceName);
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setServiceName('');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete service '${name}'?`)) return;

    try {
      await api.delete(`/admin/services/${id}`);
      setMessage(`Service '${name}' deleted.`);
      fetchServices();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete service.');
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
          <AdminSidebar />

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
                {editingService ? 'Edit Master Service' : 'Add New Master Service'}
              </h1>
              <p style={{ color: '#9CA3AF', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
                Define standard services that salon owners can select and price in their portfolios
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

              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hair Cut, Beard Grooming, Keratin Treatment, Facial"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    backgroundColor: '#22232D',
                    border: '1px solid #2E303E',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />

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
                    whiteSpace: 'nowrap',
                  }}
                >
                  {submitting ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
                </button>

                {editingService && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{
                      backgroundColor: '#22232D',
                      color: '#9CA3AF',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      border: '1px solid #2E303E',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            {/* Services Table */}
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '1.5rem',
            }}>
              <h2 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 1.25rem' }}>
                Master Service Catalog ({services.length})
              </h2>

              {loading ? (
                <div style={{ color: '#daa520', padding: '2rem', textAlign: 'center' }}>Loading services...</div>
              ) : services.length === 0 ? (
                <div style={{ color: '#9CA3AF', padding: '2rem', textAlign: 'center' }}>No services configured.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #2E303E', color: '#9CA3AF', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Service Name</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #2E303E', color: '#fff' }}>
                        <td style={{ padding: '1rem', color: '#daa520', fontWeight: '600' }}>#{s.id}</td>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{s.ServiceName}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleEdit(s)}
                            style={{
                              backgroundColor: '#22232D',
                              border: '1px solid #2E303E',
                              color: '#daa520',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              marginRight: '0.5rem',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, s.ServiceName)}
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid #EF4444',
                              color: '#EF4444',
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            Delete
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
