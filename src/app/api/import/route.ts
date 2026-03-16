import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = new ExcelJS.Workbook();

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.csv')) {
      const { Readable } = await import('stream');
      // @ts-ignore
      await workbook.csv.read(Readable.from(buffer as unknown as Iterable<any>));
    } else {
      // @ts-ignore
      await workbook.xlsx.load(buffer as any);
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return NextResponse.json({ error: 'No worksheet found in file' }, { status: 400 });
    }

    const results = {
      teachersCreated: 0,
      teachersUpdated: 0,
      assignmentsCreated: 0,
      assignmentsUpdated: 0,
      errors: [] as string[],
      totalRows: 0,
    };

    // Skip header row, process data rows
    const rows: { class: string; subject: string; subSubject: string; name: string; email: string }[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const getValue = (cell: ExcelJS.Cell): string => {
        const v = cell?.value;
        if (v === null || v === undefined) return '';
        if (typeof v === 'object' && 'text' in v) return String(v.text).trim();
        return String(v).trim();
      };

      const cls = getValue(row.getCell(1));
      const subject = getValue(row.getCell(2));
      const subSubject = getValue(row.getCell(3));
      const name = getValue(row.getCell(4));
      const email = getValue(row.getCell(5));

      if (!name || !cls || !subject) {
        results.errors.push(`Row ${rowNumber}: Missing required fields (Class, Subject, or Name)`);
        return;
      }

      rows.push({ class: cls, subject, subSubject, name, email });
    });

    results.totalRows = rows.length;

    // Process each row
    for (const row of rows) {
      try {
        // Normalize email: "N/A", empty, or missing → generate placeholder
        let email = row.email;
        if (!email || email.toLowerCase() === 'n/a' || email === '-') {
          email = `${row.name.toLowerCase().replace(/\s+/g, '.')}.placeholder@pallikoodam.org`;
        }

        // Upsert User by email
        const existingUser = await prisma.user.findUnique({ where: { email } });
        
        let userId: string;
        if (existingUser) {
          // Update name if different, keep existing password
          await prisma.user.update({
            where: { email },
            data: { name: row.name }
          });
          userId = existingUser.id;
          results.teachersUpdated++;
        } else {
          const user = await prisma.user.create({
            data: {
              name: row.name,
              email,
              password: '__UNREGISTERED__',
              role: 'TEACHER',
            }
          });
          userId = user.id;
          results.teachersCreated++;
        }

        // Upsert Assignment by userId + class + subject
        const existingAssignment = await prisma.assignment.findUnique({
          where: {
            userId_class_subject: {
              userId,
              class: row.class,
              subject: row.subject,
            }
          }
        });

        if (existingAssignment) {
          await prisma.assignment.update({
            where: { id: existingAssignment.id },
            data: {
              subSubject: row.subSubject || null,
              batch: 'Default',
            }
          });
          results.assignmentsUpdated++;
        } else {
          await prisma.assignment.create({
            data: {
              userId,
              class: row.class,
              subject: row.subject,
              subSubject: row.subSubject || null,
              batch: 'Default',
            }
          });
          results.assignmentsCreated++;
        }
      } catch (err) {
        results.errors.push(`Row for "${row.name}": ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('[API /api/import POST]', error);
    return NextResponse.json({ error: 'Failed to process import file' }, { status: 500 });
  }
}
