import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SalonCard from '../components/SalonCard';
import slide1 from '../assets/slide1.jpg';
import slide2 from '../assets/slide2.jpg';
import slide3 from '../assets/slide3.jpg';

export const LandingPage = () => {
  const [salons, setSalons] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const slides = [
    {
      img: slide1,
      title: 'Find and Book Your Perfect Salon',
      subtitle: 'Discover top-rated salons and book your appointment instantly',
    },
    {
      img: slide2,
      title: 'Expert Stylists & Luxury Care',
      subtitle: 'Experience premier salon treatments tailored to your style',
    },
    {
      img: slide3,
      title: 'Effortless Time Slot Scheduling',
      subtitle: 'No waiting in queues — reserve your dedicated appointment online',
    },
  ];

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

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
      const res = await api.get('/salons');
      if (res.data) {
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#121212', color: '#ffffff', fontFamily: "'Poppins', sans-serif" }}>
      <Navbar />

      {/* ─── Hero Section with Carousel ────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: '600px', width: '100%', overflow: 'hidden' }}>
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: currentSlide === index ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              backgroundImage: `url(${slide.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Dark Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
            }} />
          </div>
        ))}

        {/* Carousel Text Content */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 5,
          width: '90%',
          maxWidth: '850px',
        }}>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '1rem',
            lineHeight: 1.2,
          }}>
            {slides[currentSlide].title}
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#e0e0e0',
            fontWeight: '400',
            maxWidth: '650px',
            margin: '0 auto',
          }}>
            {slides[currentSlide].subtitle}
          </p>
        </div>

        {/* Carousel Left / Right Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          style={{
            position: 'absolute',
            left: '25px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '2.5rem',
            cursor: 'pointer',
            zIndex: 10,
            padding: '10px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'; }}
        >
          &#10094;
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          style={{
            position: 'absolute',
            right: '25px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '2.5rem',
            cursor: 'pointer',
            zIndex: 10,
            padding: '10px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'; }}
        >
          &#10095;
        </button>
      </div>

      {/* ─── Find Salons Near You ──────────────────────────────────────────────── */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.3rem' }}>
              Find Salons Near You
            </h2>
            <p style={{ color: '#b3b3b3', fontSize: '0.95rem' }}>
              Explore top-rated salons across different cities
            </p>
          </div>

          {/* Area Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#b3b3b3' }}>Filter by Location:</span>
            <select
              value={selectedArea}
              onChange={handleAreaChange}
              style={{
                backgroundColor: '#1e1e1e',
                color: '#ffffff',
                border: '1px solid #333',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
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
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#b3b3b3' }}>
            <p>Loading salons...</p>
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
            backgroundColor: '#1e1e1e',
            border: '1px dashed #333',
            borderRadius: '10px',
            padding: '3rem',
            textAlign: 'center',
          }}>
            <p style={{ color: '#b3b3b3', marginBottom: '1rem' }}>No salons found in this area.</p>
            <button
              onClick={() => { setSelectedArea(''); fetchSalons(''); }}
              style={{
                backgroundColor: '#ffd700',
                color: '#1a1a1a',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: '5px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Show All Salons
            </button>
          </div>
        )}
      </section>

      {/* ─── About Us Section ─────────────────────────────────────────────────── */}
      <section id="about" style={{ backgroundColor: '#1a1a1a', padding: '4rem 2rem', borderTop: '1px solid #2a2a2a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem', textAlign: 'center' }}>
            About Hair Harmony
          </h2>
          <p style={{ color: '#b3b3b3', textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
            Hair Harmony connects discerning clients with verified salons and barbers. Effortlessly explore services, view clear pricing, and schedule hourly appointments online without waiting in queues.
          </p>
        </div>
      </section>

      {/* ─── Contact Section ───────────────────────────────────────────────────── */}
      <section id="contact" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
            Contact Us
          </h2>
          <p style={{ color: '#b3b3b3', marginBottom: '1.5rem' }}>
            Need support or have inquiries? We are here to help.
          </p>
          <div style={{ display: 'inline-flex', gap: '2rem', backgroundColor: '#1e1e1e', padding: '1rem 2rem', borderRadius: '8px', border: '1px solid #333' }}>
            <span>📞 +91 98765 43210</span>
            <span>✉️ support@hairharmony.com</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
