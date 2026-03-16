import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch yearly plans for a user, optionally filtered by class/subject
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const className = searchParams.get('class');
    const subject = searchParams.get('subject');
    const academicYear = searchParams.get('academicYear');

    const where: Record<string, string> = {};
    if (userId) where.userId = userId;
    if (className) where.class = className;
    if (subject) where.subject = subject;
    if (academicYear) where.academicYear = academicYear;

    const plans = await prisma.yearlyPlan.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('[API /api/plans/yearly GET]', error);
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
  } catch (error) {
    console.error('[API /api/plans/yearly POST]', error);
    return NextResponse.json({ error: 'Failed to create yearly plan' }, { status: 500 });
  }
}

// PUT: Upsert a yearly plan by userId + class + subject + academicYear
export async function PUT(request: Request) {
  try {
    const { userId, className, subject, draftData, status, academicYear } = await request.json();

    if (!userId || !className || !subject) {
      return NextResponse.json({ error: 'userId, className, and subject are required' }, { status: 400 });
    }

    const year = academicYear || '2025-2026';

    const plan = await prisma.yearlyPlan.upsert({
      where: {
        userId_class_subject_academicYear: {
          userId,
          class: className,
          subject,
          academicYear: year,
        }
      },
      update: {
        draftData,
        status: status || 'DRAFT',
        submittedAt: status === 'SUBMITTED' ? new Date() : undefined,
      },
      create: {
        userId,
        class: className,
        subject,
        academicYear: year,
        draftData: draftData || {},
        status: status || 'DRAFT',
        submittedAt: status === 'SUBMITTED' ? new Date() : undefined,
      }
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('[API /api/plans/yearly PUT]', error);
    return NextResponse.json({ error: 'Failed to save yearly plan' }, { status: 500 });
  }
}
