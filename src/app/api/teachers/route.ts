import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all teachers
export async function GET() {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      include: {
        assignments: true,
        yearlyPlans: { select: { id: true, class: true, subject: true, status: true } },
        weeklyPlans: { select: { id: true, class: true, subject: true, status: true } },
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(teachers);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

// POST: Create a new teacher
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { name, email, password, role: 'TEACHER' }
    });

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  }
}
