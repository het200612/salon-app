import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
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
  const [viewMode, setViewMode] = useState('form'); // 'form' or 'list'
  const [selectedCityFilter, setSelectedCityFilter] = useState(() => {
    return new URLSearchParams(window.location.search).get('cityId') || 'all';
  });

  useEffect(() => {
    const paramCity = new URLSearchParams(window.location.search).get('cityId');
    if (paramCity) {
      setSelectedCityFilter(paramCity);
      setViewMode('list');
    }
  }, []);

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
    } catch (err) {
      console.error('Failed to load areas/cities:', err);
      setError('Unable to load areas data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.areaName.trim() || !formData.cityId) {
      setError('Please provide an area name and select a city.');
      return;
    }

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
        setMessage(`Area '${formData.areaName.trim()}' added successfully.`);
      }

      setFormData({ areaName: '', cityId: '' });
      await fetchAreasAndCities();
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
      cityId: area.CityName_id || area.City_id || '',
    });
    setViewMode('form');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete area '${name}'?`)) return;

    try {
      await api.delete(`/admin/areas/${id}`);
      setMessage(`Area '${name}' deleted.`);
      await fetchAreasAndCities();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete area.');
    }
  };

  return (
    <AdminLayout headerTitle="Dashboard Overview" activeMenu="areas">
      {message && <div className="admin-banner-success">✓ {message}</div>}
      {error && <div className="admin-banner-error">⚠ {error}</div>}

      {viewMode === 'form' ? (
        /* Add / Edit Area Form matching Page 2 Screenshot 2 */
        <div className="admin-form-container">
          <form className="admin-form-box" onSubmit={handleSubmit} autoComplete="off">
            <h2 className="admin-form-title">
              {editingArea ? 'Edit Area' : 'Add Area'}
            </h2>

            <div className="admin-form-group">
              <label htmlFor="areaName">Area Name</label>
              <input
                id="areaName"
                type="text"
                required
                placeholder="Area Name"
                value={formData.areaName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, areaName: e.target.value }))
                }
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="cityName">City Name</label>
              <select
                id="cityName"
                required
                value={formData.cityId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cityId: e.target.value }))
                }
              >
                <option value="">--Select City Name--</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.CityName}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="admin-btn-save" disabled={submitting}>
              {submitting ? 'Saving...' : editingArea ? 'Update' : 'Save'}
            </button>

            {editingArea && (
              <button
                type="button"
                className="admin-toggle-link"
                onClick={() => {
                  setEditingArea(null);
                  setFormData({ areaName: '', cityId: '' });
                }}
              >
                Cancel Edit
              </button>
            )}

            <button
              type="button"
              className="admin-toggle-link"
              onClick={() => setViewMode('list')}
            >
              Show List of Areas
            </button>
          </form>
        </div>
      ) : (
        /* List View matching AreaList.html */
        <div className="admin-list-container">
          <div className="admin-list-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 className="admin-list-title" style={{ margin: 0 }}>Areas List</h3>
              <select
                value={selectedCityFilter}
                onChange={(e) => setSelectedCityFilter(e.target.value)}
                style={{
                  backgroundColor: '#242424',
                  color: '#ffffff',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">-- All Cities --</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.CityName}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="admin-toggle-link"
              style={{ fontSize: '1.1rem', fontWeight: '600' }}
              onClick={() => {
                setEditingArea(null);
                setFormData({ areaName: '', cityId: '' });
                setViewMode('form');
              }}
            >
              + Add New
            </button>
          </div>

          {(() => {
            const displayedAreas = areas.filter((area) => {
              if (selectedCityFilter === 'all' || !selectedCityFilter) return true;
              return String(area.CityName_id || area.City_id) === String(selectedCityFilter);
            });

            return (
              <table className="admin-list-table">
                <thead>
                  <tr>
                    <th>Area Id</th>
                    <th>Area Name</th>
                    <th>City Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', color: '#d4af37' }}>
                        Loading areas...
                      </td>
                    </tr>
                  ) : displayedAreas.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', color: '#aaaaaa' }}>
                        No areas found for this city. Click "+ Add New" to create one.
                      </td>
                    </tr>
                  ) : (
                    displayedAreas.map((area) => (
                      <tr key={area.id}>
                        <td>{area.id}</td>
                        <td>{area.AreaName}</td>
                        <td>{area.CityName || 'N/A'}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-action-link"
                            onClick={() => handleEdit(area)}
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="admin-action-link delete"
                            onClick={() => handleDelete(area.id, area.AreaName)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            );
          })()}
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageAreasPage;
