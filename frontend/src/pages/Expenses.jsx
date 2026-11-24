import React, { useState, useEffect } from 'react';
import { financeApi } from '../api/financeApi';
import { useFinance } from '../context/FinanceContext';
import Modal from '../components/Modal';
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  Trash2,
  Edit2,
  Calendar,
  BarChart2,
  PieChart as PieIcon,
  ShoppingBag
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

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

const METHODS = [
  'Credit Card',
  'Debit Card',
  'Cash',
  'Bank Transfer',
  'UPI',
  'PayPal',
  'Other'
];

export default function Expenses() {
  const { formatCurrency, triggerRefresh } = useFinance();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [reportsData, setReportsData] = useState([]);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [showReportsView, setShowReportsView] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'Food',
    paymentMethod: 'Credit Card',
    description: '',
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getExpenses({
        search: search || undefined,
        category: categoryFilter || undefined,
        paymentMethod: methodFilter || undefined,
        limit: 100
      });
      if (res.success) {
        setExpenses(res.data);
        setTotalAmount(res.totalAmount || 0);
        setCategoryBreakdown(res.categoryBreakdown || []);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await financeApi.getExpenseReports({ year: reportYear });
      if (res.success) {
        setReportsData(res.monthly || []);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, methodFilter]);

  useEffect(() => {
    fetchReports();
  }, [reportYear]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      category: 'Food',
      paymentMethod: 'Credit Card',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (expense) => {
    setEditingId(expense._id);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      date: expense.date ? expense.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      description: expense.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await financeApi.deleteExpense(id);
        fetchExpenses();
        fetchReports();
        triggerRefresh();
      } catch (err) {
        console.error('Delete expense error:', err);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await financeApi.updateExpense(editingId, formData);
      } else {
        await financeApi.addExpense(formData);
      }
      setIsModalOpen(false);
      fetchExpenses();
      fetchReports();
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving expense');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Expense Management</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {expenses.length} records
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track, audit, and analyze outlays across 10 specialized spending categories.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowReportsView(!showReportsView)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <BarChart2 className="w-4 h-4 text-slate-600" />
            <span>{showReportsView ? 'Hide Reports' : 'Monthly Reports'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-sm shadow-rose-500/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Total Recorded Outflow</div>
            <div className="text-2xl font-black text-rose-900 mt-1">{formatCurrency(totalAmount)}</div>
          </div>
          <ArrowUpRight className="w-8 h-8 text-rose-600 opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Spending Category</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {categoryBreakdown[0] ? `${categoryBreakdown[0]._id}` : 'None'}
            </div>
            {categoryBreakdown[0] && (
              <div className="text-[11px] text-slate-400 mt-0.5">
                {formatCurrency(categoryBreakdown[0].total)} ({categoryBreakdown[0].count} txns)
              </div>
            )}
          </div>
          <ShoppingBag className="w-8 h-8 text-slate-400" />
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Expense</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(expenses.length > 0 ? totalAmount / expenses.length : 0)}
            </div>
          </div>
          <Calendar className="w-8 h-8 text-slate-400" />
        </div>
      </div>

      {/* Monthly and Yearly Report View (Collapsible) */}
      {showReportsView && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Monthly & Yearly Expense Reports ({reportYear})
              </h2>
              <p className="text-xs text-slate-500">Expenditure pattern over all 12 calendar months</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Year:</span>
              <select
                value={reportYear}
                onChange={(e) => setReportYear(Number(e.target.value))}
                className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700"
              >
                {[2026, 2025, 2024].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Total Spent']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="total" name="Monthly Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by merchant, title, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </form>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="">All Payment Methods</option>
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <button
          onClick={fetchExpenses}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 transition-colors"
        >
          Apply Filters
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Merchant / Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {expenses.length > 0 ? (
                expenses.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{item.title}</div>
                      {item.description && (
                        <div className="text-[11px] font-normal text-slate-400 truncate max-w-xs">{item.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {item.paymentMethod}
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-600 text-sm">
                      -{formatCurrency(item.amount)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Edit"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        title="Delete"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No expense entries found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Expense Record' : 'Record New Expense'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Title / Merchant</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Whole Foods Market, Subway Pass, Utility Bill"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Notes</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional notes or details..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-sm"
            >
              {editingId ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

