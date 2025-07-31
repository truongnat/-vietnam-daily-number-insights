import { NextRequest, NextResponse } from 'next/server';
import { fetchDailyAnalysis } from '@/services/geminiService';
import { saveTodaysAnalysis, getVietnamDateKey } from '@/utils/storage';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a cron job (optional security check)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

// GET method for manual testing
export async function GET() {
  return NextResponse.json({
    message: 'Daily analysis cron endpoint is active',
    usage: 'POST with proper authorization to trigger analysis'
  });
}
