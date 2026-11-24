import React, { useState, useEffect } from 'react';
import { financeApi } from '../api/financeApi';
import { useFinance } from '../context/FinanceContext';
import Modal from '../components/Modal';
import {
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  'Salary',
  'Freelancing',
  'Business',
  'Investments',
  'Rental income',
  'Other income'
];

const SOURCES = [
  'Bank Account',
  'Direct Deposit',
  'Cash',
  'PayPal',
  'Wire Transfer',
  'Cheque',
  'Stripe',
  'Crypto Wallet',
  'Other'
];

export default function Income() {
  const { formatCurrency, triggerRefresh } = useFinance();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'Salary',
    paymentSource: 'Bank Account',
    description: '',
    isRecurring: false,
  });

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getIncomes({
        search: search || undefined,
        category: categoryFilter || undefined,
        paymentSource: sourceFilter || undefined,
        limit: 100
      });
      if (res.success) {
        setIncomes(res.data);
        setTotalAmount(res.totalAmount || 0);
      }
    } catch (err) {
      console.error('Error fetching incomes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [categoryFilter, sourceFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIncomes();
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      category: 'Salary',
      paymentSource: 'Bank Account',
      description: '',
      isRecurring: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (income) => {
    setEditingId(income._id);
    setFormData({
      title: income.title,
      amount: income.amount,
      date: income.date ? income.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      category: income.category,
      paymentSource: income.paymentSource,
      description: income.description || '',
      isRecurring: Boolean(income.isRecurring),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      try {
        await financeApi.deleteIncome(id);
        fetchIncomes();
        triggerRefresh();
      } catch (err) {
        console.error('Delete income error:', err);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await financeApi.updateIncome(editingId, formData);
      } else {
        await financeApi.addIncome(formData);
      }
      setIsModalOpen(false);
      fetchIncomes();
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving income');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Income Management</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {incomes.length} records
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Categorize salaries, consulting, business dividends, and recurring revenue.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-sm shadow-brand-500/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Income</span>
        </button>
      </div>

      {/* KPI banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Total Recorded Income</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">{formatCurrency(totalAmount)}</div>
          </div>
          <ArrowDownLeft className="w-8 h-8 text-emerald-600 opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Categories</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {new Set(incomes.map((i) => i.category)).size} Categories
            </div>
          </div>
          <Sparkles className="w-8 h-8 text-slate-400" />
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Inflow</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(incomes.length > 0 ? totalAmount / incomes.length : 0)}
            </div>
          </div>
          <Calendar className="w-8 h-8 text-slate-400" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Sources</option>
          {SOURCES.map((src) => (
            <option key={src} value={src}>
              {src}
            </option>
          ))}
        </select>

        <button
          onClick={fetchIncomes}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 transition-colors"
        >
          Apply Filters
        </button>
      </div>

      {/* Income Records Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Title / Source</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {incomes.length > 0 ? (
                incomes.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{item.title}</div>
                      {item.description && (
                        <div className="text-[11px] font-normal text-slate-400 truncate max-w-xs">{item.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {item.paymentSource}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 text-sm">
                      +{formatCurrency(item.amount)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Edit"
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
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
                    No income entries found matching your criteria.
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
        title={editingId ? 'Edit Income Entry' : 'Add New Income'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Title / Source</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Monthly Salary, Freelance Milestone"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Payment Source</label>
              <select
                value={formData.paymentSource}
                onChange={(e) => setFormData({ ...formData, paymentSource: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional notes or client name..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="isRecurring" className="text-slate-700 select-none">
              Mark as recurring monthly revenue
            </label>
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
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold shadow-sm"
            >
              {editingId ? 'Update Income' : 'Save Income'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

