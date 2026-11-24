const Expense = require('../models/Expense');

// @desc    Get all expenses for logged in user with search/filter/pagination
// @route   GET /api/expenses
exports.getExpenses = async (req, res, next) => {
  try {
    const { category, paymentMethod, startDate, endDate, search, limit = 50, page = 1 } = req.query;

    const query = { user: req.user.id };

    if (category) {
      query.category = category;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        query.date.$lte = eDate;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Aggregated sum for current query
    const totalAmountAgg = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = totalAmountAgg.length > 0 ? totalAmountAgg[0].total : 0;

    // Breakdown by category
    const categoryBreakdown = await Expense.aggregate([
      { $match: query },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      totalAmount,
      categoryBreakdown,
      page: Number(page),
      pages: Math.ceil(total / limit) || 1,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
exports.getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new expense
// @route   POST /api/expenses
exports.addExpense = async (req, res, next) => {
  try {
    const { title, amount, date, category, paymentMethod, description, tags, receiptUrl } = req.body;

    const expense = await Expense.create({
      user: req.user.id,
      title,
      amount: Number(amount),
      date: date || new Date(),
      category: category || 'Food',
      paymentMethod: paymentMethod || 'Credit Card',
      description,
      tags: tags || [],
      receiptUrl
    });

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    const { title, amount, date, category, paymentMethod, description, tags, receiptUrl } = req.body;

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        title: title || expense.title,
        amount: amount !== undefined ? Number(amount) : expense.amount,
        date: date || expense.date,
        category: category || expense.category,
        paymentMethod: paymentMethod || expense.paymentMethod,
        description: description !== undefined ? description : expense.description,
        tags: tags || expense.tags,
        receiptUrl: receiptUrl !== undefined ? receiptUrl : expense.receiptUrl
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly and yearly expense reports
// @route   GET /api/expenses/reports
exports.getExpenseReports = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    // Monthly aggregation
    const monthlyData = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format monthly data with all 12 months
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const formattedMonthly = monthNames.map((name, index) => {
      const match = monthlyData.find((m) => m._id === index + 1);
      return {
        month: name,
        monthIndex: index + 1,
        total: match ? match.total : 0,
        count: match ? match.count : 0
      };
    });

    // Category distribution for the whole year
    const yearlyCategoryData = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({
      success: true,
      year,
      monthly: formattedMonthly,
      byCategory: yearlyCategoryData
    });
  } catch (error) {
    next(error);
  }
};

