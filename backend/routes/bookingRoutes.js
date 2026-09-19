const express = require('express');
const router  = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, requireUser, requireOwner } = require('../middleware/authMiddleware');

// User creates an appointment booking
router.post('/', verifyToken, requireUser, bookingController.createBooking);

// User cancels pending booking (subject to 3-hour minimum threshold)
router.patch('/:id/cancel', verifyToken, requireUser, bookingController.cancelBooking);

// Owner accepts or rejects booking (with email notifications)
router.patch('/:id/status', verifyToken, requireOwner, bookingController.updateBookingStatus);

module.exports = router;
