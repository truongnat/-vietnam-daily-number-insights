import { NextRequest, NextResponse } from 'next/server';
import { saveLotteryResultForDate } from '@/utils/server-file-storage';
import { fetchXSMBSingleDate, hasValidResults } from '@/utils/xsmb-api';
import type { LotteryResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { dateKey } = await request.json();
    
    if (!dateKey) {
      return NextResponse.json(
        { success: false, error: 'Date key is required' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateKey)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Check if the date is not too far in the future (allow some flexibility for testing)
    const today = new Date();
    const vietnamToday = new Date(today.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
    const todayString = vietnamToday.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Allow dates up to 1 day in the future for testing purposes
    const maxDate = new Date(vietnamToday);
    maxDate.setDate(maxDate.getDate() + 1);
    const maxDateString = maxDate.toISOString().split('T')[0];

    console.log(`Date validation: requested=${dateKey}, today=${todayString}, maxAllowed=${maxDateString}`);

    if (dateKey > maxDateString) {
      return NextResponse.json(
        { success: false, error: `Date too far in future. Today is ${todayString}, max allowed is ${maxDateString}, requested ${dateKey}` },
        { status: 400 }
      );
    }

    console.log(`Fetching XSMB lottery results for date: ${dateKey}`);

    // Fetch real lottery results from XSMB API
    const xsmbResponse = await fetchXSMBSingleDate(dateKey);

    if (!xsmbResponse.ok || !xsmbResponse.data) {
      return NextResponse.json({
        success: false,
        error: `Không thể lấy kết quả xổ số cho ngày ${dateKey}`,
        details: xsmbResponse.error || 'No data available'
      }, { status: 404 });
    }

    const xsmbData = xsmbResponse.data;

    // Validate that we have valid results
    if (!hasValidResults(xsmbData)) {
      return NextResponse.json({
        success: false,
        error: `Kết quả xổ số cho ngày ${dateKey} không hợp lệ hoặc chưa có`,
        details: 'No valid prize data found'
      }, { status: 404 });
    }

    // Extract special prize (Đặc biệt) - get last 2 digits
    const specialPrizeNumbers = xsmbData.prizes['ĐB'];
    if (!specialPrizeNumbers || specialPrizeNumbers.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Không tìm thấy giải đặc biệt cho ngày ${dateKey}`,
        details: 'Special prize not found'
      }, { status: 404 });
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

    const lotteryResult: LotteryResult = {
      specialPrize,
      allPrizes: uniquePrizes
    };

    // Save the lottery result
    await saveLotteryResultForDate(dateKey, lotteryResult);

    console.log(`Successfully saved lottery result for ${dateKey}:`, lotteryResult);

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật kết quả xổ số cho ngày ${dateKey}`,
      dateKey,
      lotteryResult,
      source: 'XSMB API',
      totalNumbers: uniquePrizes.length
    });

  } catch (error) {
    console.error('Error in lottery check for date:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check lottery result',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method with dateKey in body to check lottery results for a specific date',
    example: {
      method: 'POST',
      body: {
        dateKey: '2024-01-15'
      }
    }
  });
}