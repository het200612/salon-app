const express = require('express');
const router  = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/upload');

// Public auth routes
router.post('/login', authController.login);
router.post('/register', uploadSingle, authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected auth routes
router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;
