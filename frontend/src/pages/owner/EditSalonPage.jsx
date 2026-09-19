import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import OwnerSidebar from '../../components/OwnerSidebar';
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
    openTime: '',
    closeTime: '',
    numberOfSeats: '',
    type: 'Unisex',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSalonData();
  }, []);

  const fetchSalonData = async () => {
    try {
      setLoading(true);
      const [profileRes, areasRes] = await Promise.all([
        api.get('/owner/profile'),
        api.get('/salons/areas').catch(() => ({ data: [] })),
      ]);

      setAreas(areasRes.data || []);

      if (profileRes.data?.needsSalon) {
        navigate('/owner/register-salon');
        return;
      }

      const s = profileRes.data.salon;
      if (s) {
        setSalonId(s.id);
        setFormData({
          name: s.Name || '',
          location: s.Location || '',
          cityId: s.City_id || '',
          areaId: s.Area_id || '',
          openTime: s.OpenTime || '09:00',
          closeTime: s.CloseTime || '21:00',
          numberOfSeats: s.NumberOfSeats || '5',
          type: s.Type || 'Unisex',
        });
        if (s.Img) {
          setImagePreview(getImageUrl(s.Img));
        }
      }
    } catch (err) {
      console.error('Failed to load salon for editing:', err);
      setError('Unable to load salon details.');
    } finally {
      setLoading(false);
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
    if (!salonId) return;

    setError('');
    setMessage('');
    setSubmitting(true);

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

      await api.put(`/owner/salon/${salonId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Salon profile updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update salon profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1015' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '2rem auto', padding: '0 1.5rem' }}>
        <div style={{
          display: 'flex',
          gap: '2rem',
          flexDirection: 'row',
          alignItems: 'flex-start',
        }}>
          <OwnerSidebar />

          <section style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '720px',
            }}>
              <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.5rem' }}>
                Edit Salon Details
              </h1>
              <p style={{ color: '#9CA3AF', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
                Modify your salon's opening hours, seating capacity, or location info
              </p>

              {message && (
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  color: '#10B981',
                  padding: '0.85rem',
                  borderRadius: '6px',
                  marginBottom: '1.25rem',
                  fontSize: '0.9rem',
                }}>
                  ✓ {message}
                </div>
              )}

              {error && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #EF4444',
                  color: '#EF4444',
                  padding: '0.85rem',
                  borderRadius: '6px',
                  marginBottom: '1.25rem',
                  fontSize: '0.9rem',
                }}>
                  {error}
                </div>
              )}

              {loading ? (
                <div style={{ color: '#daa520', padding: '2rem' }}>Loading details...</div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Cover Photo */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    backgroundColor: '#22232D',
                    borderRadius: '8px',
                    border: '1px solid #2E303E',
                  }}>
                    <img
                      src={imagePreview || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&auto=format&fit=crop&q=80'}
                      alt="Cover Preview"
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
                        Change Cover Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.75rem' }}>
                        Recommended resolution: 1200x800px
                      </p>
                    </div>
                  </div>

                  {/* Name */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                      Salon Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

                  {/* Location */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                      Address / Location
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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

                  {/* Seats, OpenTime, CloseTime */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.25rem',
                    marginBottom: '2rem',
                  }}>
                    <div>
                      <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                        Seating Capacity
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
                        Open Time
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.openTime}
                        onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
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
                        Close Time
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.closeTime}
                        onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
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
                    disabled={submitting}
                    style={{
                      backgroundColor: '#daa520',
                      color: '#121212',
                      padding: '0.85rem 2rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: '700',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? 'Updating Profile...' : 'Save Salon Profile'}
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditSalonPage;
