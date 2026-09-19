import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

export const SalonCard = ({ salon }) => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please log in as a customer to book an appointment.', redirect: `/salon/${salon.id}` } });
    } else if (role?.toLowerCase() === 'user') {
      navigate(`/salon/${salon.id}`);
    } else {
      navigate(`/salon/${salon.id}`);
    }
  };

  const imageSrc = getImageUrl(salon.Img || salon.img);

  return (
    <div style={{
      backgroundColor: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      boxShadow: 'var(--shadow-card)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.borderColor = 'var(--color-primary)';
      e.currentTarget.style.boxShadow = '0 15px 35px rgba(212, 175, 55, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'var(--color-border)';
      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
    }}
    >
      {/* Cover Image */}
      <div style={{ position: 'relative', height: '200px', backgroundColor: '#181920', overflow: 'hidden' }}>
        <img
          src={imageSrc}
          alt={salon.Name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onError={(e) => {
            e.target.src = '/vite.svg';
          }}
        />
        {/* Salon Type Tag */}
        <span style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: 'rgba(15, 16, 21, 0.85)',
          color: 'var(--color-primary)',
          fontSize: '0.75rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: '20px',
          backdropFilter: 'blur(6px)',
          border: '1px solid var(--color-border)',
        }}>
          {salon.Type || 'Unisex'}
        </span>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.3rem',
          fontWeight: '600',
          color: 'var(--color-text-main)',
          marginBottom: '0.4rem',
        }}>
          {salon.Name}
        </h3>

        {/* Location & City */}
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.5rem',
        }}>
          <span>📍</span>
          <span>{salon.Location ? `${salon.Location}, ` : ''}{salon.AreaName || 'City Area'}, {salon.CityName || ''}</span>
        </p>

        {/* Owner Phone */}
        {salon.OwnerPhone && (
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '0.8rem',
          }}>
            <span>📞</span>
            <span>+91 {salon.OwnerPhone}</span>
          </p>
        )}

        {/* Services Badges */}
        <div style={{ marginBottom: '1.2rem', flexGrow: 1 }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.4rem', fontWeight: '600' }}>
            Featured Services:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {salon.services && salon.services.length > 0 ? (
              salon.services.slice(0, 3).map((srv) => (
                <span
                  key={srv.id || srv.serviceName}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    color: 'var(--color-text-main)',
                  }}
                >
                  {srv.serviceName || srv.ServiceName}: <strong style={{ color: 'var(--color-primary)' }}>₹{srv.price || srv.Price}</strong>
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                Hair Styling, Grooming & Care
              </span>
            )}
            {salon.services && salon.services.length > 3 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', alignSelf: 'center' }}>
                +{salon.services.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleBookClick}
          style={{
            width: '100%',
            backgroundColor: 'var(--color-primary)',
            color: '#0F1015',
            fontWeight: '600',
            fontSize: '0.9rem',
            padding: '0.7rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
        >
          <span>Book Appointment</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default SalonCard;
