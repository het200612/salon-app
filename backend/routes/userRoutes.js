const express = require('express');
const router  = express.Router();
const userController = require('../controllers/userController');
const bookingController = require('../controllers/bookingController');
const { verifyToken, requireUser } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/upload');

// All user routes require valid token and user role
router.use(verifyToken, requireUser);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', uploadSingle, userController.updateProfile);

// Booking History
router.get('/bookings', bookingController.getUserBookings);

module.exports = router;
