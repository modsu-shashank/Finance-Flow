const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Investment = require('../models/Investment');
const connectDB = require('../config/db');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing test data for clean seed...');
    await User.deleteMany({ email: 'demo@financeflow.com' });

    // 1. Create Demo User
    const user = await User.create({
      name: 'Alex Morgan',
      email: 'demo@financeflow.com',
      password: 'password123',
      currency: 'USD',
      monthlyIncomeGoal: 7500,
      bio: 'Financially independent tech lead & investor'
    });

    console.log(`Demo user created: ${user.email} (Password: password123)`);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // 2. Seed Incomes (last 3 months)
    const incomes = [
      {
        user: user._id,
        title: 'Monthly Tech Lead Salary',
        amount: 6200,
        date: new Date(currentYear, currentMonth, 1),
        category: 'Salary',
        paymentSource: 'Direct Deposit',
        description: 'Primary corporate compensation after tax',
        isRecurring: true
      },
      {
        user: user._id,
        title: 'UI/UX Design Consulting',
        amount: 1450,
        date: new Date(currentYear, currentMonth, 12),
        category: 'Freelancing',
        paymentSource: 'PayPal',
        description: 'Fintech dashboard design milestone',
        isRecurring: false
      },
      {
        user: user._id,
        title: 'Quarterly ETF Dividends',
        amount: 320,
        date: new Date(currentYear, currentMonth, 18),
        category: 'Investments',
        paymentSource: 'Bank Account',
        description: 'Vanguard VOO quarterly distribution',
        isRecurring: false
      },
      // Previous month
      {
        user: user._id,
        title: 'Monthly Tech Lead Salary',
        amount: 6200,
        date: new Date(currentYear, currentMonth - 1, 1),
        category: 'Salary',
        paymentSource: 'Direct Deposit',
        description: 'Primary corporate compensation'
      },
      {
        user: user._id,
        title: 'Web App Development Contract',
        amount: 1800,
        date: new Date(currentYear, currentMonth - 1, 15),
        category: 'Freelancing',
        paymentSource: 'Wire Transfer',
        description: 'Full-stack client project'
      },
      // Two months ago
      {
        user: user._id,
        title: 'Monthly Tech Lead Salary',
        amount: 6200,
        date: new Date(currentYear, currentMonth - 2, 1),
        category: 'Salary',
        paymentSource: 'Direct Deposit',
        description: 'Primary corporate compensation'
      }
    ];

    await Income.insertMany(incomes);
    console.log(`Seeded ${incomes.length} income entries.`);

    // 3. Seed Expenses
    const expenses = [
      {
        user: user._id,
        title: 'Luxury Apartment Rent',
        amount: 1850,
        date: new Date(currentYear, currentMonth, 2),
        category: 'Rent',
        paymentMethod: 'Bank Transfer',
        description: 'Monthly residential lease payment'
      },
      {
        user: user._id,
        title: 'Whole Foods Market Groceries',
        amount: 320.5,
        date: new Date(currentYear, currentMonth, 4),
        category: 'Food',
        paymentMethod: 'Credit Card',
        description: 'Bi-weekly organic groceries and fresh produce'
      },
      {
        user: user._id,
        title: 'High-speed Fiber Internet & Utilities',
        amount: 145,
        date: new Date(currentYear, currentMonth, 5),
        category: 'Bills',
        paymentMethod: 'Credit Card',
        description: 'Electricity, gas & 1Gbps internet'
      },
      {
        user: user._id,
        title: 'Fine Dining Dinner with Team',
        amount: 185.4,
        date: new Date(currentYear, currentMonth, 8),
        category: 'Food',
        paymentMethod: 'Credit Card',
        description: 'Celebration dinner at Italian bistro'
      },
      {
        user: user._id,
        title: 'Subway & Uber Transportation',
        amount: 95.2,
        date: new Date(currentYear, currentMonth, 10),
        category: 'Transportation',
        paymentMethod: 'Debit Card',
        description: 'Commutes and weekend cab rides'
      },
      {
        user: user._id,
        title: 'Mechanical Keyboard & Desk Mat',
        amount: 220,
        date: new Date(currentYear, currentMonth, 14),
        category: 'Shopping',
        paymentMethod: 'Credit Card',
        description: 'Home office ergonomic upgrades'
      },
      {
        user: user._id,
        title: 'Gym & Crossfit Membership',
        amount: 120,
        date: new Date(currentYear, currentMonth, 15),
        category: 'Healthcare',
        paymentMethod: 'Credit Card',
        description: 'Monthly fitness center access'
      },
      {
        user: user._id,
        title: 'Netflix & Spotify Subscriptions',
        amount: 32.99,
        date: new Date(currentYear, currentMonth, 16),
        category: 'Entertainment',
        paymentMethod: 'Credit Card',
        description: 'Monthly streaming bundle'
      },
      {
        user: user._id,
        title: 'Weekend Nature Trip Fuel & Tolls',
        amount: 110,
        date: new Date(currentYear, currentMonth, 19),
        category: 'Travel',
        paymentMethod: 'Credit Card',
        description: 'National park cabin weekend getaway'
      },
      // Previous month expenses
      {
        user: user._id,
        title: 'Apartment Rent',
        amount: 1850,
        date: new Date(currentYear, currentMonth - 1, 2),
        category: 'Rent',
        paymentMethod: 'Bank Transfer'
      },
      {
        user: user._id,
        title: 'Groceries & Household Supplies',
        amount: 540,
        date: new Date(currentYear, currentMonth - 1, 6),
        category: 'Food',
        paymentMethod: 'Credit Card'
      },
      {
        user: user._id,
        title: 'Cloud Architecture Certification Course',
        amount: 299,
        date: new Date(currentYear, currentMonth - 1, 14),
        category: 'Education',
        paymentMethod: 'Credit Card',
        description: 'AWS Solutions Architect professional prep'
      },
      {
        user: user._id,
        title: 'Flight Tickets for Family Visit',
        amount: 480,
        date: new Date(currentYear, currentMonth - 1, 20),
        category: 'Travel',
        paymentMethod: 'Credit Card'
      }
    ];

    await Expense.insertMany(expenses);
    console.log(`Seeded ${expenses.length} expense entries.`);

    // 4. Seed Monthly Budget
    const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    await Budget.create({
      user: user._id,
      month: monthKey,
      totalBudget: 4200,
      categoryBudgets: [
        { category: 'Rent', amount: 1850 },
        { category: 'Food', amount: 750 },
        { category: 'Shopping', amount: 400 },
        { category: 'Transportation', amount: 250 },
        { category: 'Bills', amount: 250 },
        { category: 'Entertainment', amount: 200 },
        { category: 'Healthcare', amount: 200 },
        { category: 'Travel', amount: 300 }
      ],
      notes: 'Active balanced budget aimed at achieving 35% savings rate.'
    });
    console.log(`Seeded budget for month: ${monthKey}`);

    // 5. Seed Goals
    const targetDate1 = new Date();
    targetDate1.setMonth(targetDate1.getMonth() + 6);

    const targetDate2 = new Date();
    targetDate2.setMonth(targetDate2.getMonth() + 18);

    const targetDate3 = new Date();
    targetDate3.setMonth(targetDate3.getMonth() + 12);

    const goals = [
      {
        user: user._id,
        title: 'Emergency Rainy Day Fund (6 Months)',
        targetAmount: 18000,
        currentAmount: 13500,
        targetDate: targetDate1,
        category: 'Emergency fund',
        priority: 'High',
        status: 'in_progress',
        contributions: [
          { amount: 10000, date: new Date(currentYear, currentMonth - 3, 1), note: 'Initial foundation' },
          { amount: 2000, date: new Date(currentYear, currentMonth - 1, 5), note: 'Bonus savings allocation' },
          { amount: 1500, date: new Date(currentYear, currentMonth, 10), note: 'Monthly auto-deposit' }
        ],
        notes: 'High-yield savings account liquid emergency cushion.'
      },
      {
        user: user._id,
        title: 'Next-Gen M3 Max MacBook Pro',
        targetAmount: 3500,
        currentAmount: 2800,
        targetDate: targetDate1,
        category: 'Buy a laptop',
        priority: 'Medium',
        status: 'in_progress',
        contributions: [
          { amount: 1800, date: new Date(currentYear, currentMonth - 1, 15), note: 'Freelance revenue deposit' },
          { amount: 1000, date: new Date(currentYear, currentMonth, 12), note: 'Mid-month contribution' }
        ],
        notes: 'Dedicated workstation for software development & AI model training.'
      },
      {
        user: user._id,
        title: 'Electric Vehicle Down Payment',
        targetAmount: 12000,
        currentAmount: 4500,
        targetDate: targetDate2,
        category: 'Purchase a vehicle',
        priority: 'Medium',
        status: 'in_progress',
        contributions: [
          { amount: 3500, date: new Date(currentYear, currentMonth - 2, 20), note: 'Year-end bonus allocation' },
          { amount: 1000, date: new Date(currentYear, currentMonth, 5), note: 'Monthly car savings' }
        ],
        notes: 'Saving for Tesla Model Y or Hyundai Ioniq 5 down payment.'
      }
    ];

    await Goal.insertMany(goals);
    console.log(`Seeded ${goals.length} financial goals.`);

    // 6. Seed Investments
    const investments = [
      {
        user: user._id,
        assetName: 'Apple Inc.',
        symbol: 'AAPL',
        assetType: 'Stocks',
        purchasePrice: 175.5,
        currentPrice: 228.4,
        quantity: 35,
        investmentDate: new Date(currentYear - 1, 3, 15),
        notes: 'Core tech blue chip holding'
      },
      {
        user: user._id,
        assetName: 'Microsoft Corporation',
        symbol: 'MSFT',
        assetType: 'Stocks',
        purchasePrice: 340.0,
        currentPrice: 422.1,
        quantity: 20,
        investmentDate: new Date(currentYear - 1, 5, 20),
        notes: 'Enterprise cloud and AI leadership'
      },
      {
        user: user._id,
        assetName: 'Vanguard S&P 500 ETF',
        symbol: 'VOO',
        assetType: 'ETFs',
        purchasePrice: 420.0,
        currentPrice: 535.8,
        quantity: 25,
        investmentDate: new Date(currentYear - 1, 1, 10),
        notes: 'Broad market passive index core'
      },
      {
        user: user._id,
        assetName: 'Physical Gold Sovereign ETF',
        symbol: 'GLD',
        assetType: 'Gold',
        purchasePrice: 185.0,
        currentPrice: 242.6,
        quantity: 15,
        investmentDate: new Date(currentYear - 1, 8, 1),
        notes: 'Macro inflation hedge'
      },
      {
        user: user._id,
        assetName: 'Ethereum Digital Asset',
        symbol: 'ETH',
        assetType: 'Cryptocurrency',
        purchasePrice: 2450.0,
        currentPrice: 3380.0,
        quantity: 2.5,
        investmentDate: new Date(currentYear, 0, 15),
        notes: 'Smart contract layer-1 holding'
      },
      {
        user: user._id,
        assetName: 'Treasury Fixed Deposit 5.2%',
        symbol: 'US-T-BILL',
        assetType: 'Fixed deposits',
        purchasePrice: 1000.0,
        currentPrice: 1052.0,
        quantity: 5,
        investmentDate: new Date(currentYear, 1, 1),
        notes: 'Guaranteed government yield asset'
      }
    ];

    await Investment.insertMany(investments);
    console.log(`Seeded ${investments.length} investment holdings.`);

    console.log('Database successfully seeded with realistic financial dataset!');
    process.exit(0);
  } catch (error) {
    console.error('Seed Data Error:', error);
    process.exit(1);
  }
};

seedData();

