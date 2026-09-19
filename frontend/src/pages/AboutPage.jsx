import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const AboutPage = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1015' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div style={{
          backgroundColor: '#181920',
          border: '1px solid #2E303E',
          borderRadius: '16px',
          padding: '3rem 2.5rem',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ color: '#daa520', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Welcome to Hair Harmony
            </span>
            <h1 style={{
              fontFamily: "'Ephesis', cursive, serif",
              fontSize: '3.5rem',
              color: '#daa520',
              margin: '0.25rem 0',
            }}>
              Crafting Elegance & Style
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '1.05rem', maxWidth: '650px', margin: '0.5rem auto 0' }}>
              Your premium gateway to top-tier salons, expert hairstylists, and effortless appointment scheduling.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ backgroundColor: '#22232D', padding: '1.5rem', borderRadius: '12px', border: '1px solid #2E303E' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💈</div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Curated Salons</h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.9rem', lineHeight: '1.6' }}>
                We partner with verified, upscale salons and certified stylists to ensure you receive world-class grooming and care.
              </p>
            </div>

            <div style={{ backgroundColor: '#22232D', padding: '1.5rem', borderRadius: '12px', border: '1px solid #2E303E' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚡</div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Instant Slot Booking</h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Say goodbye to waiting in line. Choose your preferred time slot, select your treatments, and book in seconds.
              </p>
            </div>

            <div style={{ backgroundColor: '#22232D', padding: '1.5rem', borderRadius: '12px', border: '1px solid #2E303E' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🛡️</div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Owner Control Suite</h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Salon owners gain comprehensive scheduling, seat capacity management, customer insights, and appointment tracking.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
