/**
 * Utility functions for XSMB API integration
 */

export interface XSMBPrizes {
  'ĐB': string[];
  '1': string[];
  '2': string[];
  '3': string[];
  '4': string[];
  '5': string[];
  '6': string[];
  '7': string[];
}

export interface XSMBData {
  prizes: XSMBPrizes;
  allNumbers: string[];
  meta: {
    detectedDate: string;
    tableSource: string;
    totalNumbers: number;
  };
}

export interface XSMBResult {
  date: string;
  data?: XSMBData;
  error?: string;
}

export interface XSMBResponse {
  ok: boolean;
  range: boolean;
  region: string;
  date?: string;
  start?: string;
  end?: string;
  data?: XSMBData;
  results?: XSMBResult[];
  error?: string;
}

/**
 * Get date string in YYYY-MM-DD format
 */
export const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get Vietnamese date string
 */
export const getVietnameseDateString = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Fetch XSMB results for a single date
 */
export const fetchXSMBSingleDate = async (date: string): Promise<XSMBResponse> => {
  const response = await fetch(
    `https://v0-next-js-app-for-xoso.vercel.app/api/xoso?date=${date}`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Fetch XSMB results for a date range
 */
export const fetchXSMBDateRange = async (startDate: string, endDate: string): Promise<XSMBResponse> => {
  const response = await fetch(
    `https://v0-next-js-app-for-xoso.vercel.app/api/xoso?start=${startDate}&end=${endDate}`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Get today's and yesterday's XSMB results
 */
export const fetchTodayAndYesterdayResults = async (): Promise<{
  today: XSMBResult | null;
  yesterday: XSMBResult | null;
}> => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = getDateString(today);
  const yesterdayStr = getDateString(yesterday);

  try {
    const data = await fetchXSMBDateRange(yesterdayStr, todayStr);
    
    if (!data.ok || !data.results) {
      throw new Error(data.error || 'Failed to fetch XSMB results');
    }

    const todayResult = data.results.find(r => r.date === todayStr) || null;
    const yesterdayResult = data.results.find(r => r.date === yesterdayStr) || null;

    return {
      today: todayResult,
      yesterday: yesterdayResult
    };
  } catch (error) {
    console.error('Error fetching XSMB results:', error);
    return {
      today: null,
      yesterday: null
    };
  }
};

/**
 * Prize labels mapping
 */
export const PRIZE_LABELS: Record<keyof XSMBPrizes, string> = {
  'ĐB': 'Đặc biệt',
  '1': 'Giải nhất',
  '2': 'Giải nhì',
  '3': 'Giải ba',
  '4': 'Giải tư',
  '5': 'Giải năm',
  '6': 'Giải sáu',
  '7': 'Giải bảy'
};

/**
 * Check if a date is today
 */
export const isToday = (dateStr: string): boolean => {
  const today = getDateString(new Date());
  return dateStr === today;
};

/**
 * Check if a date is yesterday
 */
export const isYesterday = (dateStr: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);
  return dateStr === yesterdayStr;
};