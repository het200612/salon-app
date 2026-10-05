import React, { useState, useEffect } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import { getImageUrl } from '../../utils/imageUrl';
import api from '../../services/api';

export const UploadImagesPage = () => {
  const [images, setImages] = useState([]);
  const [fileInputs, setFileInputs] = useState([null, null, null, null, null]);
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

  const handleFileChange = (index, file) => {
    setFileInputs((prev) => {
      const copy = [...prev];
      copy[index] = file;
      return copy;
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const validFiles = fileInputs.filter((f) => f !== null);

    if (validFiles.length === 0) {
      setError('Please choose at least one photo to upload.');
      return;
    }

    setError('');
    setMessage('');
    setUploading(true);

    try {
      const data = new FormData();
      validFiles.forEach((file) => {
        data.append('images', file);
      });

      const res = await api.post('/owner/images', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(res.data?.message || 'Images uploaded successfully!');
      setFileInputs([null, null, null, null, null]);
      // Reset HTML file input values
      for (let i = 0; i < 5; i++) {
        const el = document.getElementById(`fileInput_${i}`);
        if (el) el.value = '';
      }
      fetchImages();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload images.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to remove this photo from your salon gallery?')) {
      return;
    }

    try {
      setError('');
      setMessage('');
      await api.delete(`/owner/images/${imageId}`);
      setMessage('Photo removed successfully.');
      fetchImages();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove photo.');
    }
  };

  return (
    <OwnerLayout activeMenu="images">
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

      {/* Upload Images Form matching Page 2 Screenshot */}
      <div className="owner-upload-card">
        <h1 className="owner-upload-title">Upload Images</h1>
        <p className="owner-upload-note">NOTE: You Can Upload 5 Images At Once</p>

        <form onSubmit={handleUpload}>
          <div className="owner-file-inputs-table">
            {[0, 1, 2, 3, 4].map((idx) => (
              <div key={idx} className="owner-file-row">
                <input
                  id={`fileInput_${idx}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange(idx, e.target.files ? e.target.files[0] : null)
                  }
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="owner-btn-save"
            style={{ width: '100%', marginTop: 0 }}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      {/* Images Uploaded By You Section matching Page 2 Screenshot */}
      <h2 className="owner-gallery-title">Images Uploaded By You</h2>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#d4af37', padding: '2rem' }}>
          <i className="fas fa-spinner fa-spin"></i> Loading images...
        </div>
      ) : images.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888888', padding: '3rem' }}>
          No images uploaded yet. Use the form above to add photos to your salon showcase.
        </div>
      ) : (
        <div className="owner-gallery-grid">
          {images.map((img) => (
            <div key={img.id} className="owner-gallery-item">
              <img
                src={getImageUrl(img.Img)}
                alt="Salon gallery"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80';
                }}
              />
              <button
                type="button"
                className="owner-gallery-delete-btn"
                title="Delete photo"
                onClick={() => handleDeleteImage(img.id)}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </OwnerLayout>
  );
};

export default UploadImagesPage;
