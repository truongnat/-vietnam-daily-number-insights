
import React from 'react';
import type { LuckyNumber } from '../types';

interface LuckyNumberCardProps {
  luckyNumbers: LuckyNumber[];
}

const StrategyIcon: React.FC<{ strategy: string }> = ({ strategy }) => {
  const iconProps = { className: "w-6 h-6 text-gray-900" };
  switch (strategy) {
    case 'Cân Bằng':
      return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" /></svg>;
    case 'Tin Tức Nóng':
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...iconProps}><path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.071l9 9a.75.75 0 001.071-1.071l-9-9zM12 3a.75.75 0 01.75.75v6.19l1.72-1.72a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l1.72 1.72V3.75A.75.75 0 0112 3zM15.963 15a.75.75 0 00-1.071 1.071l4.5 4.5a.75.75 0 001.071-1.071l-4.5-4.5zM17.625 15.328a9 9 0 10-11.25 0 8.966 8.966 0 005.625 5.672 8.966 8.966 0 005.625-5.672zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>;
    case 'Bất Ngờ':
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...iconProps}><path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.435A.75.75 0 0115.75 15.75v-1.846a.75.75 0 00-.58-.727c-1.952-.447-3.527-1.464-4.663-2.618a.75.75 0 01.22-1.223zM11.25 10.5a.75.75 0 00-1.5 0v2.068a.75.75 0 01-.75.75H7.5a.75.75 0 000 1.5h1.068a.75.75 0 01.75.75v1.068a.75.75 0 001.5 0v-1.068a.75.75 0 01.75-.75h1.068a.75.75 0 000-1.5H12a.75.75 0 01-.75-.75V10.5zM3 4.5a.75.75 0 01.75.75V7.5a.75.75 0 01-1.5 0V5.25A.75.75 0 013 4.5zM4.5 3a.75.75 0 00-.75.75V5.25a.75.75 0 001.5 0V3.75A.75.75 0 004.5 3zM7.5 3a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 017.5 3z" clipRule="evenodd" /></svg>;
    default:
      return null;
  }
};

const SingleSuggestionCard: React.FC<{ luckyNumber: LuckyNumber, index: number }> = ({ luckyNumber, index }) => {
  const colors = [
    { bg: 'bg-blue-400', shadow: 'shadow-blue-500/20', border: 'border-blue-400/30' },
    { bg: 'bg-orange-400', shadow: 'shadow-orange-500/20', border: 'border-orange-400/30' },
    { bg: 'bg-violet-400', shadow: 'shadow-violet-500/20', border: 'border-violet-400/30' }
  ];
  const color = colors[index % 3];

  return (
    <div 
      className={`w-full p-4 relative bg-gradient-to-br from-gray-900 to-gray-800/70 rounded-2xl border ${color.border} shadow-lg ${color.shadow} flex flex-col`}
      style={{ animation: `fadeInUp 0.5s ${index * 150}ms both` }}
    >
      <div className={`absolute -top-3 -left-3 w-10 h-10 ${color.bg} rounded-full flex items-center justify-center`}>
        <StrategyIcon strategy={luckyNumber.strategy} />
      </div>
      <h4 className="text-lg font-bold text-center mt-4 text-white">{luckyNumber.strategy}</h4>
      <p className="text-xs text-center text-gray-400 mb-3">{luckyNumber.strategyDescription}</p>
      
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-7xl font-black text-center text-white my-2 tracking-wider" style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.2)' }}>
          {luckyNumber.number}
        </div>
      </div>
      
      <p className="text-center text-gray-400 italic text-xs mt-3 pt-3 border-t border-gray-700/50">
        "{luckyNumber.reasoning}"
      </p>
    </div>
  );
};

export const LuckyNumberCard: React.FC<LuckyNumberCardProps> = ({ luckyNumbers }) => {
  return (
    <div className="w-full max-w-6xl mx-auto mb-12 animate-fade-in">
       <h3 className="text-xl md:text-2xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400">
        Gợi Ý Con Số May Mắn
      </h3>
       <p className="text-sm text-center text-gray-400 mb-6">Ba chiến lược gợi ý dựa trên phân tích dữ liệu</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {luckyNumbers.map((ln, index) => (
          <SingleSuggestionCard key={index} luckyNumber={ln} index={index} />
        ))}
      </div>
    </div>
  );
};