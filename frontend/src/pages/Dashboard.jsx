import React, { useState, useEffect } from 'react';
import { financeApi } from '../api/financeApi';
import { useFinance } from '../context/FinanceContext';
import StatCard from '../components/StatCard';
import DateFilter from '../components/DateFilter';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Receipt,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

export default function Dashboard() {
  const { formatCurrency, refreshTrigger } = useFinance();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getDashboardData({
        timeframe,
        startDate: timeframe === 'custom' ? startDate : undefined,
        endDate: timeframe === 'custom' ? endDate : undefined
      });
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [timeframe, startDate, endDate, refreshTrigger]);

  const handleCustomDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const summary = data?.summary || {};
  const expenseBreakdown = data?.expenseBreakdown || [];
  const monthlyPerformance = data?.monthlyPerformance || [];
  const recentTransactions = data?.recentTransactions || [];
  const budgetUtilization = data?.budgetUtilization;

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Financial Dashboard</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Overview
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-asset personal finance tracking & dynamic cash flow intelligence.
          </p>
        </div>

        <DateFilter
          selectedTimeframe={timeframe}
          onChangeTimeframe={setTimeframe}
          startDate={startDate}
          endDate={endDate}
          onCustomDateChange={handleCustomDateChange}
        />
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Account Balance"
          value={formatCurrency(summary.totalAccountBalance || 0)}
          subtitle="All-time net liquid balance"
          icon={Wallet}
          colorClass="text-brand-600 bg-brand-50"
        />

        <StatCard
          title="Period Income"
          value={formatCurrency(summary.periodIncome || 0)}
          subtitle="Earnings in selected range"
          icon={ArrowDownLeft}
          colorClass="text-emerald-600 bg-emerald-50"
          trend="+12%"
          trendType="positive"
        />

        <StatCard
          title="Period Expenses"
          value={formatCurrency(summary.periodExpense || 0)}
          subtitle="Outflows in selected range"
          icon={ArrowUpRight}
          colorClass="text-rose-600 bg-rose-50"
          trendType="negative"
        />

        <StatCard
          title="Total Savings"
          value={formatCurrency(summary.totalSavings || 0)}
          subtitle={`Savings Rate: ${summary.savingsRate || 0}%`}
          icon={PiggyBank}
          colorClass="text-indigo-600 bg-indigo-50"
          badgeText="Goals"
        />

        <StatCard
          title="Investments"
          value={formatCurrency(summary.totalInvestments || 0)}
          subtitle={`Return: +${summary.investmentReturnPercent || 0}%`}
          icon={TrendingUp}
          colorClass="text-amber-600 bg-amber-50"
          badgeText="Simulated"
        />
      </div>

      {/* Active Budget Alert Pill if available */}
      {budgetUtilization && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
            budgetUtilization.percentUsed >= 100
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : budgetUtilization.percentUsed >= 80
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">
              Monthly Budget Utilization: {budgetUtilization.percentUsed}%
            </span>
            <span className="hidden md:inline">
              (Spent {formatCurrency(budgetUtilization.spent)} of {formatCurrency(budgetUtilization.totalBudget)})
            </span>
          </div>
          <Link to="/budgets" className="font-bold underline hover:opacity-80">
            View Budget Details &rarr;
          </Link>
        </div>
      )}

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Income vs Expense Performance
              </h2>
              <p className="text-xs text-slate-500">Last 6 months trend comparison</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Monthly History
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), '']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown Donut Chart (1 col) */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Expense Breakdown
            </h2>
            <Link to="/expenses" className="text-xs text-brand-600 hover:text-brand-500 font-semibold">
              Details
            </Link>
          </div>
          <p className="text-xs text-slate-500 mb-2">Distribution by category</p>

          <div className="h-56 w-full relative flex items-center justify-center">
            {expenseBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), '']}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400">
                No expense data recorded in this period.
              </div>
            )}
          </div>

          {/* Category List */}
          <div className="mt-auto space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {expenseBreakdown.slice(0, 5).map((item, idx) => (
              <div key={item.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[110px]">
                    {item.category}
                  </span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(item.amount)} ({item.percent}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Savings Rate Trajectory + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Rate Trajectory (1 col) */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Savings Trajectory
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                Healthy Trend
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Monthly net surplus growth</p>
          </div>

          <div className="h-48 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Saved']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#savingsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-xs flex items-center justify-between">
            <span className="text-slate-500">Current Period Net Cashflow:</span>
            <span className={`font-bold ${summary.netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(summary.netSavings || 0)}
            </span>
          </div>
        </div>

        {/* Recent Combined Transactions Feed (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Recent Transactions
              </h2>
              <p className="text-xs text-slate-500">Latest income and expense records</p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Link to="/income" className="font-semibold text-emerald-600 hover:text-emerald-500">
                + Add Income
              </Link>
              <span className="text-slate-300">|</span>
              <Link to="/expenses" className="font-semibold text-rose-600 hover:text-rose-500">
                + Add Expense
              </Link>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx._id} className="py-2.5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-700/40 rounded-lg px-2 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                        {tx.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{new Date(tx.date).toLocaleDateString()}</span>
                        {tx.paymentDetails && (
                          <>
                            <span>•</span>
                            <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">{tx.paymentDetails}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`text-sm font-bold ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent transactions found. Add income or expenses to see real-time records.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

