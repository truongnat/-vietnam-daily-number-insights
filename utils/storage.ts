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
 * Retrieves all historical data from localStorage.
 * @returns A HistoricalData object, or an empty object if none exists or an error occurs.
 */
export const getAllHistoricalData = async (): Promise<HistoricalData> => {
  try {
    const data = localStorage.getItem('historicalData');
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to fetch historical data from localStorage:', error);
    return {};
  }
};

/**
 * Retrieves today's analysis from localStorage.
 * @returns The StoredAnalysis object for today, or null if it doesn't exist.
 */
export const getTodaysAnalysis = async (): Promise<StoredAnalysis | null> => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    const data = localStorage.getItem(`analysis_${todayKey}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to fetch today\'s analysis from localStorage:', error);
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
    localStorage.setItem(`analysis_${todayKey}`, JSON.stringify(data));
    const historicalData = await getAllHistoricalData();
    historicalData[todayKey] = { ...historicalData[todayKey], ...data };
    localStorage.setItem('historicalData', JSON.stringify(historicalData));
  } catch (error) {
    console.error('Failed to save today\'s analysis to localStorage:', error);
    throw error;
  }
};

/**
 * Retrieves today's lottery result from localStorage.
 * @returns The LotteryResult object for today, or null if it doesn't exist.
 */
export const getTodaysLotteryResult = async (): Promise<LotteryResult | null> => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    const data = localStorage.getItem(`lottery_${todayKey}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to fetch today\'s lottery result from localStorage:', error);
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
    localStorage.setItem(`lottery_${todayKey}`, JSON.stringify(result));
    const historicalData = await getAllHistoricalData();
    if (!historicalData[todayKey]) historicalData[todayKey] = {} as StoredAnalysis;
    historicalData[todayKey].lotteryResult = result;
    localStorage.setItem('historicalData', JSON.stringify(historicalData));
  } catch (error) {
    console.error('Failed to save today\'s lottery result to localStorage:', error);
    throw error;
  }
};

/**
 * Deletes today's analysis from localStorage and updates historicalData.
 */
export const deleteTodaysAnalysis = async () => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    localStorage.removeItem(`analysis_${todayKey}`);
    const historicalData = await getAllHistoricalData();
    if (historicalData[todayKey]) {
      delete historicalData[todayKey].analysis;
    }
    localStorage.setItem('historicalData', JSON.stringify(historicalData));
  } catch (error) {
    console.error('Failed to delete today\'s analysis from localStorage:', error);
  }
};

/**
 * Deletes today's lottery result from localStorage and updates historicalData.
 */
export const deleteTodaysLotteryResult = async () => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    localStorage.removeItem(`lottery_${todayKey}`);
    const historicalData = await getAllHistoricalData();
    if (historicalData[todayKey]) {
      delete historicalData[todayKey].lotteryResult;
    }
    localStorage.setItem('historicalData', JSON.stringify(historicalData));
  } catch (error) {
    console.error('Failed to delete today\'s lottery result from localStorage:', error);
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
    console.error('Failed to delete today\'s data from localStorage:', error);
  }
};