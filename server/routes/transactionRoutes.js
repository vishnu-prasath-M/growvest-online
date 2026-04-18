const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// GET /api/transactions - Get all transactions
router.get('/', transactionController.getAllTransactions);

// GET /api/transactions/user/:userEmail - Get user transactions
router.get('/user/:userEmail', transactionController.getUserTransactions);

// GET /api/transactions/:id - Get transaction by ID
router.get('/:id', transactionController.getTransactionById);

// POST /api/transactions - Create transaction
router.post('/', transactionController.createTransaction);

module.exports = router;
