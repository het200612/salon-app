const express = require('express');
const router  = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes require valid token and admin role
router.use(verifyToken, requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Owner Verification
router.patch('/owners/:id/status', adminController.updateOwnerStatus);

// City Management
router.get('/cities', adminController.getCities);
router.get('/cities/:id', adminController.getCityById);
router.post('/cities', adminController.createCity);
router.put('/cities/:id', adminController.updateCity);
router.delete('/cities/:id', adminController.deleteCity);

// Area Management
router.get('/areas', adminController.getAreas);
router.get('/areas/:id', adminController.getAreaById);
router.post('/areas', adminController.createArea);
router.put('/areas/:id', adminController.updateArea);
router.delete('/areas/:id', adminController.deleteArea);

// Service Management
router.get('/services', adminController.getServices);
router.get('/services/:id', adminController.getServiceById);
router.post('/services', adminController.createService);
router.put('/services/:id', adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

module.exports = router;
