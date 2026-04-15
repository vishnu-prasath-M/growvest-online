const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');

router.post('/', investmentController.createInvestment);
router.get('/', investmentController.getInvestments);
router.patch('/:id/status', investmentController.updateInvestmentStatus);
router.post('/:id/withdraw', investmentController.withdrawInvestment);

module.exports = router;
