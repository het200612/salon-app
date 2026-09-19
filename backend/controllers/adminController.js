const { pool } = require('../config/db');
const {
  sendSalonApprovalEmail,
  sendSalonRejectionEmail,
} = require('../utils/email');

// ─── Dashboard Stats ───────────────────────────────────────────────────────────

/**
 * GET /api/admin/dashboard
 */
async function getDashboard(_req, res) {
  try {
    // 1. Owner requests
    const [salonRequests] = await pool.query(
      `SELECT id, Name, UserName, Email, PhoneNumber, Usertype, Status, Img
       FROM usermst
       WHERE LOWER(Usertype) = 'owner'
       ORDER BY id DESC`
    );

    // 2. Total registered users
    const [userCountRows] = await pool.query('SELECT COUNT(*) AS totalUsers FROM usermst');
    const totalUsers = userCountRows[0].totalUsers || 0;

    // 3. Today's bookings
    const [todayBookings] = await pool.query(
      `SELECT 
         b.id, b.BookingDate, b.TimeSlote, b.BillAmount, b.Status,
         u.Name AS UserName, u.PhoneNumber AS UserPhone,
         s.Name AS SalonName,
         sm.ServiceName
       FROM slotbookingmst b
       JOIN usermst u ON b.UserId_id = u.id
       JOIN salonmst s ON b.SalonId_id = s.id
       JOIN selectedservicesmst ss ON b.ServiceId_id = ss.id
       JOIN servicemst sm ON ss.ServiceName_id = sm.id
       WHERE b.BookingDate = CURDATE()
       ORDER BY b.id DESC`
    );

    return res.json({
      salonRequests,
      totalUsers,
      todayBookings,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return res.status(500).json({ message: 'Server error loading admin dashboard.' });
  }
}

/**
 * PATCH /api/admin/owners/:id/status
 */
async function updateOwnerStatus(req, res) {
  try {
    const ownerId = req.params.id;
    const { status, reason } = req.body;

    if (!status || !['verified', 'rejected', 'pending'].includes(status.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid status value. Allowed: verified, rejected, pending' });
    }

    const [owners] = await pool.query('SELECT id, Name, Email, Status FROM usermst WHERE id = ?', [ownerId]);
    if (owners.length === 0) {
      return res.status(404).json({ message: 'Owner account not found.' });
    }

    const owner = owners[0];
    const newStatus = status.toLowerCase();

    await pool.query('UPDATE usermst SET Status = ? WHERE id = ?', [newStatus, ownerId]);

    // Send corresponding email
    if (newStatus === 'verified') {
      sendSalonApprovalEmail(owner.Email, owner.Name).catch((err) => console.error('Approval email error:', err));
    } else if (newStatus === 'rejected') {
      sendSalonRejectionEmail(owner.Email, owner.Name, reason).catch((err) => console.error('Rejection email error:', err));
    }

    return res.json({ message: `Owner status updated to ${newStatus}.`, status: newStatus });
  } catch (err) {
    console.error('Update owner status error:', err);
    return res.status(500).json({ message: 'Server error updating owner status.' });
  }
}

// ─── City CRUD ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/cities
 */
async function getCities(_req, res) {
  try {
    const [cities] = await pool.query('SELECT id, CityName FROM citymst ORDER BY CityName ASC');
    return res.json(cities);
  } catch (err) {
    console.error('Get cities error:', err);
    return res.status(500).json({ message: 'Server error loading cities.' });
  }
}

/**
 * GET /api/admin/cities/:id
 */
async function getCityById(req, res) {
  try {
    const [cities] = await pool.query('SELECT id, CityName FROM citymst WHERE id = ?', [req.params.id]);
    if (cities.length === 0) {
      return res.status(404).json({ message: 'City not found.' });
    }
    return res.json(cities[0]);
  } catch (err) {
    console.error('Get city error:', err);
    return res.status(500).json({ message: 'Server error loading city.' });
  }
}

/**
 * POST /api/admin/cities
 */
async function createCity(req, res) {
  try {
    const cityName = (req.body.cityName || req.body.CityName || '').trim();
    if (!cityName) {
      return res.status(400).json({ message: 'City name is required.' });
    }

    const [existing] = await pool.query('SELECT id FROM citymst WHERE LOWER(CityName) = LOWER(?)', [cityName]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'City already exists.' });
    }

    const [result] = await pool.query('INSERT INTO citymst (CityName) VALUES (?)', [cityName]);
    return res.status(201).json({ id: result.insertId, CityName: cityName, message: 'City created successfully.' });
  } catch (err) {
    console.error('Create city error:', err);
    return res.status(500).json({ message: 'Server error creating city.' });
  }
}

/**
 * PUT /api/admin/cities/:id
 */
async function updateCity(req, res) {
  try {
    const cityName = (req.body.cityName || req.body.CityName || '').trim();
    if (!cityName) {
      return res.status(400).json({ message: 'City name is required.' });
    }

    const [result] = await pool.query('UPDATE citymst SET CityName = ? WHERE id = ?', [cityName, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'City not found.' });
    }

    return res.json({ id: Number(req.params.id), CityName: cityName, message: 'City updated successfully.' });
  } catch (err) {
    console.error('Update city error:', err);
    return res.status(500).json({ message: 'Server error updating city.' });
  }
}

/**
 * DELETE /api/admin/cities/:id
 */
async function deleteCity(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM citymst WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'City not found.' });
    }
    return res.json({ message: 'City deleted successfully.' });
  } catch (err) {
    console.error('Delete city error:', err);
    return res.status(500).json({ message: 'Server error deleting city.' });
  }
}

// ─── Area CRUD ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/areas
 */
async function getAreas(_req, res) {
  try {
    const [areas] = await pool.query(
      `SELECT a.id, a.AreaName, a.CityName_id, c.CityName
       FROM areamst a
       JOIN citymst c ON a.CityName_id = c.id
       ORDER BY a.AreaName ASC`
    );
    return res.json(areas);
  } catch (err) {
    console.error('Get areas error:', err);
    return res.status(500).json({ message: 'Server error loading areas.' });
  }
}

/**
 * GET /api/admin/areas/:id
 */
async function getAreaById(req, res) {
  try {
    const [areas] = await pool.query(
      `SELECT a.id, a.AreaName, a.CityName_id, c.CityName
       FROM areamst a
       JOIN citymst c ON a.CityName_id = c.id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (areas.length === 0) {
      return res.status(404).json({ message: 'Area not found.' });
    }
    return res.json(areas[0]);
  } catch (err) {
    console.error('Get area error:', err);
    return res.status(500).json({ message: 'Server error loading area.' });
  }
}

/**
 * POST /api/admin/areas
 */
async function createArea(req, res) {
  try {
    const areaName = (req.body.areaName || req.body.AreaName || '').trim();
    const cityId = req.body.cityNameId || req.body.CityName_id || req.body.cityId || req.body.City_id;

    if (!areaName || !cityId) {
      return res.status(400).json({ message: 'Area name and city selection are required.' });
    }

    const [cityExists] = await pool.query('SELECT id FROM citymst WHERE id = ?', [cityId]);
    if (cityExists.length === 0) {
      return res.status(400).json({ message: 'Selected city does not exist.' });
    }

    const [result] = await pool.query(
      'INSERT INTO areamst (AreaName, CityName_id) VALUES (?, ?)',
      [areaName, cityId]
    );

    return res.status(201).json({
      id: result.insertId,
      AreaName: areaName,
      CityName_id: cityId,
      message: 'Area created successfully.',
    });
  } catch (err) {
    console.error('Create area error:', err);
    return res.status(500).json({ message: 'Server error creating area.' });
  }
}

/**
 * PUT /api/admin/areas/:id
 */
async function updateArea(req, res) {
  try {
    const areaName = (req.body.areaName || req.body.AreaName || '').trim();
    const cityId = req.body.cityNameId || req.body.CityName_id || req.body.cityId || req.body.City_id;

    if (!areaName || !cityId) {
      return res.status(400).json({ message: 'Area name and city selection are required.' });
    }

    const [result] = await pool.query(
      'UPDATE areamst SET AreaName = ?, CityName_id = ? WHERE id = ?',
      [areaName, cityId, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Area not found.' });
    }

    return res.json({
      id: Number(req.params.id),
      AreaName: areaName,
      CityName_id: cityId,
      message: 'Area updated successfully.',
    });
  } catch (err) {
    console.error('Update area error:', err);
    return res.status(500).json({ message: 'Server error updating area.' });
  }
}

/**
 * DELETE /api/admin/areas/:id
 */
async function deleteArea(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM areamst WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Area not found.' });
    }
    return res.json({ message: 'Area deleted successfully.' });
  } catch (err) {
    console.error('Delete area error:', err);
    return res.status(500).json({ message: 'Server error deleting area.' });
  }
}

// ─── Service CRUD ──────────────────────────────────────────────────────────────

/**
 * GET /api/admin/services
 */
async function getServices(_req, res) {
  try {
    const [services] = await pool.query('SELECT id, ServiceName FROM servicemst ORDER BY ServiceName ASC');
    return res.json(services);
  } catch (err) {
    console.error('Get services error:', err);
    return res.status(500).json({ message: 'Server error loading services.' });
  }
}

/**
 * GET /api/admin/services/:id
 */
async function getServiceById(req, res) {
  try {
    const [services] = await pool.query('SELECT id, ServiceName FROM servicemst WHERE id = ?', [req.params.id]);
    if (services.length === 0) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    return res.json(services[0]);
  } catch (err) {
    console.error('Get service error:', err);
    return res.status(500).json({ message: 'Server error loading service.' });
  }
}

/**
 * POST /api/admin/services
 */
async function createService(req, res) {
  try {
    const serviceName = (req.body.serviceName || req.body.ServiceName || '').trim();
    if (!serviceName) {
      return res.status(400).json({ message: 'Service name is required.' });
    }

    const [existing] = await pool.query('SELECT id FROM servicemst WHERE LOWER(ServiceName) = LOWER(?)', [serviceName]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Service already exists.' });
    }

    const [result] = await pool.query('INSERT INTO servicemst (ServiceName) VALUES (?)', [serviceName]);
    return res.status(201).json({
      id: result.insertId,
      ServiceName: serviceName,
      message: 'Service created successfully.',
    });
  } catch (err) {
    console.error('Create service error:', err);
    return res.status(500).json({ message: 'Server error creating service.' });
  }
}

/**
 * PUT /api/admin/services/:id
 */
async function updateService(req, res) {
  try {
    const serviceName = (req.body.serviceName || req.body.ServiceName || '').trim();
    if (!serviceName) {
      return res.status(400).json({ message: 'Service name is required.' });
    }

    const [result] = await pool.query('UPDATE servicemst SET ServiceName = ? WHERE id = ?', [serviceName, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    return res.json({
      id: Number(req.params.id),
      ServiceName: serviceName,
      message: 'Service updated successfully.',
    });
  } catch (err) {
    console.error('Update service error:', err);
    return res.status(500).json({ message: 'Server error updating service.' });
  }
}

/**
 * DELETE /api/admin/services/:id
 */
async function deleteService(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM servicemst WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    return res.json({ message: 'Service deleted successfully.' });
  } catch (err) {
    console.error('Delete service error:', err);
    return res.status(500).json({ message: 'Server error deleting service.' });
  }
}

module.exports = {
  getDashboard,
  updateOwnerStatus,
  getCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
  getAreas,
  getAreaById,
  createArea,
  updateArea,
  deleteArea,
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
