
import type { StoredAnalysis, HistoricalData, LotteryResult } from '../types';

const STORAGE_KEY = 'vietnamNumberInsightsHistory';

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
 * Retrieves all historical data from local storage.
 * @returns A HistoricalData object, or an empty object if none exists or an error occurs.
 */
export const getAllHistoricalData = (): HistoricalData => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    return storedData ? (JSON.parse(storedData) as HistoricalData) : {};
  } catch (error) {
    console.error("Failed to parse historical data from localStorage:", error);
    return {};
  }
};

/**
 * Retrieves today's analysis from local storage.
 * @returns The StoredAnalysis object for today, or null if it doesn't exist.
 */
export const getTodaysAnalysis = (): StoredAnalysis | null => {
  const todayKey = getVietnamDateKey(new Date());
  const allData = getAllHistoricalData();
  return allData[todayKey] || null;
};


/**
 * Saves today's analysis to local storage.
 * @param data The StoredAnalysis object for today.
 */
export const saveTodaysAnalysis = (data: Omit<StoredAnalysis, 'lotteryResult'>) => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    const allData = getAllHistoricalData();
    // Preserve existing lottery result if any
    const existingEntry = allData[todayKey];
    allData[todayKey] = { ...existingEntry, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
  }
};

/**
 * Saves today's lottery result to local storage, merging it with existing data.
 * @param result The LotteryResult object for today.
 */
export const saveTodaysLotteryResult = (result: LotteryResult) => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    const allData = getAllHistoricalData();
    const todaysData = allData[todayKey];
    if (todaysData) {
      todaysData.lotteryResult = result;
      allData[todayKey] = todaysData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    } else {
      console.warn("Attempted to save lottery result, but no analysis data found for today.");
    }
  } catch (error) {
    console.error("Failed to save lottery result to localStorage:", error);
  }
};
