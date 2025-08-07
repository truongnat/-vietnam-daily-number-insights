import { NextResponse } from 'next/server';
import { fetchDailyAnalysis } from '@/services/geminiService';
import { saveTodaysAnalysis, getVietnamDateKey } from '@/utils/server-storage';
import { setProcessingStatus } from '@/utils/processing-status';
import { deleteAnalysisForDate } from '@/utils/appwrite-database';

// Background processing function for force run
async function processForceAnalysisInBackground(dateKey: string, currentHour: number) {
  try {
    console.log(`Background processing: Starting FORCE analysis for ${dateKey} at ${currentHour}:00`);
    setProcessingStatus(dateKey, 'analysis', 'processing');

    // Fetch daily analysis
    const result = await fetchDailyAnalysis();

    if (result.analysis && result.analysis.bestNumber && result.analysis.luckyNumbers && result.analysis.luckyNumbers.length > 0) {
      // Save the analysis
      await saveTodaysAnalysis({
        analysis: result.analysis,
        groundingChunks: result.groundingChunks
      });

      console.log(`Background processing: FORCE analysis completed and saved for ${dateKey}`);
      console.log(`Background processing: Best number: ${result.analysis.bestNumber.number}, Lucky numbers: ${result.analysis.luckyNumbers.map(ln => ln.number).join(', ')}`);
      setProcessingStatus(dateKey, 'analysis', 'completed');
    } else {
      console.error('Background processing: Invalid analysis result received');
      setProcessingStatus(dateKey, 'analysis', 'failed', 'Invalid analysis result received');
    }
  } catch (error) {
    console.error('Background processing: Error in FORCE analysis:', error);
    setProcessingStatus(dateKey, 'analysis', 'failed', error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function POST() {
  try {
    console.log('Starting FORCE daily analysis...');

    // Get current Vietnam time
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const currentHour = vietnamTime.getHours();
    const dateKey = getVietnamDateKey(vietnamTime);

    console.log(`Running FORCE analysis at ${currentHour}:00 Vietnam time for date ${dateKey}`);

    // Force delete existing analysis first
    try {
      await deleteAnalysisForDate(dateKey);
      console.log(`Deleted existing analysis for ${dateKey} before force run`);
    } catch (deleteError) {
      console.warn(`Failed to delete existing analysis for ${dateKey}:`, deleteError);
      // Continue anyway
    }

    // Start background processing (fire-and-forget)
    processForceAnalysisInBackground(dateKey, currentHour).catch(error => {
      console.error('Background processing failed:', error);
    });

    // Return immediate response to avoid timeout
    return NextResponse.json({
      success: true,
      message: `FORCE analysis started at ${currentHour}:00 Vietnam time`,
      dateKey,
      status: 'processing',
      note: 'Force analysis is running in background and will be saved when complete. Existing data was deleted.'
    });
    
  } catch (error) {
    console.error('Error in FORCE daily analysis:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to force run daily analysis',
    description: 'This endpoint forces a new daily analysis, deleting any existing data for today first'
  });
}
