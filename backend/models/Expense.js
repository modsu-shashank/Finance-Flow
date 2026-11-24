const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide an expense title or merchant name'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Please provide the expense amount'],
      min: [0.01, 'Amount must be greater than zero']
    },
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    category: {
      type: String,
      required: [true, 'Please select an expense category'],
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
      ],
      default: 'Food'
    },
    paymentMethod: {
      type: String,
      required: [true, 'Please select a payment method'],
      enum: [
        'Credit Card',
        'Debit Card',
        'Cash',
        'Bank Transfer',
        'UPI',
        'PayPal',
        'Other'
      ],
      default: 'Credit Card'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    receiptUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Expense', ExpenseSchema);

