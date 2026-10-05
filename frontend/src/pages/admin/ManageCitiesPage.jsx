import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

export const ManageCitiesPage = () => {
  const [cities, setCities] = useState([]);
  const [cityName, setCityName] = useState('');
  const [editingCity, setEditingCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('form'); // 'form' or 'list'

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
      await fetchCities();
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
    setViewMode('form');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete city '${name}'?`)) return;

    try {
      await api.delete(`/admin/cities/${id}`);
      setMessage(`City '${name}' deleted.`);
      await fetchCities();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete city.');
    }
  };

  return (
    <AdminLayout headerTitle="Dashboard Overview" activeMenu="cities">
      {message && <div className="admin-banner-success">✓ {message}</div>}
      {error && <div className="admin-banner-error">⚠ {error}</div>}

      {viewMode === 'form' ? (
        /* Add / Edit City Form matching Page 1 Screenshot 2 */
        <div className="admin-form-container">
          <form className="admin-form-box" onSubmit={handleSubmit} autoComplete="off">
            <h2 className="admin-form-title">
              {editingCity ? 'Edit City' : 'Add City'}
            </h2>

            <div className="admin-form-group">
              <input
                type="text"
                required
                placeholder="City Name"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
              />
            </div>

            <button type="submit" className="admin-btn-save" disabled={submitting}>
              {submitting ? 'Saving...' : editingCity ? 'Update' : 'Save'}
            </button>

            {editingCity && (
              <button
                type="button"
                className="admin-toggle-link"
                onClick={() => {
                  setEditingCity(null);
                  setCityName('');
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
              Show List of Cities
            </button>
          </form>
        </div>
      ) : (
        /* List View matching CityList.html */
        <div className="admin-list-container">
          <div className="admin-list-header-row">
            <h3 className="admin-list-title">Cities List</h3>
            <button
              type="button"
              className="admin-toggle-link"
              style={{ fontSize: '1.1rem', fontWeight: '600' }}
              onClick={() => {
                setEditingCity(null);
                setCityName('');
                setViewMode('form');
              }}
            >
              + Add New
            </button>
          </div>

          <table className="admin-list-table">
            <thead>
              <tr>
                <th>City Id</th>
                <th>City Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', color: '#d4af37' }}>
                    Loading cities...
                  </td>
                </tr>
              ) : cities.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', color: '#aaaaaa' }}>
                    No cities found. Click "+ Add New" to create one.
                  </td>
                </tr>
              ) : (
                cities.map((city) => (
                  <tr key={city.id}>
                    <td>{city.id}</td>
                    <td>
                      <Link
                        to={`/admin/areas?cityId=${city.id}`}
                        title={`View areas in ${city.CityName}`}
                        style={{ color: '#d4af37', textDecoration: 'none', cursor: 'pointer' }}
                      >
                        {city.CityName}
                      </Link>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-action-link"
                        onClick={() => handleEdit(city)}
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        className="admin-action-link delete"
                        onClick={() => handleDelete(city.id, city.CityName)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageCitiesPage;
