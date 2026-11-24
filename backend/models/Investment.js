const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    assetName: {
      type: String,
      required: [true, 'Please provide asset or security name'],
      trim: true
    },
    symbol: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    assetType: {
      type: String,
      required: [true, 'Please choose an asset type'],
      enum: [
        'Stocks',
        'Mutual funds',
        'ETFs',
        'Gold',
        'Fixed deposits',
        'Cryptocurrency',
        'Other investments'
      ],
      default: 'Stocks'
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Please provide the purchase price per unit'],
      min: [0.0001, 'Purchase price must be positive']
    },
    currentPrice: {
      type: Number,
      required: [true, 'Please provide current market price per unit'],
      min: [0.0001, 'Current price must be positive']
    },
    quantity: {
      type: Number,
      required: [true, 'Please enter quantity or units held'],
      min: [0.0001, 'Quantity must be positive']
    },
    investmentDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    isSimulated: {
      type: Boolean,
      default: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Virtuals for computed financial metrics
InvestmentSchema.virtual('investedAmount').get(function () {
  return Number((this.purchasePrice * this.quantity).toFixed(2));
});

InvestmentSchema.virtual('currentValue').get(function () {
  return Number((this.currentPrice * this.quantity).toFixed(2));
});

InvestmentSchema.virtual('profitOrLoss').get(function () {
  return Number((this.currentValue - this.investedAmount).toFixed(2));
});

InvestmentSchema.virtual('returnPercentage').get(function () {
  if (this.investedAmount <= 0) return 0;
  return Number((((this.currentValue - this.investedAmount) / this.investedAmount) * 100).toFixed(2));
});

InvestmentSchema.set('toJSON', { virtuals: true });
InvestmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Investment', InvestmentSchema);

