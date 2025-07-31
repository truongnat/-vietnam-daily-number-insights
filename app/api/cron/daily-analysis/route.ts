import { NextResponse } from 'next/server';
import { fetchDailyAnalysis } from '@/services/geminiService';
import { saveTodaysAnalysis, getVietnamDateKey } from '@/utils/server-storage';
import { setProcessingStatus } from '@/utils/processing-status';

// Background processing function
async function processAnalysisInBackground(dateKey: string, currentHour: number) {
  try {
    console.log(`Background processing: Starting analysis for ${dateKey} at ${currentHour}:00`);
    setProcessingStatus(dateKey, 'analysis', 'processing');

    // Fetch daily analysis
    const result = await fetchDailyAnalysis();

    if (result.analysis && result.analysis.bestNumber && result.analysis.luckyNumbers && result.analysis.luckyNumbers.length > 0) {
      // Save the analysis
      await saveTodaysAnalysis({
        analysis: result.analysis,
        groundingChunks: result.groundingChunks
      });

      console.log(`Background processing: Daily analysis completed and saved for ${dateKey}`);
      console.log(`Background processing: Best number: ${result.analysis.bestNumber.number}, Lucky numbers: ${result.analysis.luckyNumbers.map(ln => ln.number).join(', ')}`);
      setProcessingStatus(dateKey, 'analysis', 'completed');
    } else {
      console.error('Background processing: Invalid analysis result received');
      setProcessingStatus(dateKey, 'analysis', 'failed', 'Invalid analysis result received');
    }
  } catch (error) {
    console.error('Background processing: Error in daily analysis:', error);
    setProcessingStatus(dateKey, 'analysis', 'failed', error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function GET() {
  try {
    console.log('Starting scheduled daily analysis...');

    // Get current Vietnam time
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const currentHour = vietnamTime.getHours();
    const dateKey = getVietnamDateKey(vietnamTime);

    console.log(`Running analysis at ${currentHour}:00 Vietnam time for date ${dateKey}`);

    // Start background processing (fire-and-forget)
    processAnalysisInBackground(dateKey, currentHour).catch(error => {
      console.error('Background processing failed:', error);
    });

    // Return immediate response to avoid timeout
    return NextResponse.json({
      success: true,
      message: `Daily analysis started at ${currentHour}:00 Vietnam time`,
      dateKey,
      status: 'processing',
      note: 'Analysis is running in background and will be saved when complete'
    });
    
  } catch (error) {
    console.error('Error in daily analysis cron job:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}


