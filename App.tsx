
import React, { useState, useEffect, useCallback } from 'react';
import { fetchDailyAnalysis } from './services/geminiService';
import type { AnalysisResult, GroundingChunk, StoredAnalysis } from './types';
import { getTodaysAnalysis, saveTodaysAnalysis, getVietnamDateKey } from './utils/storage';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Footer } from './components/Footer';
import { TimeStatus } from './components/TimeStatus';
import { ViewToggle } from './components/ViewToggle';
import { FrequencyDashboard } from './components/FrequencyDashboard';


const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'daily' | 'frequency'>('daily');

  const getVietnamTime = () => {
    const now = new Date();
    const utcOffset = now.getTimezoneOffset() * 60000;
    const vietnamOffset = 7 * 3600000;
    return new Date(now.getTime() + utcOffset + vietnamOffset);
  };

  const isAfterCutoff = getVietnamTime().getHours() >= 16;
  const todayKey = getVietnamDateKey(new Date());

  const handleFetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // 1. Check local storage first
    const storedData = getTodaysAnalysis();
    if (storedData) {
      setAnalysis(storedData.analysis);
      setGroundingChunks(storedData.groundingChunks);
      setIsLoading(false);
      return;
    }

    // 2. If no stored data, fetch from API
    try {
      const result = await fetchDailyAnalysis();
      if (result.analysis) {
        setAnalysis(result.analysis);
        setGroundingChunks(result.groundingChunks);
        // 3. Save to local storage for future use
        saveTodaysAnalysis({ analysis: result.analysis, groundingChunks: result.groundingChunks });
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

  const renderDailyView = () => (
    <>
      <TimeStatus isAfterCutoff={isAfterCutoff} />
      {isLoading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {analysis && !isLoading && <ResultsDisplay analysis={analysis} />}
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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        <ViewToggle view={view} setView={setView} />
        {view === 'daily' ? renderDailyView() : <FrequencyDashboard />}
      </main>
      <Footer groundingChunks={view === 'daily' ? groundingChunks : []} />
    </div>
  );
};

export default App;
