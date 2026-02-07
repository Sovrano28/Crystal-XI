import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db';
import TransferPlanModel from '@/lib/models/TransferPlan';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/transfer-plans/[id] - Fetch specific plan
export async function GET(request: Request, { params }: RouteParams) {
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

    const plan = await TransferPlanModel.findOne({ 
      _id: id, 
      userId: session.user.id 
    }).lean();

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('[TransferPlans API] Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transfer plan' },
      { status: 500 }
    );
  }
}

// PUT /api/transfer-plans/[id] - Update plan (add/remove transfers)
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, transfers, chipUsed, isActive } = body;

    await connectDB();

    // If setting this plan as active, deactivate others first
    if (isActive) {
      await TransferPlanModel.updateMany(
        { userId: session.user.id, _id: { $ne: id } },
        { isActive: false }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (transfers !== undefined) updateData.transfers = transfers;
    if (chipUsed !== undefined) updateData.chipUsed = chipUsed;
    if (isActive !== undefined) updateData.isActive = isActive;

    const plan = await TransferPlanModel.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: updateData },
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
      message: 'Transfer plan updated successfully' 
    });
  } catch (error) {
    console.error('[TransferPlans API] Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update transfer plan' },
      { status: 500 }
    );
  }
}

// DELETE /api/transfer-plans/[id] - Delete plan
export async function DELETE(request: Request, { params }: RouteParams) {
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

    const result = await TransferPlanModel.deleteOne({ 
      _id: id, 
      userId: session.user.id 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Transfer plan deleted successfully' 
    });
  } catch (error) {
    console.error('[TransferPlans API] Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete transfer plan' },
      { status: 500 }
    );
  }
}
