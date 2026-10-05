import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserLayout from '../../components/UserLayout';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import api from '../../services/api';

export const EditProfilePage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    email: '',
    phoneNumber: '',
  });
  const [currentImg, setCurrentImg] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const res = await api.get('/user/profile');
      if (res.data) {
        setFormData({
          name: res.data.name || res.data.Name || '',
          userName: res.data.userName || res.data.UserName || '',
          email: res.data.email || res.data.Email || '',
          phoneNumber: res.data.phoneNumber || res.data.PhoneNumber || '',
        });
        setCurrentImg(res.data.img || res.data.Img || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Unable to load profile details.');
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!formData.name.trim() || !formData.userName.trim() || !formData.email.trim() || !formData.phoneNumber.trim()) {
      setError('All fields (Name, UserName, Email, PhoneNumber) are required.');
      setLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
      setError('PhoneNumber must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('userName', formData.userName.trim());
      data.append('email', formData.email.trim());
      data.append('phoneNumber', formData.phoneNumber.trim());
      if (imageFile) {
        data.append('img', imageFile);
      }

      const res = await api.put('/user/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Profile updated successfully!');
      if (res.data?.user) {
        login({
          user: res.data.user,
          token: localStorage.getItem('token'),
          role: res.data.user.usertype || user?.usertype || 'User',
        });
        setCurrentImg(res.data.user.img || currentImg);
      }
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout activeMenu="edit-profile">
      <div className="user-edit-container">
        <h2 className="user-edit-title">Edit Profile</h2>

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

        {fetching ? (
          <div style={{ textAlign: 'center', color: '#d4af37', padding: '2rem' }}>
            <i className="fas fa-spinner fa-spin"></i> Loading profile...
          </div>
        ) : (
          <form className="user-edit-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="user-edit-group">
              <label htmlFor="name">Name:</label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="user-edit-group">
              <label htmlFor="userName">UserName:</label>
              <input
                id="userName"
                type="text"
                required
                value={formData.userName}
                onChange={(e) => setFormData((p) => ({ ...p, userName: e.target.value }))}
              />
            </div>

            <div className="user-edit-group">
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              />
            </div>

            <div className="user-edit-group">
              <label htmlFor="phoneNumber">PhoneNumber:</label>
              <input
                id="phoneNumber"
                type="text"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData((p) => ({ ...p, phoneNumber: e.target.value }))}
              />
            </div>

            <div className="user-edit-group">
              <label htmlFor="imgFile">Img:</label>
              <div className="user-file-box">
                {currentImg && (
                  <div className="user-file-current">
                    Currently:{' '}
                    <a
                      href={getImageUrl(currentImg)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {currentImg}
                    </a>
                  </div>
                )}
                <div>
                  <span style={{ fontSize: '0.9rem', color: '#ccc', marginRight: '8px' }}>
                    Change:
                  </span>
                  <input
                    id="imgFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                    }}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="user-save-btn" disabled={loading}>
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>

            <Link to="/user/profile" className="user-back-btn">
              Go Back To Profile
            </Link>
          </form>
        )}
      </div>
    </UserLayout>
  );
};

export default EditProfilePage;
