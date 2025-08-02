import type { StoredAnalysis, LotteryResult } from '@/types';
import { saveAnalysisForDate, saveLotteryResultForDate } from '@/utils/appwrite-database';

/**
 * Gets a date key in YYYY-MM-DD format for consistency.
 * @param date The date object to format.
 * @returns A string in YYYY-MM-DD format.
 */
export const getVietnamDateKey = (date: Date): string => {
  const vietnamTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  return vietnamTime.toISOString().split('T')[0];
};

/**
 * Saves today's analysis directly to database (server-side only).
 * @param data The StoredAnalysis object for today.
 */
export const saveTodaysAnalysis = async (data: Omit<StoredAnalysis, 'lotteryResult'>) => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    await saveAnalysisForDate(todayKey, data);
  } catch (error) {
    console.error("Failed to save analysis:", error);
    throw error;
  }
};

/**
 * Saves today's lottery result directly to database (server-side only).
 * @param result The LotteryResult object for today.
 */
export const saveTodaysLotteryResult = async (result: LotteryResult) => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    await saveLotteryResultForDate(todayKey, result);
  } catch (error) {
    console.error("Failed to save lottery result:", error);
    throw error;
  }
};
