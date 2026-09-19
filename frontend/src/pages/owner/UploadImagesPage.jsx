import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import OwnerSidebar from '../../components/OwnerSidebar';
import { getImageUrl } from '../../utils/imageUrl';
import api from '../../services/api';

export const UploadImagesPage = () => {
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/owner/profile');
      setImages(res.data?.images || []);
    } catch (err) {
      console.error('Failed to load gallery images:', err);
      setError('Unable to load salon images.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Please choose at least one photo to upload.');
      return;
    }

    setError('');
    setMessage('');
    setUploading(true);

    try {
      const data = new FormData();
      selectedFiles.forEach((file) => {
        data.append('images', file);
      });

      const res = await api.post('/owner/images', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(res.data?.message || 'Photos uploaded successfully!');
      setSelectedFiles([]);
      fetchImages();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photos.');
    } finally {
      setUploading(false);
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
            {/* Upload Box */}
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
            }}>
              <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.5rem' }}>
                Salon Photo Gallery
              </h1>
              <p style={{ color: '#9CA3AF', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
                Upload high-resolution photos of your interior, styling chairs, and equipment (Up to 5 images at once)
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

              <form onSubmit={handleUpload}>
                <div style={{
                  border: '2px dashed #2E303E',
                  borderRadius: '10px',
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: '#22232D',
                  marginBottom: '1.25rem',
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
                  <label style={{
                    display: 'inline-block',
                    backgroundColor: '#daa520',
                    color: '#121212',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginBottom: '0.5rem',
                  }}>
                    Select Photos
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <p style={{ color: '#9CA3AF', fontSize: '0.8rem', margin: 0 }}>
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} file(s) selected: ${selectedFiles.map((f) => f.name).join(', ')}`
                      : 'Supports JPG, PNG, WEBP (Max 5 files)'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={uploading || selectedFiles.length === 0}
                  style={{
                    backgroundColor: '#daa520',
                    color: '#121212',
                    padding: '0.8rem 1.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: uploading || selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: uploading || selectedFiles.length === 0 ? 0.6 : 1,
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload Photos'}
                </button>
              </form>
            </div>

            {/* Gallery Grid */}
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '1.5rem',
            }}>
              <h2 style={{ color: '#fff', fontSize: '1.3rem', margin: '0 0 1.25rem' }}>
                Uploaded Images ({images.length})
              </h2>

              {loading ? (
                <div style={{ color: '#daa520', padding: '2rem', textAlign: 'center' }}>Loading gallery...</div>
              ) : images.length === 0 ? (
                <div style={{ color: '#9CA3AF', padding: '2rem', textAlign: 'center' }}>
                  No photos uploaded to your salon gallery yet.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '1rem',
                }}>
                  {images.map((img) => (
                    <div
                      key={img.id}
                      style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#22232D',
                        border: '1px solid #2E303E',
                        height: '140px',
                      }}
                    >
                      <img
                        src={getImageUrl(img.Img || img.img)}
                        alt="Salon gallery item"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UploadImagesPage;
