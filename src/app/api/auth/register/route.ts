import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password, confirmPassword } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Passwords do not match' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Look up user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'This email was not found in the system. Please contact your administrator to be added first.' 
      }, { status: 404 });
    }

    if (user.role !== 'TEACHER') {
      return NextResponse.json({ success: false, error: 'Registration is only available for teachers.' }, { status: 403 });
    }

    // Check if already registered (has a real password, not placeholder)
    if (user.password !== '__UNREGISTERED__') {
      return NextResponse.json({ 
        success: false, 
        error: 'This email is already registered. Please use the login page instead.' 
      }, { status: 409 });
    }

    // Set the password (plain-text for now — swap to bcrypt in production)
    await prisma.user.update({
      where: { email },
      data: { password }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful! You can now log in.' 
    });
  } catch (error) {
    console.error('[API /api/auth/register POST]', error);
    return NextResponse.json({ success: false, error: 'Server error during registration' }, { status: 500 });
  }
}
