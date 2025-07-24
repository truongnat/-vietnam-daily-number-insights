
import React from 'react';

interface ViewToggleProps {
  view: 'daily' | 'frequency';
  setView: (view: 'daily' | 'frequency') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, setView }) => {
  const baseClasses = "px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  const activeClasses = "bg-blue-600 text-white shadow-md";
  const inactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  return (
    <div className="flex items-center justify-center p-1 bg-gray-800 rounded-full mb-8 shadow-inner">
      <button
        onClick={() => setView('daily')}
        className={`${baseClasses} ${view === 'daily' ? activeClasses : inactiveClasses}`}
        aria-pressed={view === 'daily'}
      >
        Dữ liệu hôm nay
      </button>
      <button
        onClick={() => setView('frequency')}
        className={`${baseClasses} ${view === 'frequency' ? activeClasses : inactiveClasses}`}
        aria-pressed={view === 'frequency'}
      >
        Thống kê tần suất
      </button>
    </div>
  );
};
