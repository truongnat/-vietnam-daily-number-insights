
import React from 'react';

interface NumberCardProps {
  number: string;
  count: number;
  reason: string;
  index: number;
}

export const NumberCard: React.FC<NumberCardProps> = ({ number, count, reason, index }) => {
  const delay = index * 100;
  return (
    <div 
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col items-center text-center shadow-lg transform hover:scale-105 transition-transform duration-300 h-full"
      style={{ animation: `fadeInUp 0.5s ${delay}ms both` }}
    >
      <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-teal-300 to-blue-400 mb-2">
        {number}
      </div>
      <div className="text-sm text-gray-400 mb-3">
        Xuất hiện <span className="font-semibold text-white">{count}</span> lần
      </div>
      <p className="text-xs text-gray-400 italic mt-auto pt-2 border-t border-gray-700/50 w-full">
        {reason}
      </p>
    </div>
  );
};

// Add keyframes to a style tag in your main html or css file if you can.
// Since we can't, we add it here as a comment.
/*
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
*/
