import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <header style={{ maxWidth: '640px' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2.5rem',
          color: 'var(--color-primary)',
          marginBottom: '1rem'
        }}>
          Hair Harmony
        </h1>
        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: '1.1rem',
          marginBottom: '2rem'
        }}>
          Premium Salon & Grooming Platform
        </p>
        <div style={{
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-card)'
        }}>
          <p style={{ color: 'var(--color-success)', fontWeight: '600' }}>
            ✨ Phase 1 Setup Complete
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Vite + React frontend and Node.js + Express backend scaffolding ready.
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;
