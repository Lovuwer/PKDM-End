import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Get all assignments for this user
    const assignments = await prisma.assignment.findMany({
      where: { userId }
    });

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ progress: [] });
    }

    // 2. Fetch all weekly plans for this user to calculate progress
    const allWeeklyPlans = await prisma.weeklyPlan.findMany({
      where: { userId },
      select: {
         id: true,
         class: true,
         subject: true,
         isCompleted: true
      }
    });

    // 3. Aggregate progress by assignment (Class + Subject combination)
    const progressData = assignments.map(assignment => {
       const relatedPlans = allWeeklyPlans.filter(p => p.class === assignment.class && p.subject === assignment.subject);
       
       const totalWeeks = Math.max(relatedPlans.length, 40); // Assuming 40 weeks in an academic year, but could be dynamic
       const completedWeeks = relatedPlans.filter(p => p.isCompleted).length;
       
       return {
          assignmentId: assignment.id,
          class: assignment.class,
          batch: assignment.batch,
          subject: assignment.subject,
          completedWeeks,
          totalWeeks,
          percentage: totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0
       };
    });

    return NextResponse.json({ progress: progressData });

  } catch (error) {
    console.error('[API /api/plans/progress]', error);
    return NextResponse.json({ error: 'Failed to fetch syllabus progress' }, { status: 500 });
  }
}
