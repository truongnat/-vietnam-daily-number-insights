
import React from 'react';
import type { LuckyNumber, BestNumber } from '@/types';

interface LuckyNumberCardProps {
  bestNumber: BestNumber;
  luckyNumbers: LuckyNumber[];
}

const TypeIcon: React.FC<{ type: string }> = ({ type }) => {
  const iconProps = { className: "w-6 h-6 text-gray-900" };
  if (type === 'Số Đề May Mắn Nhất') {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...iconProps}><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>;
  } else {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...iconProps}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>;
  }
};

const BestNumberCard: React.FC<{ bestNumber: BestNumber }> = ({ bestNumber }) => {
  return (
    <div
      className="w-full p-6 relative bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl border border-yellow-400/30 shadow-lg shadow-yellow-500/20 flex flex-col"
      style={{ animation: 'fadeInUp 0.5s both' }}
    >
      <div className="absolute -top-3 -left-3 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
        <TypeIcon type={bestNumber.type} />
      </div>
      <h4 className="text-xl font-bold text-center mt-4 text-white">{bestNumber.type}</h4>
      <p className="text-sm text-center text-yellow-100 mb-4">Tỷ lệ: {bestNumber.probability}</p>

      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-8xl font-black text-center text-white my-4 tracking-wider" style={{ textShadow: '0 0 15px rgba(255, 255, 255, 0.3)' }}>
          {bestNumber.number}
        </div>
      </div>

      <p className="text-center text-yellow-100 italic text-sm mt-4 pt-4 border-t border-yellow-400/30">
        "{bestNumber.reasoning}"
      </p>
    </div>
  );
};

const LuckyNumberSmallCard: React.FC<{ luckyNumber: LuckyNumber, index: number }> = ({ luckyNumber, index }) => {
  const colors = [
    { bg: 'bg-blue-400', shadow: 'shadow-blue-500/20', border: 'border-blue-400/30' },
    { bg: 'bg-green-400', shadow: 'shadow-green-500/20', border: 'border-green-400/30' },
    { bg: 'bg-purple-400', shadow: 'shadow-purple-500/20', border: 'border-purple-400/30' },
    { bg: 'bg-pink-400', shadow: 'shadow-pink-500/20', border: 'border-pink-400/30' }
  ];
  const color = colors[index % 4];

  return (
    <div
      className={`w-full p-3 relative bg-gradient-to-br from-gray-900 to-gray-800/70 rounded-xl border ${color.border} shadow-lg ${color.shadow} flex flex-col`}
      style={{ animation: `fadeInUp 0.5s ${(index + 1) * 100}ms both` }}
    >
      <div className={`absolute -top-2 -left-2 w-8 h-8 ${color.bg} rounded-full flex items-center justify-center`}>
        <TypeIcon type={luckyNumber.type} />
      </div>
      <h5 className="text-sm font-bold text-center mt-3 text-white">{luckyNumber.type}</h5>
      <p className="text-xs text-center text-gray-400 mb-2">Tỷ lệ: {luckyNumber.probability}</p>

      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-4xl font-black text-center text-white my-2 tracking-wider" style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.2)' }}>
          {luckyNumber.number}
        </div>
      </div>

      <p className="text-center text-gray-400 italic text-xs mt-2 pt-2 border-t border-gray-700/50">
        "{luckyNumber.reasoning}"
      </p>
    </div>
  );
};

export const LuckyNumberCard: React.FC<LuckyNumberCardProps> = ({ bestNumber, luckyNumbers }) => {
  return (
    <div className="w-full max-w-6xl mx-auto mb-12 animate-fade-in">
      <h3 className="text-xl md:text-2xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400">
        Số May Mắn Hôm Nay
      </h3>
      <p className="text-sm text-center text-gray-400 mb-6">1 số đề may mắn nhất và 4 số lô tiềm năng</p>

      {/* Số đề may mắn nhất */}
      <div className="mb-8">
        <BestNumberCard bestNumber={bestNumber} />
      </div>

      {/* 4 số lô tiềm năng */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {luckyNumbers.map((ln, index) => (
          <LuckyNumberSmallCard key={index} luckyNumber={ln} index={index} />
        ))}
      </div>
    </div>
  );
};