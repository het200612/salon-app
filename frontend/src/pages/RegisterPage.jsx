import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import authBg from '../assets/auth-bg.jpg';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    usertype: 'Owner', // Default 'Owner' as shown in screenshot
  });
  const [profileImg, setProfileImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImg(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

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

      setSuccessMsg(res.data.message || 'Registered successfully!');
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: formData.usertype === 'Owner'
              ? 'Owner registered successfully! Waiting for admin verification.'
              : 'Registered successfully! Please log in.',
          },
        });
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      fontFamily: "'Poppins', sans-serif",
    }}>
      {/* Background Image & Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${authBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: -2,
      }} />
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        zIndex: -1,
      }} />

      <Navbar />

      {/* Main Container */}
      <div style={{
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 0 25px rgba(0, 0, 0, 0.25)',
            padding: '2rem 2.2rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Title */}
          <h1 style={{
            color: '#333333',
            fontSize: '1.8rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            Sign Up
          </h1>

          {/* Error / Success Feedback */}
          {errorMsg && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #f87171',
              color: '#b91c1c',
              padding: '0.6rem 0.8rem',
              borderRadius: '5px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              textAlign: 'center',
            }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              backgroundColor: '#d1fae5',
              border: '1px solid #34d399',
              color: '#065f46',
              padding: '0.6rem 0.8rem',
              borderRadius: '5px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              textAlign: 'center',
            }}>
              {successMsg}
            </div>
          )}

          {/* Name */}
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#333', fontWeight: '500', marginBottom: '0.2rem' }}>
              Name:
            </label>
            <input
              type="text"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '0.9rem',
                color: '#333',
                backgroundColor: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#ffd700'; }}
              onBlur={(e) => { e.target.style.borderColor = '#ddd'; }}
            />
          </div>

          {/* Username */}
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#333', fontWeight: '500', marginBottom: '0.2rem' }}>
              Username:
            </label>
            <input
              type="text"
              required
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '0.9rem',
                color: '#333',
                backgroundColor: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#ffd700'; }}
              onBlur={(e) => { e.target.style.borderColor = '#ddd'; }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#333', fontWeight: '500', marginBottom: '0.2rem' }}>
              Email:
            </label>
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '0.9rem',
                color: '#333',
                backgroundColor: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#ffd700'; }}
              onBlur={(e) => { e.target.style.borderColor = '#ddd'; }}
            />
          </div>

          {/* Phone Number */}
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#333', fontWeight: '500', marginBottom: '0.2rem' }}>
              Phonenumber:
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '0.9rem',
                color: '#333',
                backgroundColor: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#ffd700'; }}
              onBlur={(e) => { e.target.style.borderColor = '#ddd'; }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#333', fontWeight: '500', marginBottom: '0.2rem' }}>
              Password:
            </label>
            <input
              type="password"
              required
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '0.9rem',
                color: '#333',
                backgroundColor: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#ffd700'; }}
              onBlur={(e) => { e.target.style.borderColor = '#ddd'; }}
            />
          </div>

          {/* Usertype Dropdown */}
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#333', fontWeight: '500', marginBottom: '0.2rem' }}>
              Usertype:
            </label>
            <select
              name="usertype"
              value={formData.usertype}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '0.9rem',
                color: '#333',
                backgroundColor: '#fff',
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <option value="Owner">Owner</option>
              <option value="User">User</option>
            </select>
          </div>

          {/* Img File Picker */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#333', fontWeight: '500', marginBottom: '0.2rem' }}>
              Img:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                width: '100%',
                fontSize: '0.85rem',
                color: '#555',
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#d1a208',
              color: '#ffffff',
              padding: '12px',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#b98f07'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#d1a208'; }}
          >
            {loading ? 'Submitting...' : 'Register'}
          </button>

          {/* Bottom Link */}
          <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.85rem' }}>
            <Link to="/login" style={{ color: '#d1a208', textDecoration: 'none' }}>
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
