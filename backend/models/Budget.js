const mongoose = require('mongoose');

const CategoryBudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      'Food',
      'Shopping',
      'Transportation',
      'Education',
      'Healthcare',
      'Entertainment',
      'Rent',
      'Bills',
      'Travel',
      'Others'
    ]
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Category budget cannot be negative']
  }
});

const BudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    month: {
      type: String, // Format: YYYY-MM e.g. "2026-11"
      required: [true, 'Please provide a month in YYYY-MM format'],
      trim: true
    },
    totalBudget: {
      type: Number,
      required: [true, 'Please provide an overall monthly budget amount'],
      min: [1, 'Total budget must be at least 1']
    },
    categoryBudgets: [CategoryBudgetSchema],
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

BudgetSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);

