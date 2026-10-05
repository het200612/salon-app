import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import OwnerLayout from '../../components/OwnerLayout';
import { getImageUrl } from '../../utils/imageUrl';
import api from '../../services/api';

export const EditSalonPage = () => {
  const navigate = useNavigate();
  const [salonId, setSalonId] = useState(null);
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
  const [existingImg, setExistingImg] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSalonData();
  }, []);

  const loadSalonData = async () => {
    try {
      setLoading(true);
      setError('');
      const [profileRes, citiesRes, areasRes] = await Promise.all([
        api.get('/owner/profile'),
        api.get('/cities').catch(() => ({ data: [] })),
        api.get('/areas').catch(() => ({ data: [] })),
      ]);

      setCities(citiesRes.data || []);
      setAreas(areasRes.data || []);

      if (profileRes.data?.needsSalon || !profileRes.data?.salon) {
        navigate('/owner/register-salon');
        return;
      }

      const s = profileRes.data.salon;
      setSalonId(s.id);
      setExistingImg(s.Img || '');
      setFormData({
        name: s.Name || '',
        location: s.Location || '',
        cityId: s.City_id || '',
        areaId: s.Area_id || '',
        openTime: s.OpenTime ? (s.OpenTime.length === 5 ? `${s.OpenTime}:00` : s.OpenTime) : '09:00:00',
        closeTime: s.CloseTime ? (s.CloseTime.length === 5 ? `${s.CloseTime}:00` : s.CloseTime) : '20:00:00',
        numberOfSeats: String(s.NumberOfSeats || '1'),
        type: s.Type || 'Unisex',
      });
    } catch (err) {
      console.error('Failed to load salon:', err);
      setError('Unable to load salon profile for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (cityId) => {
    const matchingAreas = areas.filter((a) => String(a.CityName_id) === String(cityId));
    setFormData((prev) => ({
      ...prev,
      cityId,
      areaId: matchingAreas.some((a) => String(a.id) === String(prev.areaId))
        ? prev.areaId
        : (matchingAreas.length > 0 ? String(matchingAreas[0].id) : ''),
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
    if (!salonId) return;

    setError('');
    setMessage('');

    if (parseInt(formData.numberOfSeats, 10) <= 0) {
      setError('Number of seats must be at least 1.');
      return;
    }

    if (formData.openTime >= formData.closeTime) {
      setError('Closing time must be after opening time.');
      return;
    }

    try {
      setSaving(true);
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('location', formData.location.trim());
      data.append('cityId', formData.cityId);
      data.append('areaId', formData.areaId);
      data.append('openTime', formData.openTime);
      data.append('closeTime', formData.closeTime);
      data.append('numberOfSeats', formData.numberOfSeats);
      data.append('type', formData.type);

      if (coverImage) {
        data.append('img', coverImage);
      }

      const res = await api.put(`/owner/salon/${salonId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Salon profile updated successfully!');
      if (res.data?.salon?.Img) {
        setExistingImg(res.data.salon.Img);
      }
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Update salon error:', err);
      setError(err.response?.data?.message || 'Failed to update salon profile.');
    } finally {
      setSaving(false);
    }
  };

  const filteredAreas = areas.filter((a) => {
    if (!formData.cityId) return true;
    return String(a.CityName_id) === String(formData.cityId);
  });

  return (
    <OwnerLayout activeMenu="profile">
      <div className="owner-edit-container">
        <h2 className="owner-edit-title">
          Edit Salon: {formData.name || 'Salon'}
        </h2>

        {message && (
          <div style={{
            backgroundColor: 'rgba(46, 204, 113, 0.15)',
            border: '1px solid #2ecc71',
            color: '#2ecc71',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.95rem',
          }}>
            ✓ {message}
          </div>
        )}

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

        {loading ? (
          <div style={{ textAlign: 'center', color: '#d4af37', padding: '2rem' }}>
            <i className="fas fa-spinner fa-spin"></i> Loading salon data...
          </div>
        ) : (
          <form className="owner-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="owner-form-group">
              <label htmlFor="name">Name:</label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="owner-form-group">
              <label htmlFor="location">Location:</label>
              <input
                id="location"
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
              />
            </div>

            <div className="owner-form-group">
              <label htmlFor="img">Img:</label>
              <div style={{
                background: '#242424',
                border: '2px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}>
                {existingImg && (
                  <div style={{ fontSize: '0.85rem', color: '#aaa' }}>
                    Currently:{' '}
                    <a
                      href={getImageUrl(existingImg)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#d4af37', textDecoration: 'underline' }}
                    >
                      {existingImg}
                    </a>
                  </div>
                )}
                <div>
                  <span style={{ fontSize: '0.9rem', color: '#ccc', marginRight: '8px' }}>
                    Change:
                  </span>
                  <input
                    id="img"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="owner-form-group">
              <label htmlFor="numberOfSeats">NumberOfSeats:</label>
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
              <label htmlFor="openTime">OpenTime:</label>
              <input
                id="openTime"
                type="text"
                required
                value={formData.openTime}
                onChange={(e) => setFormData((p) => ({ ...p, openTime: e.target.value }))}
              />
            </div>

            <div className="owner-form-group">
              <label htmlFor="closeTime">CloseTime:</label>
              <input
                id="closeTime"
                type="text"
                required
                value={formData.closeTime}
                onChange={(e) => setFormData((p) => ({ ...p, closeTime: e.target.value }))}
              />
            </div>

            <div className="owner-form-group">
              <label htmlFor="type">Type:</label>
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

            <button type="submit" className="owner-btn-save" disabled={saving}>
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </OwnerLayout>
  );
};

export default EditSalonPage;
