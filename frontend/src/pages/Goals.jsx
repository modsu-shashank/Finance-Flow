import React, { useState, useEffect } from 'react';
import { financeApi } from '../api/financeApi';
import { useFinance } from '../context/FinanceContext';
import Modal from '../components/Modal';
import {
  Target,
  Plus,
  PiggyBank,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Trash2,
  Edit2,
  DollarSign
} from 'lucide-react';

const GOAL_CATEGORIES = [
  'Emergency fund',
  'Buy a laptop',
  'Purchase a vehicle',
  'Higher education',
  'Travel',
  'House savings',
  'Wedding',
  'Retirement',
  'Other'
];

export default function Goals() {
  const { formatCurrency, triggerRefresh } = useFinance();
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [goalForm, setGoalForm] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: 'Emergency fund',
    priority: 'Medium',
    notes: '',
  });

  // Deposit Contribution Modal
  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contribAmount, setContribAmount] = useState('');
  const [contribNote, setContribNote] = useState('');

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getGoals();
      if (res.success) {
        setGoals(res.data);
        setSummary(res.summary || {});
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenAddGoal = () => {
    setEditingId(null);
    setGoalForm({
      title: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      category: 'Emergency fund',
      priority: 'Medium',
      notes: '',
    });
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal) => {
    setEditingId(goal._id);
    setGoalForm({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : '',
      category: goal.category,
      priority: goal.priority,
      notes: goal.notes || '',
    });
    setIsGoalModalOpen(true);
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this financial goal?')) {
      try {
        await financeApi.deleteGoal(id);
        fetchGoals();
        triggerRefresh();
      } catch (err) {
        console.error('Delete goal error:', err);
      }
    }
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await financeApi.updateGoal(editingId, goalForm);
      } else {
        await financeApi.addGoal(goalForm);
      }
      setIsGoalModalOpen(false);
      fetchGoals();
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving goal');
    }
  };

  const handleOpenDeposit = (goal) => {
    setSelectedGoal(goal);
    setContribAmount('');
    setContribNote('Deposit from monthly savings');
    setIsContribModalOpen(true);
  };

  const handleSaveContribution = async (e) => {
    e.preventDefault();
    if (!selectedGoal || !contribAmount) return;
    try {
      await financeApi.addGoalContribution(selectedGoal._id, {
        amount: Number(contribAmount),
        note: contribNote
      });
      setIsContribModalOpen(false);
      fetchGoals();
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding deposit');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Savings & Financial Goals</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {goals.length} active
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track emergency reserves, tech gadgets, vehicles, travel, and long-term milestones.
          </p>
        </div>

        <button
          onClick={handleOpenAddGoal}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-sm shadow-brand-500/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Financial Goal</span>
        </button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Goals Target</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(summary.totalTarget || 0)}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Total Accumulated Savings</div>
          <div className="text-xl font-black text-emerald-900 mt-1">
            {formatCurrency(summary.totalSaved || 0)}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Remaining to Goal Targets</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(summary.totalRemaining || 0)}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
          <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Overall Completion</div>
          <div className="text-xl font-black text-indigo-900 mt-1">
            {summary.overallProgress || 0}%
          </div>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => (
          <div
            key={goal._id}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {goal.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                    {goal.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditGoal(goal)}
                    className="p-1 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress and percentage */}
              <div className="mt-4">
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-600 text-sm">
                    {formatCurrency(goal.currentAmount)}
                  </span>
                  <span className="text-slate-400 font-medium">
                    of {formatCurrency(goal.targetAmount)} ({goal.progressPercent}%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
                  />
                </div>
              </div>

              {/* Timing metrics & recommended contribution */}
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1 text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>Target Date:</span>
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {new Date(goal.targetDate).toLocaleDateString()} ({goal.daysRemaining} days left)
                  </span>
                </div>

                {goal.recommendedMonthlyContribution > 0 && !goal.isCompleted && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>Suggested Pace:</span>
                    </span>
                    <span className="font-semibold text-brand-600">
                      {formatCurrency(goal.recommendedMonthlyContribution)}/mo
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contribution Button */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              {goal.isCompleted ? (
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Goal Achieved!</span>
                </div>
              ) : (
                <button
                  onClick={() => handleOpenDeposit(goal)}
                  className="w-full py-2 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Savings Deposit</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Goal Add/Edit Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title={editingId ? 'Edit Financial Goal' : 'Create Financial Goal'}
      >
        <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              required
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
              placeholder="e.g. Emergency Fund, Tesla Model Y, Vacation in Japan"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Target Amount
              </label>
              <input
                type="number"
                min={1}
                required
                value={goalForm.targetAmount}
                onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                placeholder="10000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Initial / Current Saved
              </label>
              <input
                type="number"
                min={0}
                value={goalForm.currentAmount}
                onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Category
              </label>
              <select
                value={goalForm.category}
                onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {GOAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                required
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={goalForm.notes}
              onChange={(e) => setGoalForm({ ...goalForm, notes: e.target.value })}
              placeholder="Why this goal matters, account type, etc..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsGoalModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold shadow-sm"
            >
              {editingId ? 'Update Goal' : 'Save Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Contribution Modal */}
      <Modal
        isOpen={isContribModalOpen}
        onClose={() => setIsContribModalOpen(false)}
        title={`Add Savings Deposit: ${selectedGoal?.title}`}
      >
        <form onSubmit={handleSaveContribution} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Deposit Amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min={0.01}
                required
                value={contribAmount}
                onChange={(e) => setContribAmount(e.target.value)}
                placeholder="500.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Deposit Note / Source
            </label>
            <input
              type="text"
              value={contribNote}
              onChange={(e) => setContribNote(e.target.value)}
              placeholder="e.g. End of month transfer, consulting bonus"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsContribModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-sm"
            >
              Confirm Deposit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

