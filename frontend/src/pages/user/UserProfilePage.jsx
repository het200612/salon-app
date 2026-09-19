import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import UserSidebar from '../../components/UserSidebar';
import SalonCard from '../../components/SalonCard';
import api from '../../services/api';

export const UserProfilePage = () => {
  const [salons, setSalons] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [salonsRes, areasRes] = await Promise.all([
        api.get('/salons'),
        api.get('/salons/areas').catch(() => ({ data: [] })),
      ]);
      setSalons(salonsRes.data || []);
      setAreas(areasRes.data || []);
    } catch (err) {
      console.error('Failed to load salons:', err);
      setError('Unable to load salons at this time. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSalons = salons.filter((salon) => {
    const matchesArea =
      selectedArea === 'all' ||
      String(salon.Area_id) === String(selectedArea) ||
      (salon.AreaName && salon.AreaName.toLowerCase() === selectedArea.toLowerCase());

    const matchesSearch =
      salon.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (salon.AreaName && salon.AreaName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (salon.CityName && salon.CityName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesArea && matchesSearch;
  });

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
          {/* User Sidebar */}
          <UserSidebar />

          {/* Main Dashboard Content */}
          <section style={{ flex: 1, minWidth: 0 }}>
            {/* Header & Filter Card */}
            <div style={{
              backgroundColor: '#181920',
              border: '1px solid #2E303E',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.25rem',
              }}>
                <div>
                  <h1 style={{
                    color: '#fff',
                    fontSize: '1.6rem',
                    fontWeight: '700',
                    margin: 0,
                    fontFamily: "'Poppins', sans-serif",
                  }}>
                    Explore & Book Salons
                  </h1>
                  <p style={{ color: '#9CA3AF', margin: '4px 0 0', fontSize: '0.9rem' }}>
                    Select an area and discover top hair & beauty studios near you
                  </p>
                </div>

                {/* Search Bar */}
                <div style={{ minWidth: '240px', flex: '1 1 200px', maxWidth: '360px' }}>
                  <input
                    type="text"
                    placeholder="Search salon or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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

              {/* Area Pill Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingBottom: '4px',
              }}>
                <button
                  onClick={() => setSelectedArea('all')}
                  style={{
                    padding: '0.5rem 1.2rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    border: selectedArea === 'all' ? '1px solid #daa520' : '1px solid #2E303E',
                    backgroundColor: selectedArea === 'all' ? '#daa520' : '#22232D',
                    color: selectedArea === 'all' ? '#121212' : '#9CA3AF',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  All Areas
                </button>
                {areas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => setSelectedArea(area.id)}
                    style={{
                      padding: '0.5rem 1.2rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      border: String(selectedArea) === String(area.id) ? '1px solid #daa520' : '1px solid #2E303E',
                      backgroundColor: String(selectedArea) === String(area.id) ? '#daa520' : '#22232D',
                      color: String(selectedArea) === String(area.id) ? '#121212' : '#9CA3AF',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                  >
                    {area.AreaName}
                  </button>
                ))}
              </div>
            </div>

            {/* Salons Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#daa520', fontSize: '1.2rem' }}>
                Loading available salons...
              </div>
            ) : error ? (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #EF4444',
                color: '#EF4444',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center',
              }}>
                {error}
              </div>
            ) : filteredSalons.length === 0 ? (
              <div style={{
                backgroundColor: '#181920',
                border: '1px dashed #2E303E',
                borderRadius: '12px',
                padding: '4rem 2rem',
                textAlign: 'center',
                color: '#9CA3AF',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💈</div>
                <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Salons Found</h3>
                <p>No salons match your search criteria. Try switching areas or clearing the search query.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}>
                {filteredSalons.map((salon) => (
                  <SalonCard key={salon.id} salon={salon} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfilePage;
