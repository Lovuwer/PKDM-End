import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch weekly plans for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const className = searchParams.get('class');
    const subject = searchParams.get('subject');

    const where: Record<string, string> = {};
    if (userId) where.userId = userId;
    if (className) where.class = className;
    if (subject) where.subject = subject;

    const plans = await prisma.weeklyPlan.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('[API /api/plans/weekly GET]', error);
    return NextResponse.json({ error: 'Failed to fetch weekly plans' }, { status: 500 });
  }
}

// POST: Create or submit a weekly plan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, className, subject, startDate, endDate, learningObjective, teachingMethod, field1, field2, field3, field4, status } = body;

    if (!userId || !className || !subject) {
      return NextResponse.json({ error: 'userId, className, and subject are required' }, { status: 400 });
    }

    const plan = await prisma.weeklyPlan.create({
      data: {
        userId,
        class: className,
        subject,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
        learningObjective: learningObjective || field1 || null,
        teachingMethod: teachingMethod || field2 || null,
        field1: field1 || null,
        field2: field2 || null,
        field3: field3 || null,
        field4: field4 || null,
        status: status || 'DRAFT',
        submittedAt: status === 'SUBMITTED' ? new Date() : null,
      }
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('[API /api/plans/weekly POST]', error);
    return NextResponse.json({ error: 'Failed to create weekly plan' }, { status: 500 });
  }
}

// PUT: Update/auto-save a weekly plan
export async function PUT(request: Request) {
  try {
    const { id, learningObjective, teachingMethod, field1, field2, field3, field4, status, isCompleted } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Plan id is required' }, { status: 400 });
    }

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
        isCompleted: isCompleted !== undefined ? isCompleted : undefined,
        submittedAt: status === 'SUBMITTED' ? new Date() : undefined
      }
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('[API /api/plans/weekly PUT]', error);
    return NextResponse.json({ error: 'Failed to update weekly plan' }, { status: 500 });
  }
}
