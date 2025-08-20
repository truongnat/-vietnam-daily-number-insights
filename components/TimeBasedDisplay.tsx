'use client';

import React, { useState, useEffect } from 'react';
import type { StoredAnalysis, LotteryResult } from '@/types';
import { LuckyNumberCard } from '@/components/LuckyNumberCard';
import { LotteryResultDisplay } from '@/components/LotteryResultDisplay';
import { LoadingSpinner } from '@/components/LoadingSpinner';
// ...existing code...

export const TimeBasedDisplay: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<StoredAnalysis | null>(null);
  const [lotteryResult, setLotteryResult] = useState<LotteryResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVietnamTime, setCurrentVietnamTime] = useState<Date>(new Date());
    const [isSaved, setIsSaved] = useState(false);

  const getVietnamTime = () => {
    const now = new Date();
    const utcOffset = now.getTimezoneOffset() * 60000;
    const vietnamOffset = 7 * 3600000;
    return new Date(now.getTime() + utcOffset + vietnamOffset);
  };

  const getDateKey = (date: Date): string => {
    const vietnamTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    return vietnamTime.toISOString().split('T')[0];
  };

  const fetchTodaysData = async () => {
    try {
      setIsLoading(true);
      const dateKey = getDateKey(new Date());

      // Fetch analysis data
      try {
        const analysisResponse = await fetch(`/api/storage/analysis/${dateKey}`);
        if (analysisResponse.ok) {
          const data = await analysisResponse.json();
          setAnalysisData(data);
        } else {
          console.log('No analysis data available yet');
        }
      } catch (analysisError) {
        console.error('Error fetching analysis data:', analysisError);
      }

      // Fetch lottery result if it's after 19:00
      try {
        const vietnamTime = getVietnamTime();
        if (vietnamTime.getHours() >= 19) {
          const lotteryResponse = await fetch(`/api/storage/lottery/${dateKey}`);
          if (lotteryResponse.ok) {
            const lotteryData = await lotteryResponse.json();
            setLotteryResult(lotteryData);
          } else {
            console.log('No lottery data available yet');
          }
        }
      } catch (lotteryError) {
        console.error('Error fetching lottery data:', lotteryError);
      }
    } catch (error) {
      console.error('Error in fetchTodaysData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysData();

    // Update Vietnam time every minute
    const timeInterval = setInterval(() => {
      setCurrentVietnamTime(getVietnamTime());
    }, 60000);

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  const hasData = (): boolean => {
    return !!analysisData;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
        <LoadingSpinner />
        <p className="text-gray-400 mt-4 text-sm sm:text-base text-center">
          Đang tải dữ liệu theo thời gian thực...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-4">
      {/* Current Time Display */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-teal-300 mb-2">
          Phân Tích Theo Thời Gian Thực
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Thời gian Việt Nam: {currentVietnamTime.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
          })}
        </p>
      </div>

  {/* ...existing code... */}

      {/* Analysis Data - Show if available */}
      {hasData() && (
        <div className="border border-gray-700 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-white">
              Phân Tích Hôm Nay
            </h3>
            <div className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-900/50 text-green-300 border border-green-500/50 w-fit">
              Đã hoàn thành
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Analysis Summary */}
            <p className="text-gray-300 text-center text-sm sm:text-base leading-relaxed">
              {analysisData?.analysis?.summary}
            </p>

            {/* Lucky Numbers */}
            {analysisData?.analysis?.bestNumber && analysisData?.analysis?.luckyNumbers && (
              <LuckyNumberCard
                bestNumber={analysisData.analysis.bestNumber}
                luckyNumbers={analysisData.analysis.luckyNumbers}
              />
            )}

            {/* Lottery Result (only show for 19:00+ and if available) */}
            {currentVietnamTime.getHours() >= 19 && lotteryResult &&
             analysisData?.analysis?.bestNumber && analysisData?.analysis?.luckyNumbers && (
              <LotteryResultDisplay
                bestNumber={analysisData.analysis.bestNumber}
                luckyNumbers={analysisData.analysis.luckyNumbers}
                lotteryResult={lotteryResult}
              />
            )}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!analysisData && (
        <div className="text-center py-8 sm:py-12 px-4">
          <p className="text-gray-400 text-base sm:text-lg mb-2">
            Chưa có dữ liệu phân tích cho hôm nay.
          </p>
          <p className="text-gray-500 text-sm sm:text-base mt-2">
            Dữ liệu sẽ được phân tích tự động khi bạn vào màn hình này.
          </p>
          {/* ...existing code... */}
        </div>
      )}
    </div>
  );
};