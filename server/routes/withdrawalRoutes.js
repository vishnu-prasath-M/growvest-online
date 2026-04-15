const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');

router.post('/', withdrawalController.createWithdrawal);
router.get('/', withdrawalController.getWithdrawals);
router.patch('/:id/status', withdrawalController.updateWithdrawalStatus);

module.exports = router;
