import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

export const ManageAreasPage = () => {
  const [areas, setAreas] = useState([]);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({ areaName: '', cityId: '' });
  const [editingArea, setEditingArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAreasAndCities();
  }, []);

  const fetchAreasAndCities = async () => {
    try {
      setLoading(true);
      setError('');
      const [areasRes, citiesRes] = await Promise.all([
        api.get('/admin/areas'),
        api.get('/admin/cities'),
      ]);
      setAreas(areasRes.data || []);
      setCities(citiesRes.data || []);
      if (citiesRes.data?.length > 0 && !formData.cityId) {
        setFormData((prev) => ({ ...prev, cityId: citiesRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load areas/cities:', err);
      setError('Unable to load areas data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.areaName.trim() || !formData.cityId) return;

    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      if (editingArea) {
        await api.put(`/admin/areas/${editingArea.id}`, {
          areaName: formData.areaName.trim(),
          cityId: formData.cityId,
        });
        setMessage('Area updated successfully.');
        setEditingArea(null);
      } else {
        await api.post('/admin/areas', {
          areaName: formData.areaName.trim(),
          cityId: formData.cityId,
        });
        setMessage(`Area '${formData.areaName.trim()}' added.`);
      }

      setFormData({ areaName: '', cityId: cities[0]?.id || '' });
      fetchAreasAndCities();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save area.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setFormData({
      areaName: area.AreaName,
      cityId: area.City_id,
    });
  };

  const handleCancelEdit = () => {
    setEditingArea(null);
    setFormData({ areaName: '', cityId: cities[0]?.id || '' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete area '${name}'?`)) return;

    try {
      await api.delete(`/admin/areas/${id}`);
      setMessage(`Area '${name}' deleted.`);
      fetchAreasAndCities();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete area.');
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
            {/* Add / Edit Area Form */}
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
            }}>
              <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.5rem' }}>
                {editingArea ? 'Edit Area' : 'Add New Area'}
              </h1>
              <p style={{ color: '#9CA3AF', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
                Configure neighborhood / locality boundaries for salon listings
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

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>
                    Parent City
                  </label>
                  <select
                    value={formData.cityId}
                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
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
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.CityName}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: '2 1 240px' }}>
                  <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem' }}>
                    Area Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adajan, Vesu, Pal"
                    value={formData.areaName}
                    onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
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
                  {submitting ? 'Saving...' : editingArea ? 'Update Area' : 'Add Area'}
                </button>

                {editingArea && (
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
                      height: '46px',
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            {/* Areas Table */}
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '1.5rem',
            }}>
              <h2 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 1.25rem' }}>
                Configured Areas ({areas.length})
              </h2>

              {loading ? (
                <div style={{ color: '#daa520', padding: '2rem', textAlign: 'center' }}>Loading areas...</div>
              ) : areas.length === 0 ? (
                <div style={{ color: '#9CA3AF', padding: '2rem', textAlign: 'center' }}>No areas registered.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #2E303E', color: '#9CA3AF', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Area Name</th>
                      <th style={{ padding: '0.75rem 1rem' }}>City</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {areas.map((a) => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #2E303E', color: '#fff' }}>
                        <td style={{ padding: '1rem', color: '#daa520', fontWeight: '600' }}>#{a.id}</td>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{a.AreaName}</td>
                        <td style={{ padding: '1rem', color: '#9CA3AF' }}>{a.CityName || `City #${a.City_id}`}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleEdit(a)}
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
                            onClick={() => handleDelete(a.id, a.AreaName)}
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

export default ManageAreasPage;
