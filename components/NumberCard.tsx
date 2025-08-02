
import React from 'react';
import type { LotteryResult } from '@/types';

interface NumberCardProps {
  number: string;
  count: number;
  reason: string;
  index: number;
  lotteryResult?: LotteryResult;
}

export const NumberCard: React.FC<NumberCardProps> = ({ number, count, reason, index, lotteryResult }) => {
  const delay = index * 100;

  // Determine win status
  const getWinStatus = () => {
    if (!lotteryResult) return null;

    if (lotteryResult.specialPrize === number) {
      return { type: 'de', label: 'Trúng Đề', bgColor: 'bg-amber-400', textColor: 'text-amber-900' };
    } else if (lotteryResult.allPrizes.includes(number)) {
      return { type: 'lo', label: 'Trúng Lô', bgColor: 'bg-green-500', textColor: 'text-green-900' };
    } else {
      return { type: 'miss', label: 'Không trúng', bgColor: 'bg-gray-600', textColor: 'text-gray-300' };
    }
  };

  const winStatus = getWinStatus();

  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col items-center text-center shadow-lg transform hover:scale-105 transition-transform duration-300 h-full relative"
      style={{ animation: `fadeInUp 0.5s ${delay}ms both` }}
    >
      {winStatus && (
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${winStatus.bgColor} ${winStatus.textColor}`}>
            {winStatus.label}
          </span>
        </div>
      )}
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
