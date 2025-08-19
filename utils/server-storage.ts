import type { StoredAnalysis, LotteryResult } from '@/types';
import { 
  saveAnalysisForDate as saveAnalysisForDateFile,
  saveLotteryResultForDate as saveLotteryResultForDateFile,
  getVietnamDateKey as getVietnamDateKeyFile
} from './server-file-storage';

// Re-export getVietnamDateKey for compatibility
export const getVietnamDateKey = getVietnamDateKeyFile;

/**
 * Saves analysis for a specific date to file system (server-side compatible).
 * @param dateKey The date key in YYYY-MM-DD format.
 * @param data The StoredAnalysis object for the date.
 */
export const saveAnalysisForDate = async (dateKey: string, data: Omit<StoredAnalysis, 'lotteryResult'>) => {
  try {
    await saveAnalysisForDateFile(dateKey, data);
  } catch (error) {
    console.error(`Failed to save analysis for ${dateKey} to file system:`, error);
    throw error;
  }
};

/**
 * Saves lottery result for a specific date to file system (server-side compatible).
 * @param dateKey The date key in YYYY-MM-DD format.
 * @param result The LotteryResult object for the date.
 */
export const saveLotteryResultForDate = async (dateKey: string, result: LotteryResult) => {
  try {
    await saveLotteryResultForDateFile(dateKey, result);
  } catch (error) {
    console.error(`Failed to save lottery result for ${dateKey} to file system:`, error);
    throw error;
  }
};