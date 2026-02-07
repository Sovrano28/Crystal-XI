import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import TransferPlanModel from '@/lib/models/TransferPlan';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/transfer-plans/[id]/activate - Set plan as active
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    // Deactivate all other plans for this user
    await TransferPlanModel.updateMany(
      { userId: session.user.id },
      { isActive: false }
    );

    // Activate the requested plan
    const plan = await TransferPlanModel.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { isActive: true },
      { new: true }
    ).lean();

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      plan,
      message: 'Transfer plan activated' 
    });
  } catch (error) {
    console.error('[TransferPlans API] Error activating plan:', error);
    return NextResponse.json(
      { error: 'Failed to activate transfer plan' },
      { status: 500 }
    );
  }
}
