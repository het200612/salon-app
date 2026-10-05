import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

export const ManageServicesPage = () => {
  const [services, setServices] = useState([]);
  const [serviceName, setServiceName] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('form'); // 'form' or 'list'

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
      await fetchServices();
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
    setViewMode('form');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete service '${name}'?`)) return;

    try {
      await api.delete(`/admin/services/${id}`);
      setMessage(`Service '${name}' deleted.`);
      await fetchServices();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete service.');
    }
  };

  return (
    <AdminLayout headerTitle="Dashboard Overview" activeMenu="services">
      {message && <div className="admin-banner-success">✓ {message}</div>}
      {error && <div className="admin-banner-error">⚠ {error}</div>}

      {viewMode === 'form' ? (
        /* Add Services Form matching Page 2 Screenshot 1 */
        <div className="admin-form-container">
          <form className="admin-form-box" onSubmit={handleSubmit} autoComplete="off">
            <h2 className="admin-form-title">
              {editingService ? 'Edit Service' : 'Add Services'}
            </h2>

            <div className="admin-form-group">
              <input
                type="text"
                required
                placeholder="Service Name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </div>

            <button type="submit" className="admin-btn-save" disabled={submitting}>
              {submitting ? 'Saving...' : editingService ? 'Update' : 'Save'}
            </button>

            {editingService && (
              <button
                type="button"
                className="admin-toggle-link"
                onClick={() => {
                  setEditingService(null);
                  setServiceName('');
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
              Show List of Services
            </button>
          </form>
        </div>
      ) : (
        /* List View matching ServiceList.html */
        <div className="admin-list-container">
          <div className="admin-list-header-row">
            <h3 className="admin-list-title">Services List</h3>
            <button
              type="button"
              className="admin-toggle-link"
              style={{ fontSize: '1.1rem', fontWeight: '600' }}
              onClick={() => {
                setEditingService(null);
                setServiceName('');
                setViewMode('form');
              }}
            >
              + Add New
            </button>
          </div>

          <table className="admin-list-table">
            <thead>
              <tr>
                <th>Service Id</th>
                <th>Service Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', color: '#d4af37' }}>
                    Loading services...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', color: '#aaaaaa' }}>
                    No services found. Click "+ Add New" to create one.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id}>
                    <td>{service.id}</td>
                    <td>{service.ServiceName}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-action-link"
                        onClick={() => handleEdit(service)}
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        className="admin-action-link delete"
                        onClick={() => handleDelete(service.id, service.ServiceName)}
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

export default ManageServicesPage;
