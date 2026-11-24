import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Investments from './pages/Investments';
import AiAdvisor from './pages/AiAdvisor';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Main App Layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
              <Navbar />
              <div className="flex-1 flex max-w-7xl w-full mx-auto">
                <Sidebar />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/income" element={<Income />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/budgets" element={<Budgets />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/investments" element={<Investments />} />
                    <Route path="/ai-advisor" element={<AiAdvisor />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

