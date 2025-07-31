import { NextResponse } from 'next/server';
import { getVietnamDateKey } from '@/utils/server-storage';

// Simple in-memory status tracking
const processingStatus = new Map<string, {
  type: 'analysis' | 'lottery';
  status: 'processing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  error?: string;
}>();

export function setProcessingStatus(
  dateKey: string, 
  type: 'analysis' | 'lottery', 
  status: 'processing' | 'completed' | 'failed',
  error?: string
) {
  const key = `${dateKey}-${type}`;
  const existing = processingStatus.get(key);
  
  processingStatus.set(key, {
    type,
    status,
    startTime: existing?.startTime || new Date(),
    endTime: status !== 'processing' ? new Date() : undefined,
    error
  });
}

export async function GET() {
  try {
    // Get current Vietnam time
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const dateKey = getVietnamDateKey(vietnamTime);
    
    const analysisKey = `${dateKey}-analysis`;
    const lotteryKey = `${dateKey}-lottery`;
    
    const analysisStatus = processingStatus.get(analysisKey);
    const lotteryStatus = processingStatus.get(lotteryKey);
    
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
