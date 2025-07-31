import { NextRequest, NextResponse } from 'next/server';
import { fetchCurrentDayLotteryResult } from '@/services/geminiService';
import { saveTodaysLotteryResult, getVietnamDateKey } from '@/utils/storage';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a cron job (optional security check)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting scheduled lottery result check...');
    
    // Get current Vietnam time
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const currentHour = vietnamTime.getHours();
    const dateKey = getVietnamDateKey(vietnamTime);
    
    console.log(`Checking lottery results at ${currentHour}:00 Vietnam time for date ${dateKey}`);
    
    // Only check lottery results after 18:35 (6:35 PM) Vietnam time
    if (currentHour < 18 || (currentHour === 18 && vietnamTime.getMinutes() < 35)) {
      return NextResponse.json({
        success: false,
        message: 'Lottery results are not available yet. Check after 18:35 Vietnam time.',
        currentTime: vietnamTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
      });
    }
    
    // Fetch lottery results
    const result = await fetchCurrentDayLotteryResult();
    
    if (result) {
      // Save the lottery result
      await saveTodaysLotteryResult(result);
      
      console.log(`Lottery result saved for ${dateKey}:`, result);
      
      return NextResponse.json({
        success: true,
        message: `Lottery result checked and saved for ${dateKey}`,
        dateKey,
        specialPrize: result.specialPrize,
        allPrizes: result.allPrizes
      });
    } else {
      console.error('No lottery result received');
      return NextResponse.json({
        success: false,
        error: 'No lottery result received'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in lottery check cron job:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// GET method for manual testing
export async function GET() {
  return NextResponse.json({
    message: 'Lottery check cron endpoint is active',
    usage: 'POST with proper authorization to trigger lottery check'
  });
}
