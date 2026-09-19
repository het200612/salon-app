import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#0A0A0D',
      borderTop: '1px solid var(--color-border)',
      padding: '4rem 2rem 2rem',
      color: 'var(--color-text-muted)',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '2.5rem',
        marginBottom: '3rem',
      }}>
        {/* Column 1: Brand */}
        <div>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-primary)',
            fontSize: '1.5rem',
            marginBottom: '1rem',
          }}>
            Hair Harmony
          </h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '300px' }}>
            Elevating your grooming experience with premium salons, expert stylists, and effortless digital booking.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 style={{ color: 'var(--color-text-main)', fontSize: '1rem', marginBottom: '1rem' }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
            <li><Link to="/" style={{ transition: 'var(--transition-fast)' }}>Explore Salons</Link></li>
            <li><Link to="/login" style={{ transition: 'var(--transition-fast)' }}>Sign In / Register</Link></li>
            <li><a href="/#about">About Us</a></li>
            <li><a href="/#contact">Customer Support</a></li>
          </ul>
        </div>

        {/* Column 3: Partner with Us */}
        <div>
          <h4 style={{ color: 'var(--color-text-main)', fontSize: '1rem', marginBottom: '1rem' }}>
            For Salon Owners
          </h4>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Expand your clientele and streamline appointment scheduling with our partner dashboard.
          </p>
          <Link
            to="/register"
            style={{
              display: 'inline-block',
              fontSize: '0.85rem',
              color: 'var(--color-primary)',
              borderBottom: '1px solid var(--color-primary)',
              paddingBottom: '2px',
            }}
          >
            Register Your Salon →
          </Link>
        </div>

        {/* Column 4: Contact */}
        <div>
          <h4 style={{ color: 'var(--color-text-main)', fontSize: '1rem', marginBottom: '1rem' }}>
            Contact & Support
          </h4>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            📍 Mumbai, Surat, Ahmedabad, Vadodara<br />
            📞 +91 98765 43210<br />
            ✉️ support@hairharmony.com
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.85rem',
      }}>
        <span>&copy; {new Date().getFullYear()} Hair Harmony. All rights reserved.</span>
        <span>Crafted for premium grooming & salon convenience.</span>
      </div>
    </footer>
  );
};

export default Footer;
