import { NextResponse } from 'next/server';
import { getVietnamDateKey } from '@/utils/server-storage';
import { getProcessingStatus } from '@/utils/processing-status';

export async function GET() {
  try {
    // Get current Vietnam time
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const dateKey = getVietnamDateKey(vietnamTime);
    
    const analysisStatus = getProcessingStatus(dateKey, 'analysis');
    const lotteryStatus = getProcessingStatus(dateKey, 'lottery');
    
    return NextResponse.json({
      success: true,
      dateKey,
      currentTime: vietnamTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      processing: {
        analysis: analysisStatus || { status: 'not_started' },
        lottery: lotteryStatus || { status: 'not_started' }
      }
    });
    
  } catch (error) {
    console.error('Error in status check:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
