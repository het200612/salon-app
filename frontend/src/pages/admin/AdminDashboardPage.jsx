import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

export const AdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Row action state: { [ownerId]: { status: 'verified' | 'rejected', reason: '' } }
  const [rowActions, setRowActions] = useState({});

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/dashboard');
      setDashboardData(res.data);

      // Initialize radio selections based on current status
      const initialActions = {};
      const list = res.data?.salonRequests || res.data?.owners || [];
      list.forEach((owner) => {
        initialActions[owner.id] = {
          status: (owner.Status || '').toLowerCase() === 'rejected' ? 'rejected' : 'verified',
          reason: '',
        };
      });
      setRowActions(initialActions);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      const serverMsg = err.response?.data?.message;
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(serverMsg || 'Admin session expired or access unauthorized. Please log in with Administrator credentials.');
      } else {
        setError(serverMsg || 'Failed to fetch administrator statistics.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRadioChange = (ownerId, status) => {
    setRowActions((prev) => ({
      ...prev,
      [ownerId]: {
        ...prev[ownerId],
        status,
      },
    }));
  };

  const handleReasonChange = (ownerId, reason) => {
    setRowActions((prev) => ({
      ...prev,
      [ownerId]: {
        ...prev[ownerId],
        reason,
      },
    }));
  };

  const handleSubmitStatus = async (ownerId) => {
    const action = rowActions[ownerId] || { status: 'verified', reason: '' };
    try {
      setActionLoadingId(ownerId);
      setMessage('');
      setError('');

      await api.patch(`/admin/owners/${ownerId}/status`, {
        status: action.status,
        reason: action.reason,
      });

      setMessage(`Owner #${ownerId} status updated to '${action.status}'.`);
      await fetchDashboard();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update owner status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const counts = dashboardData?.counts || dashboardData || {};
  const salonRequests = dashboardData?.salonRequests || dashboardData?.owners || [];

  return (
    <AdminLayout
      headerTitle="Dashboard Overview"
      activeMenu="dashboard"
      customStats={{
        totalSalons: counts.totalSalons ?? 0,
        totalUsers: counts.totalUsers ?? 0,
        bookingsToday: counts.bookingsToday ?? 0,
      }}
    >
      {message && <div className="admin-banner-success">✓ {message}</div>}
      {error && (
        <div className="admin-banner-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <span>⚠ {error}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={fetchDashboard}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #e74c3c',
                color: '#e74c3c',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Retry
            </button>
            <a
              href="/login"
              style={{
                backgroundColor: '#d4af37',
                color: '#1a1a1a',
                padding: '4px 10px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.85rem',
              }}
            >
              Log in as Admin
            </a>
          </div>
        </div>
      )}

      {/* Salon Requests Section */}
      <div className="admin-salon-requests">
        <h3 className="admin-request-header">Salon Requests</h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-request-table">
            <thead>
              <tr>
                <th>Owner Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="admin-no-requests">
                    Loading requests...
                  </td>
                </tr>
              ) : salonRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-no-requests">
                    No pending salon requests
                  </td>
                </tr>
              ) : (
                salonRequests.map((request) => {
                  const currentAction = rowActions[request.id] || {
                    status: (request.Status || '').toLowerCase() === 'rejected' ? 'rejected' : 'verified',
                    reason: '',
                  };
                  const isVerified = (request.Status || '').toLowerCase() === 'verified';
                  const isRejected = (request.Status || '').toLowerCase() === 'rejected';

                  let badgeClass = 'pending';
                  let badgeText = 'Pending';
                  if (isVerified) {
                    badgeClass = 'verified';
                    badgeText = 'Verified';
                  } else if (isRejected) {
                    badgeClass = 'rejected';
                    badgeText = 'Rejected';
                  }

                  return (
                    <tr key={request.id}>
                      <td style={{ fontWeight: '500' }}>{request.Name}</td>
                      <td style={{ color: '#cccccc' }}>{request.UserName}</td>
                      <td style={{ color: '#cccccc' }}>{request.Email}</td>
                      <td style={{ color: '#cccccc' }}>{request.PhoneNumber}</td>
                      <td>
                        <span className={`admin-status-badge ${badgeClass}`}>{badgeText}</span>
                      </td>
                      <td>
                        <form
                          className="admin-verify-form"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmitStatus(request.id);
                          }}
                        >
                          <label className="admin-radio-label">
                            <input
                              type="radio"
                              name={`status_${request.id}`}
                              value="verified"
                              checked={currentAction.status === 'verified'}
                              onChange={() => handleRadioChange(request.id, 'verified')}
                            />
                            Verify
                          </label>

                          <label className="admin-radio-label">
                            <input
                              type="radio"
                              name={`status_${request.id}`}
                              value="rejected"
                              checked={currentAction.status === 'rejected'}
                              onChange={() => handleRadioChange(request.id, 'rejected')}
                            />
                            Reject
                          </label>

                          {currentAction.status === 'rejected' && (
                            <div className="admin-reason-container">
                              <span style={{ fontSize: '0.85rem', color: '#aaaaaa' }}>
                                Write The Reason Here:
                              </span>
                              <textarea
                                className="admin-reason-field"
                                placeholder="Write the Reason Here"
                                value={currentAction.reason}
                                onChange={(e) => handleReasonChange(request.id, e.target.value)}
                              />
                            </div>
                          )}

                          <button
                            type="submit"
                            className="admin-verify-btn"
                            disabled={actionLoadingId === request.id}
                          >
                            {actionLoadingId === request.id ? 'Saving...' : 'Submit'}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
