import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all assignments (optionally filtered by userId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const assignments = await prisma.assignment.findMany({
      where: userId ? { userId } : undefined,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { class: 'asc' }
    });

    return NextResponse.json(assignments);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

// POST: Assign a subject to a teacher
export async function POST(request: Request) {
  try {
    const { userId, className, batch, subject } = await request.json();

    if (!userId || !className || !batch || !subject) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const assignment = await prisma.assignment.create({
      data: { userId, class: className, batch, subject }
    });

    return NextResponse.json({ success: true, assignment });
  } catch {
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
