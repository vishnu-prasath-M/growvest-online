const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// GET /api/settings - Get all settings
router.get('/', settingsController.getSettings);

// GET /api/settings/:key - Get specific setting
router.get('/:key', settingsController.getSetting);

// PUT /api/settings/:key - Update specific setting
router.put('/:key', settingsController.updateSetting);

// POST /api/settings/password - Update admin password
router.post('/password', settingsController.updatePassword);

module.exports = router;
