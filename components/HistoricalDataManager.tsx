'use client';

import React, { useState } from 'react';
import { MagnifyingGlassIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SearchStatus {
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
  foundCount?: number;
  errors?: string[];
}

export const HistoricalDataManager: React.FC = () => {
  const [searchStatus, setSearchStatus] = useState<SearchStatus>({ status: 'idle' });
  const [isExpanded, setIsExpanded] = useState(false);

  const searchMissingData = async () => {
    setSearchStatus({ status: 'running', message: 'Đang tìm kiếm dữ liệu xổ số lịch sử...' });
    
    try {
      const response = await fetch('/api/historical/search-missing', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setSearchStatus({ 
          status: 'success', 
          message: `Hoàn thành! Tìm thấy ${Object.keys(data.foundResults || {}).length} kết quả xổ số.`,
          foundCount: Object.keys(data.foundResults || {}).length,
          errors: data.errors
        });
      } else {
        setSearchStatus({ 
          status: 'error', 
          message: `Lỗi: ${data.error || 'Không thể tìm kiếm dữ liệu'}` 
        });
      }
    } catch (error) {
      setSearchStatus({ 
        status: 'error', 
        message: `Lỗi kết nối: ${error instanceof Error ? error.message : 'Không xác định'}` 
      });
    }
  };

  const getStatusIcon = (status: SearchStatus) => {
    switch (status.status) {
      case 'running':
        return <ClockIcon className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <MagnifyingGlassIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: SearchStatus) => {
    switch (status.status) {
      case 'running':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="bg-gray-800/60 border border-gray-700 rounded-lg overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <MagnifyingGlassIcon className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Quản Lý Dữ Liệu Lịch Sử</h3>
            <span className="text-sm text-gray-400">
              (AI Historical Data Search)
            </span>
          </div>
          <div className="text-gray-400">
            {isExpanded ? '▼' : '▶'}
          </div>
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-700 space-y-4">
            <div className="text-sm text-gray-300 mb-4">
              <p className="mb-2">
                <strong>Tính năng AI tìm kiếm dữ liệu lịch sử:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Tự động tìm kiếm kết quả xổ số 14 ngày qua bằng AI</li>
                <li>Bổ sung dữ liệu thiếu để cải thiện độ chính xác phân tích</li>
                <li>Sử dụng Google Search để tìm kết quả chính thức</li>
                <li>Lưu tự động vào cơ sở dữ liệu</li>
              </ul>
            </div>

            {/* Search Missing Data */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">Tìm Kiếm Dữ Liệu Thiếu</h4>
                <button
                  onClick={searchMissingData}
                  disabled={searchStatus.status === 'running'}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  {getStatusIcon(searchStatus)}
                  <span>
                    {searchStatus.status === 'running' ? 'Đang tìm kiếm...' : 'Tìm Kiếm Ngay'}
                  </span>
                </button>
              </div>
              {searchStatus.message && (
                <div className="space-y-2">
                  <p className={`text-sm ${getStatusColor(searchStatus)}`}>
                    {searchStatus.message}
                  </p>
                  {searchStatus.foundCount !== undefined && searchStatus.foundCount > 0 && (
                    <div className="text-sm text-green-400 bg-green-900/20 p-2 rounded border border-green-500/50">
                      ✅ Đã bổ sung {searchStatus.foundCount} kết quả xổ số vào cơ sở dữ liệu
                    </div>
                  )}
                  {searchStatus.errors && searchStatus.errors.length > 0 && (
                    <div className="text-sm text-yellow-400 bg-yellow-900/20 p-2 rounded border border-yellow-500/50">
                      <p className="font-medium">Một số lỗi đã xảy ra:</p>
                      <ul className="list-disc list-inside mt-1">
                        {searchStatus.errors.slice(0, 3).map((error, index) => (
                          <li key={index} className="text-xs">{error}</li>
                        ))}
                        {searchStatus.errors.length > 3 && (
                          <li className="text-xs">... và {searchStatus.errors.length - 3} lỗi khác</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 border-t border-gray-700 pt-3">
              <p><strong>Lưu ý:</strong> Quá trình tìm kiếm có thể mất 1-2 phút để hoàn thành. 
              AI sẽ tìm kiếm từng ngày một cách tuần tự để tránh giới hạn tốc độ.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
