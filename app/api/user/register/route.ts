import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import UserModel from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await UserModel.create({
      email,
      name,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: 'User created successfully', userId: user._id.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

