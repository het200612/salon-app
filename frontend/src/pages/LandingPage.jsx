import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SalonCard from '../components/SalonCard';
import heroBg from '../assets/hero-bg.png';

export const LandingPage = () => {
  const [salons, setSalons] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch Salons & Areas
  useEffect(() => {
    fetchSalons();
    fetchAreas();
  }, []);

  const fetchSalons = async (areaId = '') => {
    try {
      setLoading(true);
      const url = areaId ? `/salons?area=${areaId}` : '/salons';
      const res = await api.get(url);
      setSalons(res.data || []);
    } catch (err) {
      console.error('Error fetching salons:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      // Fetch areas from public or admin area endpoint
      const res = await api.get('/salons');
      if (res.data) {
        // Extract unique areas from salons list
        const uniqueAreas = [];
        const map = new Map();
        res.data.forEach((s) => {
          if (s.Area_id && !map.has(s.Area_id)) {
            map.set(s.Area_id, true);
            uniqueAreas.push({ id: s.Area_id, name: s.AreaName || `Area #${s.Area_id}` });
          }
        });
        setAreas(uniqueAreas);
      }
    } catch (err) {
      console.error('Error loading areas:', err);
    }
  };

  const handleAreaChange = (e) => {
    const areaId = e.target.value;
    setSelectedArea(areaId);
    fetchSalons(areaId);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <Navbar />

      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '5rem 2rem',
        backgroundImage: `linear-gradient(rgba(15, 16, 21, 0.75), rgba(15, 16, 21, 0.95)), url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={{ maxWidth: '850px', zIndex: 1 }}>
          <span style={{
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '1rem',
            display: 'inline-block',
          }}>
            Luxury Grooming & Styling Experience
          </span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            color: 'var(--color-text-main)',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            Where Style Meets <span style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>Perfection</span>
          </h1>
          <p style={{
            color: 'var(--color-text-muted)',
            fontSize: '1.2rem',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '650px',
            margin: '0 auto 2.5rem auto',
          }}>
            Discover elite salons, select your specialized service, and reserve your dedicated grooming time slot with ease.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href="#salons"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#0F1015',
                fontWeight: '700',
                padding: '0.9rem 2rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '1rem',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
            >
              Browse Top Salons
            </a>
            <Link
              to="/register"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-text-main)',
                border: '1px solid var(--color-border)',
                fontWeight: '600',
                padding: '0.9rem 2rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '1rem',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >
              Join as Salon Owner
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─────────────────────────────────────────────────────────── */}
      <section style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '2rem',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          textAlign: 'center',
        }}>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>
              500+
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Verified Luxury Salons</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>
              25k+
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Completed Appointments</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>
              4.9 / 5
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Client Satisfaction Rating</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>
              100%
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Confirmed Time Slots</div>
          </div>
        </div>
      </section>

      {/* ─── Salons Section ────────────────────────────────────────────────────── */}
      <section id="salons" style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}>
          <div>
            <span style={{ color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', fontWeight: '700' }}>
              Explore Locations
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--color-text-main)', marginTop: '0.3rem' }}>
              Premier Salons & Spas
            </h2>
          </div>

          {/* Area Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <label htmlFor="areaFilter" style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
              Filter by Area:
            </label>
            <select
              id="areaFilter"
              value={selectedArea}
              onChange={handleAreaChange}
              style={{
                backgroundColor: 'var(--color-card)',
                color: 'var(--color-text-main)',
                border: '1px solid var(--color-border)',
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">All Locations</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Salons Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
            <p>Loading available salons...</p>
          </div>
        ) : salons.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem',
          }}>
            {salons.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        ) : (
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '4rem 2rem',
            textAlign: 'center',
          }}>
            <h3 style={{ color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>No Salons Found in this Area</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Try selecting "All Locations" or check back soon.</p>
            <button
              onClick={() => { setSelectedArea(''); fetchSalons(''); }}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#0F1015',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              View All Salons
            </button>
          </div>
        )}
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--color-surface)', padding: '5rem 2rem', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', fontWeight: '700' }}>
            Seamless Experience
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--color-text-main)', marginTop: '0.3rem', marginBottom: '3rem' }}>
            How Hair Harmony Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            textAlign: 'left',
          }}>
            {/* Step 1 */}
            <div style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
            }}>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.2rem',
                marginBottom: '1.2rem',
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                Discover Top Salons
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Browse curated unisex, men's, and women's salons near your location with verified customer reviews and transparent service menus.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
            }}>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.2rem',
                marginBottom: '1.2rem',
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                Choose Service & Time Slot
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Select your preferred haircut, coloring, or grooming service and book a 1-hour hourly time slot that fits seamlessly into your schedule.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              position: 'relative',
            }}>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.2rem',
                marginBottom: '1.2rem',
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                Relax & Enjoy
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Receive instant email confirmations, arrive without waiting in queue, and enjoy an exceptional personalized styling session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── About Us Section ─────────────────────────────────────────────────── */}
      <section id="about" style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
        }}>
          <div>
            <span style={{ color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', fontWeight: '700' }}>
              About Hair Harmony
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--color-text-main)', marginTop: '0.3rem', marginBottom: '1.2rem' }}>
              Redefining Salon Appointments
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Hair Harmony was created to bridge the gap between discerning clients and premier beauty salons. We eliminate walk-in uncertainties and queue waiting through intelligent hourly time slot scheduling and verified service quality.
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.7 }}>
              Whether you are looking for a routine hair trim or an extensive luxury makeover, our network of certified salon owners ensures you receive personalized, punctual, and top-tier grooming care.
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-card)',
          }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '1.5rem', marginBottom: '1.2rem' }}>
              Why Clients Choose Us
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--color-text-main)' }}>
              <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <span>Direct real-time slot scheduling with instant confirmation emails.</span>
              </li>
              <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <span>Transparent pricing with no hidden walk-in charges.</span>
              </li>
              <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <span>Verified salon owners vetted and approved by platform administrators.</span>
              </li>
              <li style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <span>Flexible cancellation options with clear 3-hour advance policy.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Contact Section ───────────────────────────────────────────────────── */}
      <section id="contact" style={{ backgroundColor: 'var(--color-surface)', padding: '5rem 2rem', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', fontWeight: '700' }}>
            Get In Touch
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--color-text-main)', marginTop: '0.3rem', marginBottom: '1rem' }}>
            Have Questions or Need Assistance?
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Our dedicated support team is here to assist both clients and salon owners 7 days a week.
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            padding: '1rem 2rem',
            borderRadius: 'var(--radius-md)',
          }}>
            <span>✉️ <strong>support@hairharmony.com</strong></span>
            <span>|</span>
            <span>📞 <strong>+91 98765 43210</strong></span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
