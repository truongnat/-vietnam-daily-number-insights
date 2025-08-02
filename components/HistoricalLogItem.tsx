
import React, { useState, useMemo } from 'react';
import type { StoredAnalysis } from '@/types';
import { EventSnippet } from '@/components/EventSnippet';
import { NumberCard } from '@/components/NumberCard';
import { ForceCheckButton } from '@/components/ForceCheckButton';

interface HistoricalLogItemProps {
  dateKey: string;
  storedData: StoredAnalysis;
  onLotteryUpdate?: () => void;
}

const WinBadge: React.FC<{ count: number, type: 'de' | 'lo' }> = ({ count, type }) => {
    if (count === 0) return null;
    const isDe = type === 'de';
    const bgColor = isDe ? 'bg-amber-400' : 'bg-green-500';
    const textColor = isDe ? 'text-amber-900' : 'text-green-900';
    const text = isDe ? `Trúng Đề` : `Trúng Lô`;

    return (
        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${bgColor} ${textColor}`}>
            {count > 1 ? `${count} ${text}` : text}
        </span>
    );
};

export const HistoricalLogItem: React.FC<HistoricalLogItemProps> = ({ dateKey, storedData, onLotteryUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { analysis, lotteryResult } = storedData;
    
    const formattedDate = useMemo(() => {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
        }).format(new Date(dateKey));
    }, [dateKey]);

    const winStats = useMemo(() => {
        if (!lotteryResult || (!analysis.bestNumber && !analysis.luckyNumbers)) {
            return { de: 0, lo: 0, total: 0 };
        }
        let de = 0;
        let lo = 0;

        // Check best number
        if (analysis.bestNumber) {
            if (lotteryResult.specialPrize === analysis.bestNumber.number) {
                de++;
            } else if (lotteryResult.allPrizes.includes(analysis.bestNumber.number)) {
                lo++;
            }
        }

        // Check lucky numbers
        if (analysis.luckyNumbers) {
            analysis.luckyNumbers.forEach(ln => {
                if (lotteryResult.specialPrize === ln.number) {
                    de++;
                } else if (lotteryResult.allPrizes.includes(ln.number)) {
                    lo++;
                }
            });
        }

        return { de, lo, total: de + lo };
    }, [lotteryResult, analysis.bestNumber, analysis.luckyNumbers]);

    return (
        <div className="bg-gray-800/70 border border-gray-700 rounded-lg text-left overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex justify-between items-center hover:bg-gray-700/50 transition-colors duration-200"
                aria-expanded={isExpanded}
            >
                <div className="flex-1 text-left">
                    <p className="font-semibold text-lg text-white">{formattedDate}</p>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-400">Gợi ý:</p>
                        {analysis.bestNumber && (
                            <span className="text-lg font-bold text-yellow-300 border border-yellow-600 px-2 py-1 rounded">
                                {analysis.bestNumber.number}
                            </span>
                        )}
                        {analysis.luckyNumbers && analysis.luckyNumbers.map(ln => (
                             <span key={ln.number} className="text-lg font-bold text-gray-200">{ln.number}</span>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {lotteryResult ? (
                         <>
                         {winStats.total > 0 ? (
                            <div className="flex gap-2">
                                <WinBadge count={winStats.de} type="de" />
                                <WinBadge count={winStats.lo} type="lo" />
                            </div>
                         ) : (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-600 text-gray-300">Không trúng</span>
                         )}
                         </>
                    ) : (
                        <ForceCheckButton
                          dateKey={dateKey}
                          onSuccess={onLotteryUpdate}
                        />
                    )}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 text-gray-400 ml-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>

            </button>
            {isExpanded && (
                <div className="p-4 md:p-6 border-t border-gray-700 bg-gray-900/50 animate-fade-in-down">
                    <h4 className="text-lg font-semibold text-teal-300 mb-4">Chi Tiết Phân Tích</h4>
                    <p className="text-sm text-gray-400 italic mb-6">"{analysis.summary}"</p>

                    <div className="mb-6">
                        <h5 className="font-semibold text-gray-300 mb-3">Các Gợi Ý:</h5>
                        <div className="space-y-4">
                            {analysis.bestNumber && (
                                <div className="bg-yellow-900/30 p-4 rounded-md border-l-4 border-yellow-600">
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-white">{analysis.bestNumber.type}: <span className="text-2xl text-yellow-300">{analysis.bestNumber.number}</span></p>
                                        {lotteryResult && (
                                            <div className="flex items-center space-x-2">
                                                {lotteryResult.specialPrize === analysis.bestNumber.number ? (
                                                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-amber-400 text-amber-900">Trúng Đề</span>
                                                ) : lotteryResult.allPrizes.includes(analysis.bestNumber.number) ? (
                                                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-500 text-green-900">Trúng Lô</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-600 text-gray-300">Không trúng</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-yellow-200 mt-1">Tỷ lệ: {analysis.bestNumber.probability}</p>
                                    <p className="text-xs text-gray-400 mt-1 italic">"{analysis.bestNumber.reasoning}"</p>
                                </div>
                            )}
                            {analysis.luckyNumbers && analysis.luckyNumbers.map((ln, index) => (
                                <div key={index} className="bg-gray-800 p-3 rounded-md border-l-4 border-gray-600">
                                    <p className="font-bold text-white">{ln.type}: <span className="text-xl">{ln.number}</span></p>
                                    <p className="text-xs text-gray-400 mt-1">Tỷ lệ: {ln.probability}</p>
                                    <p className="text-xs text-gray-400 mt-1 italic">"{ln.reasoning}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <h5 className="font-semibold text-gray-300 mb-3">Các Con Số Nổi Bật Trong Tin Tức:</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {analysis.topNumbers.map((item, index) => (
                                <NumberCard key={index} number={item.number} count={item.count} reason={item.reason} index={index} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h5 className="font-semibold text-gray-300 mb-3">Nguồn Sự Kiện Chính:</h5>
                        <div className="space-y-3">
                            {analysis.events.map((event, index) => (
                                <EventSnippet key={index} title={event.title} description={event.description} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};