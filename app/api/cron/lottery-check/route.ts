import { NextResponse } from 'next/server';
import { fetchCurrentDayLotteryResult } from '@/services/geminiService';
import { saveLotteryResultForDate, getVietnamDateKey } from '@/utils/server-storage';
import { setProcessingStatus } from '@/utils/processing-status';
import { getLotteryResultForDate } from '@/utils/server-file-storage';

// Background processing function
async function processLotteryCheckInBackground(dateKey: string, currentHour: number) {
  try {
    console.log(`Background processing: Starting lottery check for ${dateKey} at ${currentHour}:00`);
    setProcessingStatus(dateKey, 'lottery', 'processing');

    // Fetch lottery results
    const result = await fetchCurrentDayLotteryResult();

    if (result) {
      // Save the lottery result
      await saveLotteryResultForDate(dateKey, result);

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

    // Check if lottery result already exists for today (prevent multiple runs per day)
    const existingResult = await getLotteryResultForDate(dateKey);
    if (existingResult) {
      console.log(`Lottery result already exists for ${dateKey}, skipping...`);
      return NextResponse.json({
        success: true,
        message: `Lottery result already exists for ${dateKey}`,
        dateKey,
        status: 'already_completed',
        note: 'Lottery result was already fetched today. Only one check per day is allowed.'
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