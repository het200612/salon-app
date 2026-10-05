const { pool } = require('../config/db');
const { generateSlots } = require('../utils/generateSlots');

/**
 * GET /api/salons
 * Public. List all active salons with optional ?area=id filter.
 */
async function getSalons(req, res) {
  try {
    const { area, city, cityId, search } = req.query;
    let query = `
      SELECT 
        s.id, s.Name, s.Location, s.Img, s.Status, s.NumberOfSeats,
        s.OpenTime, s.CloseTime, s.Type, s.Area_id, s.City_id,
        a.AreaName,
        c.CityName,
        u.Name AS OwnerName, u.PhoneNumber AS OwnerPhone
      FROM salonmst s
      JOIN areamst a ON s.Area_id = a.id
      JOIN citymst c ON s.City_id = c.id
      JOIN usermst u ON s.Owner_id = u.id
      WHERE s.Status = 'active'
    `;
    const params = [];

    if (area) {
      query += ' AND s.Area_id = ?';
      params.push(area);
    }
    if (cityId) {
      query += ' AND s.City_id = ?';
      params.push(cityId);
    } else if (city) {
      query += ' AND LOWER(c.CityName) = LOWER(?)';
      params.push(city);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (
        s.Name LIKE ? 
        OR a.AreaName LIKE ? 
        OR c.CityName LIKE ? 
        OR s.Location LIKE ?
        OR s.id IN (
          SELECT ss.SalonId_id 
          FROM selectedservicesmst ss 
          JOIN servicemst sm ON ss.ServiceName_id = sm.id 
          WHERE sm.ServiceName LIKE ?
        )
      )`;
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY s.id DESC';

    const [salons] = await pool.query(query, params);

    // Fetch services for all returned salons
    if (salons.length > 0) {
      const salonIds = salons.map((s) => s.id);
      const [services] = await pool.query(
        `SELECT ss.id, ss.SalonId_id, ss.Price, sm.id AS ServiceMstId, sm.ServiceName
         FROM selectedservicesmst ss
         JOIN servicemst sm ON ss.ServiceName_id = sm.id
         WHERE ss.SalonId_id IN (?)`,
        [salonIds]
      );

      // Group services by salon
      const servicesBySalon = {};
      services.forEach((srv) => {
        if (!servicesBySalon[srv.SalonId_id]) {
          servicesBySalon[srv.SalonId_id] = [];
        }
        servicesBySalon[srv.SalonId_id].push({
          id: srv.id,
          serviceNameId: srv.ServiceMstId,
          serviceName: srv.ServiceName,
          price: srv.Price,
        });
      });

      salons.forEach((salon) => {
        salon.services = servicesBySalon[salon.id] || [];
      });
    }

    return res.json(salons);
  } catch (err) {
    console.error('Get salons error:', err);
    return res.status(500).json({ message: 'Server error loading salons.' });
  }
}

/**
 * GET /api/salons/:id
 * Public. Single salon details with services and gallery images.
 */
async function getSalonById(req, res) {
  try {
    const salonId = req.params.id;

    const [salons] = await pool.query(
      `SELECT 
         s.id, s.Name, s.Location, s.Img, s.Status, s.NumberOfSeats,
         s.OpenTime, s.CloseTime, s.Type, s.Area_id, s.City_id, s.Owner_id,
         a.AreaName,
         c.CityName,
         u.Name AS OwnerName, u.PhoneNumber AS OwnerPhone, u.Email AS OwnerEmail
       FROM salonmst s
       JOIN areamst a ON s.Area_id = a.id
       JOIN citymst c ON s.City_id = c.id
       JOIN usermst u ON s.Owner_id = u.id
       WHERE s.id = ?`,
      [salonId]
    );

    if (salons.length === 0) {
      return res.status(404).json({ message: 'Salon not found.' });
    }

    const salon = salons[0];

    // Fetch services
    const [services] = await pool.query(
      `SELECT ss.id, ss.ServiceName_id, ss.Price, sm.ServiceName
       FROM selectedservicesmst ss
       JOIN servicemst sm ON ss.ServiceName_id = sm.id
       WHERE ss.SalonId_id = ?`,
      [salonId]
    );

    // Fetch gallery images
    const [images] = await pool.query(
      'SELECT id, Img FROM imagemst WHERE SalonId_id = ? ORDER BY id DESC',
      [salonId]
    );

    return res.json({
      salon,
      services: services.map((s) => ({
        id: s.id,
        serviceNameId: s.ServiceName_id,
        serviceName: s.ServiceName,
        price: s.Price,
      })),
      images: images.map((img) => ({
        id: img.id,
        img: img.Img,
      })),
    });
  } catch (err) {
    console.error('Get salon details error:', err);
    return res.status(500).json({ message: 'Server error loading salon details.' });
  }
}

/**
 * GET /api/salons/:id/slots
 * Public. Calculate available 1-hour time slots for booking.
 */
async function getSalonSlots(req, res) {
  try {
    const salonId = req.params.id;

    const [salons] = await pool.query(
      'SELECT id, Name, OpenTime, CloseTime, NumberOfSeats FROM salonmst WHERE id = ?',
      [salonId]
    );

    if (salons.length === 0) {
      return res.status(404).json({ message: 'Salon not found.' });
    }

    const salon = salons[0];
    const slots = generateSlots(salon.OpenTime, salon.CloseTime);

    // Fetch services for slot booking dropdown
    const [services] = await pool.query(
      `SELECT ss.id, ss.Price, sm.ServiceName
       FROM selectedservicesmst ss
       JOIN servicemst sm ON ss.ServiceName_id = sm.id
       WHERE ss.SalonId_id = ?`,
      [salonId]
    );

    return res.json({
      salon: {
        id: salon.id,
        name: salon.Name,
        openTime: salon.OpenTime,
        closeTime: salon.CloseTime,
        numberOfSeats: salon.NumberOfSeats,
      },
      slots,
      services: services.map((s) => ({
        id: s.id,
        serviceName: s.ServiceName,
        price: s.Price,
      })),
    });
  } catch (err) {
    console.error('Get salon slots error:', err);
    return res.status(500).json({ message: 'Server error generating slots.' });
  }
}

/**
 * GET /api/salons/areas
 * Public. List all available areas.
 */
async function getAreas(req, res) {
  try {
    const { cityId, city, CityName_id } = req.query || {};
    const targetCityId = cityId || CityName_id;
    let query = `
      SELECT a.id, a.AreaName, a.CityName_id, c.CityName,
             COUNT(CASE WHEN s.Status = 'active' THEN s.id END) AS salonCount
      FROM areamst a
      JOIN citymst c ON a.CityName_id = c.id
      LEFT JOIN salonmst s ON s.Area_id = a.id
    `;
    const params = [];
    if (targetCityId) {
      query += ' WHERE a.CityName_id = ?';
      params.push(targetCityId);
    } else if (city) {
      query += ' WHERE LOWER(c.CityName) = LOWER(?)';
      params.push(city);
    }
    query += ' GROUP BY a.id, a.AreaName, a.CityName_id, c.CityName';
    query += ' ORDER BY a.AreaName ASC';
    const [areas] = await pool.query(query, params);
    return res.json(areas);
  } catch (err) {
    console.error('Get areas error:', err);
    return res.status(500).json({ message: 'Server error loading areas.' });
  }
}

module.exports = {
  getSalons,
  getSalonById,
  getSalonSlots,
  getAreas,
};
