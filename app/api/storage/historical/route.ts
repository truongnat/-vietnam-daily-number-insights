import { NextResponse } from 'next/server';
import { getAllHistoricalData } from '@/utils/database';

export async function GET() {
  try {
    const data = getAllHistoricalData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}
