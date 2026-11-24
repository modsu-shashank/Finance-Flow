const Income = require('../models/Income');

// @desc    Get all income records for logged in user with search/filter/pagination
// @route   GET /api/income
exports.getIncomes = async (req, res, next) => {
  try {
    const { category, paymentSource, startDate, endDate, search, limit = 50, page = 1 } = req.query;

    const query = { user: req.user.id };

    if (category) {
      query.category = category;
    }

    if (paymentSource) {
      query.paymentSource = paymentSource;
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

    const total = await Income.countDocuments(query);
    const incomes = await Income.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Calculate aggregated total for current query
    const totalAmountAgg = await Income.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmount = totalAmountAgg.length > 0 ? totalAmountAgg[0].total : 0;

    res.status(200).json({
      success: true,
      count: incomes.length,
      total,
      totalAmount,
      page: Number(page),
      pages: Math.ceil(total / limit) || 1,
      data: incomes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single income record
// @route   GET /api/income/:id
exports.getIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user.id });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found'
      });
    }

    res.status(200).json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new income
// @route   POST /api/income
exports.addIncome = async (req, res, next) => {
  try {
    const { title, amount, date, category, paymentSource, description, isRecurring } = req.body;

    const income = await Income.create({
      user: req.user.id,
      title,
      amount: Number(amount),
      date: date || new Date(),
      category: category || 'Salary',
      paymentSource: paymentSource || 'Bank Account',
      description,
      isRecurring: Boolean(isRecurring)
    });

    res.status(201).json({
      success: true,
      message: 'Income added successfully',
      data: income
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update income
// @route   PUT /api/income/:id
exports.updateIncome = async (req, res, next) => {
  try {
    let income = await Income.findOne({ _id: req.params.id, user: req.user.id });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found'
      });
    }

    const { title, amount, date, category, paymentSource, description, isRecurring } = req.body;

    income = await Income.findByIdAndUpdate(
      req.params.id,
      {
        title: title || income.title,
        amount: amount !== undefined ? Number(amount) : income.amount,
        date: date || income.date,
        category: category || income.category,
        paymentSource: paymentSource || income.paymentSource,
        description: description !== undefined ? description : income.description,
        isRecurring: isRecurring !== undefined ? Boolean(isRecurring) : income.isRecurring
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Income updated successfully',
      data: income
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
exports.deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Income deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

