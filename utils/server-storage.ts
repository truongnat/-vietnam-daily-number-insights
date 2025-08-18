import type { StoredAnalysis, LotteryResult } from '@/types';
import { 
  saveAnalysisForDate as saveAnalysisForDateFile,
  saveLotteryResultForDate as saveLotteryResultForDateFile,
  getVietnamDateKey as getVietnamDateKeyFile
} from './server-file-storage';

// Re-export getVietnamDateKey for compatibility
export const getVietnamDateKey = getVietnamDateKeyFile;

/**
 * Saves today's analysis to file system (server-side compatible).
 * @param data The StoredAnalysis object for today.
 */
export const saveTodaysAnalysisServer = async (data: Omit<StoredAnalysis, 'lotteryResult'>) => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    await saveAnalysisForDateFile(todayKey, data);
  } catch (error) {
    console.error("Failed to save analysis to file system:", error);
    throw error;
  }
};

// Export with the expected name for compatibility
export const saveTodaysAnalysis = saveTodaysAnalysisServer;

/**
 * Saves today's lottery result to file system (server-side compatible).
 * @param result The LotteryResult object for today.
 */
export const saveTodaysLotteryResultServer = async (result: LotteryResult) => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    await saveLotteryResultForDateFile(todayKey, result);
  } catch (error) {
    console.error("Failed to save lottery result to file system:", error);
    throw error;
  }
};

// Export with the expected name for compatibility
export const saveTodaysLotteryResult = saveTodaysLotteryResultServer;