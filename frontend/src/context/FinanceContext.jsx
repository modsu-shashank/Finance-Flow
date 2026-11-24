import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Format currency based on user settings
  const formatCurrency = useCallback((amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
    const currency = user?.currency || 'USD';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `$${Number(amount).toFixed(2)}`;
    }
  }, [user?.currency]);

  return (
    <FinanceContext.Provider
      value={{
        refreshTrigger,
        triggerRefresh,
        formatCurrency,
        userCurrency: user?.currency || 'USD'
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);

