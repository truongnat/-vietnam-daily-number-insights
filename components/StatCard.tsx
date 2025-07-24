import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  number: string | undefined;
  description: string;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, number, description, colorClass }) => {
  return (
    <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700/80 flex items-center space-x-4 h-full">
      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-300">{label}</p>
        <p className="text-3xl font-bold text-white tracking-wider">
          {number ?? <span className="text-gray-600">-</span>}
        </p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
};
