'use client';

import { useEffect, useRef, useState, use } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ArrowLeft, BookOpen, Clock, Loader2, CalendarDays, CheckCircle2, FileText, Sheet } from 'lucide-react';
import { getSubjectIcon } from '@/lib/subjectIcons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

interface Assignment {
  id: string;
  class: string;
  batch: string;
  subject: string;
}

interface DraftData {
  [month: string]: Record<string, string>;
}

interface Teacher {
  id: string;
  name: string;
  assignments: Assignment[];
  yearlyPlans: { id: string; class: string; subject: string; status: string; draftData: DraftData }[];
  weeklyPlans: { id: string; class: string; subject: string; status: string }[];
}

export default function TeacherProfile({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const containerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dash-animate',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }, containerRef);

    // Fetch all teachers, then find the one matching this ID
    fetch('/api/teachers')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find((t: Teacher) => t.id === unwrappedParams.id);
          if (found) setTeacher(found);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => ctx.revert();
  }, [unwrappedParams.id]);

  const getYearlyStatus = (assignment: Assignment) => {
    if (!teacher) return 'Pending';
    const plan = teacher.yearlyPlans.find(p => p.class === assignment.class && p.subject === assignment.subject);
    return plan?.status === 'SUBMITTED' ? 'Completed' : 'Pending';
  };

  const getWeeklyStatus = (assignment: Assignment) => {
    if (!teacher) return 'Pending';
    const plan = teacher.weeklyPlans.find(p => p.class === assignment.class && p.subject === assignment.subject);
    return plan?.status === 'SUBMITTED' ? 'Completed' : 'Pending';
  };

  const handleExportPDF = (assignment: Assignment) => {
    setExporting('pdf');
    const plan = teacher?.yearlyPlans.find(p => p.subject === assignment.subject);
    const rows: string[][] = [];
    if (plan?.draftData && typeof plan.draftData === 'object') {
      Object.entries(plan.draftData).forEach(([month, weeks]: [string, Record<string, string>]) => {
        Object.entries(weeks).forEach(([week, topic]: [string, string]) => {
          rows.push([month, week.replace('week', 'Week '), String(topic), '']);
        });
      });
    }
    if (rows.length === 0) rows.push(['No data available', '', '', '']);

    setTimeout(() => {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.text(`Academic Plan: ${assignment.subject}`, 14, 20);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Faculty: ${teacher?.name} | ${assignment.class} - ${assignment.batch}`, 14, 30);
      
      autoTable(doc, {
        startY: 40,
        head: [['Month', 'Week', 'Topic', 'Objective']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [17, 24, 39] }
      });
      
      doc.save(`Pallikoodam_${assignment.subject}_Plan.pdf`);
      setExporting(null);
    }, 500);
  };

  const handleExportExcel = async (assignment: Assignment) => {
    setExporting('excel');
    const plan = teacher?.yearlyPlans.find(p => p.subject === assignment.subject);
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Academic Plan');
      
      sheet.columns = [
        { header: 'Month', key: 'month', width: 15 },
        { header: 'Week', key: 'week', width: 15 },
        { header: 'Topic', key: 'topic', width: 40 },
        { header: 'Objective', key: 'objective', width: 40 },
      ];

      if (plan?.draftData && typeof plan.draftData === 'object') {
        Object.entries(plan.draftData).forEach(([month, weeks]: [string, Record<string, string>]) => {
          Object.entries(weeks as Record<string, string>).forEach(([week, topic]) => {
            sheet.addRow({ month, week: week.replace('week', 'Week '), topic: String(topic), objective: '' });
          });
        });
      }
      
      sheet.getRow(1).font = { bold: true };
      
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Pallikoodam_${assignment.subject}_Plan.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading teacher profile...
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="max-w-5xl mx-auto text-center py-24">
        <p className="text-gray-500">Teacher not found.</p>
        <Link href="/admin/dashboard" className="text-gray-900 font-medium mt-4 inline-block underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto pb-24">
      
      <div className="mb-8 dash-animate">
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center gap-6 bg-white p-8 rounded-3xl shadow-soft border border-soft">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center font-medium text-gray-700 text-2xl border border-gray-200">
            {teacher.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">{teacher.name}</h1>
            <p className="text-gray-500 mt-1 flex items-center">
              Faculty Member • {teacher.assignments.length} subject(s) assigned
            </p>
          </div>
        </div>
      </div>

      <div className="dash-animate mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 px-2">Assigned Subjects</h2>
      </div>

      {teacher.assignments.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-soft border border-soft p-12 text-center text-gray-400 dash-animate">
          No subjects assigned. Use the Assign Subjects page to add them.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 dash-animate">
          {teacher.assignments.map((assignment) => {
            const SubjectIcon = getSubjectIcon(assignment.subject);
            const yearlyStatus = getYearlyStatus(assignment);
            const weeklyStatus = getWeeklyStatus(assignment);
            return (
              <div key={assignment.id} className="bg-white rounded-3xl shadow-soft border border-soft p-8 flex flex-col h-full">
                
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mr-4">
                      <SubjectIcon className="w-6 h-6 text-gray-800" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-gray-900">{assignment.subject}</h3>
                      <p className="text-gray-500 text-sm mt-0.5">{assignment.class} • {assignment.batch}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                      <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Yearly Plan
                    </div>
                    {yearlyStatus === 'Completed' ? (
                      <span className="inline-flex items-center text-sm font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-md">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Submitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-sm font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                        <Clock className="w-4 h-4 mr-1.5" /> Pending
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                      <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Weekly Plan
                    </div>
                    {weeklyStatus === 'Completed' ? (
                      <span className="inline-flex items-center text-sm font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-md">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Submitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-sm font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                        <Clock className="w-4 h-4 mr-1.5" /> Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <button 
                    onClick={() => handleExportPDF(assignment)}
                    disabled={exporting !== null}
                    className="w-full flex items-center justify-center py-3.5 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-70 group"
                  >
                    {exporting === 'pdf' ? (
                      <span className="animate-pulse">Generating PDF...</span>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2 opacity-80 group-hover:opacity-100" />
                        Download PDF Report
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => handleExportExcel(assignment)}
                    disabled={exporting !== null}
                    className="w-full flex items-center justify-center py-3.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-800 text-sm font-medium rounded-xl transition-colors disabled:opacity-70 group shadow-sm"
                  >
                    {exporting === 'excel' ? (
                      <span className="animate-pulse">Generating Excel...</span>
                    ) : (
                      <>
                        <Sheet className="w-4 h-4 mr-2 text-green-600 opacity-80 group-hover:opacity-100" />
                        Download Excel Data
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
