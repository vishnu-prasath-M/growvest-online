const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/users - Get all users (Admin only)
router.get('/', protect, admin, userController.getAllUsers);

// GET /api/users/email/:email - Get user by email
router.get('/email/:email', userController.getUserByEmail);

// PUT /api/users/email/:email/balance - Update user balance
router.put('/email/:email/balance', userController.updateBalance);

module.exports = router;
