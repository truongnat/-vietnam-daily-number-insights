import { NextResponse } from 'next/server';
import { fetchCurrentDayLotteryResult } from '@/services/geminiService';
import { saveTodaysLotteryResult, getVietnamDateKey } from '@/utils/server-storage';
import { setProcessingStatus } from '@/utils/processing-status';

// Background processing function
async function processLotteryCheckInBackground(dateKey: string, currentHour: number) {
  try {
    console.log(`Background processing: Starting lottery check for ${dateKey} at ${currentHour}:00`);
    setProcessingStatus(dateKey, 'lottery', 'processing');

    // Fetch lottery results
    const result = await fetchCurrentDayLotteryResult();

    if (result) {
      // Save the lottery result
      await saveTodaysLotteryResult(result);

      console.log(`Background processing: Lottery result saved for ${dateKey}:`, result);
      setProcessingStatus(dateKey, 'lottery', 'completed');
    } else {
      console.error('Background processing: No lottery result received');
      setProcessingStatus(dateKey, 'lottery', 'failed', 'No lottery result received');
    }
  } catch (error) {
    console.error('Background processing: Error in lottery check:', error);
    setProcessingStatus(dateKey, 'lottery', 'failed', error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function GET() {
  try {
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

    // Start background processing (fire-and-forget)
    processLotteryCheckInBackground(dateKey, currentHour).catch(error => {
      console.error('Background processing failed:', error);
    });

    // Return immediate response to avoid timeout
    return NextResponse.json({
      success: true,
      message: `Lottery check started at ${currentHour}:00 Vietnam time`,
      dateKey,
      status: 'processing',
      note: 'Lottery check is running in background and will be saved when complete'
    });
    
  } catch (error) {
    console.error('Error in lottery check cron job:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}


