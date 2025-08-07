import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisForDate, saveAnalysisForDate, deleteAnalysisForDate } from '@/utils/appwrite-database';
import type { StoredAnalysis } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    const data = await getAnalysisForDate(date);

    if (!data) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    const data: Omit<StoredAnalysis, 'lotteryResult'> = await request.json();

    await saveAnalysisForDate(date, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving analysis:', error);
    return NextResponse.json(
      { error: 'Failed to save analysis' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    await deleteAnalysisForDate(date);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    );
  }
}
