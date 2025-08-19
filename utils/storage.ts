import type { StoredAnalysis, HistoricalData, LotteryResult } from '@/types';

/**
 * Gets a date key in YYYY-MM-DD format for consistency.
 * @param date The date object to format.
 * @returns A string in YYYY-MM-DD format.
 */
export const getVietnamDateKey = (date: Date): string => {
  const vietnamTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const year = vietnamTime.getFullYear();
  const month = String(vietnamTime.getMonth() + 1).padStart(2, '0');
  const day = String(vietnamTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if we're running on the client side
 */
const isClient = typeof window !== 'undefined';

/**
 * Get the base URL for API calls
 */
const getBaseUrl = (): string => {
  if (isClient) {
    return window.location.origin;
  }
  // For server-side, we need to determine the base URL
  return process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : 'http://localhost:3000';
};

/**
 * Retrieves all historical data from localStorage or API.
 * @returns A HistoricalData object, or an empty object if none exists or an error occurs.
 */
export const getAllHistoricalData = async (): Promise<HistoricalData> => {
  try {
    if (isClient) {
      // Client-side: use localStorage
      const data = localStorage.getItem('historicalData');
      return data ? JSON.parse(data) : {};
    } else {
      // Server-side: use server-storage functions directly
      const { getAllHistoricalDataServer } = await import('@/utils/server-file-storage');
      return await getAllHistoricalDataServer();
    }
  } catch (error) {
    console.error('Failed to fetch historical data:', error);
    return {};
  }
};

/**
 * Retrieves today's analysis from localStorage or API.
 * @returns The StoredAnalysis object for today, or null if it doesn't exist.
 */
export const getTodaysAnalysis = async (): Promise<StoredAnalysis | null> => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    
    if (isClient) {
      // Client-side: use localStorage
      const data = localStorage.getItem(`analysis_${todayKey}`);
      return data ? JSON.parse(data) : null;
    } else {
      // Server-side: use server-storage functions directly
      const { getAnalysisForDateServer } = await import('@/utils/server-file-storage');
      return await getAnalysisForDateServer(todayKey);
    }
  } catch (error) {
    console.error('Failed to fetch today\'s analysis:', error);
    return null;
  }
};

/**
 * Saves today's analysis to localStorage and updates historicalData.
 * @param data The analysis data to save.
 */
export const saveTodaysAnalysis = async (data: Omit<StoredAnalysis, 'lotteryResult'>) => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    
    if (isClient) {
      // Client-side: use localStorage
      localStorage.setItem(`analysis_${todayKey}`, JSON.stringify(data));
      const historicalData = await getAllHistoricalData();
      historicalData[todayKey] = { ...historicalData[todayKey], ...data };
      localStorage.setItem('historicalData', JSON.stringify(historicalData));
    } else {
      // Server-side: use server-storage functions directly
      const { saveAnalysisForDate } = await import('@/utils/server-file-storage');
      await saveAnalysisForDate(todayKey, data);
    }
  } catch (error) {
    console.error('Failed to save today\'s analysis:', error);
    throw error;
  }
};

/**
 * Retrieves today's lottery result from localStorage or API.
 * @returns The LotteryResult object for today, or null if it doesn't exist.
 */
export const getTodaysLotteryResult = async (): Promise<LotteryResult | null> => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    
    if (isClient) {
      // Client-side: use localStorage
      const data = localStorage.getItem(`lottery_${todayKey}`);
      return data ? JSON.parse(data) : null;
    } else {
      // Server-side: use server-storage functions directly
      const { getLotteryResultForDateServer } = await import('@/utils/server-file-storage');
      return await getLotteryResultForDateServer(todayKey);
    }
  } catch (error) {
    console.error('Failed to fetch today\'s lottery result:', error);
    return null;
  }
};

/**
 * Saves today's lottery result to localStorage and updates historicalData.
 * @param result The lottery result to save.
 */
export const saveTodaysLotteryResult = async (result: LotteryResult) => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    
    if (isClient) {
      // Client-side: use localStorage
      localStorage.setItem(`lottery_${todayKey}`, JSON.stringify(result));
      const historicalData = await getAllHistoricalData();
      if (!historicalData[todayKey]) historicalData[todayKey] = {} as StoredAnalysis;
      historicalData[todayKey].lotteryResult = result;
      localStorage.setItem('historicalData', JSON.stringify(historicalData));
    } else {
      // Server-side: use server-storage functions directly
      const { saveLotteryResultForDate } = await import('@/utils/server-file-storage');
      await saveLotteryResultForDate(todayKey, result);
    }
  } catch (error) {
    console.error('Failed to save today\'s lottery result:', error);
    throw error;
  }
};

/**
 * Deletes today's analysis from localStorage and updates historicalData.
 */
export const deleteTodaysAnalysis = async () => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    
    if (isClient) {
      // Client-side: use localStorage
      localStorage.removeItem(`analysis_${todayKey}`);
      const historicalData = await getAllHistoricalData();
      if (historicalData[todayKey] && historicalData[todayKey].analysis) {
        historicalData[todayKey] = {
          ...historicalData[todayKey],
          analysis: undefined
        };
      }
      localStorage.setItem('historicalData', JSON.stringify(historicalData));
    } else {
      // Server-side: use server-storage functions directly
      const { deleteAnalysisForDateServer } = await import('@/utils/server-file-storage');
      await deleteAnalysisForDateServer(todayKey);
    }
  } catch (error) {
    console.error('Failed to delete today\'s analysis:', error);
  }
};

/**
 * Deletes today's lottery result from localStorage and updates historicalData.
 */
export const deleteTodaysLotteryResult = async () => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    
    if (isClient) {
      // Client-side: use localStorage
      localStorage.removeItem(`lottery_${todayKey}`);
      const historicalData = await getAllHistoricalData();
      if (historicalData[todayKey] && historicalData[todayKey].lotteryResult) {
        historicalData[todayKey] = {
          ...historicalData[todayKey],
          lotteryResult: undefined
        };
      }
      localStorage.setItem('historicalData', JSON.stringify(historicalData));
    } else {
      // Server-side: use server-storage functions directly
      const { deleteLotteryResultForDateServer } = await import('@/utils/server-file-storage');
      await deleteLotteryResultForDateServer(todayKey);
    }
  } catch (error) {
    console.error('Failed to delete today\'s lottery result:', error);
  }
};

/**
 * Deletes all of today's data (analysis and lottery result) from localStorage.
 */
export const deleteTodaysData = async () => {
  try {
    await deleteTodaysAnalysis();
    await deleteTodaysLotteryResult();
  } catch (error) {
    console.error('Failed to delete today\'s data:', error);
  }
};

// Additional functions for date-specific operations

/**
 * Gets analysis for a specific date
 */
export const getAnalysisForDate = async (dateKey: string): Promise<StoredAnalysis | null> => {
  try {
    if (isClient) {
      // Client-side: use localStorage
      const data = localStorage.getItem(`analysis_${dateKey}`);
      return data ? JSON.parse(data) : null;
    } else {
      // Server-side: use server-storage functions directly
      const { getAnalysisForDateServer } = await import('@/utils/server-file-storage');
      return await getAnalysisForDateServer(dateKey);
    }
  } catch (error) {
    console.error(`Failed to fetch analysis for ${dateKey}:`, error);
    return null;
  }
};

/**
 * Saves lottery result for a specific date
 */
export const saveLotteryResultForDate = async (dateKey: string, result: LotteryResult) => {
  try {
    if (isClient) {
      // Client-side: use localStorage
      localStorage.setItem(`lottery_${dateKey}`, JSON.stringify(result));
      const historicalData = await getAllHistoricalData();
      if (!historicalData[dateKey]) historicalData[dateKey] = {} as StoredAnalysis;
      historicalData[dateKey].lotteryResult = result;
      localStorage.setItem('historicalData', JSON.stringify(historicalData));
    } else {
      // Server-side: use server-storage functions directly
      const { saveLotteryResultForDate: saveLotteryResultForDateServer } = await import('@/utils/server-file-storage');
      await saveLotteryResultForDateServer(dateKey, result);
    }
  } catch (error) {
    console.error(`Failed to save lottery result for ${dateKey}:`, error);
    throw error;
  }
};

/**
 * Deletes lottery result for a specific date
 */
export const deleteLotteryResultForDate = async (dateKey: string) => {
  try {
    if (isClient) {
      // Client-side: use localStorage
      localStorage.removeItem(`lottery_${dateKey}`);
      const historicalData = await getAllHistoricalData();
      if (historicalData[dateKey] && historicalData[dateKey].lotteryResult) {
        historicalData[dateKey] = {
          ...historicalData[dateKey],
          lotteryResult: undefined
        };
      }
      localStorage.setItem('historicalData', JSON.stringify(historicalData));
    } else {
      // Server-side: use server-storage functions directly
      const { deleteLotteryResultForDateServer } = await import('@/utils/server-file-storage');
      await deleteLotteryResultForDateServer(dateKey);
    }
  } catch (error) {
    console.error(`Failed to delete lottery result for ${dateKey}:`, error);
  }
};

/**
 * Deletes analysis for a specific date
 */
export const deleteAnalysisForDate = async (dateKey: string) => {
  try {
    if (isClient) {
      // Client-side: use localStorage
      localStorage.removeItem(`analysis_${dateKey}`);
      const historicalData = await getAllHistoricalData();
      if (historicalData[dateKey] && historicalData[dateKey].analysis) {
        historicalData[dateKey] = {
          ...historicalData[dateKey],
          analysis: undefined
        };
      }
      localStorage.setItem('historicalData', JSON.stringify(historicalData));
    } else {
      // Server-side: use server-storage functions directly
      const { deleteAnalysisForDateServer } = await import('@/utils/server-file-storage');
      await deleteAnalysisForDateServer(dateKey);
    }
  } catch (error) {
    console.error(`Failed to delete analysis for ${dateKey}:`, error);
  }
};