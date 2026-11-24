const Investment = require('../models/Investment');

// Helper to simulate realistic market price shifts
const simulateMarketTick = (price) => {
  // Random fluctuation between -2.5% to +2.8%
  const deltaPercent = (Math.random() * 5.3 - 2.5) / 100;
  const newPrice = price * (1 + deltaPercent);
  return Number(Math.max(0.01, newPrice).toFixed(2));
};

// @desc    Get all investments with portfolio analytics
// @route   GET /api/investments
exports.getInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user.id }).sort({ investmentDate: -1 });

    let totalInvested = 0;
    let totalCurrentValue = 0;
    const assetAllocationMap = {};

    investments.forEach((inv) => {
      const invested = inv.purchasePrice * inv.quantity;
      const current = inv.currentPrice * inv.quantity;

      totalInvested += invested;
      totalCurrentValue += current;

      if (!assetAllocationMap[inv.assetType]) {
        assetAllocationMap[inv.assetType] = {
          assetType: inv.assetType,
          totalInvested: 0,
          currentValue: 0,
          count: 0
        };
      }
      assetAllocationMap[inv.assetType].totalInvested += invested;
      assetAllocationMap[inv.assetType].currentValue += current;
      assetAllocationMap[inv.assetType].count += 1;
    });

    const totalProfitLoss = Number((totalCurrentValue - totalInvested).toFixed(2));
    const returnPercentage =
      totalInvested > 0
        ? Number((((totalCurrentValue - totalInvested) / totalInvested) * 100).toFixed(2))
        : 0;

    const assetAllocation = Object.values(assetAllocationMap).map((item) => ({
      ...item,
      totalInvested: Number(item.totalInvested.toFixed(2)),
      currentValue: Number(item.currentValue.toFixed(2)),
      allocationPercent:
        totalCurrentValue > 0
          ? Number(((item.currentValue / totalCurrentValue) * 100).toFixed(1))
          : 0
    }));

    res.status(200).json({
      success: true,
      count: investments.length,
      portfolioSummary: {
        totalInvestedAmount: Number(totalInvested.toFixed(2)),
        currentPortfolioValue: Number(totalCurrentValue.toFixed(2)),
        totalProfitLoss,
        returnPercentage,
        isPositive: totalProfitLoss >= 0,
        assetAllocation,
        dataDisclaimer: 'Simulated market valuation for personal finance tracking & demo. No live execution.'
      },
      data: investments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add investment
// @route   POST /api/investments
exports.addInvestment = async (req, res, next) => {
  try {
    const {
      assetName,
      symbol,
      assetType,
      purchasePrice,
      currentPrice,
      quantity,
      investmentDate,
      notes
    } = req.body;

    const pPrice = Number(purchasePrice);
    const cPrice = currentPrice !== undefined ? Number(currentPrice) : pPrice;
    const qty = Number(quantity);

    const investment = await Investment.create({
      user: req.user.id,
      assetName,
      symbol: symbol ? symbol.toUpperCase() : '',
      assetType: assetType || 'Stocks',
      purchasePrice: pPrice,
      currentPrice: cPrice,
      quantity: qty,
      investmentDate: investmentDate || new Date(),
      notes: notes || '',
      isSimulated: true
    });

    res.status(201).json({
      success: true,
      message: 'Investment added to portfolio',
      data: investment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update investment
// @route   PUT /api/investments/:id
exports.updateInvestment = async (req, res, next) => {
  try {
    let investment = await Investment.findOne({ _id: req.params.id, user: req.user.id });

    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment record not found' });
    }

    const {
      assetName,
      symbol,
      assetType,
      purchasePrice,
      currentPrice,
      quantity,
      investmentDate,
      notes
    } = req.body;

    investment = await Investment.findByIdAndUpdate(
      req.params.id,
      {
        assetName: assetName || investment.assetName,
        symbol: symbol !== undefined ? symbol.toUpperCase() : investment.symbol,
        assetType: assetType || investment.assetType,
        purchasePrice: purchasePrice !== undefined ? Number(purchasePrice) : investment.purchasePrice,
        currentPrice: currentPrice !== undefined ? Number(currentPrice) : investment.currentPrice,
        quantity: quantity !== undefined ? Number(quantity) : investment.quantity,
        investmentDate: investmentDate || investment.investmentDate,
        notes: notes !== undefined ? notes : investment.notes,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Investment updated successfully',
      data: investment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate/Refresh market prices for portfolio
// @route   POST /api/investments/refresh-prices
exports.refreshMarketPrices = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user.id });

    for (const inv of investments) {
      inv.currentPrice = simulateMarketTick(inv.currentPrice);
      inv.lastUpdated = new Date();
      await inv.save();
    }

    res.status(200).json({
      success: true,
      message: 'Portfolio prices refreshed with simulated real-time market data'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete investment
// @route   DELETE /api/investments/:id
exports.deleteInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment record not found' });
    }

    res.status(200).json({ success: true, message: 'Investment removed from portfolio' });
  } catch (error) {
    next(error);
  }
};

