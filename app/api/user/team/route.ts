import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import UserTeamModel from '@/lib/models/UserTeam';
import UserModel from '@/lib/models/User';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userTeam = await UserTeamModel.findOne({ userId: session.user.id });
    if (!userTeam) {
      return NextResponse.json({ fplTeamId: null });
    }

    return NextResponse.json({
      fplTeamId: userTeam.fplTeamId,
      teamName: userTeam.teamName,
      autoSync: userTeam.autoSync,
      preferences: userTeam.preferences,
    });
  } catch (error) {
    console.error('Error fetching user team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fplTeamId, teamName, autoSync, preferences } = await request.json();

    if (!fplTeamId || isNaN(Number(fplTeamId))) {
      return NextResponse.json({ error: 'Valid FPL team ID is required' }, { status: 400 });
    }

    await connectDB();

    // Update or create user team
    const userTeam = await UserTeamModel.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        fplTeamId: Number(fplTeamId),
        teamName,
        autoSync: autoSync !== undefined ? autoSync : true,
        preferences: preferences || {
          defaultFormation: '3-4-3',
          showPrices: true,
          showStats: true,
        },
      },
      { upsert: true, new: true }
    );

    // Also update user's fplTeamId
    await UserModel.findByIdAndUpdate(session.user.id, {
      fplTeamId: Number(fplTeamId),
    });

    return NextResponse.json({
      message: 'Team updated successfully',
      fplTeamId: userTeam.fplTeamId,
    });
  } catch (error) {
    console.error('Error updating user team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

