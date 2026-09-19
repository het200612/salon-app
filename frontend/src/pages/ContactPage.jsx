import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0F1015' }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div style={{
          backgroundColor: '#181920',
          border: '1px solid #2E303E',
          borderRadius: '16px',
          padding: '3rem 2.5rem',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ color: '#daa520', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Get in Touch
            </span>
            <h1 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '2.4rem',
              color: '#fff',
              fontWeight: '700',
              margin: '0.25rem 0',
            }}>
              Contact Hair Harmony
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '0.95rem', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Have questions or feedback? Our team is always here to assist salon partners and clients.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ backgroundColor: '#22232D', padding: '1.25rem', borderRadius: '10px', border: '1px solid #2E303E' }}>
                <h4 style={{ color: '#daa520', margin: '0 0 0.4rem', fontSize: '1rem' }}>📍 Address</h4>
                <p style={{ color: '#E5E7EB', margin: 0, fontSize: '0.9rem' }}>
                  Hair Harmony Headquarters, VIP Road, Vesu, Surat, Gujarat 395007
                </p>
              </div>

              <div style={{ backgroundColor: '#22232D', padding: '1.25rem', borderRadius: '10px', border: '1px solid #2E303E' }}>
                <h4 style={{ color: '#daa520', margin: '0 0 0.4rem', fontSize: '1rem' }}>📞 Phone Support</h4>
                <p style={{ color: '#E5E7EB', margin: 0, fontSize: '0.9rem' }}>
                  +91 98765 43210 (Mon - Sat: 9:00 AM - 8:00 PM)
                </p>
              </div>

              <div style={{ backgroundColor: '#22232D', padding: '1.25rem', borderRadius: '10px', border: '1px solid #2E303E' }}>
                <h4 style={{ color: '#daa520', margin: '0 0 0.4rem', fontSize: '1rem' }}>✉️ Email Inquiries</h4>
                <p style={{ color: '#E5E7EB', margin: 0, fontSize: '0.9rem' }}>
                  support@hairharmony.com
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {submitted && (
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  color: '#10B981',
                  padding: '0.85rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                }}>
                  ✓ Thank you! Your message has been sent successfully.
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#22232D',
                    border: '1px solid #2E303E',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#22232D',
                    border: '1px solid #2E303E',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#E5E7EB', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#22232D',
                    border: '1px solid #2E303E',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#daa520',
                  color: '#121212',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
