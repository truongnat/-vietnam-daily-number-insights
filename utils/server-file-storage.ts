import fs from 'fs';
import path from 'path';
import type { StoredAnalysis, HistoricalData, LotteryResult } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const ANALYSIS_DIR = path.join(DATA_DIR, 'analysis');
const LOTTERY_DIR = path.join(DATA_DIR, 'lottery');
const HISTORICAL_FILE = path.join(DATA_DIR, 'historical.json');

// Ensure directories exist
const ensureDirectories = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ANALYSIS_DIR)) {
    fs.mkdirSync(ANALYSIS_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOTTERY_DIR)) {
    fs.mkdirSync(LOTTERY_DIR, { recursive: true });
  }
};

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
 * Retrieves all historical data from file system.
 * @returns A HistoricalData object, or an empty object if none exists or an error occurs.
 */
export const getAllHistoricalData = async (): Promise<HistoricalData> => {
  try {
    ensureDirectories();
    if (fs.existsSync(HISTORICAL_FILE)) {
      const data = fs.readFileSync(HISTORICAL_FILE, 'utf8');
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Failed to fetch historical data from file system:', error);
    return {};
  }
};

/**
 * Saves historical data to file system.
 * @param data The historical data to save.
 */
const saveHistoricalData = async (data: HistoricalData): Promise<void> => {
  try {
    ensureDirectories();
    fs.writeFileSync(HISTORICAL_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save historical data to file system:', error);
    throw error;
  }
};

/**
 * Retrieves analysis data for a specific date from file system.
 * @param dateKey The date key in YYYY-MM-DD format.
 * @returns The StoredAnalysis object for the date, or null if it doesn't exist.
 */
export const getAnalysisForDate = async (dateKey: string): Promise<StoredAnalysis | null> => {
  try {
    ensureDirectories();
    const analysisFile = path.join(ANALYSIS_DIR, `${dateKey}.json`);
    
    if (!fs.existsSync(analysisFile)) {
      return null;
    }
    
    const data = fs.readFileSync(analysisFile, 'utf8');
    const analysisData = JSON.parse(data);
    
    // Try to get lottery result
    const lotteryFile = path.join(LOTTERY_DIR, `${dateKey}.json`);
    let lotteryResult = null;
    
    if (fs.existsSync(lotteryFile)) {
      const lotteryData = fs.readFileSync(lotteryFile, 'utf8');
      lotteryResult = JSON.parse(lotteryData);
    }
    
    return {
      ...analysisData,
      lotteryResult
    };
  } catch (error) {
    console.error(`Failed to retrieve analysis for ${dateKey} from file system:`, error);
    return null;
  }
};

/**
 * Saves analysis data for a specific date to file system.
 * @param dateKey The date key in YYYY-MM-DD format.
 * @param data The analysis data to save.
 */
export const saveAnalysisForDate = async (
  dateKey: string,
  data: Omit<StoredAnalysis, 'lotteryResult'>
): Promise<void> => {
  try {
    ensureDirectories();
    const analysisFile = path.join(ANALYSIS_DIR, `${dateKey}.json`);
    
    fs.writeFileSync(analysisFile, JSON.stringify(data, null, 2));
    
    // Update historical data
    const historicalData = await getAllHistoricalData();
    historicalData[dateKey] = { ...historicalData[dateKey], ...data };
    await saveHistoricalData(historicalData);
  } catch (error) {
    console.error(`Failed to save analysis for ${dateKey} to file system:`, error);
    throw error;
  }
};

/**
 * Deletes analysis data for a specific date from file system.
 * @param dateKey The date key in YYYY-MM-DD format.
 */
export const deleteAnalysisForDate = async (dateKey: string): Promise<void> => {
  try {
    ensureDirectories();
    const analysisFile = path.join(ANALYSIS_DIR, `${dateKey}.json`);
    
    if (fs.existsSync(analysisFile)) {
      fs.unlinkSync(analysisFile);
    }
    
    // Update historical data
    const historicalData = await getAllHistoricalData();
    if (historicalData[dateKey]) {
      historicalData[dateKey] = {
        ...historicalData[dateKey],
        analysis: undefined,
        groundingChunks: undefined
      };
      await saveHistoricalData(historicalData);
    }
  } catch (error) {
    console.error(`Failed to delete analysis for ${dateKey} from file system:`, error);
    throw error;
  }
};

/**
 * Retrieves lottery result for a specific date from file system.
 * @param dateKey The date key in YYYY-MM-DD format.
 * @returns The LotteryResult object for the date, or null if it doesn't exist.
 */
export const getLotteryResultForDate = async (dateKey: string): Promise<LotteryResult | null> => {
  try {
    ensureDirectories();
    const lotteryFile = path.join(LOTTERY_DIR, `${dateKey}.json`);
    
    if (!fs.existsSync(lotteryFile)) {
      return null;
    }
    
    const data = fs.readFileSync(lotteryFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to retrieve lottery result for ${dateKey} from file system:`, error);
    return null;
  }
};

/**
 * Saves lottery result for a specific date to file system.
 * @param dateKey The date key in YYYY-MM-DD format.
 * @param result The lottery result to save.
 */
export const saveLotteryResultForDate = async (dateKey: string, result: LotteryResult): Promise<void> => {
  try {
    ensureDirectories();
    const lotteryFile = path.join(LOTTERY_DIR, `${dateKey}.json`);
    
    fs.writeFileSync(lotteryFile, JSON.stringify(result, null, 2));
    
    // Update historical data
    const historicalData = await getAllHistoricalData();
    if (!historicalData[dateKey]) {
      historicalData[dateKey] = {} as StoredAnalysis;
    }
    historicalData[dateKey].lotteryResult = result;
    await saveHistoricalData(historicalData);
  } catch (error) {
    console.error(`Failed to save lottery result for ${dateKey} to file system:`, error);
    throw error;
  }
};

/**
 * Deletes lottery result for a specific date from file system.
 * @param dateKey The date key in YYYY-MM-DD format.
 */
export const deleteLotteryResultForDate = async (dateKey: string): Promise<void> => {
  try {
    ensureDirectories();
    const lotteryFile = path.join(LOTTERY_DIR, `${dateKey}.json`);
    
    if (fs.existsSync(lotteryFile)) {
      fs.unlinkSync(lotteryFile);
    }
    
    // Update historical data
    const historicalData = await getAllHistoricalData();
    if (historicalData[dateKey]) {
      historicalData[dateKey] = {
        ...historicalData[dateKey],
        lotteryResult: undefined
      };
      await saveHistoricalData(historicalData);
    }
  } catch (error) {
    console.error(`Failed to delete lottery result for ${dateKey} from file system:`, error);
    throw error;
  }
};
// Server-specific function aliases for compatibility
export const getAllHistoricalDataServer = getAllHistoricalData;
export const getAnalysisForDateServer = getAnalysisForDate;
export const getLotteryResultForDateServer = getLotteryResultForDate;
export const deleteAnalysisForDateServer = deleteAnalysisForDate;
export const deleteLotteryResultForDateServer = deleteLotteryResultForDate;
