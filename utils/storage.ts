
import type { StoredAnalysis, HistoricalData, LotteryResult } from '../types';

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
 * Retrieves all historical data from the API.
 * @returns A HistoricalData object, or an empty object if none exists or an error occurs.
 */
export const getAllHistoricalData = async (): Promise<HistoricalData> => {
  try {
    const response = await fetch('/api/storage/historical');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch historical data:", error);
    return {};
  }
};

/**
 * Retrieves today's analysis from the API.
 * @returns The StoredAnalysis object for today, or null if it doesn't exist.
 */
export const getTodaysAnalysis = async (): Promise<StoredAnalysis | null> => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    const response = await fetch(`/api/storage/analysis/${todayKey}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch today's analysis:", error);
    return null;
  }
};

/**
 * Saves today's analysis via the API.
 * @param data The StoredAnalysis object for today.
 */
export const saveTodaysAnalysis = async (data: Omit<StoredAnalysis, 'lotteryResult'>) => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    const response = await fetch(`/api/storage/analysis/${todayKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to save analysis:", error);
    throw error;
  }
};

/**
 * Saves today's lottery result via the API, merging it with existing data.
 * @param result The LotteryResult object for today.
 */
export const saveTodaysLotteryResult = async (result: LotteryResult) => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    const response = await fetch(`/api/storage/lottery/${todayKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to save lottery result:", error);
    throw error;
  }
};
