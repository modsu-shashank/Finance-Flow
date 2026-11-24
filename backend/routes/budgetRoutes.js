const express = require('express');
const router = express.Router();
const {
  getBudgetByMonth,
  setBudget,
  getAllBudgets,
  deleteBudget
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAllBudgets)
  .post(setBudget);

router.get('/month/:month', getBudgetByMonth);
router.delete('/:id', deleteBudget);

module.exports = router;

