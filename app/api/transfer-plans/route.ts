import { NextResponse } from 'next/server';
// Force recompile
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import TransferPlanModel from '@/lib/models/TransferPlan';

// GET /api/transfer-plans - Fetch all plans for current user
export async function GET() {
  try {
    const session = await auth();

    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const plans = await TransferPlanModel.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('[TransferPlans API] Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transfer plans' },
      { status: 500 }
    );
  }
}

// POST /api/transfer-plans - Create new transfer plan
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, gameweek, transfers = [], chipUsed = null, isActive = false } = body;

    if (!name || !gameweek) {
      return NextResponse.json(
        { error: 'Name and gameweek are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Count existing plans for naming
    const existingCount = await TransferPlanModel.countDocuments({ 
      userId: session.user.id 
    });

    const plan = new TransferPlanModel({
      userId: session.user.id,
      name: name || `Plan ${existingCount + 1}`,
      gameweek,
      transfers,
      chipUsed,
      isActive,
    });

    await plan.save();

    return NextResponse.json({ 
      plan: plan.toObject(),
      message: 'Transfer plan created successfully' 
    });
  } catch (error) {
    console.error('[TransferPlans API] Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create transfer plan' },
      { status: 500 }
    );
  }
}
