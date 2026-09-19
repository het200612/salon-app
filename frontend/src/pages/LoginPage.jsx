import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import authBg from '../assets/auth-bg.jpg';
import logoEmblem from '../assets/logo-emblem.png';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User'); // 'Admin', 'User', 'Owner'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(location.state?.message || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password,
        role: role.toLowerCase(),
      });

      login(res.data);

      const normalizedRole = (res.data.role || role).toLowerCase();
      const redirectPath = location.state?.redirect || (
        normalizedRole === 'admin'
          ? '/admin/dashboard'
          : normalizedRole === 'owner'
          ? '/owner/dashboard'
          : '/user/profile'
      );

      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Username or password is incorrect';
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
        padding: '2rem 1rem',
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 0 25px rgba(0, 0, 0, 0.25)',
            padding: '2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Circular Logo on top */}
          <div style={{
            width: '4.5rem',
            height: '4.5rem',
            borderRadius: '50%',
            border: '1px solid #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
          }}>
            <img
              src={logoEmblem}
              alt="Logo Emblem"
              style={{ width: '80%', height: '80%', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Heading */}
          <h1 style={{
            color: '#ffd700',
            fontSize: '2rem',
            fontWeight: '600',
            marginBottom: '1.2rem',
            textAlign: 'center',
          }}>
            Login
          </h1>

          {/* Error message */}
          {errorMsg && (
            <div style={{
              width: '100%',
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

          {/* Select Role */}
          <div style={{ width: '100%', marginBottom: '1.2rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#555', fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem' }}>
              Select Role
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1.5rem',
            }}>
              {['Admin', 'User', 'Owner'].map((r) => (
                <label
                  key={r}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#333',
                    fontWeight: '500',
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                    style={{
                      accentColor: '#d1a208',
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                    }}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div style={{ width: '100%', marginBottom: '1rem' }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '0.95rem',
                color: '#333',
                backgroundColor: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#ffd700'; }}
              onBlur={(e) => { e.target.style.borderColor = '#ddd'; }}
            />
          </div>

          {/* Password Input */}
          <div style={{ width: '100%', marginBottom: '1.2rem' }}>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '0.95rem',
                color: '#333',
                backgroundColor: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#ffd700'; }}
              onBlur={(e) => { e.target.style.borderColor = '#ddd'; }}
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
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Bottom Links */}
          <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.85rem' }}>
            <div>
              <Link to="/register" style={{ color: '#d1a208', textDecoration: 'none' }}>
                Don't have an account? Register
              </Link>
            </div>
            {role !== 'Admin' && (
              <div style={{ marginTop: '0.4rem' }}>
                <Link to="/forgot-password" style={{ color: '#666', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
