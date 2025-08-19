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
  date: string;
  region: string;
  url?: string;
  prizes: XSMBPrizes;
  allNumbers: string[];
  meta: {
    title?: string;
    detectedDate: string;
    tableSource: string;
    tbodyRowCount?: number;
    totalNumbers?: number;
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
 * Convert DD-MM-YYYY to YYYY-MM-DD format
 */
export const convertDateFormat = (dateStr: string): string => {
  if (dateStr.includes('-') && dateStr.length === 10) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      // Check if it's DD-MM-YYYY format
      if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert to YYYY-MM-DD
      }
    }
  }
  return dateStr; // Return as-is if already in correct format
};

/**
 * Get Vietnamese date string
 */
export const getVietnameseDateString = (dateStr: string): string => {
  // Convert to YYYY-MM-DD format first if needed
  const normalizedDate = convertDateFormat(dateStr);
  const date = new Date(normalizedDate);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateStr; // Return original if can't parse
  }
  
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Check if XSMB data has valid results
 */
export const hasValidResults = (data: XSMBData): boolean => {
  if (!data || !data.prizes) return false;
  
  // Check if at least one prize category has numbers
  return Object.values(data.prizes).some(prizes => prizes && prizes.length > 0);
};

/**
 * Fetch XSMB results for a single date using our proxy API
 */
export const fetchXSMBSingleDate = async (date: string): Promise<XSMBResponse> => {
  const response = await fetch(`/api/xsmb?date=${date}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Fetch XSMB results for a date range using our proxy API
 */
export const fetchXSMBDateRange = async (startDate: string, endDate: string): Promise<XSMBResponse> => {
  const response = await fetch(`/api/xsmb?start=${startDate}&end=${endDate}`);
  
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

    // Find results by matching dates (handle both formats)
    const todayResult = data.results.find(r => {
      const normalizedDate = convertDateFormat(r.date);
      return normalizedDate === todayStr;
    }) || null;
    
    const yesterdayResult = data.results.find(r => {
      const normalizedDate = convertDateFormat(r.date);
      return normalizedDate === yesterdayStr;
    }) || null;

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
  const normalizedDate = convertDateFormat(dateStr);
  return normalizedDate === today;
};

/**
 * Check if a date is yesterday
 */
export const isYesterday = (dateStr: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);
  const normalizedDate = convertDateFormat(dateStr);
  return normalizedDate === yesterdayStr;
};