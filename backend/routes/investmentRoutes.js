const express = require('express');
const router = express.Router();
const {
  getInvestments,
  addInvestment,
  updateInvestment,
  deleteInvestment,
  refreshMarketPrices
} = require('../controllers/investmentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getInvestments)
  .post(addInvestment);

router.post('/refresh-prices', refreshMarketPrices);

router.route('/:id')
  .put(updateInvestment)
  .delete(deleteInvestment);

module.exports = router;

