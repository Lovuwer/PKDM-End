import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch weekly plans for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const plans = await prisma.weeklyPlan.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(plans);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weekly plans' }, { status: 500 });
  }
}

// POST: Create a new weekly plan
export async function POST(request: Request) {
  try {
    const { userId, className, subject, startDate, endDate, learningObjective, teachingMethod, field1, field2, field3, field4 } = await request.json();

    const plan = await prisma.weeklyPlan.create({
      data: {
        userId,
        class: className,
        subject,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        learningObjective,
        teachingMethod,
        field1,
        field2,
        field3,
        field4,
        status: 'DRAFT'
      }
    });

    return NextResponse.json({ success: true, plan });
  } catch {
    return NextResponse.json({ error: 'Failed to create weekly plan' }, { status: 500 });
  }
}

// PUT: Update/auto-save a weekly plan
export async function PUT(request: Request) {
  try {
    const { id, learningObjective, teachingMethod, field1, field2, field3, field4, status } = await request.json();

    const plan = await prisma.weeklyPlan.update({
      where: { id },
      data: {
        learningObjective,
        teachingMethod,
        field1,
        field2,
        field3,
        field4,
        status: status || undefined,
        submittedAt: status === 'SUBMITTED' ? new Date() : undefined
      }
    });

    return NextResponse.json({ success: true, plan });
  } catch {
    return NextResponse.json({ error: 'Failed to update weekly plan' }, { status: 500 });
  }
}
