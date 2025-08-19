'use client';

import React, { useState, useEffect } from 'react';
import { CalendarIcon, TrophyIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { 
  fetchTodayAndYesterdayResults, 
  getVietnameseDateString, 
  PRIZE_LABELS,
  isToday,
  hasValidResults,
  type XSMBResult,
  type XSMBPrizes 
} from '@/utils/xsmb-api';

export const XSMBResults: React.FC = () => {
  const [todayResult, setTodayResult] = useState<XSMBResult | null>(null);
  const [yesterdayResult, setYesterdayResult] = useState<XSMBResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { today, yesterday } = await fetchTodayAndYesterdayResults();
      
      setTodayResult(today);
      setYesterdayResult(yesterday);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching XSMB results:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    
    // Auto-refresh every 30 minutes
    const interval = setInterval(fetchResults, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const renderPrizeRow = (prizeKey: keyof XSMBPrizes, numbers: string[]) => {
    const isSpecialPrize = prizeKey === 'ĐB';
    const prizeLabel = PRIZE_LABELS[prizeKey];
    
    // Don't render if no numbers
    if (!numbers || numbers.length === 0) {
      return null;
    }
    
    return (
      <div key={prizeKey} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 py-3 px-3 sm:px-4 rounded-lg transition-all duration-200 ${
        isSpecialPrize 
          ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/40 shadow-lg' 
          : 'bg-gray-800/60 hover:bg-gray-800/80'
      }`}>
        <div className={`font-semibold text-sm sm:text-base min-w-[80px] ${
          isSpecialPrize ? 'text-yellow-300' : 'text-gray-300'
        }`}>
          {prizeLabel}
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-start sm:justify-end">
          {numbers.map((number, index) => (
            <span
              key={index}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-mono font-bold transition-all duration-200 ${
                isSpecialPrize 
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-yellow-100 shadow-lg transform hover:scale-105' 
                  : 'bg-blue-600 text-blue-100 hover:bg-blue-500'
              }`}
            >
              {number}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderResultCard = (result: XSMBResult | null, title: string, icon: React.ReactNode, isCurrentDay: boolean = false) => {
    if (!result) {
      return (
        <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
            <div className="flex items-center space-x-3">
              {icon}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">{title}</h3>
                <p className="text-gray-400 text-sm">Không có dữ liệu</p>
              </div>
            </div>
          </div>
          <div className="text-center py-8 text-gray-400">
            Không thể tải dữ liệu
          </div>
        </div>
      );
    }

    const hasResults = result.data && hasValidResults(result.data);

    return (
      <div className={`bg-gray-800/60 border rounded-lg p-4 sm:p-6 transition-all duration-200 hover:bg-gray-800/80 ${
        isCurrentDay ? 'border-green-500/50 shadow-lg shadow-green-500/10' : 'border-gray-700'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
          <div className="flex items-center space-x-3">
            {icon}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span>{title}</span>
                {isCurrentDay && (
                  <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded-full w-fit">
                    Live
                  </span>
                )}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                {getVietnameseDateString(result.date)}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-sm text-gray-400 font-semibold">XSMB</div>
            <div className="text-xs text-gray-500">{result.date}</div>
          </div>
        </div>

        {result.error || !hasResults ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-gray-400 mb-2">
              <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium text-sm sm:text-base">Chưa có kết quả</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              {result.error || 'Kết quả chưa được công bố'}
            </p>
            {isCurrentDay && (
              <p className="text-xs text-gray-600 mt-2">
                Kết quả sẽ được cập nhật sau 18:15
              </p>
            )}
          </div>
        ) : result.data ? (
          <div className="space-y-2">
            {/* Render prizes in order, but only if they have numbers */}
            {(['ĐB', '1', '2', '3', '4', '5', '6', '7'] as (keyof XSMBPrizes)[]).map(prizeKey => 
              renderPrizeRow(prizeKey, result.data!.prizes[prizeKey])
            ).filter(Boolean)}
            
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-400">
                <span>
                  Tổng cộng: {result.data.allNumbers?.length || 0} số
                </span>
                <span>Nguồn: xoso.com.vn</span>
              </div>
              {result.data.url && (
                <div className="mt-2">
                  <a 
                    href={result.data.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 underline break-all"
                  >
                    Xem chi tiết trên xoso.com.vn
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 text-gray-400">
            <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
            Không có dữ liệu
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto mb-8 px-2 sm:px-4">
        <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6 sm:p-8">
          <div className="flex items-center justify-center space-x-3">
            <ArrowPathIcon className="animate-spin h-5 h-5 sm:h-6 sm:w-6 text-blue-400" />
            <span className="text-gray-400 text-sm sm:text-base">Đang tải kết quả XSMB...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !todayResult && !yesterdayResult) {
    return (
      <div className="w-full max-w-7xl mx-auto mb-8 px-2 sm:px-4">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-red-400 text-xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-red-300 font-semibold text-sm sm:text-base">Lỗi tải dữ liệu XSMB</h3>
              <p className="text-red-400 text-xs sm:text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={fetchResults}
              className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center space-x-2 w-fit"
            >
              <ArrowPathIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Thử lại</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mb-8 px-2 sm:px-4">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center space-x-3">
              <TrophyIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-yellow-400" />
              <span>Kết Quả Xổ Số Miền Bắc</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Kết quả chính thức từ xoso.com.vn
              {lastUpdated && (
                <span className="block sm:inline sm:ml-2 text-xs text-gray-500">
                  • Cập nhật lúc {lastUpdated.toLocaleTimeString('vi-VN')}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchResults}
            disabled={isLoading}
            className="px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg text-gray-300 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center space-x-2 w-fit"
          >
            <ArrowPathIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Today's Results */}
        {renderResultCard(
          todayResult,
          "Hôm nay",
          <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />,
          true
        )}

        {/* Yesterday's Results */}
        {renderResultCard(
          yesterdayResult,
          "Hôm qua",
          <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />,
          false
        )}
      </div>

      {error && (todayResult || yesterdayResult) && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-300 text-xs sm:text-sm">
            ⚠️ Có lỗi khi tải một số dữ liệu: {error}
          </p>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-gray-500">
        <p className="leading-relaxed">
          Dữ liệu được cập nhật tự động mỗi 30 phút • 
          Kết quả chính thức từ Công ty Xổ số kiến thiết Việt Nam
        </p>
      </div>
    </div>
  );
};