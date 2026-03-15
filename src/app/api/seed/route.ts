import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Seed initial data for testing
export async function POST() {
  try {
    // Create admin user (if not exists)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@pallikoodam.edu' },
      update: {},
      create: {
        name: 'Administrator',
        email: 'admin@pallikoodam.edu',
        password: 'BEIN1801',
        role: 'ADMIN'
      }
    });

    // Create sample teachers
    const febin = await prisma.user.upsert({
      where: { email: 'febin@pallikoodam.edu' },
      update: {},
      create: {
        name: 'Febin Thomas',
        email: 'febin@pallikoodam.edu',
        password: 'febin123',
        role: 'TEACHER'
      }
    });

    const sarah = await prisma.user.upsert({
      where: { email: 'sarah@pallikoodam.edu' },
      update: {},
      create: {
        name: 'Sarah Joseph',
        email: 'sarah@pallikoodam.edu',
        password: 'sarah123',
        role: 'TEACHER'
      }
    });

    const ajay = await prisma.user.upsert({
      where: { email: 'ajay@pallikoodam.edu' },
      update: {},
      create: {
        name: 'Ajay K',
        email: 'ajay@pallikoodam.edu',
        password: 'ajay123',
        role: 'TEACHER'
      }
    });

    // Assign subjects
    const existingAssignments = await prisma.assignment.count();
    if (existingAssignments === 0) {
      await prisma.assignment.createMany({
        data: [
          { userId: febin.id, class: '11th Standard', batch: 'Batch A', subject: 'Economics' },
          { userId: febin.id, class: '11th Standard', batch: 'Batch B', subject: 'Commerce' },
          { userId: sarah.id, class: '12th Standard', batch: 'Batch A', subject: 'Mathematics' },
          { userId: sarah.id, class: '10th Standard', batch: 'Batch A', subject: 'Physics' },
          { userId: sarah.id, class: '11th Standard', batch: 'Batch A', subject: 'Chemistry' },
          { userId: ajay.id, class: '10th Standard', batch: 'Batch A', subject: 'Computer Science' },
        ]
      });
    }

    // Create a sample submitted yearly plan for Febin
    const existingPlans = await prisma.yearlyPlan.count();
    if (existingPlans === 0) {
      await prisma.yearlyPlan.create({
        data: {
          userId: febin.id,
          class: '11th Standard',
          subject: 'Economics',
          academicYear: '2025-2026',
          draftData: {
            June: { week1: 'Intro to Microeconomics', week2: 'Demand & Supply', week3: 'Elasticity', week4: 'Market Structures' },
            July: { week1: 'National Income', week2: 'GDP & GNP', week3: 'Money & Banking', week4: 'Inflation' },
          },
          status: 'SUBMITTED',
          submittedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: { admin: admin.email, teachers: [febin.email, sarah.email, ajay.email] }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
