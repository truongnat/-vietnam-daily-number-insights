'use client';

import React, { useState } from 'react';
import { PlayIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ForceCheckButtonProps {
  dateKey: string;
  onSuccess?: () => void;
}

interface CheckStatus {
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
}

export const ForceCheckButton: React.FC<ForceCheckButtonProps> = ({ dateKey, onSuccess }) => {
  const [checkStatus, setCheckStatus] = useState<CheckStatus>({ status: 'idle' });

  const runLotteryCheck = async () => {
    setCheckStatus({ status: 'running', message: 'Đang kiểm tra kết quả xổ số...' });

    try {
      // Use the new lottery check API for specific dates
      const response = await fetch('/api/cron/lottery-check-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateKey })
      });

      const data = await response.json();

      if (data.success) {
        setCheckStatus({
          status: 'success',
          message: `Đã cập nhật kết quả xổ số cho ${dateKey}!`
        });
        // Wait a moment then trigger refresh
        setTimeout(() => {
          onSuccess?.();
        }, 1000);
      } else {
        setCheckStatus({
          status: 'error',
          message: data.error || 'Không thể kiểm tra kết quả xổ số'
        });
      }
    } catch (error) {
      setCheckStatus({
        status: 'error',
        message: `Lỗi kết nối: ${error instanceof Error ? error.message : 'Không xác định'}`
      });
    }
  };

  const getStatusIcon = () => {
    switch (checkStatus.status) {
      case 'running':
        return <ClockIcon className="w-3 h-3 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircleIcon className="w-3 h-3 text-green-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-3 h-3 text-red-400" />;
      default:
        return <PlayIcon className="w-3 h-3 text-gray-400" />;
    }
  };

  const getButtonColor = () => {
    switch (checkStatus.status) {
      case 'running':
        return 'bg-blue-600 text-blue-100';
      case 'success':
        return 'bg-green-600 text-green-100';
      case 'error':
        return 'bg-red-600 text-red-100';
      default:
        return 'bg-gray-600 hover:bg-gray-500 text-gray-200';
    }
  };

  const getButtonText = () => {
    switch (checkStatus.status) {
      case 'running':
        return 'Đang kiểm tra...';
      case 'success':
        return 'Đã cập nhật';
      case 'error':
        return 'Thử lại';
      default:
        return 'Kiểm tra KQ';
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={runLotteryCheck}
        disabled={checkStatus.status === 'running' || checkStatus.status === 'success'}
        className={`px-2 py-1 text-xs font-medium rounded transition-colors duration-200 flex items-center space-x-1 ${getButtonColor()} ${
          checkStatus.status === 'running' || checkStatus.status === 'success' 
            ? 'cursor-not-allowed opacity-75' 
            : 'cursor-pointer'
        }`}
        title={checkStatus.message || `Kiểm tra kết quả xổ số cho ${dateKey}`}
      >
        {getStatusIcon()}
        <span>{getButtonText()}</span>
      </button>
      
      {checkStatus.message && checkStatus.status !== 'idle' && (
        <div className={`text-xs max-w-48 text-right ${
          checkStatus.status === 'success' ? 'text-green-400' :
          checkStatus.status === 'error' ? 'text-red-400' :
          'text-blue-400'
        }`}>
          {checkStatus.message}
        </div>
      )}
    </div>
  );
};
