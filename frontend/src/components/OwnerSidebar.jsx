import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

export const OwnerSidebar = ({ salon }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard & Bookings', path: '/owner/dashboard', icon: '📊' },
    { label: 'Salon Profile', path: '/owner/edit-salon', icon: '🏪' },
    { label: 'Manage Services', path: '/owner/services', icon: '✂️' },
    { label: 'Gallery Images', path: '/owner/images', icon: '🖼️' },
  ];

  return (
    <aside style={{
      width: '280px',
      backgroundColor: '#181920',
      border: '1px solid #2E303E',
      borderRadius: '12px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      height: 'fit-content',
    }}>
      {/* Owner & Salon Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid #2E303E',
      }}>
        <img
          src={getImageUrl(user?.img)}
          alt={user?.name || 'Owner'}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #daa520',
            backgroundColor: '#22232D',
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60';
          }}
        />
        <div style={{ overflow: 'hidden' }}>
          <h3 style={{
            fontSize: '1.05rem',
            color: '#fff',
            margin: 0,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}>
            {user?.name || 'Salon Owner'}
          </h3>
          <p style={{
            fontSize: '0.8rem',
            color: '#daa520',
            margin: '2px 0 0',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}>
            {salon?.Name || 'Owner Portal'}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/owner/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '500',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: isActive ? 'rgba(218, 165, 32, 0.15)' : 'transparent',
              color: isActive ? '#daa520' : '#E5E7EB',
              borderLeft: isActive ? '3px solid #daa520' : '3px solid transparent',
            })}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          color: '#EF4444',
          fontSize: '0.95rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
        }}
      >
        <span>🚪</span>
        <span>Log Out</span>
      </button>
    </aside>
  );
};

export default OwnerSidebar;
