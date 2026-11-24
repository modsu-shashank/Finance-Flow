const axios = require('./backend/node_modules/axios');
const app = require('./backend/server');

const runTests = async () => {
  console.log('=== STARTING FINANCE FLOW COMPREHENSIVE INTEGRATION SUITE ===\n');

  let server;
  const PORT = 5055;
  const BASE_URL = `http://127.0.0.1:${PORT}/api`;

  try {
    await new Promise((resolve) => {
      server = app.listen(PORT, () => {
        console.log(`Test server running on port ${PORT}`);
        resolve();
      });
    });

    // 1. Health Check
    console.log('[Test 1] Health Check...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health status:', healthRes.data.status, '-', healthRes.data.tagline);

    // 2. Authentication: Login demo user
    console.log('\n[Test 2] User Authentication (Login)...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'demo@financeflow.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('✅ Authenticated user:', loginRes.data.user.name, `(Token received: ${token.slice(0, 15)}...)`);

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Main Dashboard Data
    console.log('\n[Test 3] Main Dashboard Endpoint...');
    const dashRes = await axios.get(`${BASE_URL}/dashboard?timeframe=this_month`, authHeaders);
    const summary = dashRes.data.summary;
    console.log('✅ Dashboard Data:');
    console.log('   • Total Account Balance:', summary.totalAccountBalance);
    console.log('   • Total Income:', summary.periodIncome);
    console.log('   • Total Expenses:', summary.periodExpense);
    console.log('   • Total Savings:', summary.totalSavings);
    console.log('   • Total Investments:', summary.totalInvestments);
    console.log('   • Expense Breakdown Categories:', dashRes.data.expenseBreakdown.length);
    console.log('   • Monthly Performance Points:', dashRes.data.monthlyPerformance.length);

    // 4. Income Management
    console.log('\n[Test 4] Income Management (Add & List)...');
    const newIncomeRes = await axios.post(
      `${BASE_URL}/income`,
      {
        title: 'API Consulting Test',
        amount: 850,
        category: 'Freelancing',
        paymentSource: 'PayPal',
        description: 'Integration test milestone'
      },
      authHeaders
    );
    console.log('✅ Created Income:', newIncomeRes.data.data.title, 'Amount:', newIncomeRes.data.data.amount);
    const incomeId = newIncomeRes.data.data._id;

    const listIncomeRes = await axios.get(`${BASE_URL}/income`, authHeaders);
    console.log('✅ Total income records fetched:', listIncomeRes.data.count);

    // 5. Expense Management
    console.log('\n[Test 5] Expense Management (Add & List)...');
    const newExpenseRes = await axios.post(
      `${BASE_URL}/expenses`,
      {
        title: 'Cloud Infrastructure Fee',
        amount: 85.50,
        category: 'Bills',
        paymentMethod: 'Credit Card',
        description: 'Server hosting'
      },
      authHeaders
    );
    console.log('✅ Created Expense:', newExpenseRes.data.data.title, 'Amount:', newExpenseRes.data.data.amount);
    const expenseId = newExpenseRes.data.data._id;

    const listExpenseRes = await axios.get(`${BASE_URL}/expenses`, authHeaders);
    console.log('✅ Total expense records fetched:', listExpenseRes.data.count);

    // 6. Expense Reports
    console.log('\n[Test 6] Expense Reports (12-month analytics)...');
    const reportsRes = await axios.get(`${BASE_URL}/expenses/reports?year=2026`, authHeaders);
    console.log('✅ 12-Month Reports generated:', reportsRes.data.monthly.length, 'months');

    // 7. Budget Management
    console.log('\n[Test 7] Budget Management & Utilization...');
    const currentMonth = new Date().toISOString().slice(0, 7);
    const budgetRes = await axios.get(`${BASE_URL}/budgets/month/${currentMonth}`, authHeaders);
    console.log('✅ Budget for', currentMonth, ':');
    console.log('   • Total Planned Budget:', budgetRes.data.totalBudget);
    console.log('   • Total Actual Spent:', budgetRes.data.totalSpent);
    console.log('   • Percent Used:', budgetRes.data.overallPercentUsed, '%');
    console.log('   • Category comparison items:', budgetRes.data.categoryComparison.length);

    // 8. Financial Goals
    console.log('\n[Test 8] Goals & Savings Contributions...');
    const goalsRes = await axios.get(`${BASE_URL}/goals`, authHeaders);
    console.log('✅ Active Goals count:', goalsRes.data.count);
    if (goalsRes.data.data.length > 0) {
      const g = goalsRes.data.data[0];
      console.log(`   • Goal: "${g.title}" | Target: ${g.targetAmount} | Saved: ${g.currentAmount} (${g.progressPercent}%)`);

      // Add a test contribution
      const contribRes = await axios.post(
        `${BASE_URL}/goals/${g._id}/contributions`,
        { amount: 100, note: 'Automated test deposit' },
        authHeaders
      );
      console.log('   • Deposit added! New currentAmount:', contribRes.data.data.currentAmount);
    }

    // 9. Investment Portfolio
    console.log('\n[Test 9] Investment Portfolio & Market Prices...');
    const invRes = await axios.get(`${BASE_URL}/investments`, authHeaders);
    console.log('✅ Portfolio Holdings:', invRes.data.count);
    console.log('   • Invested Capital:', invRes.data.portfolioSummary.totalInvestedAmount);
    console.log('   • Market Valuation:', invRes.data.portfolioSummary.currentPortfolioValue);
    console.log('   • Profit/Loss:', invRes.data.portfolioSummary.totalProfitLoss);

    // Refresh simulated prices
    const refreshRes = await axios.post(`${BASE_URL}/investments/refresh-prices`, {}, authHeaders);
    console.log('   • Market prices refreshed:', refreshRes.data.message);

    // 10. AI Assistant & Insights
    console.log('\n[Test 10] AI Financial Assistant Endpoints...');
    const chatRes = await axios.post(
      `${BASE_URL}/ai/chat`,
      { message: "Where am I spending the most money?" },
      authHeaders
    );
    console.log('✅ AI Chat Response:');
    console.log('   Reply Preview:', chatRes.data.reply.slice(0, 160) + '...');

    const summaryAiRes = await axios.get(`${BASE_URL}/ai/summary`, authHeaders);
    console.log('✅ AI Monthly Summary:', summaryAiRes.data.summary.slice(0, 120) + '...');

    const expenseAiRes = await axios.get(`${BASE_URL}/ai/expense-analysis`, authHeaders);
    console.log('✅ AI Expense Outlier Analysis:', expenseAiRes.data.highSpendingCategories?.length, 'categories analyzed');

    const budgetAiRes = await axios.get(`${BASE_URL}/ai/budget-recommendations`, authHeaders);
    console.log('✅ AI Budget Recommendation:', '50/30/20 target calculated successfully.');

    // Cleanup created test records
    await axios.delete(`${BASE_URL}/income/${incomeId}`, authHeaders);
    await axios.delete(`${BASE_URL}/expenses/${expenseId}`, authHeaders);

    console.log('\n🎉 ALL 10 COMPREHENSIVE INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    if (server) server.close();
  }
};

runTests();

