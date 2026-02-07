import { NextResponse } from 'next/server';
// Force recompile
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import TransferPlanModel from '@/lib/models/TransferPlan';

// GET /api/transfer-plans/active - Get the active plan for current user
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

    const plan = await TransferPlanModel.findOne({ 
      userId: session.user.id,
      isActive: true 
    }).lean();

    // Return null if no active plan (not an error)
    return NextResponse.json({ plan: plan || null });
  } catch (error) {
    console.error('[TransferPlans API] Error fetching active plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active transfer plan' },
      { status: 500 }
    );
  }
}

// DELETE /api/transfer-plans/active - Deactivate all plans (reset to real squad)
export async function DELETE() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    await TransferPlanModel.updateMany(
      { userId: session.user.id },
      { isActive: false }
    );

    return NextResponse.json({ 
      message: 'All plans deactivated - viewing real squad' 
    });
  } catch (error) {
    console.error('[TransferPlans API] Error deactivating plans:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate plans' },
      { status: 500 }
    );
  }
}
