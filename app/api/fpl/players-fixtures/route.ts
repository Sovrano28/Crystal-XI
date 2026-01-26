import { NextRequest, NextResponse } from 'next/server';
import { getPlayersWithFixtures, getCurrentGameweek } from '@/lib/fpl-api';

export async function POST(request: NextRequest) {
  try {
    const { playerIds } = await request.json();

    if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json(
        { error: 'Player IDs array is required' },
        { status: 400 }
      );
    }

    const currentGW = await getCurrentGameweek();
    const playersWithFixtures = await getPlayersWithFixtures(playerIds, currentGW);

    return NextResponse.json({
      players: playersWithFixtures,
      currentGameweek: currentGW,
    });
  } catch (error) {
    console.error('Error fetching players with fixtures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players with fixtures' },
      { status: 500 }
    );
  }
}
