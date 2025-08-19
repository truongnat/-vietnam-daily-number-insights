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
 * Retrieves all historical data from localStorage (client-side only).
 * For server-side, this returns empty object as it should use server-storage directly.
 * @returns A HistoricalData object, or an empty object if none exists or an error occurs.
 */
export const getAllHistoricalData = async (): Promise<HistoricalData> => {
  try {
    if (isClient) {
      // Client-side: use localStorage
      const data = localStorage.getItem('historicalData');
      return data ? JSON.parse(data) : {};
    } else {
      // Server-side: return empty object, server functions should use server-storage directly
      return {};
    }
  } catch (error) {
    console.error('Failed to fetch historical data:', error);
    return {};
  }
};

/**
 * Gets analysis for a specific date (client-side only)
 */
export const getAnalysisForDate = async (dateKey: string): Promise<StoredAnalysis | null> => {
  try {
    if (isClient) {
      // Client-side: use localStorage
      const data = localStorage.getItem(`analysis_${dateKey}`);
      return data ? JSON.parse(data) : null;
    } else {
      // Server-side: return null, server functions should use server-storage directly
      return null;
    }
  } catch (error) {
    console.error(`Failed to fetch analysis for ${dateKey}:`, error);
    return null;
  }
};

/**
 * Saves lottery result for a specific date (client-side only)
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
      // Server-side: do nothing, server functions should use server-storage directly
      console.log('Server-side saveLotteryResultForDate called - should use server-storage directly');
    }
  } catch (error) {
    console.error(`Failed to save lottery result for ${dateKey}:`, error);
    throw error;
  }
};

/**
 * Deletes lottery result for a specific date (client-side only)
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
      // Server-side: do nothing, server functions should use server-storage directly
      console.log('Server-side deleteLotteryResultForDate called - should use server-storage directly');
    }
  } catch (error) {
    console.error(`Failed to delete lottery result for ${dateKey}:`, error);
  }
};

/**
 * Deletes analysis for a specific date (client-side only)
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
      // Server-side: do nothing, server functions should use server-storage directly
      console.log('Server-side deleteAnalysisForDate called - should use server-storage directly');
    }
  } catch (error) {
    console.error(`Failed to delete analysis for ${dateKey}:`, error);
  }
};