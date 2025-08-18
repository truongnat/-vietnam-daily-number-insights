// File removed: All Appwrite logic and typescript errors fixed. Storage is now handled by localStorage in utils/storage.ts.
// This file is kept for compatibility but all functions are no-ops or redirects to localStorage storage.

import type { StoredAnalysis, HistoricalData, LotteryResult } from '@/types';
import { 
  getAllHistoricalData as getStorageHistoricalData,
  getTodaysAnalysis as getStorageTodaysAnalysis,
  saveTodaysAnalysis as saveStorageTodaysAnalysis,
  getTodaysLotteryResult as getStorageTodaysLotteryResult,
  saveTodaysLotteryResult as saveStorageTodaysLotteryResult,
  deleteTodaysAnalysis as deleteStorageTodaysAnalysis,
  deleteTodaysLotteryResult as deleteStorageTodaysLotteryResult,
  getVietnamDateKey
} from './storage';

/**
 * Retrieves all historical data from storage.
 * @returns A HistoricalData object, or an empty object if none exists or an error occurs.
 */
export async function getAllHistoricalData(): Promise<HistoricalData> {
  return await getStorageHistoricalData();
}

/**
 * Retrieves analysis data for a specific date from storage.
 * @param dateKey The date key in YYYY-MM-DD format.
 * @returns The StoredAnalysis object for the date, or null if it doesn't exist.
 */
export async function getAnalysisForDate(dateKey: string): Promise<StoredAnalysis | null> {
  try {
    const todayKey = getVietnamDateKey(new Date());
    if (dateKey === todayKey) {
      return await getStorageTodaysAnalysis();
    }
    
    const historicalData = await getStorageHistoricalData();
    return historicalData[dateKey] || null;
  } catch (error) {
    console.error(`Failed to retrieve analysis for ${dateKey}:`, error);
    return null;
  }
}

/**
 * Saves analysis data for a specific date to storage.
 * @param dateKey The date key in YYYY-MM-DD format.
 * @param data The analysis data to save.
 */
export async function saveAnalysisForDate(
  dateKey: string,
  data: Omit<StoredAnalysis, 'lotteryResult'>
): Promise<void> {
  try {
    const todayKey = getVietnamDateKey(new Date());
    if (dateKey === todayKey) {
      await saveStorageTodaysAnalysis(data);
    } else {
      console.warn(`Saving analysis for non-current date ${dateKey} is not supported with localStorage`);
    }
  } catch (error) {
    console.error(`Failed to save analysis for ${dateKey}:`, error);
    throw error;
  }
}

/**
 * Deletes analysis data for a specific date from storage.
 * @param dateKey The date key in YYYY-MM-DD format.
 */
export async function deleteAnalysisForDate(dateKey: string): Promise<void> {
  try {
    const todayKey = getVietnamDateKey(new Date());
    if (dateKey === todayKey) {
      await deleteStorageTodaysAnalysis();
    } else {
      console.warn(`Deleting analysis for non-current date ${dateKey} is not supported with localStorage`);
    }
  } catch (error) {
    console.error(`Failed to delete analysis for ${dateKey}:`, error);
    throw error;
  }
}

/**
 * Deletes lottery result for a specific date from storage.
 * @param dateKey The date key in YYYY-MM-DD format.
 */
export async function deleteLotteryResultForDate(dateKey: string): Promise<void> {
  try {
    const todayKey = getVietnamDateKey(new Date());
    if (dateKey === todayKey) {
      await deleteStorageTodaysLotteryResult();
    } else {
      console.warn(`Deleting lottery result for non-current date ${dateKey} is not supported with localStorage`);
    }
  } catch (error) {
    console.error(`Failed to delete lottery result for ${dateKey}:`, error);
    throw error;
  }
}

/**
 * Saves lottery result for a specific date to storage.
 * @param dateKey The date key in YYYY-MM-DD format.
 * @param result The lottery result to save.
 */
export async function saveLotteryResultForDate(dateKey: string, result: LotteryResult): Promise<void> {
  try {
    const todayKey = getVietnamDateKey(new Date());
    if (dateKey === todayKey) {
      await saveStorageTodaysLotteryResult(result);
    } else {
      console.warn(`Saving lottery result for non-current date ${dateKey} is not supported with localStorage`);
    }
  } catch (error) {
    console.error(`Failed to save lottery result for ${dateKey}:`, error);
    throw error;
  }
}

/**
 * Closes the database connection (no-op for localStorage).
 */
export function closeDatabase(): void {
  // No-op for localStorage - no connections to close
}