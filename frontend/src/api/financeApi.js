import axiosClient from './axiosClient';

export const financeApi = {
  // Dashboard
  getDashboardData: async (params) => {
    const res = await axiosClient.get('/dashboard', { params });
    return res.data;
  },

  // Income
  getIncomes: async (params) => {
    const res = await axiosClient.get('/income', { params });
    return res.data;
  },
  addIncome: async (data) => {
    const res = await axiosClient.post('/income', data);
    return res.data;
  },
  updateIncome: async (id, data) => {
    const res = await axiosClient.put(`/income/${id}`, data);
    return res.data;
  },
  deleteIncome: async (id) => {
    const res = await axiosClient.delete(`/income/${id}`);
    return res.data;
  },

  // Expenses
  getExpenses: async (params) => {
    const res = await axiosClient.get('/expenses', { params });
    return res.data;
  },
  addExpense: async (data) => {
    const res = await axiosClient.post('/expenses', data);
    return res.data;
  },
  updateExpense: async (id, data) => {
    const res = await axiosClient.put(`/expenses/${id}`, data);
    return res.data;
  },
  deleteExpense: async (id) => {
    const res = await axiosClient.delete(`/expenses/${id}`);
    return res.data;
  },
  getExpenseReports: async (params) => {
    const res = await axiosClient.get('/expenses/reports', { params });
    return res.data;
  },

  // Budgets
  getBudgetByMonth: async (month) => {
    const res = await axiosClient.get(`/budgets/month/${month}`);
    return res.data;
  },
  setBudget: async (data) => {
    const res = await axiosClient.post('/budgets', data);
    return res.data;
  },
  getAllBudgets: async () => {
    const res = await axiosClient.get('/budgets');
    return res.data;
  },
  deleteBudget: async (id) => {
    const res = await axiosClient.delete(`/budgets/${id}`);
    return res.data;
  },

  // Goals
  getGoals: async () => {
    const res = await axiosClient.get('/goals');
    return res.data;
  },
  addGoal: async (data) => {
    const res = await axiosClient.post('/goals', data);
    return res.data;
  },
  updateGoal: async (id, data) => {
    const res = await axiosClient.put(`/goals/${id}`, data);
    return res.data;
  },
  addGoalContribution: async (id, data) => {
    const res = await axiosClient.post(`/goals/${id}/contributions`, data);
    return res.data;
  },
  deleteGoal: async (id) => {
    const res = await axiosClient.delete(`/goals/${id}`);
    return res.data;
  },

  // Investments
  getInvestments: async () => {
    const res = await axiosClient.get('/investments');
    return res.data;
  },
  addInvestment: async (data) => {
    const res = await axiosClient.post('/investments', data);
    return res.data;
  },
  updateInvestment: async (id, data) => {
    const res = await axiosClient.put(`/investments/${id}`, data);
    return res.data;
  },
  deleteInvestment: async (id) => {
    const res = await axiosClient.delete(`/investments/${id}`);
    return res.data;
  },
  refreshMarketPrices: async () => {
    const res = await axiosClient.post('/investments/refresh-prices');
    return res.data;
  },
};

