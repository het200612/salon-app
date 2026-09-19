const { pool } = require('../config/db');
const {
  sendAppointmentConfirmationEmail,
  sendAppointmentRejectionEmail,
} = require('../utils/email');

/**
 * Helper to parse appointment date and slot time into a JavaScript Date object.
 * Example: dateStr = "2026-09-25", slotStr = "09:00 AM - 10:00 AM"
 */
function parseAppointmentDateTime(dateVal, slotStr) {
  try {
    let dateStr = '';
    if (dateVal instanceof Date) {
      dateStr = dateVal.toISOString().split('T')[0];
    } else if (typeof dateVal === 'string') {
      dateStr = dateVal.split('T')[0];
    }

    if (!slotStr) return new Date(dateStr);

    const startTimePart = slotStr.split('-')[0].trim(); // e.g. "09:00 AM"
    const [time, modifier] = startTimePart.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier) {
      if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, hours, minutes || 0, 0);
  } catch (err) {
    console.error('Error parsing appointment date/time:', err);
    return new Date();
  }
}

/**
 * POST /api/bookings
 * Protected (requireUser).
 */
async function createBooking(req, res) {
  try {
    const userId = req.user.id;
    const { salonId, serviceId, date, timeSlot } = req.body;

    if (!salonId || !serviceId || !date || !timeSlot) {
      return res.status(400).json({ message: 'Salon, service, date, and time slot are all required.' });
    }

    // Lookup service price from selectedservicesmst
    const [services] = await pool.query(
      `SELECT ss.id, ss.Price 
       FROM selectedservicesmst ss
       WHERE (ss.id = ? OR ss.ServiceName_id = ?) AND ss.SalonId_id = ?`,
      [serviceId, serviceId, salonId]
    );

    if (services.length === 0) {
      return res.status(404).json({ message: 'Selected service is not offered by this salon.' });
    }

    const serviceRecord = services[0];
    const billAmount = serviceRecord.Price;

    const [result] = await pool.query(
      `INSERT INTO slotbookingmst (BookingDate, TimeSlote, ServiceId_id, SalonId_id, UserId_id, BillAmount, Status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [date, timeSlot, serviceRecord.id, salonId, userId, billAmount]
    );

    return res.status(201).json({
      message: 'Your appointment is booked. Waiting for owner confirmation.',
      bookingId: result.insertId,
    });
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ message: 'Server error creating appointment booking.' });
  }
}

/**
 * GET /api/user/bookings
 * Protected (requireUser).
 */
async function getUserBookings(req, res) {
  try {
    const userId = req.user.id;

    // Fetch user bookings excluding Cancelled (matching Django behavior)
    const [bookings] = await pool.query(
      `SELECT 
         b.id, b.BookingDate, b.TimeSlote, b.BillAmount, b.Status,
         s.id AS SalonId, s.Name AS SalonName, s.Location AS SalonLocation, s.Img AS SalonImg,
         sm.ServiceName
       FROM slotbookingmst b
       JOIN salonmst s ON b.SalonId_id = s.id
       JOIN selectedservicesmst ss ON b.ServiceId_id = ss.id
       JOIN servicemst sm ON ss.ServiceName_id = sm.id
       WHERE b.UserId_id = ? AND b.Status != 'Cancelled'
       ORDER BY b.BookingDate DESC, b.id DESC`,
      [userId]
    );

    return res.json(bookings);
  } catch (err) {
    console.error('Get user bookings error:', err);
    return res.status(500).json({ message: 'Server error loading booking history.' });
  }
}

/**
 * PATCH /api/bookings/:id/cancel
 * Protected (requireUser).
 * Strictly enforces 3-hour minimum advance cancellation rule.
 */
async function cancelBooking(req, res) {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const [bookings] = await pool.query(
      'SELECT id, BookingDate, TimeSlote, Status, UserId_id FROM slotbookingmst WHERE id = ? AND UserId_id = ?',
      [bookingId, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const booking = bookings[0];

    if (booking.Status === 'Cancelled') {
      return res.status(400).json({ message: 'This booking has already been cancelled.' });
    }

    if (booking.Status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending bookings can be cancelled by the user.' });
    }

    // 3-Hour Cancellation Rule Check
    const appointmentDateTime = parseAppointmentDateTime(booking.BookingDate, booking.TimeSlote);
    const now = new Date();
    const diffMs = appointmentDateTime.getTime() - now.getTime();
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

    if (diffMs < THREE_HOURS_MS) {
      return res.status(400).json({
        message: 'Appointments can only be cancelled at least 3 hours before the scheduled time slot.',
      });
    }

    await pool.query('UPDATE slotbookingmst SET Status = "Cancelled" WHERE id = ?', [bookingId]);

    return res.json({ message: 'Appointment cancelled successfully.' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    return res.status(500).json({ message: 'Server error cancelling booking.' });
  }
}

/**
 * PATCH /api/bookings/:id/status
 * Protected (requireOwner).
 */
async function updateBookingStatus(req, res) {
  try {
    const ownerId = req.user.id;
    const bookingId = req.params.id;
    const { status, reason } = req.body;

    const normalizedStatus = (status || '').trim();
    if (!['Accepted', 'Rejected'].includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Status must be either "Accepted" or "Rejected".' });
    }

    // Verify booking belongs to this owner's salon
    const [bookings] = await pool.query(
      `SELECT 
         b.id, b.BookingDate, b.TimeSlote, b.BillAmount,
         u.Name AS CustomerName, u.Email AS CustomerEmail,
         s.Name AS SalonName,
         sm.ServiceName
       FROM slotbookingmst b
       JOIN salonmst s ON b.SalonId_id = s.id
       JOIN usermst u ON b.UserId_id = u.id
       JOIN selectedservicesmst ss ON b.ServiceId_id = ss.id
       JOIN servicemst sm ON ss.ServiceName_id = sm.id
       WHERE b.id = ? AND s.Owner_id = ?`,
      [bookingId, ownerId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found or not authorized for your salon.' });
    }

    const booking = bookings[0];

    await pool.query('UPDATE slotbookingmst SET Status = ? WHERE id = ?', [normalizedStatus, bookingId]);

    // Send transactional notification email to customer
    if (normalizedStatus === 'Accepted') {
      sendAppointmentConfirmationEmail(
        booking.CustomerEmail,
        booking.CustomerName,
        booking.SalonName,
        booking.ServiceName,
        booking.BookingDate,
        booking.TimeSlote
      ).catch((err) => console.error('Appointment accept email error:', err));
    } else {
      sendAppointmentRejectionEmail(
        booking.CustomerEmail,
        booking.CustomerName,
        booking.SalonName,
        booking.ServiceName,
        booking.BookingDate,
        booking.TimeSlote,
        reason
      ).catch((err) => console.error('Appointment reject email error:', err));
    }

    return res.json({
      message: `Appointment ${normalizedStatus.toLowerCase()} successfully.`,
      status: normalizedStatus,
    });
  } catch (err) {
    console.error('Update booking status error:', err);
    return res.status(500).json({ message: 'Server error updating appointment status.' });
  }
}

module.exports = {
  createBooking,
  getUserBookings,
  cancelBooking,
  updateBookingStatus,
};
