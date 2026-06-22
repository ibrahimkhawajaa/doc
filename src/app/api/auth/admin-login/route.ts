import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Demo admin credentials - in production, use database
const DEMO_ADMINS = [
  { email: 'admin@medicare.com', password: 'Admin@2024' },
  { email: 'root@medicare.com', password: 'Root@2024' },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate credentials
    const admin = DEMO_ADMINS.find(a => a.email === email && a.password === password);

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { email, role: 'admin', iat: Date.now() },
      process.env.ADMIN_SECRET || 'admin-secret-key-2024',
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      token,
      email,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
