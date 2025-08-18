import type { StoredAnalysis, LotteryResult } from '@/types';
import { saveTodaysAnalysis, saveTodaysLotteryResult, getVietnamDateKey } from './storage';

// Re-export getVietnamDateKey for compatibility
export { getVietnamDateKey };

/**
 * Saves today's analysis to localStorage (server-side compatible).
 * @param data The StoredAnalysis object for today.
 */
export const saveTodaysAnalysisServer = async (data: Omit<StoredAnalysis, 'lotteryResult'>) => {
  try {
    await saveTodaysAnalysis(data);
  } catch (error) {
    console.error("Failed to save analysis to localStorage:", error);
    throw error;
  }
};

// Export with the expected name for compatibility
export const saveTodaysAnalysis = saveTodaysAnalysisServer;

/**
 * Saves today's lottery result to localStorage (server-side compatible).
 * @param result The LotteryResult object for today.
 */
export const saveTodaysLotteryResultServer = async (result: LotteryResult) => {
  try {
    await saveTodaysLotteryResult(result);
  } catch (error) {
    console.error("Failed to save lottery result to localStorage:", error);
    throw error;
  }
};

// Export with the expected name for compatibility
export const saveTodaysLotteryResult = saveTodaysLotteryResultServer;
