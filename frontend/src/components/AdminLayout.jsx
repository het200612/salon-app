import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import logoEmblem from '../assets/logo-emblem.png';
import './AdminLayout.css';

export const AdminLayout = ({ children, headerTitle = 'Dashboard Overview', activeMenu, customStats }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [stats, setStats] = useState({
    totalSalons: 0,
    totalUsers: 0,
    bookingsToday: 0,
  });

  useEffect(() => {
    if (customStats) {
      setStats({
        totalSalons: customStats.totalSalons ?? 0,
        totalUsers: customStats.totalUsers ?? 0,
        bookingsToday: customStats.bookingsToday ?? 0,
      });
      return;
    }

    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (isMounted && res.data) {
          const counts = res.data.counts || res.data;
          setStats({
            totalSalons: counts.totalSalons ?? 0,
            totalUsers: counts.totalUsers ?? 0,
            bookingsToday: counts.bookingsToday ?? 0,
          });
        }
      } catch (err) {
        console.warn('Could not load dashboard stats for admin header:', err);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [customStats]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'fas fa-tachometer-alt', key: 'dashboard' },
    { label: 'Manage Cities', path: '/admin/cities', icon: 'fas fa-city', key: 'cities' },
    { label: 'Manage Areas', path: '/admin/areas', icon: 'fas fa-map-marker-alt', key: 'areas' },
    { label: 'Manage Salon Services', path: '/admin/services', icon: 'fas fa-store', key: 'services' },
    { label: 'Change Password', path: '/admin/change-password', icon: 'fas fa-key', key: 'change-password' },
  ];

  return (
    <div className="admin-wrapper">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', padding: '1.25rem 1rem' }}>
          <img
            src={logoEmblem}
            alt="Hair Harmony Symbol"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #d4af37',
              boxShadow: '0 2px 10px rgba(212, 175, 55, 0.25)',
            }}
          />
          <NavLink to="/admin/dashboard" className="admin-logo-title">
            HairHarmony
          </NavLink>
        </div>

        <nav className="admin-sidebar-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin/dashboard'}
              className={({ isActive }) =>
                `admin-menu-item ${isActive || activeMenu === item.key ? 'active' : ''}`
              }
              onClick={() => {
                if (window.innerWidth <= 768) {
                  setSidebarOpen(false);
                }
              }}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <button onClick={handleLogout} className="admin-menu-item" style={{ marginTop: 'auto' }}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`admin-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-title">
            <button
              type="button"
              className="admin-menu-toggle-btn"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle Sidebar"
              title="Toggle Menu"
            >
              <i className="fas fa-bars"></i>
            </button>
            <span>{headerTitle}</span>
          </div>

          <div className="admin-user-menu">
            <i className="fas fa-bell" title="Notifications"></i>
            <i className="fas fa-user-circle" title="Admin Profile"></i>
            <i
              className="fas fa-sign-out-alt"
              title="Logout"
              onClick={handleLogout}
              style={{ cursor: 'pointer' }}
            ></i>
          </div>
        </header>

        {/* Dashboard 3 Stat Cards */}
        <div className="admin-dashboard-cards">
          <div className="admin-stat-card">
            <div className="admin-stat-info">
              <h3>{stats.totalSalons}</h3>
              <p>Total Salons</p>
            </div>
            <div className="admin-stat-icon">
              <i className="fas fa-store"></i>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Active Users</p>
            </div>
            <div className="admin-stat-icon">
              <i className="fas fa-users"></i>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-info">
              <h3>{stats.bookingsToday}</h3>
              <p>Bookings Today</p>
            </div>
            <div className="admin-stat-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
          </div>
        </div>

        {/* Page Body */}
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
