import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import UserSidebar from '../../components/UserSidebar';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';
import api from '../../services/api';

export const EditProfilePage = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      if (res.data) {
        setFormData({
          name: res.data.Name || '',
          phoneNumber: res.data.PhoneNumber || '',
        });
        if (res.data.Img) {
          setImagePreview(getImageUrl(res.data.Img));
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phoneNumber', formData.phoneNumber);
      if (imageFile) {
        data.append('img', imageFile);
      }

      const res = await api.put('/user/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Profile updated successfully!');
      if (res.data?.user) {
        login({
          user: res.data.user,
          token: localStorage.getItem('token'),
          role: res.data.user.usertype,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
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
          {/* User Sidebar */}
          <UserSidebar />

          {/* Edit Profile Form */}
          <section style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '640px',
            }}>
              <h1 style={{
                color: '#fff',
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: '0 0 0.5rem',
                fontFamily: "'Poppins', sans-serif",
              }}>
                Edit Profile
              </h1>
              <p style={{ color: '#9CA3AF', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
                Update your contact information and profile avatar
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

              <form onSubmit={handleSubmit}>
                {/* Profile Image Section */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#22232D',
                  borderRadius: '8px',
                  border: '1px solid #2E303E',
                }}>
                  <img
                    src={imagePreview || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60'}
                    alt="Preview"
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #daa520',
                    }}
                  />
                  <div>
                    <label style={{
                      display: 'inline-block',
                      backgroundColor: '#daa520',
                      color: '#121212',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginBottom: '4px',
                    }}>
                      Choose Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.75rem' }}>
                      JPG, PNG, WEBP max 5MB
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

                {/* Phone Number */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="10-digit phone number"
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
                  disabled={loading}
                  style={{
                    backgroundColor: '#daa520',
                    color: '#121212',
                    padding: '0.85rem 1.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditProfilePage;
