const express = require('express');
const router = express.Router();
const {
  chatWithAssistant,
  getFinancialSummary,
  getExpenseAnalysis,
  getBudgetRecommendations,
  getSavingsForecast,
  getInvestmentInsights
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/chat', chatWithAssistant);
router.get('/summary', getFinancialSummary);
router.get('/expense-analysis', getExpenseAnalysis);
router.get('/budget-recommendations', getBudgetRecommendations);
router.get('/savings-forecast', getSavingsForecast);
router.get('/investment-insights', getInvestmentInsights);

module.exports = router;

