
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
 * Retrieves all historical data from the API.
 * @returns A HistoricalData object, or an empty object if none exists or an error occurs.
 */
  try {
    const data = localStorage.getItem('historicalData');
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to fetch historical data from localStorage:", error);
    return {};
  }
};
/**
 * Retrieves today's analysis from the API.
 * @returns The StoredAnalysis object for today, or null if it doesn't exist.
 */
  try {
    const todayKey = getVietnamDateKey(new Date());
    const data = localStorage.getItem(`analysis_${todayKey}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to fetch today's analysis from localStorage:", error);
    return null;
  }
};
/**
 * Saves today's analysis via the API.
 * @param data The StoredAnalysis object for today.
 */
  try {
    const todayKey = getVietnamDateKey(new Date());
    localStorage.setItem(`analysis_${todayKey}`, JSON.stringify(data));
    const historicalData = await getAllHistoricalData();
    historicalData[todayKey] = data;
    localStorage.setItem('historicalData', JSON.stringify(historicalData));
  } catch (error) {
    console.error("Failed to save today's analysis to localStorage:", error);
    throw error;
  }
};

// Removed duplicate/invalid block
/**
 * Retrieves today's lottery result from localStorage.
 */
export const getTodaysLotteryResult = async (): Promise<LotteryResult | null> => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    const data = localStorage.getItem(`lottery_${todayKey}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to fetch today's lottery result from localStorage:", error);
    return null;
  }
};

/**
 * Saves today's lottery result to localStorage.
 */
  try {
    const todayKey = getVietnamDateKey(new Date());
    localStorage.setItem(`lottery_${todayKey}`, JSON.stringify(result));
    const historicalData = await getAllHistoricalData();
    if (!historicalData[todayKey]) historicalData[todayKey] = {} as StoredAnalysis;
    historicalData[todayKey].lotteryResult = result;
    localStorage.setItem('historicalData', JSON.stringify(historicalData));
  } catch (error) {
    console.error("Failed to save today's lottery result to localStorage:", error);
    throw error;
  }
};

/**
 * Deletes today's analysis from localStorage.
 */
  try {
    const todayKey = getVietnamDateKey(new Date());
    localStorage.removeItem(`analysis_${todayKey}`);
    const historicalData = await getAllHistoricalData();
    if (historicalData[todayKey]) delete historicalData[todayKey].analysis;
    localStorage.setItem('historicalData', JSON.stringify(historicalData));
  } catch (error) {
    console.error("Failed to delete today's analysis from localStorage:", error);
  }
};

/**
 * Deletes today's lottery result from localStorage.
 */
  try {
    const todayKey = getVietnamDateKey(new Date());
    localStorage.removeItem(`lottery_${todayKey}`);
    const historicalData = await getAllHistoricalData();
    if (historicalData[todayKey]) delete historicalData[todayKey].lotteryResult;
    localStorage.setItem('historicalData', JSON.stringify(historicalData));
  } catch (error) {
    console.error("Failed to delete today's lottery result from localStorage:", error);
  }
};

/**
 * Deletes all of today's data (analysis and lottery result) from localStorage.
 */
  try {
    await deleteTodaysAnalysis();
    await deleteTodaysLotteryResult();
  } catch (error) {
    console.error("Failed to delete today's data from localStorage:", error);
  }
};
  try {
    const todayKey = getVietnamDateKey(new Date());
    const response = await fetch(`/api/storage/lottery/${todayKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to save lottery result:", error);
    throw error;
  }
};

/**
 * Deletes today's analysis via the API.
 */
export const deleteTodaysAnalysis = async () => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    const response = await fetch(`/api/storage/analysis/${todayKey}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to delete today's analysis:", error);
    throw error;
  }
};

/**
 * Deletes today's lottery result via the API.
 */
export const deleteTodaysLotteryResult = async () => {
  try {
    const todayKey = getVietnamDateKey(new Date());
    const response = await fetch(`/api/storage/lottery/${todayKey}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to delete today's lottery result:", error);
    throw error;
  }
};

/**
 * Deletes all of today's data (analysis and lottery result).
 */
export const deleteTodaysData = async () => {
  try {
    await Promise.all([
      deleteTodaysAnalysis(),
      deleteTodaysLotteryResult()
    ]);
  } catch (error) {
    console.error("Failed to delete today's data:", error);
    throw error;
  }
};
