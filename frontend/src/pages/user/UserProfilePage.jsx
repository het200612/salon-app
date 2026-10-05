import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../components/UserLayout';
import { getImageUrl } from '../../utils/imageUrl';
import api from '../../services/api';

export const UserProfilePage = () => {
  const [salons, setSalons] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [searchTrigger, setSearchTrigger] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [salonsRes, areasRes, citiesRes] = await Promise.all([
        api.get('/salons'),
        api.get('/areas').catch(() => api.get('/salons/areas')).catch(() => ({ data: [] })),
        api.get('/cities').catch(() => ({ data: [] })),
      ]);
      setSalons(salonsRes.data || []);
      setAreas(areasRes.data || []);
      setCities(citiesRes.data || []);
    } catch (err) {
      console.error('Failed to load salons:', err);
      setError('Unable to load salons at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (cityId) => {
    setSelectedCity(cityId);
    setSelectedArea('all');
    setSearchTrigger('all');
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearchTrigger(selectedArea);
  };

  const filteredAreas = areas.filter((area) => {
    if (selectedCity === 'all' || !selectedCity) return true;
    return String(area.CityName_id) === String(selectedCity);
  });

  const filteredSalons = salons.filter((salon) => {
    if (selectedCity !== 'all' && selectedCity) {
      const matchCity =
        String(salon.City_id) === String(selectedCity) ||
        (salon.CityName && salon.CityName.toLowerCase() === String(selectedCity).toLowerCase());
      if (!matchCity) return false;
    }

    if (searchTrigger === 'all' || !searchTrigger) return true;
    return (
      String(salon.Area_id) === String(searchTrigger) ||
      String(salon.AreaName_id) === String(searchTrigger) ||
      (salon.AreaName && salon.AreaName.toLowerCase() === String(searchTrigger).toLowerCase())
    );
  });

  const formatOpenTime = (timeStr) => {
    if (!timeStr) return '9 a.m.';
    try {
      const [h, m] = timeStr.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
      const formattedH = hour % 12 || 12;
      return `${formattedH}${parseInt(m, 10) > 0 ? `:${m}` : ''} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <UserLayout activeMenu="profile">
      {/* Filter Section matching Page 1 Screenshot 1 */}
      <div className="user-filter-section">
        <h2 className="user-filter-title">Find Salons</h2>

        <form className="user-filter-group" onSubmit={handleSearch}>
          <select
            className="user-area-select"
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
          >
            <option value="all">Select City</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.CityName}
              </option>
            ))}
          </select>

          <select
            className="user-area-select"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            <option value="all">Select Area</option>
            {filteredAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.AreaName || area.name}
              </option>
            ))}
          </select>

          <button type="submit" className="user-search-btn">
            <i className="fas fa-search"></i>
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Salons Grid matching Page 1 Screenshot 1 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#d4af37', fontSize: '1.2rem' }}>
          <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading salons...
        </div>
      ) : error ? (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          color: '#ef4444',
          padding: '1.25rem',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          {error}
        </div>
      ) : filteredSalons.length === 0 ? (
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px dashed #333',
          borderRadius: '12px',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: '#888888',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💈</div>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Salons Found</h3>
          <p>No salons available in this area. Try selecting a different area or 'Select Area' for all.</p>
        </div>
      ) : (
        <div className="user-salon-grid">
          {filteredSalons.map((salon) => {
            const imageSrc = getImageUrl(salon.Img || salon.img);
            const opensAt = formatOpenTime(salon.OpenTime);
            const phone = salon.OwnerPhone || salon.PhoneNumber || '1212121212';

            return (
              <div key={salon.id} className="user-salon-card">
                <img
                  src={imageSrc}
                  alt={salon.Name}
                  className="user-salon-image"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80';
                  }}
                />

                <div className="user-salon-info">
                  <h3 className="user-salon-name" title={salon.Name}>
                    {salon.Name}
                  </h3>

                  <div className="user-salon-details">
                    <span>
                      <i className="far fa-clock"></i> Opens {opensAt}
                    </span>
                    <span>
                      <i className="fas fa-phone"></i> {phone}
                    </span>
                  </div>

                  <div className="user-salon-rating">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <span className="user-salon-reviews">(100 reviews)</span>
                  </div>

                  <Link to={`/salon/${salon.id}`} className="user-book-btn">
                    Book Appointment
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </UserLayout>
  );
};

export default UserProfilePage;
