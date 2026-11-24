const axios = require('axios');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Investment = require('../models/Investment');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

// Helper to gather full financial snapshot for AI analysis
const getUserFinancialSnapshot = async (userId, userObj) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [incomes, expenses, budgets, goals, investments] = await Promise.all([
    Income.find({ user: userId }).sort({ date: -1 }).limit(100).lean(),
    Expense.find({ user: userId }).sort({ date: -1 }).limit(150).lean(),
    Budget.find({ user: userId }).sort({ month: -1 }).limit(6).lean(),
    Goal.find({ user: userId }).lean(),
    Investment.find({ user: userId }).lean()
  ]);

  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpense;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const activeBudget = budgets.find((b) => b.month === currentMonth) || budgets[0] || null;

  return {
    user: {
      name: userObj.name,
      currency: userObj.currency || 'USD',
      monthlyIncomeGoal: userObj.monthlyIncomeGoal || 5000
    },
    metrics: {
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpense: Number(totalExpense.toFixed(2)),
      balance: Number(balance.toFixed(2)),
      savingsRate: totalIncome > 0 ? Number((((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)) : 0
    },
    activeBudget,
    incomes: incomes.map((i) => ({
      title: i.title,
      amount: i.amount,
      category: i.category,
      date: i.date.toISOString().slice(0, 10),
      paymentSource: i.paymentSource
    })),
    expenses: expenses.map((e) => ({
      title: e.title,
      amount: e.amount,
      category: e.category,
      date: e.date.toISOString().slice(0, 10),
      paymentMethod: e.paymentMethod
    })),
    goals: goals.map((g) => ({
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      targetDate: g.targetDate ? g.targetDate.toISOString().slice(0, 10) : '',
      category: g.category,
      status: g.status
    })),
    investments: investments.map((inv) => ({
      assetName: inv.assetName,
      symbol: inv.symbol,
      assetType: inv.assetType,
      purchasePrice: inv.purchasePrice,
      currentPrice: inv.currentPrice,
      quantity: inv.quantity,
      invested: Number((inv.purchasePrice * inv.quantity).toFixed(2)),
      currentValue: Number((inv.currentPrice * inv.quantity).toFixed(2))
    }))
  };
};

// @desc    Chat with AI Financial Assistant
// @route   POST /api/ai/chat
exports.chatWithAssistant = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const snapshot = await getUserFinancialSnapshot(req.user.id, req.user);

    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/ai/chat`,
        {
          message,
          financialData: snapshot,
          conversationHistory
        },
        { timeout: 15000 }
      );

      return res.status(200).json(response.data);
    } catch (aiErr) {
      console.warn('FastAPI AI Service call failed, generating direct intelligent fallback:', aiErr.message);

      // Intelligent rule-based fallback response engine
      const query = message.toLowerCase();
      let reply = '';
      let suggestions = [];

      if (query.includes('where') && (query.includes('spending') || query.includes('most'))) {
        const catMap = {};
        snapshot.expenses.forEach((e) => {
          catMap[e.category] = (catMap[e.category] || 0) + e.amount;
        });
        const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
        if (sortedCats.length > 0) {
          reply = `Based on your recent transactions, your highest spending category is **${sortedCats[0][0]}**, where you've spent **$${sortedCats[0][1].toLocaleString()}** (${((sortedCats[0][1] / (snapshot.metrics.totalExpense || 1)) * 100).toFixed(1)}% of all expenses). ` +
            (sortedCats[1] ? `Your second highest spending category is **${sortedCats[1][0]}** at **$${sortedCats[1][1].toLocaleString()}**.` : '');
        } else {
          reply = "You don't have enough recorded expenses yet. Start adding expenses in the Expense Tracker to see a breakdown!";
        }
      } else if (query.includes('save') || query.includes('saving')) {
        const net = snapshot.metrics.totalIncome - snapshot.metrics.totalExpense;
        const rate = snapshot.metrics.savingsRate;
        reply = `Your current net savings balance is **$${net.toLocaleString()}**, representing a savings rate of **${rate}%**. Financial advisors typically recommend aiming for at least 20% to build a healthy emergency buffer and invest for retirement.`;
      } else if (query.includes('reduce') || query.includes('cut')) {
        reply = `To reduce your monthly expenses effectively, consider auditing your discretionary categories such as **Shopping** and **Entertainment**. Setting category limits under the **Budgets** tab will trigger alerts whenever you approach 80% of your threshold.`;
      } else if (query.includes('budget')) {
        if (snapshot.activeBudget) {
          reply = `Your active monthly budget is set at **$${snapshot.activeBudget.totalBudget.toLocaleString()}**. Your current period expenses total **$${snapshot.metrics.totalExpense.toLocaleString()}**. Keep monitoring high-frequency categories to avoid exceeding your planned threshold.`;
        } else {
          reply = `You currently haven't set a budget for this month. We recommend going to the **Budgets** section to establish a monthly spending cap and category allocations!`;
        }
      } else if (query.includes('goal') || query.includes('target')) {
        if (snapshot.goals.length > 0) {
          const firstGoal = snapshot.goals[0];
          const remaining = firstGoal.targetAmount - firstGoal.currentAmount;
          reply = `For your goal **"${firstGoal.title}"**, you have saved **$${firstGoal.currentAmount.toLocaleString()}** out of **$${firstGoal.targetAmount.toLocaleString()}** (remaining: **$${remaining.toLocaleString()}**). Consistent monthly contributions will help you reach this target ahead of schedule!`;
        } else {
          reply = `You don't have active goals yet. Create one in the **Goals** section, like an "Emergency Fund" or "Vacation Savings", and I will help you track optimal monthly contributions.`;
        }
      } else {
        reply = `Hello ${req.user.name}! Here is a quick snapshot: Your recorded income is **$${snapshot.metrics.totalIncome.toLocaleString()}**, total expenses are **$${snapshot.metrics.totalExpense.toLocaleString()}**, and your savings rate is **${snapshot.metrics.savingsRate}%**. You have **${snapshot.goals.length}** active goal(s) and **${snapshot.investments.length}** investment holding(s). Ask me about reducing expenses, tracking your budget, or reaching your savings goals!`;
      }

      suggestions = [
        "Where am I spending the most money?",
        "How much did I save this month?",
        "Can I reduce my monthly expenses?",
        "Am I following my budget?",
        "Compare my spending this month with last month."
      ];

      return res.status(200).json({
        success: true,
        reply,
        suggestions,
        isFallback: true
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Generate natural language monthly summary
// @route   GET /api/ai/summary
exports.getFinancialSummary = async (req, res, next) => {
  try {
    const snapshot = await getUserFinancialSnapshot(req.user.id, req.user);

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/ai/summary`, snapshot, { timeout: 15000 });
      return res.status(200).json(response.data);
    } catch (aiErr) {
      console.warn('FastAPI AI Service summary fallback:', aiErr.message);

      const netCashflow = snapshot.metrics.totalIncome - snapshot.metrics.totalExpense;
      const isPositive = netCashflow >= 0;

      const summaryText = `In this evaluation period, you generated **$${snapshot.metrics.totalIncome.toLocaleString()}** in total revenue and incurred **$${snapshot.metrics.totalExpense.toLocaleString()}** in expenses, resulting in a ${isPositive ? 'positive cash flow' : 'net deficit'} of **$${Math.abs(netCashflow).toLocaleString()}** (Savings Rate: **${snapshot.metrics.savingsRate}%**). ` +
        (snapshot.activeBudget ? `You are currently utilizing your monthly budget with disciplined monitoring.` : `Consider setting an explicit monthly budget to maintain spending limits.`) +
        ` Your investment portfolio currently holds **${snapshot.investments.length}** asset(s) with an active balance.`;

      return res.status(200).json({
        success: true,
        summary: summaryText,
        metrics: snapshot.metrics,
        keyInsights: [
          `Savings rate is currently at ${snapshot.metrics.savingsRate}%`,
          `${snapshot.expenses.length} expense transactions recorded`,
          `${snapshot.goals.length} active financial target(s)`
        ],
        isFallback: true
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense anomalies and deep category analysis
// @route   GET /api/ai/expense-analysis
exports.getExpenseAnalysis = async (req, res, next) => {
  try {
    const snapshot = await getUserFinancialSnapshot(req.user.id, req.user);

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/ai/expense-analysis`, snapshot, { timeout: 15000 });
      return res.status(200).json(response.data);
    } catch (aiErr) {
      console.warn('FastAPI AI Service expense analysis fallback:', aiErr.message);

      const catMap = {};
      snapshot.expenses.forEach((e) => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
      });

      const highSpendingCategories = Object.entries(catMap)
        .map(([category, amount]) => ({
          category,
          amount: Number(amount.toFixed(2)),
          percentage: snapshot.metrics.totalExpense > 0 ? Number(((amount / snapshot.metrics.totalExpense) * 100).toFixed(1)) : 0
        }))
        .sort((a, b) => b.amount - a.amount);

      return res.status(200).json({
        success: true,
        highSpendingCategories,
        anomalies: snapshot.expenses.filter((e) => e.amount > 500).map((e) => ({
          title: e.title,
          amount: e.amount,
          category: e.category,
          date: e.date,
          reason: 'High transaction amount compared to average'
        })),
        isFallback: true
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI recommendations for budget adjustments
// @route   GET /api/ai/budget-recommendations
exports.getBudgetRecommendations = async (req, res, next) => {
  try {
    const snapshot = await getUserFinancialSnapshot(req.user.id, req.user);

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/ai/budget-recommendations`, snapshot, { timeout: 15000 });
      return res.status(200).json(response.data);
    } catch (aiErr) {
      console.warn('FastAPI AI Service budget recommendations fallback:', aiErr.message);

      const recommendedTotal = Math.round(snapshot.metrics.totalIncome * 0.7) || 3000;
      const suggestions = [
        {
          category: 'Food',
          recommendedLimit: 600,
          advice: 'Try meal planning on weekdays to curb dining out expenses.'
        },
        {
          category: 'Shopping',
          recommendedLimit: 300,
          advice: 'Apply the 48-hour rule before non-essential purchases.'
        },
        {
          category: 'Bills',
          recommendedLimit: 400,
          advice: 'Review subscription services and utility efficiency plans.'
        }
      ];

      return res.status(200).json({
        success: true,
        recommendedTotalBudget: recommendedTotal,
        suggestions,
        rule503020: {
          needs: Number((snapshot.metrics.totalIncome * 0.5).toFixed(2)),
          wants: Number((snapshot.metrics.totalIncome * 0.3).toFixed(2)),
          savings: Number((snapshot.metrics.totalIncome * 0.2).toFixed(2))
        },
        isFallback: true
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get savings recommendations and goal feasibility calculations
// @route   GET /api/ai/savings-forecast
exports.getSavingsForecast = async (req, res, next) => {
  try {
    const snapshot = await getUserFinancialSnapshot(req.user.id, req.user);

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/ai/savings-forecast`, snapshot, { timeout: 15000 });
      return res.status(200).json(response.data);
    } catch (aiErr) {
      console.warn('FastAPI AI Service savings forecast fallback:', aiErr.message);

      const potentialMonthlySavings = Math.max(0, snapshot.metrics.totalIncome - snapshot.metrics.totalExpense);

      return res.status(200).json({
        success: true,
        potentialMonthlySavings: Number(potentialMonthlySavings.toFixed(2)),
        annualProjectedSavings: Number((potentialMonthlySavings * 12).toFixed(2)),
        emergencyFundHealth: {
          recommendedMonths: 6,
          targetFund: Number((snapshot.metrics.totalExpense * 6).toFixed(2)),
          currentStatus: 'Recommended buffer: 3-6 months of living expenses'
        },
        isFallback: true
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get investment insights and diversification health
// @route   GET /api/ai/investment-insights
exports.getInvestmentInsights = async (req, res, next) => {
  try {
    const snapshot = await getUserFinancialSnapshot(req.user.id, req.user);

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/ai/investment-insights`, snapshot, { timeout: 15000 });
      return res.status(200).json(response.data);
    } catch (aiErr) {
      console.warn('FastAPI AI Service investment insights fallback:', aiErr.message);

      return res.status(200).json({
        success: true,
        diversificationScore: snapshot.investments.length >= 4 ? 'Good' : 'Moderate',
        summary: 'Your investment portfolio is actively tracked. Aim for a balanced distribution across equities, index ETFs, fixed income, and defensive reserves.',
        disclaimer: 'Educational insights only. Finance Flow does not provide formal investment advice or execute live trades.',
        isFallback: true
      });
    }
  } catch (error) {
    next(error);
  }
};

