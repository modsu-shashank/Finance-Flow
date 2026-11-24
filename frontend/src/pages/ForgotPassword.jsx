import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { TrendingUp, Mail, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');
    setIsSubmitting(true);

    try {
      const res = await authApi.forgotPassword(email);
      setStatusMessage(res.message || 'Password reset link generated.');
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not process password reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white shadow-xl shadow-brand-500/30 mb-4">
          <KeyRound className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">Reset Password</h2>
        <p className="mt-1 text-sm text-emerald-400 font-medium">Finance Flow Security Center</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/10 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-white/15 sm:px-10">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {statusMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold">{statusMessage}</p>
                {resetToken && (
                  <div className="mt-3 p-2 bg-slate-900/80 rounded-lg border border-slate-700">
                    <p className="text-[11px] text-slate-400">One-time reset token:</p>
                    <code className="text-xs text-brand-300 break-all select-all">{resetToken}</code>
                    <div className="mt-2">
                      <button
                        onClick={() => navigate(`/reset-password/${resetToken}`)}
                        className="text-xs text-white bg-brand-600 hover:bg-brand-500 px-3 py-1 rounded-lg font-semibold"
                      >
                        Proceed to Reset &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@financeflow.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Requesting token...' : 'Send Reset Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Remembered your credentials?{' '}
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

