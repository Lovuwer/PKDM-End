import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch yearly plans for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const plans = await prisma.yearlyPlan.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(plans);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch yearly plans' }, { status: 500 });
  }
}

// POST: Create a new yearly plan
export async function POST(request: Request) {
  try {
    const { userId, className, subject, academicYear, draftData } = await request.json();

    const plan = await prisma.yearlyPlan.create({
      data: {
        userId,
        class: className,
        subject,
        academicYear: academicYear || '2025-2026',
        draftData: draftData || {},
        status: 'DRAFT'
      }
    });

    return NextResponse.json({ success: true, plan });
  } catch {
    return NextResponse.json({ error: 'Failed to create yearly plan' }, { status: 500 });
  }
}

// PUT: Update/auto-save a yearly plan
export async function PUT(request: Request) {
  try {
    const { id, draftData, status } = await request.json();

    const plan = await prisma.yearlyPlan.update({
      where: { id },
      data: {
        draftData,
        status: status || undefined,
        submittedAt: status === 'SUBMITTED' ? new Date() : undefined
      }
    });

    return NextResponse.json({ success: true, plan });
  } catch {
    return NextResponse.json({ error: 'Failed to update yearly plan' }, { status: 500 });
  }
}
