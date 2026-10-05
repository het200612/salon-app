import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserAvatarUrl } from '../utils/imageUrl';
import './UserLayout.css';

export const UserLayout = ({ children, activeMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Profile', path: '/user/profile', icon: 'fas fa-user', key: 'profile' },
    { label: 'Booking History', path: '/user/bookings', icon: 'fas fa-history', key: 'bookings' },
    { label: 'Change Password', path: '/user/change-password', icon: 'fas fa-lock', key: 'change-password' },
    { label: 'Edit Profile', path: '/user/edit-profile', icon: 'fas fa-pen', key: 'edit-profile' },
  ];

  const avatarSrc = getUserAvatarUrl(user?.img, user?.name);

  return (
    <div className="user-layout-wrapper">
      {/* Mobile Toggle Button */}
      <button
        className="user-mobile-toggle"
        onClick={() => setSidebarOpen((prev) => !prev)}
        aria-label="Toggle Menu"
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(2px)',
            zIndex: 999,
            cursor: 'pointer',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`user-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="user-sidebar-header">
          <img
            src={avatarSrc}
            alt={user?.name || 'User Profile'}
            className="user-sidebar-pic"
            onError={(e) => {
              e.target.src = getUserAvatarUrl('', user?.name);
            }}
          />
          <div className="user-sidebar-username">{user?.name || 'Dhruv Rajput'}</div>
          <div className="user-sidebar-email">{user?.email || 'dhruv@gmail.com'}</div>
        </div>

        <nav className="user-sidebar-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/user/profile'}
              className={({ isActive }) =>
                `user-menu-item ${isActive || activeMenu === item.key ? 'active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <button onClick={handleLogout} className="user-menu-item" style={{ marginTop: 'auto' }}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="user-main-content">
        {children}
      </main>
    </div>
  );
};

export default UserLayout;
