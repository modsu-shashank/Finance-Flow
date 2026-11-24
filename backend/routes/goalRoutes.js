const express = require('express');
const router = express.Router();
const {
  getGoals,
  addGoal,
  updateGoal,
  addContribution,
  deleteGoal
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(addGoal);

router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

router.post('/:id/contributions', addContribution);

module.exports = router;

