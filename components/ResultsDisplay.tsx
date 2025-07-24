
import React from 'react';
import type { AnalysisResult } from '../types';
import { NumberCard } from './NumberCard';
import { EventSnippet } from './EventSnippet';
import { LuckyNumberCard } from './LuckyNumberCard';

interface ResultsDisplayProps {
  analysis: AnalysisResult;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ analysis }) => {
  return (
    <div className="w-full max-w-6xl animate-fade-in">
      <p className="text-center text-gray-400 mb-8 max-w-3xl mx-auto">{analysis.summary}</p>
      
      {analysis.luckyNumber && <LuckyNumberCard luckyNumber={analysis.luckyNumber} />}

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
