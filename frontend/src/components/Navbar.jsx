import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

export const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      backgroundColor: 'rgba(15, 16, 21, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '0.8rem 2rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={logoImg}
            alt="Hair Harmony Logo"
            style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.4rem',
            fontWeight: '700',
            letterSpacing: '0.5px',
            color: 'var(--color-primary)',
          }}>
            Hair Harmony
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }}>
          <Link to="/" style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', fontWeight: '500', transition: 'var(--transition-fast)' }}>
            Home
          </Link>
          <a href="/#salons" style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', fontWeight: '500' }}>
            Salons
          </a>
          <a href="/#about" style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', fontWeight: '500' }}>
            About Us
          </a>
          <a href="/#contact" style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', fontWeight: '500' }}>
            Contact
          </a>

          {/* Auth Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>Dashboard ({user?.name || role})</span>
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    padding: '0.5rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-danger)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    color: 'var(--color-text-main)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    padding: '0.5rem 1rem',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#0F1015',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    padding: '0.5rem 1.2rem',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
