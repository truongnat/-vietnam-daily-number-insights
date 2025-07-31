'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchDailyAnalysis, fetchCurrentDayLotteryResult } from '@/services/geminiService';
import type { AnalysisResult, GroundingChunk, StoredAnalysis, LotteryResult } from '@/types';
import { getTodaysAnalysis, saveTodaysAnalysis, saveTodaysLotteryResult } from '@/utils/storage';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { Footer } from '@/components/Footer';
import { TimeStatus } from '@/components/TimeStatus';
import { ViewToggle } from '@/components/ViewToggle';
import { FrequencyDashboard } from '@/components/FrequencyDashboard';
import { HistoricalLog } from '@/components/HistoricalLog';

export default function Page() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [lotteryResult, setLotteryResult] = useState<LotteryResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [view, setView] = useState<'daily' | 'frequency' | 'history'>('daily');

  const getVietnamTime = () => {
    const now = new Date();
    const utcOffset = now.getTimezoneOffset() * 60000;
    const vietnamOffset = 7 * 3600000;
    return new Date(now.getTime() + utcOffset + vietnamOffset);
  };

  const vietnamTime = getVietnamTime();
  const isAfterCutoff = vietnamTime.getHours() >= 16;
  const isAfterLotteryTime = vietnamTime.getHours() > 18 || (vietnamTime.getHours() === 18 && vietnamTime.getMinutes() >= 35);

  const handleFetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLotteryResult(null);

    try {
      const storedData = await getTodaysAnalysis();
      if (storedData) {
        setAnalysis(storedData.analysis);
        setGroundingChunks(storedData.groundingChunks);
        if (storedData.lotteryResult) {
          setLotteryResult(storedData.lotteryResult);
        }
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error fetching stored data:", error);
      // Continue to fetch fresh data if stored data fails
    }

    try {
      const result = await fetchDailyAnalysis();
      if (result.analysis && result.analysis.luckyNumbers && result.analysis.luckyNumbers.length > 0) {
        setAnalysis(result.analysis);
        setGroundingChunks(result.groundingChunks);
        try {
          await saveTodaysAnalysis({ analysis: result.analysis, groundingChunks: result.groundingChunks });
        } catch (saveError) {
          console.error("Error saving analysis:", saveError);
          // Don't fail the whole operation if saving fails
        }
      } else {
        setError("Không thể truy xuất phân tích hợp lệ. Mô hình có thể đã trả về phản hồi trống hoặc không hợp lệ.");
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Đã xảy ra một lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'daily') {
      handleFetchData();
    }
  }, [view, handleFetchData]);

  useEffect(() => {
    if (view === 'daily' && analysis && analysis.luckyNumbers && analysis.luckyNumbers.length > 0 && isAfterLotteryTime && !lotteryResult && !isVerifying) {
        const verifyResult = async () => {
            setIsVerifying(true);
            setVerificationError(null);
            console.log("Time is after 18:35, fetching today's lottery results...");
            try {
                const result = await fetchCurrentDayLotteryResult();
                if (result) {
                    setLotteryResult(result);
                    try {
                        await saveTodaysLotteryResult(result);
                    } catch (saveError) {
                        console.error("Error saving lottery result:", saveError);
                        // Don't fail the whole operation if saving fails
                    }
                } else {
                    setVerificationError("Không thể lấy kết quả xổ số. Phản hồi không hợp lệ.");
                }
            } catch (e) {
                console.error("Error fetching lottery results:", e);
                setVerificationError(e instanceof Error ? e.message : 'Lỗi khi kiểm tra kết quả xổ số.');
            } finally {
                setIsVerifying(false);
            }
        };
        verifyResult();
    }
  }, [analysis, view, isAfterLotteryTime, lotteryResult, isVerifying]);

  const renderDailyView = () => (
    <>
      <TimeStatus isAfterCutoff={isAfterCutoff} />
      {isLoading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {analysis && !isLoading &&
        <ResultsDisplay
          analysis={analysis}
          lotteryResult={lotteryResult}
          isVerifying={isVerifying}
          verificationError={verificationError}
        />}
      {!isLoading && !analysis && !error && (
        <div className="text-center mt-16">
          <p className="text-gray-400">Không tìm thấy dữ liệu được lưu trữ cho ngày hôm nay.</p>
          <button
            onClick={handleFetchData}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors duration-300 shadow-lg"
          >
            Lấy Số Hôm Nay
          </button>
        </div>
      )}
    </>
  );

  const renderContent = () => {
    switch(view) {
      case 'daily':
        return renderDailyView();
      case 'frequency':
        return <FrequencyDashboard />;
      case 'history':
        return <HistoricalLog />;
      default:
        return renderDailyView();
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        <ViewToggle view={view} setView={setView} />
        {renderContent()}
      </main>
      <Footer groundingChunks={view === 'daily' ? groundingChunks : []} />
    </div>
  );
}
