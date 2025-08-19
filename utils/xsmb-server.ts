/**
 * Server-side utility functions for XSMB API integration
 * This file contains functions that directly call the external XSMB API
 * without going through our own API routes
 */

import type { XSMBResponse, XSMBData, XSMBResult, LotteryResult } from '@/types';

/**
 * Directly fetch XSMB results from the external API for server-side use
 */
export const fetchXSMBDirectly = async (date: string): Promise<XSMBResponse> => {
  const externalUrl = `https://v0-next-js-app-for-xoso.vercel.app/api/xoso?date=${encodeURIComponent(date)}`;
  
  console.log('Fetching XSMB data directly from:', externalUrl);

  const response = await fetch(externalUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`External XSMB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch XSMB results for a date range directly from external API
 */
export const fetchXSMBRangeDirectly = async (startDate: string, endDate: string): Promise<XSMBResponse> => {
  const externalUrl = `https://v0-next-js-app-for-xoso.vercel.app/api/xoso?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`;
  
  console.log('Fetching XSMB range data directly from:', externalUrl);

  const response = await fetch(externalUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`External XSMB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
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
 * Convert XSMB data to LotteryResult format
 */
export const convertXSMBToLotteryResult = (xsmbData: XSMBData): LotteryResult | null => {
  if (!hasValidResults(xsmbData)) {
    return null;
  }

  // Extract special prize (Đặc biệt) - get last 2 digits
  const specialPrizeNumbers = xsmbData.prizes['ĐB'];
  if (!specialPrizeNumbers || specialPrizeNumbers.length === 0) {
    return null;
  }

  const specialPrize = specialPrizeNumbers[0].slice(-2); // Get last 2 digits

  // Extract all prizes - get last 2 digits of all numbers
  const allPrizes: string[] = [];
  Object.values(xsmbData.prizes).forEach(prizeArray => {
    if (prizeArray && Array.isArray(prizeArray)) {
      prizeArray.forEach(number => {
        if (number && typeof number === 'string') {
          allPrizes.push(number.slice(-2)); // Get last 2 digits
        }
      });
    }
  });

  // Remove duplicates and sort
  const uniquePrizes = Array.from(new Set(allPrizes)).sort();

  return {
    specialPrize,
    allPrizes: uniquePrizes
  };
};

/**
 * Fetch lottery result for a specific date (server-side only)
 */
export const fetchLotteryResultForDate = async (dateKey: string): Promise<LotteryResult | null> => {
  try {
    console.log(`Fetching lottery result for date: ${dateKey}`);
    
    const xsmbResponse = await fetchXSMBDirectly(dateKey);

    if (!xsmbResponse.ok || !xsmbResponse.data) {
      console.warn(`No XSMB data available for ${dateKey}`);
      return null;
    }

    const lotteryResult = convertXSMBToLotteryResult(xsmbResponse.data);
    
    if (lotteryResult) {
      console.log(`Successfully fetched lottery result for ${dateKey}:`, lotteryResult);
    } else {
      console.warn(`Invalid lottery data for ${dateKey}`);
    }

    return lotteryResult;
  } catch (error) {
    console.error(`Error fetching lottery result for ${dateKey}:`, error);
    return null;
  }
};