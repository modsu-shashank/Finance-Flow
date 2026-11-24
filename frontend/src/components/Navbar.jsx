import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  LogOut,
  User,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-brand-700 dark:from-white dark:to-emerald-400 bg-clip-text text-transparent">
                Finance Flow
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Track Smarter, Invest Better
              </span>
            </div>
          </Link>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Quick AI Advisor CTA */}
          <Link
            to="/ai-advisor"
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>AI Advisor</span>
          </Link>

          {/* User profile dropdown / info */}
          {user && (
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-700">
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-200 hover:text-brand-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'FF'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="font-semibold text-xs leading-none">{user.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{user.currency} Active</div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

