import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

export const ManageCitiesPage = () => {
  const [cities, setCities] = useState([]);
  const [cityName, setCityName] = useState('');
  const [editingCity, setEditingCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/cities');
      setCities(res.data || []);
    } catch (err) {
      console.error('Failed to load cities:', err);
      setError('Unable to load cities list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cityName.trim()) return;

    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      if (editingCity) {
        await api.put(`/admin/cities/${editingCity.id}`, { cityName: cityName.trim() });
        setMessage(`City updated successfully.`);
        setEditingCity(null);
      } else {
        await api.post('/admin/cities', { cityName: cityName.trim() });
        setMessage(`City '${cityName.trim()}' added successfully.`);
      }

      setCityName('');
      fetchCities();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save city.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (city) => {
    setEditingCity(city);
    setCityName(city.CityName);
  };

  const handleCancelEdit = () => {
    setEditingCity(null);
    setCityName('');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete city '${name}'?`)) return;

    try {
      await api.delete(`/admin/cities/${id}`);
      setMessage(`City '${name}' deleted.`);
      fetchCities();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete city.');
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
            {/* Add / Edit City Form */}
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
            }}>
              <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.5rem' }}>
                {editingCity ? 'Edit City' : 'Add New City'}
              </h1>
              <p style={{ color: '#9CA3AF', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
                Manage operational cities where salons can register
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
                  placeholder="Enter city name (e.g. Surat, Ahmedabad)"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
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
                  {submitting ? 'Saving...' : editingCity ? 'Update City' : 'Add City'}
                </button>

                {editingCity && (
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

            {/* Cities Table */}
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '1.5rem',
            }}>
              <h2 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 1.25rem' }}>
                Existing Cities ({cities.length})
              </h2>

              {loading ? (
                <div style={{ color: '#daa520', padding: '2rem', textAlign: 'center' }}>Loading cities...</div>
              ) : cities.length === 0 ? (
                <div style={{ color: '#9CA3AF', padding: '2rem', textAlign: 'center' }}>No cities found.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #2E303E', color: '#9CA3AF', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>City Name</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cities.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #2E303E', color: '#fff' }}>
                        <td style={{ padding: '1rem', color: '#daa520', fontWeight: '600' }}>#{c.id}</td>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{c.CityName}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleEdit(c)}
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
                            onClick={() => handleDelete(c.id, c.CityName)}
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

export default ManageCitiesPage;
