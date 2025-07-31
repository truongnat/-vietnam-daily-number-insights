import fs from 'fs';
import path from 'path';
import type { StoredAnalysis, HistoricalData, LotteryResult } from '@/types';

// Data file path - using JSON file instead of SQLite for now
const DATA_PATH = path.join(process.cwd(), 'data', 'vietnam-insights.json');

interface DatabaseData {
  analyses: Record<string, StoredAnalysis>;
  lotteryResults: Record<string, LotteryResult>;
}

// Initialize data storage
function ensureDataFile(): DatabaseData {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Check if data file exists
    if (!fs.existsSync(DATA_PATH)) {
      const initialData: DatabaseData = {
        analyses: {},
        lotteryResults: {}
      };
      fs.writeFileSync(DATA_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }

    // Read existing data
    const fileContent = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(fileContent) as DatabaseData;
  } catch (error) {
    console.error('Error initializing data file:', error);
    return {
      analyses: {},
      lotteryResults: {}
    };
  }
}

function saveDataFile(data: DatabaseData): void {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data file:', error);
  }
}

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
 * Retrieves all historical data from the database.
 * @returns A HistoricalData object.
 */
export function getAllHistoricalData(): HistoricalData {
  try {
    const data = ensureDataFile();
    const result: HistoricalData = {};

    // Combine analyses with lottery results
    for (const [dateKey, analysis] of Object.entries(data.analyses)) {
      const storedAnalysis: StoredAnalysis = { ...analysis };

      // Add lottery result if it exists
      if (data.lotteryResults[dateKey]) {
        storedAnalysis.lotteryResult = data.lotteryResults[dateKey];
      }

      result[dateKey] = storedAnalysis;
    }

    // Sort by date key (descending)
    const sortedResult: HistoricalData = {};
    const sortedKeys = Object.keys(result).sort().reverse();
    for (const key of sortedKeys) {
      sortedResult[key] = result[key];
    }

    return sortedResult;
  } catch (error) {
    console.error("Failed to retrieve historical data:", error);
    return {};
  }
}

/**
 * Retrieves analysis data for a specific date.
 * @param dateKey The date key in YYYY-MM-DD format.
 * @returns The StoredAnalysis object for the date, or null if it doesn't exist.
 */
export function getAnalysisForDate(dateKey: string): StoredAnalysis | null {
  try {
    const data = ensureDataFile();

    if (!data.analyses[dateKey]) {
      return null;
    }

    const storedAnalysis: StoredAnalysis = { ...data.analyses[dateKey] };

    // Add lottery result if it exists
    if (data.lotteryResults[dateKey]) {
      storedAnalysis.lotteryResult = data.lotteryResults[dateKey];
    }

    return storedAnalysis;
  } catch (error) {
    console.error(`Failed to retrieve analysis for ${dateKey}:`, error);
    return null;
  }
}

/**
 * Saves analysis data for a specific date.
 * @param dateKey The date key in YYYY-MM-DD format.
 * @param data The analysis data to save.
 */
export function saveAnalysisForDate(dateKey: string, data: Omit<StoredAnalysis, 'lotteryResult'>): void {
  try {
    const fileData = ensureDataFile();

    // Save the analysis data
    fileData.analyses[dateKey] = data as StoredAnalysis;

    // Save back to file
    saveDataFile(fileData);
  } catch (error) {
    console.error(`Failed to save analysis for ${dateKey}:`, error);
    throw error;
  }
}

/**
 * Saves lottery result for a specific date.
 * @param dateKey The date key in YYYY-MM-DD format.
 * @param result The lottery result to save.
 */
export function saveLotteryResultForDate(dateKey: string, result: LotteryResult): void {
  try {
    const fileData = ensureDataFile();

    // Save the lottery result
    fileData.lotteryResults[dateKey] = result;

    // Save back to file
    saveDataFile(fileData);
  } catch (error) {
    console.error(`Failed to save lottery result for ${dateKey}:`, error);
    throw error;
  }
}

/**
 * Closes the database connection (no-op for JSON file storage).
 */
export function closeDatabase(): void {
  // No-op for JSON file storage
}
