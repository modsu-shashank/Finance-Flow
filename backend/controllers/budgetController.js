const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Get budget for a specific month (default current month) along with actual spending comparison
// @route   GET /api/budgets/month/:month (e.g. 2026-11)
exports.getBudgetByMonth = async (req, res, next) => {
  try {
    const month = req.params.month || new Date().toISOString().slice(0, 7);

    let budget = await Budget.findOne({ user: req.user.id, month });

    // Calculate actual expenses for this month
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
    const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

    const expenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const actualSpendingByCategory = {};
    let totalActualSpent = 0;
    expenses.forEach((item) => {
      actualSpendingByCategory[item._id] = item.totalSpent;
      totalActualSpent += item.totalSpent;
    });

    if (!budget) {
      return res.status(200).json({
        success: true,
        hasBudget: false,
        month,
        totalBudget: 0,
        totalSpent: totalActualSpent,
        categoryComparison: expenses.map((e) => ({
          category: e._id,
          budgeted: 0,
          spent: e.totalSpent,
          remaining: -e.totalSpent,
          percentUsed: 100,
          status: 'unbudgeted'
        })),
        alerts: []
      });
    }

    // Build comparison analysis
    const categoryComparison = budget.categoryBudgets.map((cb) => {
      const spent = actualSpendingByCategory[cb.category] || 0;
      const remaining = Number((cb.amount - spent).toFixed(2));
      const percentUsed = cb.amount > 0 ? Number(((spent / cb.amount) * 100).toFixed(1)) : 0;
      let status = 'safe';
      if (percentUsed >= 100) status = 'exceeded';
      else if (percentUsed >= 80) status = 'warning';

      return {
        category: cb.category,
        budgeted: cb.amount,
        spent: Number(spent.toFixed(2)),
        remaining,
        percentUsed,
        status
      };
    });

    // Also include any categories spent that were not explicitly in categoryBudgets
    const budgetedCategoryNames = new Set(budget.categoryBudgets.map((cb) => cb.category));
    expenses.forEach((e) => {
      if (!budgetedCategoryNames.has(e._id)) {
        categoryComparison.push({
          category: e._id,
          budgeted: 0,
          spent: Number(e.totalSpent.toFixed(2)),
          remaining: Number((-e.totalSpent).toFixed(2)),
          percentUsed: 100,
          status: 'unbudgeted'
        });
      }
    });

    const overallPercentUsed =
      budget.totalBudget > 0
        ? Number(((totalActualSpent / budget.totalBudget) * 100).toFixed(1))
        : 0;

    let overallStatus = 'safe';
    if (overallPercentUsed >= 100) overallStatus = 'exceeded';
    else if (overallPercentUsed >= 80) overallStatus = 'warning';

    // Build alerts
    const alerts = [];
    if (overallPercentUsed >= 100) {
      alerts.push({
        type: 'danger',
        message: `Overall budget exceeded! You have spent ${overallPercentUsed}% of your $${budget.totalBudget.toLocaleString()} limit.`
      });
    } else if (overallPercentUsed >= 80) {
      alerts.push({
        type: 'warning',
        message: `Approaching budget limit! You have spent ${overallPercentUsed}% of your monthly budget.`
      });
    }

    categoryComparison.forEach((item) => {
      if (item.status === 'exceeded' && item.budgeted > 0) {
        alerts.push({
          type: 'danger',
          category: item.category,
          message: `${item.category} budget exceeded by $${Math.abs(item.remaining).toFixed(2)} (${item.percentUsed}% used)`
        });
      } else if (item.status === 'warning') {
        alerts.push({
          type: 'warning',
          category: item.category,
          message: `${item.category} budget is at ${item.percentUsed}% of its $${item.budgeted} allocation`
        });
      }
    });

    res.status(200).json({
      success: true,
      hasBudget: true,
      month,
      budget,
      totalBudget: budget.totalBudget,
      totalSpent: Number(totalActualSpent.toFixed(2)),
      remainingBudget: Number((budget.totalBudget - totalActualSpent).toFixed(2)),
      overallPercentUsed,
      overallStatus,
      categoryComparison,
      alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update monthly budget
// @route   POST /api/budgets
exports.setBudget = async (req, res, next) => {
  try {
    const { month, totalBudget, categoryBudgets, notes } = req.body;

    if (!month || !totalBudget) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month (YYYY-MM) and total budget amount'
      });
    }

    let budget = await Budget.findOne({ user: req.user.id, month });

    if (budget) {
      budget.totalBudget = Number(totalBudget);
      budget.categoryBudgets = categoryBudgets || [];
      if (notes !== undefined) budget.notes = notes;
      await budget.save();
    } else {
      budget = await Budget.create({
        user: req.user.id,
        month,
        totalBudget: Number(totalBudget),
        categoryBudgets: categoryBudgets || [],
        notes: notes || ''
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget saved successfully',
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all historical budgets for logged in user
// @route   GET /api/budgets
exports.getAllBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ user: req.user.id }).sort({ month: -1 });
    res.status(200).json({ success: true, count: budgets.length, data: budgets });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.status(200).json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    next(error);
  }
};

