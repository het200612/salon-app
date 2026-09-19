const express = require('express');
const router  = express.Router();
const salonController = require('../controllers/salonController');

// Public salon routes
router.get('/', salonController.getSalons);
router.get('/areas', salonController.getAreas);
router.get('/:id', salonController.getSalonById);
router.get('/:id/slots', salonController.getSalonSlots);

module.exports = router;
