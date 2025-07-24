
import React from 'react';
import type { AnalysisResult, LotteryResult } from '../types';
import { NumberCard } from './NumberCard';
import { EventSnippet } from './EventSnippet';
import { LuckyNumberCard } from './LuckyNumberCard';
import { LotteryResultDisplay } from './LotteryResultDisplay';

interface ResultsDisplayProps {
  analysis: AnalysisResult;
  lotteryResult: LotteryResult | null;
  isVerifying: boolean;
  verificationError: string | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ analysis, lotteryResult, isVerifying, verificationError }) => {
  return (
    <div className="w-full max-w-6xl animate-fade-in">
      <p className="text-center text-gray-400 mb-8 max-w-3xl mx-auto">{analysis.summary}</p>
      
      {analysis.luckyNumbers && analysis.luckyNumbers.length > 0 && <LuckyNumberCard luckyNumbers={analysis.luckyNumbers} />}

      {isVerifying && (
        <div className="flex flex-col items-center justify-center space-y-3 my-12">
            <div className="w-10 h-10 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400">Đang đối chiếu với kết quả xổ số...</p>
        </div>
      )}
      {verificationError && (
         <div className="text-center my-8 text-red-400 bg-red-900/20 p-4 rounded-lg max-w-md mx-auto border border-red-500/50">
            <p className="font-semibold text-red-300">Lỗi Đối Chiếu</p>
            <p className="text-sm mt-1">{verificationError}</p>
         </div>
      )}
      {lotteryResult && analysis.luckyNumbers && analysis.luckyNumbers.length > 0 && (
        <LotteryResultDisplay luckyNumbers={analysis.luckyNumbers} lotteryResult={lotteryResult} />
      )}


      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-center mb-6 text-teal-300">Các Con Số Nổi Bật Trong Tin Tức</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {analysis.topNumbers.map((item, index) => (
            <NumberCard key={index} number={item.number} count={item.count} reason={item.reason} index={index} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-center mb-6 text-teal-300">Nguồn Sự Kiện Chính</h2>
        <div className="space-y-4">
          {analysis.events.map((event, index) => (
            <EventSnippet key={index} title={event.title} description={event.description} />
          ))}
        </div>
      </section>
    </div>
  );
};