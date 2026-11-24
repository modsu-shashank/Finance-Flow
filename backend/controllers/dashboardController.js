const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Goal = require('../models/Goal');
const Investment = require('../models/Investment');
const Budget = require('../models/Budget');

// Helper to calculate date ranges
const getDateRangeFilter = (timeframe, startDateStr, endDateStr) => {
  const now = new Date();
  let start = new Date(0);
  let end = new Date();

  switch (timeframe) {
    case 'today': {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    }
    case 'this_week': {
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      start = new Date(now);
      start.setDate(now.getDate() + diffToMonday);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'this_month': {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    }
    case 'last_month': {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    }
    case 'custom': {
      if (startDateStr) start = new Date(startDateStr);
      if (endDateStr) {
        end = new Date(endDateStr);
        end.setHours(23, 59, 59, 999);
      }
      break;
    }
    default: {
      // Default to this_month
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    }
  }

  return { start, end };
};

// @desc    Get dynamic dashboard metrics
// @route   GET /api/dashboard
exports.getDashboardData = async (req, res, next) => {
  try {
    const { timeframe = 'this_month', startDate, endDate } = req.query;
    const { start, end } = getDateRangeFilter(timeframe, startDate, endDate);
    const userId = req.user._id;

    // 1. Period Income & Expenses
    const dateQuery = { user: userId, date: { $gte: start, $lte: end } };

    const [incomeAgg, expenseAgg] = await Promise.all([
      Income.aggregate([
        { $match: dateQuery },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: dateQuery },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const periodIncome = incomeAgg.length > 0 ? incomeAgg[0].total : 0;
    const periodExpense = expenseAgg.length > 0 ? expenseAgg[0].total : 0;

    // 2. All-time Totals for net worth and account balance
    const [allTimeIncomeAgg, allTimeExpenseAgg, goalsAgg, investments] = await Promise.all([
      Income.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Goal.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$currentAmount' } } }
      ]),
      Investment.find({ user: userId })
    ]);

    const allTimeIncome = allTimeIncomeAgg.length > 0 ? allTimeIncomeAgg[0].total : 0;
    const allTimeExpense = allTimeExpenseAgg.length > 0 ? allTimeExpenseAgg[0].total : 0;
    const totalSavings = goalsAgg.length > 0 ? goalsAgg[0].total : 0;

    let totalInvested = 0;
    let totalPortfolioValue = 0;
    investments.forEach((inv) => {
      totalInvested += inv.purchasePrice * inv.quantity;
      totalPortfolioValue += inv.currentPrice * inv.quantity;
    });

    const totalAccountBalance = Number((allTimeIncome - allTimeExpense).toFixed(2));
    const netWorth = Number((totalAccountBalance + totalPortfolioValue).toFixed(2));

    // 3. Expense Breakdown by Category for selected timeframe
    const expenseBreakdown = await Expense.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // 4. Income Breakdown by Category
    const incomeBreakdown = await Income.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // 5. Recent Combined Transactions (last 10)
    const recentIncomes = await Income.find({ user: userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(6)
      .lean();

    const recentExpenses = await Expense.find({ user: userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(6)
      .lean();

    const recentTransactions = [
      ...recentIncomes.map((inc) => ({
        _id: inc._id,
        type: 'income',
        title: inc.title,
        amount: inc.amount,
        date: inc.date,
        category: inc.category,
        paymentDetails: inc.paymentSource
      })),
      ...recentExpenses.map((exp) => ({
        _id: exp._id,
        type: 'expense',
        title: exp.title,
        amount: exp.amount,
        date: exp.date,
        category: exp.category,
        paymentDetails: exp.paymentMethod
      }))
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    // 6. Monthly Financial Performance (Last 6 Months: Income vs Expense)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [monthlyIncomes, monthlyExpenses] = await Promise.all([
      Income.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            total: { $sum: '$amount' }
          }
        }
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    // Build timeline for last 6 months
    const monthlyPerformance = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const label = `${monthNames[m - 1]} ${y.toString().slice(-2)}`;

      const incMatch = monthlyIncomes.find((item) => item._id.year === y && item._id.month === m);
      const expMatch = monthlyExpenses.find((item) => item._id.year === y && item._id.month === m);

      const inc = incMatch ? incMatch.total : 0;
      const exp = expMatch ? expMatch.total : 0;
      const net = inc - exp;
      const savingsRate = inc > 0 ? Number(((net / inc) * 100).toFixed(1)) : 0;

      monthlyPerformance.push({
        label,
        year: y,
        month: m,
        income: Number(inc.toFixed(2)),
        expense: Number(exp.toFixed(2)),
        savings: Number(net.toFixed(2)),
        savingsRate: Math.max(0, savingsRate)
      });
    }

    // 7. Current Month Budget Health
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const activeBudget = await Budget.findOne({ user: userId, month: currentMonthStr });
    let budgetUtilization = null;
    if (activeBudget) {
      const percentUsed = Number(((periodExpense / activeBudget.totalBudget) * 100).toFixed(1));
      budgetUtilization = {
        totalBudget: activeBudget.totalBudget,
        spent: periodExpense,
        remaining: Math.max(0, activeBudget.totalBudget - periodExpense),
        percentUsed
      };
    }

    res.status(200).json({
      success: true,
      timeframe,
      dateRange: { start, end },
      summary: {
        totalAccountBalance,
        netWorth,
        periodIncome: Number(periodIncome.toFixed(2)),
        periodExpense: Number(periodExpense.toFixed(2)),
        netSavings: Number((periodIncome - periodExpense).toFixed(2)),
        savingsRate:
          periodIncome > 0
            ? Number((((periodIncome - periodExpense) / periodIncome) * 100).toFixed(1))
            : 0,
        totalSavings: Number(totalSavings.toFixed(2)),
        totalInvestments: Number(totalPortfolioValue.toFixed(2)),
        investedCapital: Number(totalInvested.toFixed(2)),
        investmentReturnPercent:
          totalInvested > 0
            ? Number((((totalPortfolioValue - totalInvested) / totalInvested) * 100).toFixed(2))
            : 0
      },
      expenseBreakdown: expenseBreakdown.map((item) => ({
        category: item._id,
        amount: Number(item.total.toFixed(2)),
        count: item.count,
        percent: periodExpense > 0 ? Number(((item.total / periodExpense) * 100).toFixed(1)) : 0
      })),
      incomeBreakdown: incomeBreakdown.map((item) => ({
        category: item._id,
        amount: Number(item.total.toFixed(2)),
        count: item.count,
        percent: periodIncome > 0 ? Number(((item.total / periodIncome) * 100).toFixed(1)) : 0
      })),
      recentTransactions,
      monthlyPerformance,
      budgetUtilization
    });
  } catch (error) {
    next(error);
  }
};

