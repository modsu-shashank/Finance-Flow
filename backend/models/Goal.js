const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Contribution must be positive']
  },
  date: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    trim: true,
    default: ''
  }
});

const GoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a goal name'],
      trim: true
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please set a target savings amount'],
      min: [1, 'Target amount must be at least 1']
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current savings cannot be negative']
    },
    targetDate: {
      type: Date,
      required: [true, 'Please specify target completion date']
    },
    category: {
      type: String,
      enum: [
        'Emergency fund',
        'Buy a laptop',
        'Purchase a vehicle',
        'Higher education',
        'Travel',
        'House savings',
        'Wedding',
        'Retirement',
        'Other'
      ],
      default: 'Emergency fund'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    contributions: [ContributionSchema],
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'paused'],
      default: 'in_progress'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Goal', GoalSchema);

