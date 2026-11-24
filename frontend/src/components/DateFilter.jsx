import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';

export default function DateFilter({
  selectedTimeframe,
  onChangeTimeframe,
  startDate,
  endDate,
  onCustomDateChange
}) {
  const [showCustom, setShowCustom] = useState(selectedTimeframe === 'custom');

  const options = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Custom Range', value: 'custom' },
  ];

  const handleSelect = (val) => {
    if (val === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
    }
    onChangeTimeframe(val);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedTimeframe === opt.value
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="date"
            value={startDate || ''}
            onChange={(e) => onCustomDateChange(e.target.value, endDate)}
            className="bg-transparent border-0 focus:outline-none text-slate-700 dark:text-slate-200"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate || ''}
            onChange={(e) => onCustomDateChange(startDate, e.target.value)}
            className="bg-transparent border-0 focus:outline-none text-slate-700 dark:text-slate-200"
          />
        </div>
      )}
    </div>
  );
}

