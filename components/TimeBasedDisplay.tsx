'use client';

import React, { useState, useEffect } from 'react';
import type { StoredAnalysis, LotteryResult } from '@/types';
import { LuckyNumberCard } from '@/components/LuckyNumberCard';
import { LotteryResultDisplay } from '@/components/LotteryResultDisplay';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ForceRunButton } from '@/components/ForceRunButton';

interface TimeSlot {
  time: string;
  hour: number;
  label: string;
}

const TIME_SLOTS: TimeSlot[] = [
  { time: '12:00', hour: 12, label: 'Phân Tích Buổi Trưa' },
  { time: '16:00', hour: 16, label: 'Phân Tích Buổi Chiều' },
  { time: '17:00', hour: 17, label: 'Phân Tích Cuối Ngày' },
];

export const TimeBasedDisplay: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<StoredAnalysis | null>(null);
  const [lotteryResult, setLotteryResult] = useState<LotteryResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVietnamTime, setCurrentVietnamTime] = useState<Date>(new Date());

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

  const hasDataForTimeSlot = (timeSlot: TimeSlot): boolean => {
    if (!analysisData) return false;

    // Check if we have data and current time is past the time slot
    // This ensures we only show sections after cron jobs have had a chance to run
    const currentHour = currentVietnamTime.getHours();
    return currentHour >= timeSlot.hour;
  };

  const getTimeSlotStatus = (timeSlot: TimeSlot): 'completed' | 'upcoming' => {
    const currentHour = currentVietnamTime.getHours();

    if (currentHour >= timeSlot.hour) return 'completed';
    return 'upcoming';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner />
        <p className="text-gray-400 mt-4">Đang tải dữ liệu theo thời gian thực...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl space-y-8">
      {/* Current Time Display */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-teal-300 mb-2">
          Phân Tích Theo Thời Gian Thực
        </h2>
        <p className="text-gray-400">
          Thời gian Việt Nam: {currentVietnamTime.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
          })}
        </p>
      </div>

      {/* Time Slots - Only show if data exists and time has passed */}
      {TIME_SLOTS.filter(timeSlot => hasDataForTimeSlot(timeSlot)).map((timeSlot) => {
        const status = getTimeSlotStatus(timeSlot);

        return (
          <div key={timeSlot.time} className="border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                {timeSlot.label} ({timeSlot.time})
              </h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                status === 'completed' ? 'bg-green-900/50 text-green-300 border border-green-500/50' :
                'bg-gray-900/50 text-gray-400 border border-gray-500/50'
              }`}>
                {status === 'completed' ? 'Đã hoàn thành' : 'Chưa tới giờ'}
              </div>
            </div>

            {analysisData && (
              <div className="space-y-6">
                {/* Analysis Summary */}
                <p className="text-gray-300 text-center">
                  {analysisData.analysis.summary}
                </p>

                {/* Lucky Numbers */}
                {analysisData.analysis.bestNumber && analysisData.analysis.luckyNumbers && (
                  <LuckyNumberCard
                    bestNumber={analysisData.analysis.bestNumber}
                    luckyNumbers={analysisData.analysis.luckyNumbers}
                  />
                )}

                {/* Lottery Result (only show for 19:00+ and if available) */}
                {currentVietnamTime.getHours() >= 19 && lotteryResult &&
                 analysisData.analysis.bestNumber && analysisData.analysis.luckyNumbers && (
                  <LotteryResultDisplay
                    bestNumber={analysisData.analysis.bestNumber}
                    luckyNumbers={analysisData.analysis.luckyNumbers}
                    lotteryResult={lotteryResult}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* No Data Message */}
      {!analysisData && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            Chưa có dữ liệu phân tích cho hôm nay.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Dữ liệu sẽ xuất hiện sau khi cron jobs chạy vào 12:00, 16:00, và 17:00.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Refresh trang để xem kết quả mới nhất.
          </p>
        </div>
      )}

      {/* Show message when no time slots are visible yet */}
      {analysisData && TIME_SLOTS.filter(timeSlot => hasDataForTimeSlot(timeSlot)).length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            Có dữ liệu nhưng chưa tới giờ hiển thị.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Thời gian hiện tại: {currentVietnamTime.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Ho_Chi_Minh'
            })}
          </p>
        </div>
      )}
    </div>
  );
};
