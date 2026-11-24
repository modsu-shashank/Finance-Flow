import React, { useState, useEffect } from 'react';
import { financeApi } from '../api/financeApi';
import { useFinance } from '../context/FinanceContext';
import Modal from '../components/Modal';
import {
  TrendingUp,
  Plus,
  RefreshCw,
  AlertCircle,
  PieChart as PieIcon,
  Trash2,
  Edit2,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

const ASSET_TYPES = [
  'Stocks',
  'Mutual funds',
  'ETFs',
  'Gold',
  'Fixed deposits',
  'Cryptocurrency',
  'Other investments'
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

export default function Investments() {
  const { formatCurrency, triggerRefresh } = useFinance();
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    assetName: '',
    symbol: '',
    assetType: 'Stocks',
    purchasePrice: '',
    currentPrice: '',
    quantity: '',
    investmentDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getInvestments();
      if (res.success) {
        setInvestments(res.data);
        setSummary(res.portfolioSummary || {});
      }
    } catch (err) {
      console.error('Error fetching investments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleRefreshMarketPrices = async () => {
    try {
      setIsRefreshing(true);
      await financeApi.refreshMarketPrices();
      await fetchInvestments();
      triggerRefresh();
    } catch (err) {
      console.error('Refresh price error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      assetName: '',
      symbol: '',
      assetType: 'Stocks',
      purchasePrice: '',
      currentPrice: '',
      quantity: '',
      investmentDate: new Date().toISOString().slice(0, 10),
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inv) => {
    setEditingId(inv._id);
    setFormData({
      assetName: inv.assetName,
      symbol: inv.symbol || '',
      assetType: inv.assetType,
      purchasePrice: inv.purchasePrice,
      currentPrice: inv.currentPrice,
      quantity: inv.quantity,
      investmentDate: inv.investmentDate ? inv.investmentDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes: inv.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this investment holding?')) {
      try {
        await financeApi.deleteInvestment(id);
        fetchInvestments();
        triggerRefresh();
      } catch (err) {
        console.error('Delete investment error:', err);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await financeApi.updateInvestment(editingId, formData);
      } else {
        await financeApi.addInvestment(formData);
      }
      setIsModalOpen(false);
      fetchInvestments();
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving investment');
    }
  };

  const assetAllocation = summary.assetAllocation || [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Investment Portfolio</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {investments.length} holdings
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track stocks, mutual funds, index ETFs, gold, fixed deposits, and cryptocurrency assets.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefreshMarketPrices}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Update Live Market Prices'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-sm shadow-amber-500/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Alert */}
      <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start space-x-3 text-xs text-amber-900">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Simulated Market Data & Educational Tracking Notice:</span> Market valuation prices are simulated for portfolio tracking and demonstration purposes. Finance Flow does not execute live security trades or guarantee investment returns.
        </div>
      </div>

      {/* Portfolio KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Invested Capital</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(summary.totalInvestedAmount || 0)}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Current Portfolio Valuation</div>
          <div className="text-2xl font-black text-amber-900 mt-1">
            {formatCurrency(summary.currentPortfolioValue || 0)}
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            summary.totalProfitLoss >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
          }`}
        >
          <div
            className={`text-xs font-semibold uppercase tracking-wider ${
              summary.totalProfitLoss >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            Unrealized Profit / Loss
          </div>
          <div
            className={`text-2xl font-black mt-1 ${
              summary.totalProfitLoss >= 0 ? 'text-emerald-900' : 'text-rose-900'
            }`}
          >
            {summary.totalProfitLoss >= 0 ? '+' : ''}
            {formatCurrency(summary.totalProfitLoss || 0)}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Return Percentage</div>
          <div
            className={`text-2xl font-black mt-1 ${
              summary.returnPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {summary.returnPercentage >= 0 ? '+' : ''}
            {summary.returnPercentage || 0}%
          </div>
        </div>
      </div>

      {/* Asset Allocation Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Portfolio Allocation
            </h2>
            <p className="text-xs text-slate-500">Asset-wise diversification</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center my-2">
            {assetAllocation.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    dataKey="currentValue"
                    nameKey="assetType"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Current Value']}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400">No assets tracked yet.</div>
            )}
          </div>

          <div className="space-y-1.5 text-xs">
            {assetAllocation.map((item, idx) => (
              <div key={item.assetType} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-600 dark:text-slate-300">{item.assetType}</span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(item.currentValue)} ({item.allocationPercent}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Holdings Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Securities & Asset Holdings
            </h2>
            <span className="text-xs text-slate-400">Calculated P&L</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Avg Buy</th>
                  <th className="py-3 px-4">Live Price</th>
                  <th className="py-3 px-4">Market Val</th>
                  <th className="py-3 px-4">P&L (%)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {investments.length > 0 ? (
                  investments.map((inv) => {
                    const invested = inv.purchasePrice * inv.quantity;
                    const curVal = inv.currentPrice * inv.quantity;
                    const pl = curVal - invested;
                    const plPct = invested > 0 ? ((pl / invested) * 100).toFixed(1) : 0;
                    const isProfit = pl >= 0;

                    return (
                      <tr key={inv._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          <div>{inv.assetName}</div>
                          {inv.symbol && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{inv.symbol}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{inv.assetType}</td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-200 font-medium">{inv.quantity}</td>
                        <td className="py-3 px-4 text-slate-500">{formatCurrency(inv.purchasePrice)}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{formatCurrency(inv.currentPrice)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{formatCurrency(curVal)}</td>
                        <td className={`py-3 px-4 font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isProfit ? '+' : ''}{formatCurrency(pl)} ({isProfit ? '+' : ''}{plPct}%)
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEdit(inv)}
                            className="p-1 text-slate-400 hover:text-amber-600 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(inv._id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      No investment assets logged. Click "Add Asset" to start tracking your portfolio.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Investment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Investment Asset' : 'Add Investment Asset'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Asset Name</label>
              <input
                type="text"
                required
                value={formData.assetName}
                onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                placeholder="e.g. Apple Inc, Vanguard VOO"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Ticker / Symbol</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="e.g. AAPL, BTC, GLD"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Asset Type</label>
              <select
                value={formData.assetType}
                onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {ASSET_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Units / Quantity</label>
              <input
                type="number"
                step="any"
                min={0.0001}
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="e.g. 10"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Purchase Price per Unit</label>
              <input
                type="number"
                step="any"
                min={0.0001}
                required
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="150.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Current Market Price</label>
              <input
                type="number"
                step="any"
                min={0.0001}
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                placeholder="Leave blank to match buy price"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">Date Acquired</label>
            <input
              type="date"
              required
              value={formData.investmentDate}
              onChange={(e) => setFormData({ ...formData, investmentDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold shadow-sm"
            >
              {editingId ? 'Update Holding' : 'Save Holding'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

