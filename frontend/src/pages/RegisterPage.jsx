import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    usertype: 'User', // 'User' | 'Owner'
  });
  const [profileImg, setProfileImg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImg(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Client-side validations
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setErrorMsg('Phone number must be exactly 10 digits.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setErrorMsg('Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@$!%*?&).');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('userName', formData.userName);
      data.append('email', formData.email.trim());
      data.append('phoneNumber', formData.phoneNumber.trim());
      data.append('password', formData.password);
      data.append('usertype', formData.usertype);
      if (profileImg) {
        data.append('img', profileImg);
      }

      const res = await api.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMsg(res.data.message || 'Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: formData.usertype === 'Owner'
              ? 'Owner account registered! Waiting for administrator approval.'
              : 'Registration successful! Please log in.',
          },
        });
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Registration failed. Please check your information.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Navbar />

      <div style={{
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <span style={{ color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem', fontWeight: '700' }}>
              Join Hair Harmony
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-text-main)', marginTop: '0.3rem' }}>
              Create Your Account
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
              Register as a customer or salon owner
            </p>
          </div>

          {/* Account Type Toggle */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--color-surface)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            border: '1px solid var(--color-border)',
          }}>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, usertype: 'User' }))}
              style={{
                padding: '0.6rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: formData.usertype === 'User' ? 'var(--color-primary)' : 'transparent',
                color: formData.usertype === 'User' ? '#0F1015' : 'var(--color-text-muted)',
                transition: 'var(--transition-fast)',
              }}
            >
              Customer / User
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, usertype: 'Owner' }))}
              style={{
                padding: '0.6rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: formData.usertype === 'Owner' ? 'var(--color-primary)' : 'transparent',
                color: formData.usertype === 'Owner' ? '#0F1015' : 'var(--color-text-muted)',
                transition: 'var(--transition-fast)',
              }}
            >
              Salon Owner
            </button>
          </div>

          {/* Error & Success Messages */}
          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '1.2rem',
            }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#6EE7B7',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '1.2rem',
            }}>
              {successMsg}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem', fontWeight: '500' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-main)',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem', fontWeight: '500' }}>
                  Username
                </label>
                <input
                  type="text"
                  required
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder="johndoe"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-main)',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem', fontWeight: '500' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-main)',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem', fontWeight: '500' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="9876543210"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-main)',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem', fontWeight: '500' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 chars, A-Z, 0-9, @"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-main)',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem', fontWeight: '500' }}>
                Profile Photo (Optional)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-text-muted)',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#0F1015',
                fontWeight: '700',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                marginTop: '0.5rem',
                transition: 'var(--transition-fast)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Submitting Registration...' : `Register as ${formData.usertype}`}
            </button>
          </form>

          {/* Footer Login Link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--color-border)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterPage;
