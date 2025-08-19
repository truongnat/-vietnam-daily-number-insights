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
      <div key={prizeKey} className={`flex items-center justify-between py-3 px-4 rounded-lg transition-all duration-200 ${
        isSpecialPrize 
          ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/40 shadow-lg' 
          : 'bg-gray-800/60 hover:bg-gray-800/80'
      }`}>
        <div className={`font-semibold min-w-[80px] ${
          isSpecialPrize ? 'text-yellow-300' : 'text-gray-300'
        }`}>
          {prizeLabel}
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {numbers.map((number, index) => (
            <span
              key={index}
              className={`px-3 py-1.5 rounded-full text-sm font-mono font-bold transition-all duration-200 ${
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
        <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {icon}
              <div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
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
      <div className={`bg-gray-800/60 border rounded-lg p-6 transition-all duration-200 hover:bg-gray-800/80 ${
        isCurrentDay ? 'border-green-500/50 shadow-lg shadow-green-500/10' : 'border-gray-700'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {icon}
            <div>
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <span>{title}</span>
                {isCurrentDay && (
                  <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded-full">
                    Live
                  </span>
                )}
              </h3>
              <p className="text-gray-400 text-sm">
                {getVietnameseDateString(result.date)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 font-semibold">XSMB</div>
            <div className="text-xs text-gray-500">{result.date}</div>
          </div>
        </div>

        {result.error || !hasResults ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <ClockIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Chưa có kết quả</p>
            </div>
            <p className="text-sm text-gray-500">
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
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-400">
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
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    Xem chi tiết trên xoso.com.vn
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <ClockIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Không có dữ liệu
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto mb-8">
        <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-8">
          <div className="flex items-center justify-center space-x-3">
            <ArrowPathIcon className="animate-spin h-6 w-6 text-blue-400" />
            <span className="text-gray-400">Đang tải kết quả XSMB...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !todayResult && !yesterdayResult) {
    return (
      <div className="w-full max-w-6xl mx-auto mb-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="text-red-400 text-xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-red-300 font-semibold">Lỗi tải dữ liệu XSMB</h3>
              <p className="text-red-400 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={fetchResults}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Thử lại</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-3">
              <TrophyIcon className="w-8 h-8 text-yellow-400" />
              <span>Kết Quả Xổ Số Miền Bắc</span>
            </h2>
            <p className="text-gray-400">
              Kết quả chính thức từ xoso.com.vn
              {lastUpdated && (
                <span className="ml-2 text-xs text-gray-500">
                  • Cập nhật lúc {lastUpdated.toLocaleTimeString('vi-VN')}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchResults}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg text-gray-300 text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Results */}
        {renderResultCard(
          todayResult,
          "Hôm nay",
          <CalendarIcon className="w-6 h-6 text-green-400" />,
          true
        )}

        {/* Yesterday's Results */}
        {renderResultCard(
          yesterdayResult,
          "Hôm qua",
          <ClockIcon className="w-6 h-6 text-blue-400" />,
          false
        )}
      </div>

      {error && (todayResult || yesterdayResult) && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-300 text-sm">
            ⚠️ Có lỗi khi tải một số dữ liệu: {error}
          </p>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-gray-500">
        <p>
          Dữ liệu được cập nhật tự động mỗi 30 phút • 
          Kết quả chính thức từ Công ty Xổ số kiến thiết Việt Nam
        </p>
      </div>
    </div>
  );
};