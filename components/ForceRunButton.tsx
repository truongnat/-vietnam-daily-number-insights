'use client';

import React, { useState } from 'react';
import { PlayIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ForceRunButtonProps {
  onStatusUpdate?: () => void;
}

interface ProcessStatus {
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
}

export const ForceRunButton: React.FC<ForceRunButtonProps> = ({ onStatusUpdate }) => {
  const [analysisStatus, setAnalysisStatus] = useState<ProcessStatus>({ status: 'idle' });
  const [lotteryStatus, setLotteryStatus] = useState<ProcessStatus>({ status: 'idle' });
  const [isExpanded, setIsExpanded] = useState(false);

  const runDailyAnalysis = async () => {
    setAnalysisStatus({ status: 'running', message: 'Đang chạy phân tích hàng ngày...' });
    
    try {
      const response = await fetch('/api/cron/daily-analysis');
      const data = await response.json();
      
      if (data.success) {
        setAnalysisStatus({ 
          status: 'success', 
          message: `Phân tích đã bắt đầu cho ${data.dateKey}. Đang xử lý trong nền...` 
        });
        
        // Check status after a delay
        setTimeout(async () => {
          try {
            const statusResponse = await fetch('/api/cron/status');
            const statusData = await statusResponse.json();
            
            if (statusData.success && statusData.processing.analysis.status === 'completed') {
              setAnalysisStatus({ 
                status: 'success', 
                message: 'Phân tích hoàn thành thành công!' 
              });
              onStatusUpdate?.();
            } else if (statusData.processing.analysis.status === 'failed') {
              setAnalysisStatus({ 
                status: 'error', 
                message: `Phân tích thất bại: ${statusData.processing.analysis.error || 'Lỗi không xác định'}` 
              });
            }
          } catch (error) {
            console.error('Error checking status:', error);
          }
        }, 5000);
        
      } else {
        setAnalysisStatus({ 
          status: 'error', 
          message: `Lỗi: ${data.error || 'Không thể chạy phân tích'}` 
        });
      }
    } catch (error) {
      setAnalysisStatus({ 
        status: 'error', 
        message: `Lỗi kết nối: ${error instanceof Error ? error.message : 'Không xác định'}` 
      });
    }
  };

  const runLotteryCheck = async () => {
    setLotteryStatus({ status: 'running', message: 'Đang kiểm tra kết quả xổ số...' });
    
    try {
      const response = await fetch('/api/cron/lottery-check');
      const data = await response.json();
      
      if (data.success) {
        setLotteryStatus({ 
          status: 'success', 
          message: `Kiểm tra xổ số đã bắt đầu cho ${data.dateKey}. Đang xử lý trong nền...` 
        });
        
        // Check status after a delay
        setTimeout(async () => {
          try {
            const statusResponse = await fetch('/api/cron/status');
            const statusData = await statusResponse.json();
            
            if (statusData.success && statusData.processing.lottery.status === 'completed') {
              setLotteryStatus({ 
                status: 'success', 
                message: 'Kiểm tra xổ số hoàn thành thành công!' 
              });
              onStatusUpdate?.();
            } else if (statusData.processing.lottery.status === 'failed') {
              setLotteryStatus({ 
                status: 'error', 
                message: `Kiểm tra xổ số thất bại: ${statusData.processing.lottery.error || 'Lỗi không xác định'}` 
              });
            }
          } catch (error) {
            console.error('Error checking status:', error);
          }
        }, 5000);
        
      } else {
        setLotteryStatus({ 
          status: 'error', 
          message: `Lỗi: ${data.error || data.message || 'Không thể kiểm tra xổ số'}` 
        });
      }
    } catch (error) {
      setLotteryStatus({ 
        status: 'error', 
        message: `Lỗi kết nối: ${error instanceof Error ? error.message : 'Không xác định'}` 
      });
    }
  };

  const getStatusIcon = (status: ProcessStatus) => {
    switch (status.status) {
      case 'running':
        return <ClockIcon className="w-4 h-4 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />;
      default:
        return <PlayIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ProcessStatus) => {
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
            <PlayIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Chạy Thủ Công</h3>
            <span className="text-sm text-gray-400">
              (Force Run Processes)
            </span>
          </div>
          <div className="text-gray-400">
            {isExpanded ? '▼' : '▶'}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-700 space-y-4">
            <p className="text-sm text-gray-400 mb-4">
              Chạy thủ công các tiến trình phân tích và kiểm tra xổ số thay vì chờ cron job tự động.
            </p>

            {/* Daily Analysis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">Phân Tích Hàng Ngày</h4>
                <button
                  onClick={runDailyAnalysis}
                  disabled={analysisStatus.status === 'running'}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  {getStatusIcon(analysisStatus)}
                  <span>
                    {analysisStatus.status === 'running' ? 'Đang chạy...' : 'Chạy Ngay'}
                  </span>
                </button>
              </div>
              {analysisStatus.message && (
                <p className={`text-sm ${getStatusColor(analysisStatus)}`}>
                  {analysisStatus.message}
                </p>
              )}
            </div>

            {/* Lottery Check */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">Kiểm Tra Xổ Số</h4>
                <button
                  onClick={runLotteryCheck}
                  disabled={lotteryStatus.status === 'running'}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  {getStatusIcon(lotteryStatus)}
                  <span>
                    {lotteryStatus.status === 'running' ? 'Đang chạy...' : 'Chạy Ngay'}
                  </span>
                </button>
              </div>
              {lotteryStatus.message && (
                <p className={`text-sm ${getStatusColor(lotteryStatus)}`}>
                  {lotteryStatus.message}
                </p>
              )}
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-400">
                💡 <strong>Lưu ý:</strong> Các tiến trình sẽ chạy trong nền và có thể mất 1-2 phút để hoàn thành. 
                Kết quả sẽ được lưu tự động vào database.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
