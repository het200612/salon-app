import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';

export const AdminSettingsPage = () => {
  const [appName, setAppName] = useState('Hair Harmony');
  const [supportEmail, setSupportEmail] = useState('support@hairharmony.com');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#111111',
      color: '#ffffff',
      fontFamily: "'Poppins', sans-serif",
    }}>
      <AdminSidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          height: '65px',
          backgroundColor: '#161616',
          borderBottom: '1px solid #222222',
          display: 'flex',
          alignItems: 'center',
          padding: '0 2rem',
          color: '#daa520',
          fontWeight: '600',
        }}>
          Platform Settings
        </header>

        <main style={{ padding: '2rem', flex: 1 }}>
          <div style={{
            backgroundColor: '#161616',
            borderRadius: '10px',
            border: '1px solid #222222',
            padding: '2rem',
            maxWidth: '600px',
          }}>
            <h2 style={{ color: '#daa520', fontSize: '1.6rem', marginBottom: '1.5rem' }}>
              System Configuration
            </h2>

            {saved && (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem',
              }}>
                ✓ Settings saved successfully.
              </div>
            )}

            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.4rem' }}>Application Name</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.4rem' }}>System Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#222',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#daa520',
                  color: '#000',
                  border: 'none',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Save Settings
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
