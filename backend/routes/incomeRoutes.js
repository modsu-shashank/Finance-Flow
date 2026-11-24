const express = require('express');
const router = express.Router();
const {
  getIncomes,
  getIncome,
  addIncome,
  updateIncome,
  deleteIncome
} = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getIncomes)
  .post(addIncome);

router.route('/:id')
  .get(getIncome)
  .put(updateIncome)
  .delete(deleteIncome);

module.exports = router;

