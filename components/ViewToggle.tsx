import React from 'react';

interface ViewToggleProps {
  view: 'realtime' | 'frequency' | 'history';
  setView: (view: 'realtime' | 'frequency' | 'history') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, setView }) => {
  const baseClasses = "px-4 md:px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 whitespace-nowrap";
  const activeClasses = "bg-blue-600 text-white shadow-md";
  const inactiveClasses = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  return (
    <div className="flex items-center justify-center p-1 bg-gray-800 rounded-full mb-8 shadow-inner">
      <button
        onClick={() => setView('realtime')}
        className={`${baseClasses} ${view === 'realtime' ? activeClasses : inactiveClasses}`}
        aria-pressed={view === 'realtime'}
      >
        Realtime
      </button>
      <button
        onClick={() => setView('frequency')}
        className={`${baseClasses} ${view === 'frequency' ? activeClasses : inactiveClasses}`}
        aria-pressed={view === 'frequency'}
      >
        Tần suất
      </button>
       <button
        onClick={() => setView('history')}
        className={`${baseClasses} ${view === 'history' ? activeClasses : inactiveClasses}`}
        aria-pressed={view === 'history'}
      >
        Nhật ký
      </button>
    </div>
  );
};