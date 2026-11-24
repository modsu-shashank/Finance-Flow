const Goal = require('../models/Goal');

// @desc    Get all goals with detailed financial progress
// @route   GET /api/goals
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });

    const enrichedGoals = goals.map((goal) => {
      const g = goal.toObject();
      const percent = g.targetAmount > 0 ? Math.min(100, Number(((g.currentAmount / g.targetAmount) * 100).toFixed(1))) : 0;
      const remainingAmount = Math.max(0, Number((g.targetAmount - g.currentAmount).toFixed(2)));

      // Calculate time metrics
      const now = new Date();
      const targetDate = new Date(g.targetDate);
      const diffTime = targetDate - now;
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const monthsRemaining = Math.max(0.1, Number((daysRemaining / 30.4).toFixed(1)));
      const recommendedMonthlyContribution =
        remainingAmount > 0 && monthsRemaining > 0
          ? Number((remainingAmount / monthsRemaining).toFixed(2))
          : 0;

      return {
        ...g,
        progressPercent: percent,
        remainingAmount,
        daysRemaining,
        monthsRemaining,
        recommendedMonthlyContribution,
        isCompleted: g.currentAmount >= g.targetAmount || g.status === 'completed'
      };
    });

    const totalTarget = enrichedGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = enrichedGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallProgress = totalTarget > 0 ? Number(((totalSaved / totalTarget) * 100).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      count: enrichedGoals.length,
      summary: {
        totalGoals: enrichedGoals.length,
        totalTarget: Number(totalTarget.toFixed(2)),
        totalSaved: Number(totalSaved.toFixed(2)),
        totalRemaining: Number(Math.max(0, totalTarget - totalSaved).toFixed(2)),
        overallProgress
      },
      data: enrichedGoals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add financial goal
// @route   POST /api/goals
exports.addGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount = 0, targetDate, category, priority, notes } = req.body;

    const goal = await Goal.create({
      user: req.user.id,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      targetDate,
      category: category || 'Emergency fund',
      priority: priority || 'Medium',
      notes: notes || '',
      contributions: currentAmount > 0 ? [{ amount: Number(currentAmount), date: new Date(), note: 'Initial savings' }] : []
    });

    res.status(201).json({
      success: true,
      message: 'Financial goal created successfully',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
exports.updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const { title, targetAmount, targetDate, category, priority, status, notes } = req.body;

    goal = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        title: title || goal.title,
        targetAmount: targetAmount !== undefined ? Number(targetAmount) : goal.targetAmount,
        targetDate: targetDate || goal.targetDate,
        category: category || goal.category,
        priority: priority || goal.priority,
        status: status || goal.status,
        notes: notes !== undefined ? notes : goal.notes
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add contribution to a goal
// @route   POST /api/goals/:id/contributions
exports.addContribution = async (req, res, next) => {
  try {
    const { amount, note, date } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a positive contribution amount'
      });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const contribAmount = Number(amount);
    goal.currentAmount = Number((goal.currentAmount + contribAmount).toFixed(2));
    goal.contributions.push({
      amount: contribAmount,
      date: date || new Date(),
      note: note || 'Savings deposit'
    });

    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: `Added $${contribAmount} contribution to "${goal.title}"`,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.status(200).json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

