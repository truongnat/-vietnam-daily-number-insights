'use client';

import React, { useState, useEffect } from 'react';
import type { StoredAnalysis, LotteryResult } from '@/types';
import { LuckyNumberCard } from '@/components/LuckyNumberCard';
import { LotteryResultDisplay } from '@/components/LotteryResultDisplay';
import { LoadingSpinner } from '@/components/LoadingSpinner';
// ...existing code...

export const TimeBasedDisplay: React.FC = () => {
  const handleRefresh = async () => {
    setIsLoading(true);
    const dateKey = getDateKey(new Date());
    try {
      // Xóa dữ liệu phân tích hiện tại
      await fetch(`/api/storage/analysis/${dateKey}`, { method: 'DELETE' });
    } catch (err) {
      // ignore
    }
    // Phân tích lại và cập nhật UI
    await fetchTodaysData();
  };
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
    setIsLoading(true);
    const dateKey = getDateKey(new Date());
    try {
      // 1. Kiểm tra đã có dữ liệu phân tích chưa
      let analysis = null;
      try {
        const analysisResponse = await fetch(`/api/storage/analysis/${dateKey}`);
        if (analysisResponse.ok) {
          analysis = await analysisResponse.json();
          setAnalysisData(analysis);
        }
      } catch (err) {
        // ignore
      }

      // 2. Nếu chưa có thì mới gọi API phân tích và poll lấy kết quả
      if (!analysis) {
        await fetch('/api/cron/daily-analysis');
        const maxAttempts = 15; // ~30s nếu mỗi lần 2s
        let attempts = 0;
        while (!analysis && attempts < maxAttempts) {
          attempts++;
          try {
            const analysisResponse = await fetch(`/api/storage/analysis/${dateKey}`);
            if (analysisResponse.ok) {
              analysis = await analysisResponse.json();
              setAnalysisData(analysis);
              break;
            }
          } catch (err) {
            // ignore
          }
          await new Promise(res => setTimeout(res, 2000));
        }
        if (!analysis) {
          console.log('Không lấy được dữ liệu phân tích sau khi chạy!');
        }
      }

      // 3. Lấy kết quả xổ số nếu sau 19:00
      const vietnamTime = getVietnamTime();
      if (vietnamTime.getHours() >= 19) {
        try {
          const lotteryResponse = await fetch(`/api/storage/lottery/${dateKey}`);
          if (lotteryResponse.ok) {
            const lotteryData = await lotteryResponse.json();
            setLotteryResult(lotteryData);
          }
        } catch (lotteryError) {
          // ignore
        }
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
            {/* Button làm mới */}
            <div className="flex justify-center mb-4">
              <button
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded shadow transition-all duration-200"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                Làm mới phân tích hôm nay
              </button>
            </div>
            {/* Analysis Summary */}
            <p className="text-gray-300 text-center text-sm sm:text-base leading-relaxed">
              {analysisData?.analysis?.summary}
            </p>

            {/* Lucky Numbers: 1 số đề, 3 số lô */}
            {analysisData?.analysis?.bestNumber && analysisData?.analysis?.luckyNumbers && (
              <LuckyNumberCard
                bestNumber={analysisData.analysis.bestNumber}
                luckyNumbers={analysisData.analysis.luckyNumbers.slice(0, 3)}
              />
            )}

            {/* Lottery Result (only show for 19:00+ and if available) */}
            {currentVietnamTime.getHours() >= 19 && lotteryResult &&
             analysisData?.analysis?.bestNumber && analysisData?.analysis?.luckyNumbers && (
              <LotteryResultDisplay
                bestNumber={analysisData.analysis.bestNumber}
                luckyNumbers={analysisData.analysis.luckyNumbers.slice(0, 3)}
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