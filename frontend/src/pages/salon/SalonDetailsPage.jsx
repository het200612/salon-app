import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getImageUrl } from '../../utils/imageUrl';
import api from '../../services/api';

export const SalonDetailsPage = () => {
  const { id } = useParams();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchSalonDetails();
  }, [id]);

  const fetchSalonDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/salons/${id}`);
      setSalon(res.data.salon);
      setServices(res.data.services || []);
      setImages(res.data.images || []);
    } catch (err) {
      console.error('Failed to load salon details:', err);
      setError('Unable to load salon details at this time.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1015' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#daa520', fontSize: '1.2rem' }}>
          Loading Salon Profile...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1015' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#EF4444', padding: '2rem' }}>
          <h2>{error || 'Salon not found'}</h2>
          <Link to="/" style={{ marginTop: '1rem', color: '#daa520', textDecoration: 'underline' }}>
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1015' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Salon Hero Banner */}
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#181920',
          border: '1px solid #2E303E',
          marginBottom: '2.5rem',
        }}>
          <div style={{
            height: '320px',
            width: '100%',
            position: 'relative',
          }}>
            <img
              src={getImageUrl(salon.Img)}
              alt={salon.Name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.65)',
              }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80';
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '2rem',
              background: 'linear-gradient(to top, rgba(15,16,21,0.95), transparent)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '1rem',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{
                    backgroundColor: '#daa520',
                    color: '#121212',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}>
                    {salon.Type || 'Unisex'}
                  </span>
                  <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                    📍 {salon.AreaName}, {salon.CityName}
                  </span>
                </div>
                <h1 style={{
                  color: '#fff',
                  fontSize: '2.4rem',
                  fontWeight: '700',
                  margin: 0,
                  fontFamily: "'Poppins', sans-serif",
                }}>
                  {salon.Name}
                </h1>
                <p style={{ color: '#D1D5DB', margin: '6px 0 0', fontSize: '0.95rem' }}>
                  {salon.Location}
                </p>
              </div>

              {/* Book Action CTA */}
              <Link
                to={`/salon/${salon.id}/book`}
                style={{
                  backgroundColor: '#daa520',
                  color: '#121212',
                  padding: '0.9rem 2rem',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '1.05rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(218, 165, 32, 0.4)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffd700';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#daa520';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                ✂️ Book Appointment
              </Link>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            padding: '1.25rem 2rem',
            backgroundColor: '#1E1F29',
            borderTop: '1px solid #2E303E',
            gap: '1rem',
          }}>
            <div>
              <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Opening Hours</div>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>
                {salon.OpenTime} – {salon.CloseTime}
              </div>
            </div>
            <div>
              <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Capacity</div>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>
                🪑 {salon.NumberOfSeats} Styling Stations
              </div>
            </div>
            <div>
              <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Contact Host</div>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>
                📞 {salon.OwnerPhone || 'Available upon booking'}
              </div>
            </div>
            <div>
              <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Salon Owner</div>
              <div style={{ color: '#daa520', fontWeight: '600', fontSize: '0.95rem' }}>
                👤 {salon.OwnerName}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section: Services & Gallery */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          {/* Services Menu */}
          <section style={{
            backgroundColor: '#181920',
            border: '1px solid #2E303E',
            borderRadius: '12px',
            padding: '1.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{
                color: '#fff',
                fontSize: '1.4rem',
                margin: 0,
                fontFamily: "'Poppins', sans-serif",
              }}>
                Available Services & Pricing
              </h2>
              <span style={{ color: '#daa520', fontSize: '0.9rem', fontWeight: '600' }}>
                {services.length} Services
              </span>
            </div>

            {services.length === 0 ? (
              <p style={{ color: '#9CA3AF' }}>No specific services listed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      backgroundColor: '#22232D',
                      border: '1px solid #2E303E',
                      borderRadius: '8px',
                    }}
                  >
                    <div>
                      <h4 style={{ color: '#fff', margin: 0, fontSize: '1.05rem' }}>
                        {srv.serviceName}
                      </h4>
                      <p style={{ color: '#9CA3AF', margin: '2px 0 0', fontSize: '0.8rem' }}>
                        Professional service delivered by certified specialists
                      </p>
                    </div>
                    <div style={{
                      color: '#10B981',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      whiteSpace: 'nowrap',
                    }}>
                      ₹{srv.price}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Salon Photo Gallery */}
          <aside style={{
            backgroundColor: '#181920',
            border: '1px solid #2E303E',
            borderRadius: '12px',
            padding: '1.75rem',
          }}>
            <h2 style={{
              color: '#fff',
              fontSize: '1.4rem',
              margin: '0 0 1.25rem',
              fontFamily: "'Poppins', sans-serif",
            }}>
              Salon Gallery
            </h2>

            {images.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#22232D',
                borderRadius: '8px',
                color: '#9CA3AF',
                fontSize: '0.9rem',
              }}>
                📷 No additional photos uploaded yet.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
              }}>
                {images.map((img) => (
                  <img
                    key={img.id}
                    src={getImageUrl(img.img)}
                    alt="Salon gallery view"
                    onClick={() => setSelectedPhoto(getImageUrl(img.img))}
                    style={{
                      width: '100%',
                      height: '110px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: '1px solid #2E303E',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                ))}
              </div>
            )}

            {/* Book Button */}
            <div style={{ marginTop: '1.75rem' }}>
              <Link
                to={`/salon/${salon.id}/book`}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  backgroundColor: '#daa520',
                  color: '#121212',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  textDecoration: 'none',
                }}
              >
                Schedule Appointment
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={selectedPhoto}
            alt="Enlarged gallery view"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '8px',
              border: '2px solid #daa520',
              boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            }}
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SalonDetailsPage;
