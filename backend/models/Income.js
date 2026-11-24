const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide an income title or source name'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an income amount'],
      min: [0.01, 'Amount must be greater than zero']
    },
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Salary',
        'Freelancing',
        'Business',
        'Investments',
        'Rental income',
        'Other income'
      ],
      default: 'Salary'
    },
    paymentSource: {
      type: String,
      required: [true, 'Please select a payment source'],
      enum: [
        'Bank Account',
        'Direct Deposit',
        'Cash',
        'PayPal',
        'Wire Transfer',
        'Cheque',
        'Stripe',
        'Crypto Wallet',
        'Other'
      ],
      default: 'Bank Account'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isRecurring: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Income', IncomeSchema);

