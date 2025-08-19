import { NextRequest, NextResponse } from 'next/server';
import { saveLotteryResultForDate } from '@/utils/server-file-storage';

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

    // Allow dates up to 7 days in the future for testing purposes
    const maxDate = new Date(vietnamToday);
    maxDate.setDate(maxDate.getDate() + 7);
    const maxDateString = maxDate.toISOString().split('T')[0];

    console.log(`Date validation: requested=${dateKey}, today=${todayString}, maxAllowed=${maxDateString}`);

    if (dateKey > maxDateString) {
      return NextResponse.json(
        { success: false, error: `Date too far in future. Today is ${todayString}, max allowed is ${maxDateString}, requested ${dateKey}` },
        { status: 400 }
      );
    }

    // For now, we'll simulate fetching lottery results
    // In a real implementation, you would call an actual lottery API here
    const mockLotteryResult = {
      specialPrize: generateMockNumber(),
      allPrizes: generateMockPrizes(),
      date: dateKey,
      source: 'Mock API - Force Check'
    };

    // Save the lottery result
    await saveLotteryResultForDate(dateKey, mockLotteryResult);

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật kết quả xổ số cho ngày ${dateKey}`,
      dateKey,
      lotteryResult: mockLotteryResult
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

// Helper function to generate mock lottery numbers
function generateMockNumber(): string {
  return Math.floor(Math.random() * 100).toString().padStart(2, '0');
}

// Helper function to generate mock prize list
function generateMockPrizes(): string[] {
  const prizes = new Set<string>();
  
  // Generate 20 unique 2-digit numbers
  while (prizes.size < 20) {
    prizes.add(generateMockNumber());
  }
  
  return Array.from(prizes);
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