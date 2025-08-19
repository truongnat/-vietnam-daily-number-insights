'use client';

import React, { useState, useEffect } from 'react';
import { CalendarIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/outline';

interface XSMBPrizes {
  'ĐB': string[];
  '1': string[];
  '2': string[];
  '3': string[];
  '4': string[];
  '5': string[];
  '6': string[];
  '7': string[];
}

interface XSMBData {
  prizes: XSMBPrizes;
  allNumbers: string[];
  meta: {
    detectedDate: string;
    tableSource: string;
    totalNumbers: number;
  };
}

interface XSMBResult {
  date: string;
  data?: XSMBData;
  error?: string;
}

interface XSMBResponse {
  ok: boolean;
  range: boolean;
  region: string;
  date?: string;
  start?: string;
  end?: string;
  data?: XSMBData;
  results?: XSMBResult[];
  error?: string;
}

export const XSMBResults: React.FC = () => {
  const [todayResult, setTodayResult] = useState<XSMBResult | null>(null);
  const [yesterdayResult, setYesterdayResult] = useState<XSMBResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDateString = (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const getVietnameseDateString = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchXSMBResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const todayStr = getDateString(today);
      const yesterdayStr = getDateString(yesterday);

      // Fetch results for both days using range API
      const response = await fetch(
        `https://v0-next-js-app-for-xoso.vercel.app/api/xoso?start=${yesterdayStr}&end=${todayStr}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: XSMBResponse = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to fetch XSMB results');
      }

      if (data.results) {
        // Find today's and yesterday's results
        const todayData = data.results.find(r => r.date === todayStr);
        const yesterdayData = data.results.find(r => r.date === yesterdayStr);

        setTodayResult(todayData || { date: todayStr, error: 'No data available' });
        setYesterdayResult(yesterdayData || { date: yesterdayStr, error: 'No data available' });
      }
    } catch (err) {
      console.error('Error fetching XSMB results:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchXSMBResults();
  }, []);

  const renderPrizeRow = (prizeKey: keyof XSMBPrizes, prizeLabel: string, numbers: string[]) => {
    const isSpecialPrize = prizeKey === 'ĐB';
    
    return (
      <div key={prizeKey} className={`flex items-center justify-between py-2 px-3 rounded-lg ${
        isSpecialPrize ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30' : 'bg-gray-800/50'
      }`}>
        <div className={`font-semibold ${isSpecialPrize ? 'text-yellow-300' : 'text-gray-300'}`}>
          {prizeLabel}
        </div>
        <div className="flex flex-wrap gap-2">
          {numbers.map((number, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm font-mono font-bold ${
                isSpecialPrize 
                  ? 'bg-yellow-600 text-yellow-100 shadow-lg' 
                  : 'bg-blue-600 text-blue-100'
              }`}
            >
              {number}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderResultCard = (result: XSMBResult, title: string, icon: React.ReactNode) => {
    return (
      <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {icon}
            <div>
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="text-gray-400 text-sm">
                {getVietnameseDateString(result.date)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">XSMB</div>
            <div className="text-xs text-gray-500">{result.date}</div>
          </div>
        </div>

        {result.error ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <ClockIcon className="w-8 h-8 mx-auto mb-2" />
              Chưa có kết quả
            </div>
            <p className="text-sm text-gray-500">{result.error}</p>
          </div>
        ) : result.data ? (
          <div className="space-y-3">
            {renderPrizeRow('ĐB', 'Đặc biệt', result.data.prizes['ĐB'])}
            {renderPrizeRow('1', 'Giải nhất', result.data.prizes['1'])}
            {renderPrizeRow('2', 'Giải nhì', result.data.prizes['2'])}
            {renderPrizeRow('3', 'Giải ba', result.data.prizes['3'])}
            {renderPrizeRow('4', 'Giải tư', result.data.prizes['4'])}
            {renderPrizeRow('5', 'Giải năm', result.data.prizes['5'])}
            {renderPrizeRow('6', 'Giải sáu', result.data.prizes['6'])}
            {renderPrizeRow('7', 'Giải bảy', result.data.prizes['7'])}
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400 text-center">
                Tổng cộng: {result.data.meta.totalNumbers} số
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
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
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            <span className="text-gray-400">Đang tải kết quả XSMB...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto mb-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="text-red-400">⚠️</div>
            <div>
              <h3 className="text-red-300 font-semibold">Lỗi tải dữ liệu XSMB</h3>
              <p className="text-red-400 text-sm mt-1">{error}</p>
              <button
                onClick={fetchXSMBResults}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors duration-200"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-3">
          <TrophyIcon className="w-8 h-8 text-yellow-400" />
          <span>Kết Quả Xổ Số Miền Bắc</span>
        </h2>
        <p className="text-gray-400">
          Kết quả chính thức từ xoso.com.vn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Results */}
        {todayResult && renderResultCard(
          todayResult,
          "Hôm nay",
          <CalendarIcon className="w-6 h-6 text-green-400" />
        )}

        {/* Yesterday's Results */}
        {yesterdayResult && renderResultCard(
          yesterdayResult,
          "Hôm qua",
          <ClockIcon className="w-6 h-6 text-blue-400" />
        )}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={fetchXSMBResults}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm font-medium transition-colors duration-200"
        >
          🔄 Làm mới kết quả
        </button>
      </div>
    </div>
  );
};