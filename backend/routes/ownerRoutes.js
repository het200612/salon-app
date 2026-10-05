const express = require('express');
const router  = express.Router();
const ownerController = require('../controllers/ownerController');
const { verifyToken, requireOwner } = require('../middleware/authMiddleware');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

// All owner routes require valid token and owner role
router.use(verifyToken, requireOwner);

// Profile and salon dashboard data
router.get('/profile', ownerController.getProfile);

// Salon management
router.post('/salon', uploadSingle, ownerController.createSalon);
router.put('/salon/:id', uploadSingle, ownerController.updateSalon);

// Service management
router.get('/services', ownerController.getOwnerServices);
router.post('/services', ownerController.addOwnerService);
router.delete('/services/:id', ownerController.deleteOwnerService);

// Gallery upload and delete
router.post('/images', uploadMultiple, ownerController.uploadSalonImages);
router.delete('/images/:id', ownerController.deleteSalonImage);

module.exports = router;

