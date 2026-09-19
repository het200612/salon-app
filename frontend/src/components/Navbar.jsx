import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    const normalizedRole = (role || '').toLowerCase();
    if (normalizedRole === 'admin') return '/admin/dashboard';
    if (normalizedRole === 'owner') return '/owner/dashboard';
    return '/user/profile';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
      padding: '0.8rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand in Ephesis cursive gold font */}
        <Link
          to="/"
          style={{
            fontFamily: "'Ephesis', cursive, serif",
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#daa520',
            textDecoration: 'none',
            lineHeight: 1,
            letterSpacing: '1px',
          }}
        >
          Hair Harmony
        </Link>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          fontFamily: "'Poppins', sans-serif",
        }}>
          <Link
            to="/"
            style={{
              color: '#121212',
              fontWeight: '600',
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.color = '#daa520'; }}
            onMouseLeave={(e) => { e.target.style.color = '#121212'; }}
          >
            Home
          </Link>
          <a
            href="/#about"
            style={{
              color: '#121212',
              fontWeight: '600',
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.color = '#daa520'; }}
            onMouseLeave={(e) => { e.target.style.color = '#121212'; }}
          >
            About Us
          </a>
          <a
            href="/#contact"
            style={{
              color: '#121212',
              fontWeight: '600',
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.color = '#daa520'; }}
            onMouseLeave={(e) => { e.target.style.color = '#121212'; }}
          >
            Contact
          </a>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                style={{
                  color: '#daa520',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  border: '1px solid #daa520',
                  padding: '6px 14px',
                  borderRadius: '4px',
                }}
              >
                Dashboard ({user?.name || role})
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #ddd',
                  color: '#666',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#dc3545'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#666'; }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: '#121212',
                  fontWeight: '600',
                  fontSize: '1rem',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.color = '#daa520'; }}
                onMouseLeave={(e) => { e.target.style.color = '#121212'; }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  color: '#121212',
                  fontWeight: '600',
                  fontSize: '1rem',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.color = '#daa520'; }}
                onMouseLeave={(e) => { e.target.style.color = '#121212'; }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
