import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    // Build the external API URL
    let externalUrl = 'https://v0-next-js-app-for-xoso.vercel.app/api/xoso';
    
    if (date) {
      externalUrl += `?date=${encodeURIComponent(date)}`;
    } else if (start && end) {
      externalUrl += `?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    } else {
      return NextResponse.json({
        ok: false,
        error: 'Thiếu tham số. Dùng ?date=YYYY-MM-DD hoặc ?start=...&end=...',
        exampleSingle: '/api/xsmb?date=2025-08-02',
        exampleRange: '/api/xsmb?start=2025-08-01&end=2025-08-03'
      }, { status: 400 });
    }

    console.log('Fetching XSMB data from:', externalUrl);

    // Fetch data from the external API
    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      return NextResponse.json({
        ok: false,
        error: `External API error: ${response.status} ${response.statusText}`
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Add CORS headers to allow frontend access
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    return NextResponse.json(data, { headers });

  } catch (error) {
    console.error('XSMB API proxy error:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch XSMB data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  // Handle preflight requests
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}