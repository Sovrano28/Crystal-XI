import { NextRequest, NextResponse } from 'next/server';
import { getPlayersWithPoints, fetchBootstrapStatic, getScoringGameweek } from '@/lib/fpl-api';

export async function POST(request: NextRequest) {
  try {
    const { playerIds, gameweek } = await request.json();

    if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json(
        { error: 'Player IDs array is required' },
        { status: 400 }
      );
    }

    // Use provided gameweek or default to scoring gameweek
    let targetGameweek = gameweek;
    if (!targetGameweek) {
      const bootstrap = await fetchBootstrapStatic();
      targetGameweek = getScoringGameweek(bootstrap.events);
    }

    const playersWithPoints = await getPlayersWithPoints(playerIds, targetGameweek);

    return NextResponse.json({
      players: playersWithPoints,
      gameweek: targetGameweek,
    });
  } catch (error) {
    console.error('Error fetching players with points:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players with points' },
      { status: 500 }
    );
  }
}
