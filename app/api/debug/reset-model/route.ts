import { NextResponse } from 'next/server';

// POST /api/debug/reset-model - Debug endpoint (stub)
export async function POST() {
  return NextResponse.json({ ok: true, message: 'Reset model (debug)' });
}
