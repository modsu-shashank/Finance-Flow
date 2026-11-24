import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
  Target,
  TrendingUp,
  Sparkles,
  User,
  HelpCircle
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Income', path: '/income', icon: ArrowDownLeft },
  { name: 'Expenses', path: '/expenses', icon: ArrowUpRight },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Savings & Goals', path: '/goals', icon: Target },
  { name: 'Investments', path: '/investments', icon: TrendingUp },
  { name: 'AI Financial Advisor', path: '/ai-advisor', icon: Sparkles, badge: 'Smart' },
  { name: 'My Profile', path: '/profile', icon: User },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 hidden md:block bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded bg-amber-100 text-amber-800 border border-amber-200">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Financial Health Tip Widget */}
      <div className="mt-8 p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
        <div className="flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Smart Rule</span>
        </div>
        <p className="text-[11px] text-emerald-700/90 mt-1 leading-relaxed">
          Aim to allocate <strong>50%</strong> to needs, <strong>30%</strong> to wants, and <strong>20%</strong> to savings and investments.
        </p>
      </div>
    </aside>
  );
}

