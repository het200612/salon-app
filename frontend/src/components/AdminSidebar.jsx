import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '🎛️' },
    { label: 'Manage Cities', path: '/admin/cities', icon: '🏙️' },
    { label: 'Manage Areas', path: '/admin/areas', icon: '📍' },
    { label: 'Manage Salon Services', path: '/admin/services', icon: '✂️' },
    { label: 'Manage Users', path: '/admin/users', icon: '👥' },
    { label: 'Bookings', path: '/admin/bookings', icon: '📅' },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
    { label: 'Change Password', path: '/admin/change-password', icon: '🔒' },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#161616',
      borderRight: '1px solid #222222',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.5rem 1.75rem',
        borderBottom: '1px solid #222222',
      }}>
        <div style={{
          fontFamily: "'Ephesis', cursive, serif",
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#daa520',
          lineHeight: 1,
          letterSpacing: '1px',
        }}>
          Hair Harmony
        </div>
      </div>

      {/* Navigation List */}
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
            end={item.path === '/admin/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.85rem 1.75rem',
              fontSize: '0.95rem',
              fontWeight: isActive ? '600' : '400',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              backgroundColor: isActive ? '#242424' : 'transparent',
              color: isActive ? '#daa520' : '#e0e0e0',
              borderLeft: isActive ? '4px solid #daa520' : '4px solid transparent',
              fontFamily: "'Poppins', sans-serif",
            })}
          >
            <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Logout Item */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.85rem 1.75rem',
            fontSize: '0.95rem',
            fontWeight: '400',
            backgroundColor: 'transparent',
            border: 'none',
            borderLeft: '4px solid transparent',
            color: '#e0e0e0',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: "'Poppins', sans-serif",
            transition: 'all 0.2s',
            marginTop: 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.backgroundColor = '#242424';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#e0e0e0';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span style={{ fontSize: '1.15rem' }}>🚪</span>
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
