import { NextRequest, NextResponse } from 'next/server';
import { saveLotteryResultForDate, deleteLotteryResultForDate } from '@/utils/appwrite-database';
import type { LotteryResult } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    const result: LotteryResult = await request.json();

    await saveLotteryResultForDate(date, result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving lottery result:', error);
    return NextResponse.json(
      { error: 'Failed to save lottery result' },
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
    await deleteLotteryResultForDate(date);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lottery result:', error);
    return NextResponse.json(
      { error: 'Failed to delete lottery result' },
      { status: 500 }
    );
  }
}
