import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserAvatarUrl } from '../utils/imageUrl';

export const UserSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Profile', path: '/user/profile', icon: '👤' },
    { label: 'Booking History', path: '/user/bookings', icon: '🕒' },
    { label: 'Change Password', path: '/user/change-password', icon: '🔒' },
    { label: 'Edit Profile', path: '/user/edit-profile', icon: '✏️' },
  ];

  return (
    <aside style={{
      width: '240px',
      backgroundColor: '#161616',
      borderRight: '1px solid #222222',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      fontFamily: "'Poppins', sans-serif",
    }}>
      {/* Centered User Avatar & Details */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2.5rem 1.25rem 2rem',
        borderBottom: '1px solid #222222',
      }}>
        <div style={{
          width: '74px',
          height: '74px',
          borderRadius: '50%',
          padding: '3px',
          border: '2px solid #F5A623',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.85rem',
          backgroundColor: '#202025',
        }}>
          <img
            src={getUserAvatarUrl(user?.img, user?.name)}
            alt={user?.name || 'User'}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = getUserAvatarUrl('', user?.name);
            }}
          />
        </div>
        <h3 style={{
          color: '#F5A623',
          fontSize: '1.05rem',
          fontWeight: '600',
          margin: '0 0 4px',
          textAlign: 'center',
          maxWidth: '200px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {user?.name || 'Dhruv Rajput'}
        </h3>
        <p style={{
          color: '#8E8E93',
          fontSize: '0.82rem',
          margin: 0,
          textAlign: 'center',
          maxWidth: '200px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {user?.email || 'dhruv@gmail.com'}
        </p>
      </div>

      {/* Navigation Links */}
      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem 0',
        flex: 1,
      }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/user/profile'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.9rem 1.75rem',
              fontSize: '0.92rem',
              fontWeight: isActive ? '600' : '400',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: isActive ? '#242424' : 'transparent',
              color: isActive ? '#daa520' : '#d1d1d1',
              borderLeft: isActive ? '4px solid #daa520' : '4px solid transparent',
            })}
          >
            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Logout */}
        <div
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '0.9rem 1.75rem',
            fontSize: '0.92rem',
            fontWeight: '400',
            color: '#d1d1d1',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginTop: '0.5rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#EF4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#d1d1d1';
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>🚪</span>
          <span>Logout</span>
        </div>
      </nav>
    </aside>
  );
};

export default UserSidebar;
