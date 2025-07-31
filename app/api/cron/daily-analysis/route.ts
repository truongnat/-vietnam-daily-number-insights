import { NextResponse } from 'next/server';
import { fetchDailyAnalysis } from '@/services/geminiService';
import { saveTodaysAnalysis, getVietnamDateKey } from '@/utils/server-storage';

export async function GET() {
  try {
    console.log('Starting scheduled daily analysis...');
    
    // Get current Vietnam time
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const currentHour = vietnamTime.getHours();
    const dateKey = getVietnamDateKey(vietnamTime);
    
    console.log(`Running analysis at ${currentHour}:00 Vietnam time for date ${dateKey}`);
    
    // Fetch daily analysis
    const result = await fetchDailyAnalysis();
    
    if (result.analysis && result.analysis.bestNumber && result.analysis.luckyNumbers && result.analysis.luckyNumbers.length > 0) {
      // Save the analysis
      await saveTodaysAnalysis({
        analysis: result.analysis,
        groundingChunks: result.groundingChunks
      });

      console.log(`Daily analysis completed and saved for ${dateKey}`);

      return NextResponse.json({
        success: true,
        message: `Daily analysis completed at ${currentHour}:00`,
        dateKey,
        bestNumber: result.analysis.bestNumber.number,
        luckyNumbers: result.analysis.luckyNumbers.map(ln => ln.number)
      });
    } else {
      console.error('Invalid analysis result received');
      return NextResponse.json({
        success: false,
        error: 'Invalid analysis result received'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in daily analysis cron job:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}


