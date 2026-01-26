import { NextResponse } from 'next/server';
import { fetchFixtures } from '@/lib/fpl-api';

export async function GET() {
  try {
    const data = await fetchFixtures();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fixtures' },
      { status: 500 }
    );
  }
}

