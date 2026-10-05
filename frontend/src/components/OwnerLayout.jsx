import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserAvatarUrl } from '../utils/imageUrl';
import './OwnerLayout.css';

export const OwnerLayout = ({ children, activeMenu, salon }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Profile', path: '/owner/dashboard', icon: 'fas fa-user', key: 'profile' },
  ];

  if (!salon || !salon.Name) {
    navItems.push({
      label: 'Salon Registration',
      path: '/owner/register-salon',
      icon: 'fas fa-store',
      key: 'register',
    });
  }

  navItems.push(
    { label: 'Services', path: '/owner/services', icon: 'fas fa-cut', key: 'services' },
    { label: 'Image Upload', path: '/owner/images', icon: 'fas fa-images', key: 'images' }
  );

  const avatarSrc = getUserAvatarUrl(user?.img, user?.name);

  return (
    <div className="owner-layout-wrapper">
      {/* Mobile Toggle Button */}
      <button
        className="owner-mobile-toggle"
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
      <aside className={`owner-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="owner-sidebar-header">
          <img
            src={avatarSrc}
            alt={user?.name || 'Owner Profile'}
            className="owner-sidebar-pic"
            onError={(e) => {
              e.target.src = getUserAvatarUrl('', user?.name);
            }}
          />
          <div className="owner-sidebar-username">{user?.name || 'Salon Owner'}</div>
          <div className="owner-sidebar-salon">{salon?.Name || 'Owner Portal'}</div>
        </div>

        <nav className="owner-sidebar-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/owner/dashboard'}
              className={({ isActive }) =>
                `owner-menu-item ${isActive || activeMenu === item.key ? 'active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <button onClick={handleLogout} className="owner-menu-item" style={{ marginTop: 'auto' }}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="owner-main-content">{children}</main>
    </div>
  );
};

export default OwnerLayout;
