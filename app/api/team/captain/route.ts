import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import CaptainSettings from '@/lib/models/CaptainSettings';

/**
 * GET /api/team/captain?gameweek=X
 * 
 * Retrieves the saved captain/vice-captain settings for the authenticated user
 * for a specific gameweek. Returns null if no record exists.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameweek = parseInt(searchParams.get('gameweek') || '0');

    if (!gameweek || gameweek < 1 || gameweek > 38) {
      return NextResponse.json({ error: 'Invalid gameweek' }, { status: 400 });
    }

    await connectDB();

    const settings = await CaptainSettings.findOne({
      userId: session.user.id,
      gameweek,
    });

    if (!settings) {
      return NextResponse.json({ settings: null });
    }

    return NextResponse.json({
      settings: {
        captainId: settings.captainId,
        viceCaptainId: settings.viceCaptainId,
        lastFetchedFromFPL: settings.lastFetchedFromFPL,
        gameweek: settings.gameweek,
      },
    });
  } catch (error) {
    console.error('Error fetching captain settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch captain settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/team/captain
 * 
 * Saves captain/vice-captain selections for the authenticated user.
 * Uses upsert to create new record or update existing one.
 * 
 * Body: { gameweek: number, captainId: number, viceCaptainId: number, fromFPL?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gameweek, captainId, viceCaptainId, fromFPL = false } = body;

    if (!gameweek || gameweek < 1 || gameweek > 38) {
      return NextResponse.json({ error: 'Invalid gameweek' }, { status: 400 });
    }

    if (!captainId || !viceCaptainId) {
      return NextResponse.json({ error: 'Captain and vice-captain IDs are required' }, { status: 400 });
    }

    if (captainId === viceCaptainId) {
      return NextResponse.json({ error: 'Captain and vice-captain cannot be the same player' }, { status: 400 });
    }

    await connectDB();

    // Upsert: update if exists, create if not
    const settings = await CaptainSettings.findOneAndUpdate(
      { userId: session.user.id, gameweek },
      {
        captainId,
        viceCaptainId,
        lastFetchedFromFPL: fromFPL,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      settings: {
        captainId: settings.captainId,
        viceCaptainId: settings.viceCaptainId,
        lastFetchedFromFPL: settings.lastFetchedFromFPL,
        gameweek: settings.gameweek,
      },
    });
  } catch (error) {
    console.error('Error saving captain settings:', error);
    return NextResponse.json(
      { error: 'Failed to save captain settings' },
      { status: 500 }
    );
  }
}
