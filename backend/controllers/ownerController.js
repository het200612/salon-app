const { pool } = require('../config/db');

/**
 * GET /api/owner/profile
 * Protected (requireOwner).
 */
async function getProfile(req, res) {
  try {
    const ownerId = req.user.id;

    // 1. Fetch Owner User details
    const [owners] = await pool.query(
      'SELECT id, Name, UserName, Email, PhoneNumber, Usertype, Status, Img FROM usermst WHERE id = ?',
      [ownerId]
    );

    if (owners.length === 0) {
      return res.status(404).json({ message: 'Owner user not found.' });
    }

    const owner = owners[0];

    // 2. Fetch Salon owned by this user
    const [salons] = await pool.query(
      `SELECT s.*, a.AreaName, c.CityName
       FROM salonmst s
       JOIN areamst a ON s.Area_id = a.id
       JOIN citymst c ON s.City_id = c.id
       WHERE s.Owner_id = ?`,
      [ownerId]
    );

    if (salons.length === 0) {
      return res.json({
        owner,
        needsSalon: true,
        salon: null,
        bookings: [],
      });
    }

    const salon = salons[0];
    const filterDate = req.query.date || null;

    // 3. Fetch Bookings for this salon
    let bookingQuery = `
      SELECT 
        b.id, b.BookingDate, b.TimeSlote, b.BillAmount, b.Status,
        u.id AS UserId, u.Name AS CustomerName, u.PhoneNumber AS CustomerPhone, u.Email AS CustomerEmail,
        sm.ServiceName
      FROM slotbookingmst b
      JOIN usermst u ON b.UserId_id = u.id
      JOIN selectedservicesmst ss ON b.ServiceId_id = ss.id
      JOIN servicemst sm ON ss.ServiceName_id = sm.id
      WHERE b.SalonId_id = ?
    `;
    const queryParams = [salon.id];

    if (filterDate) {
      bookingQuery += ' AND b.BookingDate = ?';
      queryParams.push(filterDate);
    } else {
      bookingQuery += ' AND b.BookingDate = CURDATE()';
    }

    bookingQuery += ' ORDER BY b.id DESC';

    const [bookings] = await pool.query(bookingQuery, queryParams);

    // 4. Fetch Gallery Images
    const [images] = await pool.query('SELECT id, Img FROM imagemst WHERE SalonId_id = ? ORDER BY id DESC', [salon.id]);

    // 5. Fetch Services
    const [services] = await pool.query(
      `SELECT ss.id, ss.Price, sm.ServiceName, sm.id AS ServiceMstId
       FROM selectedservicesmst ss
       JOIN servicemst sm ON ss.ServiceName_id = sm.id
       WHERE ss.SalonId_id = ?`,
      [salon.id]
    );

    return res.json({
      owner,
      needsSalon: false,
      salon,
      bookings,
      images,
      services,
    });
  } catch (err) {
    console.error('Owner profile error:', err);
    return res.status(500).json({ message: 'Server error loading owner profile.' });
  }
}

/**
 * POST /api/owner/salon
 * Protected (requireOwner + uploadSingle).
 */
async function createSalon(req, res) {
  try {
    const ownerId = req.user.id;
    const {
      name,
      location,
      areaId,
      cityId,
      openTime,
      closeTime,
      numberOfSeats,
      type,
    } = req.body;

    const coverImg = req.file ? req.file.filename : 'default.jpg';

    if (!name || !location || !areaId || !cityId || !openTime || !closeTime || !numberOfSeats || !type) {
      return res.status(400).json({ message: 'All salon fields are required.' });
    }

    const seats = parseInt(numberOfSeats, 10);
    if (isNaN(seats) || seats <= 0) {
      return res.status(400).json({ message: 'Number of seats must be a positive integer.' });
    }

    // Check if owner already has a salon
    const [existing] = await pool.query('SELECT id FROM salonmst WHERE Owner_id = ?', [ownerId]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already registered a salon. Please edit your existing salon.' });
    }

    const [result] = await pool.query(
      `INSERT INTO salonmst (Name, Location, Owner_id, Img, Status, NumberOfSeats, Area_id, City_id, OpenTime, CloseTime, Type)
       VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)`,
      [name, location, ownerId, coverImg, seats, areaId, cityId, openTime, closeTime, type]
    );

    return res.status(201).json({
      message: 'Salon registered successfully.',
      salonId: result.insertId,
    });
  } catch (err) {
    console.error('Create salon error:', err);
    return res.status(500).json({ message: 'Server error registering salon.' });
  }
}

/**
 * PUT /api/owner/salon/:id
 * Protected (requireOwner + uploadSingle).
 */
async function updateSalon(req, res) {
  try {
    const ownerId = req.user.id;
    const salonId = req.params.id;
    const {
      name,
      location,
      areaId,
      cityId,
      openTime,
      closeTime,
      numberOfSeats,
      type,
    } = req.body;

    const [salons] = await pool.query('SELECT id, Img FROM salonmst WHERE id = ? AND Owner_id = ?', [salonId, ownerId]);
    if (salons.length === 0) {
      return res.status(404).json({ message: 'Salon not found or unauthorized.' });
    }

    const currentSalon = salons[0];
    const coverImg = req.file ? req.file.filename : currentSalon.Img;

    const seats = parseInt(numberOfSeats, 10);
    if (isNaN(seats) || seats <= 0) {
      return res.status(400).json({ message: 'Number of seats must be a positive integer.' });
    }

    await pool.query(
      `UPDATE salonmst 
       SET Name = ?, Location = ?, Img = ?, NumberOfSeats = ?, Area_id = ?, City_id = ?, OpenTime = ?, CloseTime = ?, Type = ?
       WHERE id = ? AND Owner_id = ?`,
      [name, location, coverImg, seats, areaId, cityId, openTime, closeTime, type, salonId, ownerId]
    );

    return res.json({ message: 'Salon details updated successfully.' });
  } catch (err) {
    console.error('Update salon error:', err);
    return res.status(500).json({ message: 'Server error updating salon.' });
  }
}

/**
 * GET /api/owner/services
 * Protected (requireOwner).
 */
async function getOwnerServices(req, res) {
  try {
    const ownerId = req.user.id;

    const [salons] = await pool.query('SELECT id FROM salonmst WHERE Owner_id = ?', [ownerId]);
    if (salons.length === 0) {
      return res.status(404).json({ message: 'Salon not found for this owner.' });
    }

    const salonId = salons[0].id;

    // All global master services
    const [allServices] = await pool.query('SELECT id, ServiceName FROM servicemst ORDER BY ServiceName ASC');

    // Selected services for this salon
    const [selectedServices] = await pool.query(
      `SELECT ss.id, ss.Price, sm.ServiceName, sm.id AS ServiceMstId
       FROM selectedservicesmst ss
       JOIN servicemst sm ON ss.ServiceName_id = sm.id
       WHERE ss.SalonId_id = ?`,
      [salonId]
    );

    return res.json({
      allServices,
      selectedServices,
    });
  } catch (err) {
    console.error('Get owner services error:', err);
    return res.status(500).json({ message: 'Server error loading services.' });
  }
}

/**
 * POST /api/owner/services
 * Protected (requireOwner).
 */
async function addOwnerService(req, res) {
  try {
    const ownerId = req.user.id;
    const { serviceId, price } = req.body;

    if (!serviceId || !price) {
      return res.status(400).json({ message: 'Service and price are required.' });
    }

    const parsedPrice = parseInt(price, 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number.' });
    }

    const [salons] = await pool.query('SELECT id FROM salonmst WHERE Owner_id = ?', [ownerId]);
    if (salons.length === 0) {
      return res.status(404).json({ message: 'Salon not found for this owner.' });
    }

    const salonId = salons[0].id;

    // Insert or update service
    const [existing] = await pool.query(
      'SELECT id FROM selectedservicesmst WHERE SalonId_id = ? AND ServiceName_id = ?',
      [salonId, serviceId]
    );

    if (existing.length > 0) {
      await pool.query('UPDATE selectedservicesmst SET Price = ? WHERE id = ?', [parsedPrice, existing[0].id]);
      return res.json({ message: 'Service price updated successfully.' });
    }

    const [result] = await pool.query(
      'INSERT INTO selectedservicesmst (ServiceName_id, SalonId_id, Price) VALUES (?, ?, ?)',
      [serviceId, salonId, parsedPrice]
    );

    return res.status(201).json({
      id: result.insertId,
      message: 'Service added to salon successfully.',
    });
  } catch (err) {
    console.error('Add owner service error:', err);
    return res.status(500).json({ message: 'Server error adding service.' });
  }
}

/**
 * POST /api/owner/images
 * Protected (requireOwner + uploadMultiple).
 */
async function uploadSalonImages(req, res) {
  try {
    const ownerId = req.user.id;

    const [salons] = await pool.query('SELECT id FROM salonmst WHERE Owner_id = ?', [ownerId]);
    if (salons.length === 0) {
      return res.status(404).json({ message: 'Salon not found for this owner.' });
    }

    const salonId = salons[0].id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please select at least one image to upload.' });
    }

    const insertPromises = req.files.map((file) =>
      pool.query('INSERT INTO imagemst (SalonId_id, Img) VALUES (?, ?)', [salonId, file.filename])
    );

    await Promise.all(insertPromises);

    return res.status(201).json({
      message: `${req.files.length} image(s) uploaded successfully to salon gallery.`,
    });
  } catch (err) {
    console.error('Upload salon images error:', err);
    return res.status(500).json({ message: 'Server error uploading images.' });
  }
}

module.exports = {
  getProfile,
  createSalon,
  updateSalon,
  getOwnerServices,
  addOwnerService,
  uploadSalonImages,
};
