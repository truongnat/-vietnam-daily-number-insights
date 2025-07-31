import Database from 'better-sqlite3';
import path from 'path';
import type { StoredAnalysis, HistoricalData, LotteryResult } from '../types';

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'vietnam-insights.db');

// Initialize database
let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require('fs');
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    db = new Database(DB_PATH);
    
    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS daily_data (
        date_key TEXT PRIMARY KEY,
        analysis_data TEXT,
        lottery_result TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create trigger to update updated_at timestamp
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_daily_data_timestamp 
      AFTER UPDATE ON daily_data
      BEGIN
        UPDATE daily_data SET updated_at = CURRENT_TIMESTAMP WHERE date_key = NEW.date_key;
      END
    `);
  }
  return db;
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
    const database = getDatabase();
    const stmt = database.prepare('SELECT * FROM daily_data ORDER BY date_key DESC');
    const rows = stmt.all() as Array<{
      date_key: string;
      analysis_data: string | null;
      lottery_result: string | null;
    }>;
    
    const result: HistoricalData = {};
    
    for (const row of rows) {
      const storedAnalysis: StoredAnalysis = {};
      
      if (row.analysis_data) {
        try {
          const analysisData = JSON.parse(row.analysis_data);
          Object.assign(storedAnalysis, analysisData);
        } catch (error) {
          console.error(`Failed to parse analysis data for ${row.date_key}:`, error);
        }
      }
      
      if (row.lottery_result) {
        try {
          storedAnalysis.lotteryResult = JSON.parse(row.lottery_result);
        } catch (error) {
          console.error(`Failed to parse lottery result for ${row.date_key}:`, error);
        }
      }
      
      if (Object.keys(storedAnalysis).length > 0) {
        result[row.date_key] = storedAnalysis;
      }
    }
    
    return result;
  } catch (error) {
    console.error("Failed to retrieve historical data from database:", error);
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
    const database = getDatabase();
    const stmt = database.prepare('SELECT * FROM daily_data WHERE date_key = ?');
    const row = stmt.get(dateKey) as {
      date_key: string;
      analysis_data: string | null;
      lottery_result: string | null;
    } | undefined;
    
    if (!row) {
      return null;
    }
    
    const storedAnalysis: StoredAnalysis = {};
    
    if (row.analysis_data) {
      try {
        const analysisData = JSON.parse(row.analysis_data);
        Object.assign(storedAnalysis, analysisData);
      } catch (error) {
        console.error(`Failed to parse analysis data for ${dateKey}:`, error);
      }
    }
    
    if (row.lottery_result) {
      try {
        storedAnalysis.lotteryResult = JSON.parse(row.lottery_result);
      } catch (error) {
        console.error(`Failed to parse lottery result for ${dateKey}:`, error);
      }
    }
    
    return Object.keys(storedAnalysis).length > 0 ? storedAnalysis : null;
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
    const database = getDatabase();
    
    // Check if record exists
    const existingStmt = database.prepare('SELECT analysis_data, lottery_result FROM daily_data WHERE date_key = ?');
    const existing = existingStmt.get(dateKey) as { analysis_data: string | null; lottery_result: string | null } | undefined;
    
    const analysisDataJson = JSON.stringify(data);
    
    if (existing) {
      // Update existing record, preserving lottery result
      const updateStmt = database.prepare('UPDATE daily_data SET analysis_data = ? WHERE date_key = ?');
      updateStmt.run(analysisDataJson, dateKey);
    } else {
      // Insert new record
      const insertStmt = database.prepare('INSERT INTO daily_data (date_key, analysis_data) VALUES (?, ?)');
      insertStmt.run(dateKey, analysisDataJson);
    }
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
    const database = getDatabase();
    
    // Check if record exists
    const existingStmt = database.prepare('SELECT analysis_data, lottery_result FROM daily_data WHERE date_key = ?');
    const existing = existingStmt.get(dateKey) as { analysis_data: string | null; lottery_result: string | null } | undefined;
    
    const lotteryResultJson = JSON.stringify(result);
    
    if (existing) {
      // Update existing record
      const updateStmt = database.prepare('UPDATE daily_data SET lottery_result = ? WHERE date_key = ?');
      updateStmt.run(lotteryResultJson, dateKey);
    } else {
      // Insert new record with just lottery result
      const insertStmt = database.prepare('INSERT INTO daily_data (date_key, lottery_result) VALUES (?, ?)');
      insertStmt.run(dateKey, lotteryResultJson);
    }
  } catch (error) {
    console.error(`Failed to save lottery result for ${dateKey}:`, error);
    throw error;
  }
}

/**
 * Closes the database connection.
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
