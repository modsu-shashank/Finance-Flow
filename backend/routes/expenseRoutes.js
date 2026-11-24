const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpense,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseReports
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/reports', getExpenseReports);

router.route('/')
  .get(getExpenses)
  .post(addExpense);

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;

