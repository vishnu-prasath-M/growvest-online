const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/settings - Get all settings (Admin only)
router.get('/', protect, admin, settingsController.getSettings);

// GET /api/settings/:key - Get specific setting (Public for upiId, protected otherwise)
router.get('/:key', settingsController.getSetting);

// PUT /api/settings/:key - Update specific setting (Admin only)
router.put('/:key', protect, admin, settingsController.updateSetting);

// POST /api/settings/password - Update admin password (Admin only)
router.post('/password', protect, admin, settingsController.updatePassword);

module.exports = router;
