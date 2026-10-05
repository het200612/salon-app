import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OwnerLayout from '../../components/OwnerLayout';
import api from '../../services/api';

export const RegisterSalonPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    cityId: '',
    areaId: '',
    openTime: '09:00:00',
    closeTime: '20:00:00',
    numberOfSeats: '1',
    type: 'Unisex',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCitiesAndAreas();
  }, []);

  const fetchCitiesAndAreas = async () => {
    try {
      const [citiesRes, areasRes] = await Promise.all([
        api.get('/cities').catch(() => ({ data: [] })),
        api.get('/areas').catch(() => ({ data: [] })),
      ]);

      const loadedCities = citiesRes.data || [];
      const loadedAreas = areasRes.data || [];
      setCities(loadedCities);
      setAreas(loadedAreas);

      if (loadedCities.length > 0) {
        const firstCityId = loadedCities[0].id;
        const matchingAreas = loadedAreas.filter((a) => String(a.CityName_id) === String(firstCityId));
        setFormData((prev) => ({
          ...prev,
          cityId: firstCityId,
          areaId: matchingAreas.length > 0 ? matchingAreas[0].id : (loadedAreas[0]?.id || ''),
        }));
      }
    } catch (err) {
      console.error('Failed to load cities/areas:', err);
    }
  };

  const handleCityChange = (cityId) => {
    const matchingAreas = areas.filter((a) => String(a.CityName_id) === String(cityId));
    setFormData((prev) => ({
      ...prev,
      cityId,
      areaId: matchingAreas.length > 0 ? matchingAreas[0].id : '',
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseInt(formData.numberOfSeats, 10) <= 0) {
      setError('Number of seats must be at least 1.');
      return;
    }

    if (formData.openTime >= formData.closeTime) {
      setError('Closing time must be after opening time.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('location', formData.location);
      data.append('cityId', formData.cityId);
      data.append('areaId', formData.areaId);
      data.append('openTime', formData.openTime);
      data.append('closeTime', formData.closeTime);
      data.append('numberOfSeats', formData.numberOfSeats);
      data.append('type', formData.type);
      if (coverImage) {
        data.append('img', coverImage);
      }

      await api.post('/owner/salon', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/owner/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register salon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAreas = areas.filter((a) => {
    if (!formData.cityId) return true;
    return String(a.CityName_id) === String(formData.cityId);
  });

  return (
    <OwnerLayout activeMenu="register">
      <div className="owner-edit-container">
        <h2 className="owner-edit-title">Salon Registration</h2>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.95rem',
          }}>
            ⚠ {error}
          </div>
        )}

        <form className="owner-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="owner-form-group">
            <label htmlFor="name">Salon Name:</label>
            <input
              id="name"
              type="text"
              required
              placeholder="e.g. Royal Unisex Salon"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="owner-form-group">
            <label htmlFor="location">Address / Location:</label>
            <input
              id="location"
              type="text"
              required
              placeholder="e.g. Shop 12, Golden Plaza"
              value={formData.location}
              onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
            />
          </div>

          <div className="owner-form-group">
            <label htmlFor="cityId">City:</label>
            <select
              id="cityId"
              required
              value={formData.cityId}
              onChange={(e) => handleCityChange(e.target.value)}
            >
              <option value="">--Select City--</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.CityName}
                </option>
              ))}
            </select>
          </div>

          <div className="owner-form-group">
            <label htmlFor="areaId">Area:</label>
            <select
              id="areaId"
              required
              value={formData.areaId}
              onChange={(e) => setFormData((p) => ({ ...p, areaId: e.target.value }))}
            >
              <option value="">--Select Area--</option>
              {filteredAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.AreaName}
                </option>
              ))}
            </select>
          </div>

          <div className="owner-form-group">
            <label htmlFor="openTime">Opening Time:</label>
            <input
              id="openTime"
              type="text"
              required
              value={formData.openTime}
              onChange={(e) => setFormData((p) => ({ ...p, openTime: e.target.value }))}
            />
          </div>

          <div className="owner-form-group">
            <label htmlFor="closeTime">Closing Time:</label>
            <input
              id="closeTime"
              type="text"
              required
              value={formData.closeTime}
              onChange={(e) => setFormData((p) => ({ ...p, closeTime: e.target.value }))}
            />
          </div>

          <div className="owner-form-group">
            <label htmlFor="numberOfSeats">Total Styling Seats:</label>
            <input
              id="numberOfSeats"
              type="number"
              min="1"
              required
              value={formData.numberOfSeats}
              onChange={(e) => setFormData((p) => ({ ...p, numberOfSeats: e.target.value }))}
            />
          </div>

          <div className="owner-form-group">
            <label htmlFor="type">Salon Category / Type:</label>
            <select
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="Unisex">Unisex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="owner-form-group">
            <label htmlFor="salonCover">Cover Image:</label>
            <input
              id="salonCover"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <button type="submit" className="owner-btn-save" disabled={loading}>
            {loading ? 'Registering...' : 'Register Salon'}
          </button>
        </form>
      </div>
    </OwnerLayout>
  );
};

export default RegisterSalonPage;
