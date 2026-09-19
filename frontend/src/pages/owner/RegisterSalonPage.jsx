import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';

export const RegisterSalonPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    cityId: '',
    areaId: '',
    openTime: '09:00',
    closeTime: '21:00',
    numberOfSeats: '5',
    type: 'Unisex',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
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
        api.get('/salons/areas').catch(() => ({ data: [] })),
        api.get('/salons/areas').catch(() => ({ data: [] })),
      ]);
      // Let's also fetch from admin cities if available or public salons
      const res = await api.get('/salons/areas');
      setAreas(res.data || []);
      // Extract unique cities if present
      const uniqueCities = Array.from(new Set((res.data || []).map((a) => a.City_id))).map((id) => ({
        id,
        CityName: 'City ' + id,
      }));
      setCities(uniqueCities);
      if (res.data?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          areaId: res.data[0].id,
          cityId: res.data[0].City_id,
        }));
      }
    } catch (err) {
      console.error('Failed to load cities/areas:', err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
      setError(err.response?.data?.message || 'Failed to register salon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1015' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '800px', width: '100%', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        <div style={{
          backgroundColor: '#181920',
          border: '1px solid #2E303E',
          borderRadius: '16px',
          padding: '2.5rem',
        }}>
          <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '700', margin: '0 0 0.5rem' }}>
            Register Your Salon
          </h1>
          <p style={{ color: '#9CA3AF', margin: '0 0 2rem', fontSize: '0.9rem' }}>
            Enter your salon details to start hosting appointments on Hair Harmony
          </p>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              color: '#EF4444',
              padding: '0.85rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Cover Image */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              marginBottom: '1.5rem',
              padding: '1.25rem',
              backgroundColor: '#22232D',
              borderRadius: '8px',
              border: '1px solid #2E303E',
            }}>
              <img
                src={imagePreview || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&auto=format&fit=crop&q=80'}
                alt="Salon Cover Preview"
                style={{
                  width: '90px',
                  height: '70px',
                  borderRadius: '6px',
                  objectFit: 'cover',
                  border: '2px solid #daa520',
                }}
              />
              <div>
                <label style={{
                  display: 'inline-block',
                  backgroundColor: '#daa520',
                  color: '#121212',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '4px',
                }}>
                  Upload Cover Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.75rem' }}>
                  Landscape view recommended (JPG/PNG)
                </p>
              </div>
            </div>

            {/* Salon Name */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                Salon Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Royal Touch Hair Studio"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#22232D',
                  border: '1px solid #2E303E',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Address / Location */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                Full Address / Street Location
              </label>
              <textarea
                rows={2}
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Shop No, Complex / Street name"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#22232D',
                  border: '1px solid #2E303E',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Area & Type */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem',
              marginBottom: '1.25rem',
            }}>
              <div>
                <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                  Area
                </label>
                <select
                  required
                  value={formData.areaId}
                  onChange={(e) => {
                    const sel = areas.find((a) => String(a.id) === e.target.value);
                    setFormData({
                      ...formData,
                      areaId: e.target.value,
                      cityId: sel ? sel.City_id : formData.cityId,
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#22232D',
                    border: '1px solid #2E303E',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                >
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.AreaName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                  Salon Type
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#22232D',
                    border: '1px solid #2E303E',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men Only</option>
                  <option value="Women">Women Only</option>
                </select>
              </div>
            </div>

            {/* Seats, Open Time, Close Time */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}>
              <div>
                <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                  Styling Seats
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={formData.numberOfSeats}
                  onChange={(e) => setFormData({ ...formData, numberOfSeats: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#22232D',
                    border: '1px solid #2E303E',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                  Opening Time
                </label>
                <input
                  type="text"
                  required
                  value={formData.openTime}
                  onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                  placeholder="09:00"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#22232D',
                    border: '1px solid #2E303E',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                  Closing Time
                </label>
                <input
                  type="text"
                  required
                  value={formData.closeTime}
                  onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                  placeholder="21:00"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#22232D',
                    border: '1px solid #2E303E',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#daa520',
                color: '#121212',
                padding: '1rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1.05rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating Salon Profile...' : 'Complete Salon Registration'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterSalonPage;
