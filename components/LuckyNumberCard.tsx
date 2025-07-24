
import React from 'react';
import type { LuckyNumber } from '../types';

interface LuckyNumberCardProps {
  luckyNumber: LuckyNumber;
}

export const LuckyNumberCard: React.FC<LuckyNumberCardProps> = ({ luckyNumber }) => {
  const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.32 1.011l-4.2 4.244a.563.563 0 0 0-.162.632l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 21.4a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.162-.631l-4.2-4.244a.562.562 0 0 1 .32-1.011l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  );

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 animate-fade-in p-6 relative bg-gradient-to-br from-blue-900 via-gray-900 to-teal-900 rounded-2xl border border-teal-400/30 shadow-2xl shadow-teal-500/10">
      <div className="absolute -top-3 -left-3 w-12 h-12 bg-teal-400 rounded-full flex items-center justify-center animate-pulse">
        <StarIcon className="w-6 h-6 text-gray-900" />
      </div>
      <h3 className="text-xl font-bold text-center mb-1 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400">
        Gợi Ý Con Số May Mắn
      </h3>
       <p className="text-sm text-center text-gray-400 mb-4">Dựa trên phân tích tin tức và dữ liệu lịch sử</p>
      <div className="text-7xl md:text-8xl font-black text-center text-white my-4 tracking-wider" style={{ textShadow: '0 0 15px rgba(56, 189, 248, 0.4)' }}>
        {luckyNumber.number}
      </div>
      <p className="text-center text-gray-300 italic text-sm">
        "{luckyNumber.reasoning}"
      </p>
    </div>
  );
};
