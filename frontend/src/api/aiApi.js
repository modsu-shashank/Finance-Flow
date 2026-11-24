import axiosClient from './axiosClient';

export const aiApi = {
  chatWithAssistant: async (message, conversationHistory = []) => {
    const res = await axiosClient.post('/ai/chat', { message, conversationHistory });
    return res.data;
  },
  getFinancialSummary: async () => {
    const res = await axiosClient.get('/ai/summary');
    return res.data;
  },
  getExpenseAnalysis: async () => {
    const res = await axiosClient.get('/ai/expense-analysis');
    return res.data;
  },
  getBudgetRecommendations: async () => {
    const res = await axiosClient.get('/ai/budget-recommendations');
    return res.data;
  },
  getSavingsForecast: async () => {
    const res = await axiosClient.get('/ai/savings-forecast');
    return res.data;
  },
  getInvestmentInsights: async () => {
    const res = await axiosClient.get('/ai/investment-insights');
    return res.data;
  },
};

