import React, { useState, useEffect } from 'react';
import { financeApi } from '../api/financeApi';
import { useFinance } from '../context/FinanceContext';
import Modal from '../components/Modal';
import {
  PieChart as BudgetIcon,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = [
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
];

export default function Budgets() {
  const { formatCurrency, triggerRefresh } = useFinance();
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  const [month, setMonth] = useState(currentMonthStr);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State for setting/adjusting budget
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalBudgetInput, setTotalBudgetInput] = useState('');
  const [categoryInputs, setCategoryInputs] = useState(
    CATEGORIES.map((c) => ({ category: c, amount: '' }))
  );
  const [budgetNotes, setBudgetNotes] = useState('');

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getBudgetByMonth(month);
      if (res.success) {
        setBudgetData(res);
      }
    } catch (err) {
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [month]);

  const handleOpenModal = () => {
    if (budgetData?.hasBudget && budgetData.budget) {
      setTotalBudgetInput(budgetData.budget.totalBudget || '');
      setBudgetNotes(budgetData.budget.notes || '');

      const existingMap = {};
      (budgetData.budget.categoryBudgets || []).forEach((cb) => {
        existingMap[cb.category] = cb.amount;
      });

      setCategoryInputs(
        CATEGORIES.map((c) => ({
          category: c,
          amount: existingMap[c] !== undefined ? existingMap[c] : ''
        }))
      );
    } else {
      setTotalBudgetInput(3500);
      setBudgetNotes('Monthly spending plan');
      setCategoryInputs(
        CATEGORIES.map((c) => ({ category: c, amount: '' }))
      );
    }
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    try {
      const formattedCategoryBudgets = categoryInputs
        .filter((c) => c.amount !== '' && Number(c.amount) >= 0)
        .map((c) => ({ category: c.category, amount: Number(c.amount) }));

      await financeApi.setBudget({
        month,
        totalBudget: Number(totalBudgetInput),
        categoryBudgets: formattedCategoryBudgets,
        notes: budgetNotes
      });

      setIsModalOpen(false);
      fetchBudget();
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving budget');
    }
  };

  const categoryComparison = budgetData?.categoryComparison || [];
  const alerts = budgetData?.alerts || [];
  const percentUsed = budgetData?.overallPercentUsed || 0;
  const remainingBudget = budgetData?.remainingBudget || 0;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Budget Management</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {month}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Set spending thresholds, track planned vs actual expenses, and monitor alerts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <button
            onClick={handleOpenModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-500/30 transition-all hover:scale-105"
          >
            <Edit2 className="w-4 h-4" />
            <span>{budgetData?.hasBudget ? 'Adjust Budget' : 'Set Budget'}</span>
          </button>
        </div>
      </div>

      {/* Spending Alerts Banner */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alt, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-center space-x-2.5 text-xs font-medium ${
                alt.type === 'danger'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{alt.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Overall Utilization Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Overall Monthly Budget Utilization
            </h2>
            <p className="text-xs text-slate-500">
              Target for {month}: {formatCurrency(budgetData?.totalBudget || 0)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {percentUsed}%
            </span>
            <span className="text-xs text-slate-400 ml-1">used</span>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentUsed >= 100
                ? 'bg-rose-500'
                : percentUsed >= 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
          <div>
            <span className="text-slate-400">Total Budget Limit:</span>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(budgetData?.totalBudget || 0)}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Actual Outflow:</span>
            <div className="text-base font-bold text-rose-600 mt-0.5">
              {formatCurrency(budgetData?.totalSpent || 0)}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Remaining Cushion:</span>
            <div
              className={`text-base font-bold mt-0.5 ${
                remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(remainingBudget)}
            </div>
          </div>
        </div>
      </div>

      {/* Category-wise Budgets Comparison Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Category Breakdown: Planned vs Actual
          </h2>
          <span className="text-xs text-slate-400">Visual utilization indicators</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryComparison.length > 0 ? (
            categoryComparison.map((cat) => (
              <div
                key={cat.category}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {cat.category}
                    </span>
                    {cat.status === 'exceeded' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                        Exceeded
                      </span>
                    )}
                    {cat.status === 'warning' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                        Warning
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-slate-600 dark:text-slate-300">
                    {cat.percentUsed}%
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      cat.status === 'exceeded'
                        ? 'bg-rose-500'
                        : cat.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, cat.percentUsed)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Spent: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(cat.spent)}</strong></span>
                  <span>Budgeted: <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(cat.budgeted)}</strong></span>
                  <span>
                    Remaining:{' '}
                    <strong className={cat.remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {formatCurrency(cat.remaining)}
                    </strong>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-10 text-center text-xs text-slate-400 bg-white rounded-2xl border">
              No categories configured for this month. Click "Set Budget" to allocate category limits!
            </div>
          )}
        </div>
      </div>

      {/* Adjust Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Set Budget for ${month}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveBudget} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Overall Total Monthly Budget Limit
            </label>
            <input
              type="number"
              required
              min={1}
              value={totalBudgetInput}
              onChange={(e) => setTotalBudgetInput(e.target.value)}
              placeholder="e.g. 4000"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Category-Wise Spending Allocations (Optional limits)
            </label>
            <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {categoryInputs.map((cat, idx) => (
                <div key={cat.category} className="flex items-center space-x-2">
                  <span className="w-28 font-medium text-slate-700 truncate">{cat.category}:</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={cat.amount}
                    onChange={(e) => {
                      const updated = [...categoryInputs];
                      updated[idx].amount = e.target.value;
                      setCategoryInputs(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Strategy / Notes
            </label>
            <textarea
              rows={2}
              value={budgetNotes}
              onChange={(e) => setBudgetNotes(e.target.value)}
              placeholder="e.g. Target 30% savings rate this month..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-sm"
            >
              Save Budget
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

