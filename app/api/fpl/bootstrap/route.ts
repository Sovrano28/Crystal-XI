import { NextResponse } from 'next/server';
import { fetchBootstrapStatic } from '@/lib/fpl-api';

export async function GET() {
  try {
    const data = await fetchBootstrapStatic();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching bootstrap data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FPL data' },
      { status: 500 }
    );
  }
}

