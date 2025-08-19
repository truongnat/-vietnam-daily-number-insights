import { NextResponse } from 'next/server';
import { fetchCurrentDayLotteryResult } from '@/services/geminiService';
import { saveLotteryResultForDate, getVietnamDateKey } from '@/utils/server-storage';
import { setProcessingStatus } from '@/utils/processing-status';
import { deleteLotteryResultForDate } from '@/utils/server-file-storage';

// Background processing function for force lottery check
async function processForceLotteryCheckInBackground(dateKey: string, currentHour: number) {
  try {
    console.log(`Background processing: Starting FORCE lottery check for ${dateKey} at ${currentHour}:00`);
    setProcessingStatus(dateKey, 'lottery', 'processing');

    // Fetch lottery results
    const result = await fetchCurrentDayLotteryResult();

    if (result) {
      // Save the lottery result
      await saveLotteryResultForDate(dateKey, result);

      console.log(`Background processing: FORCE lottery result saved for ${dateKey}:`, result);
      setProcessingStatus(dateKey, 'lottery', 'completed');
    } else {
      console.error('Background processing: No lottery result received');
      setProcessingStatus(dateKey, 'lottery', 'failed', 'No lottery result received');
    }
  } catch (error) {
    console.error('Background processing: Error in FORCE lottery check:', error);
    setProcessingStatus(dateKey, 'lottery', 'failed', error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function POST() {
  try {
    console.log('Starting FORCE lottery result check...');

    // Get current Vietnam time
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const currentHour = vietnamTime.getHours();
    const dateKey = getVietnamDateKey(vietnamTime);

    console.log(`Checking FORCE lottery results at ${currentHour}:00 Vietnam time for date ${dateKey}`);

    // Force delete existing lottery result first
    try {
      await deleteLotteryResultForDate(dateKey);
      console.log(`Deleted existing lottery result for ${dateKey} before force run`);
    } catch (deleteError) {
      console.warn(`Failed to delete existing lottery result for ${dateKey}:`, deleteError);
      // Continue anyway
    }

    // Start background processing (fire-and-forget)
    processForceLotteryCheckInBackground(dateKey, currentHour).catch(error => {
      console.error('Background processing failed:', error);
    });

    // Return immediate response to avoid timeout
    return NextResponse.json({
      success: true,
      message: `FORCE lottery check started at ${currentHour}:00 Vietnam time`,
      dateKey,
      status: 'processing',
      note: 'Force lottery check is running in background and will be saved when complete. Existing data was deleted.'
    });
    
  } catch (error) {
    console.error('Error in FORCE lottery check:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to force run lottery check',
    description: 'This endpoint forces a new lottery check, deleting any existing data for today first'
  });
}