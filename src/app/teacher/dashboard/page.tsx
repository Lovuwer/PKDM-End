'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { FilePlus2, CalendarDays, ChevronRight, Download, Loader2 } from 'lucide-react';
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

interface YearlyPlan {
  id: string;
  class: string;
  subject: string;
  status: string;
}

export default function TeacherDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [yearlyPlans, setYearlyPlans] = useState<YearlyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check auth
    const stored = localStorage.getItem('pallikoodam_user');
    if (!stored) {
      router.push('/login/teacher');
      return;
    }
    const user = JSON.parse(stored);
    setUserName(user.name);

    // Fetch real data
    Promise.all([
      fetch(`/api/assignments?userId=${user.id}`).then(r => r.json()),
      fetch(`/api/plans/yearly?userId=${user.id}`).then(r => r.json()),
    ]).then(([assignmentData, planData]) => {
      if (Array.isArray(assignmentData)) setAssignments(assignmentData);
      if (Array.isArray(planData)) setYearlyPlans(planData);
      setLoading(false);
    }).catch(() => setLoading(false));

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dash-animate',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [router]);

  const getStatus = (assignment: Assignment) => {
    const plan = yearlyPlans.find(p => p.class === assignment.class && p.subject === assignment.subject);
    return plan?.status === 'SUBMITTED' ? 'Submitted' : 'Draft';
  };

  const handleExport = async (subjectName: string, format: 'pdf' | 'excel') => {
    const plan = yearlyPlans.find(p => p.subject === subjectName);
    const planData = plan ? (plan as any).draftData : null;

    const rows: string[][] = [];
    if (planData && typeof planData === 'object') {
      Object.entries(planData).forEach(([month, weeks]: [string, any]) => {
        Object.entries(weeks).forEach(([week, topic]: [string, any]) => {
          rows.push([month, week.replace('week', 'Week '), String(topic), '']);
        });
      });
    }
    if (rows.length === 0) {
      rows.push(['No data', '', '', '']);
    }

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Lesson Plan: ${subjectName}`, 14, 22);
      autoTable(doc, {
        startY: 30,
        head: [['Month', 'Week', 'Topic', 'Notes']],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      });
      doc.save(`Lesson_Plan_${subjectName.replace(/\s+/g, '_')}.pdf`);
    } else {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Lesson Plan');
      sheet.columns = [
        { header: 'Month', key: 'month', width: 15 },
        { header: 'Week', key: 'week', width: 15 },
        { header: 'Topic', key: 'topic', width: 40 },
        { header: 'Notes', key: 'notes', width: 30 },
      ];
      rows.forEach(row => {
        sheet.addRow({ month: row[0], week: row[1], topic: row[2], notes: row[3] });
      });
      sheet.getRow(1).font = { bold: true };
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Lesson_Plan_${subjectName.replace(/\s+/g, '_')}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto">
      
      <div className="mb-10 dash-animate">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          {userName ? `Welcome, ${userName.split(' ')[0]}` : 'Overview'}
        </h1>
        <p className="text-gray-500 mt-1">Manage your academic assignments and lessons.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link 
          href="/teacher/yearly-plan"
          className="dash-animate group bg-gray-900 rounded-3xl p-8 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
            <FilePlus2 className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-16 backdrop-blur-sm border border-white/10">
              <FilePlus2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white mb-2">Create Yearly Plan</h2>
              <p className="text-gray-400 text-sm flex items-center">
                Draft a full academic structure
                <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </p>
            </div>
          </div>
        </Link>

        <Link 
          href="/teacher/weekly-plan"
          className="dash-animate group bg-white border border-soft shadow-soft rounded-3xl p-8 hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-16 border border-gray-100 group-hover:bg-gray-100 transition-colors">
              <CalendarDays className="w-6 h-6 text-gray-800" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Create Weekly Plan</h2>
              <p className="text-gray-500 text-sm flex items-center">
                Submit specific weekly lesson goals
                <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-gray-800" />
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="dash-animate">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Assignments</h2>
        <div className="bg-white border border-soft shadow-soft rounded-2xl overflow-hidden">
          
          {loading ? (
            <div className="p-8 text-center text-gray-400 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No subjects assigned yet. Ask your administrator to assign classes to you.
            </div>
          ) : (
            assignments.map((assignment) => {
              const SubjectIcon = getSubjectIcon(assignment.subject);
              const status = getStatus(assignment);
              return (
                <div key={assignment.id} className="p-4 flex items-center border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mr-4">
                    <SubjectIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900">{assignment.subject} · {assignment.class}</h3>
                    <p className="text-xs text-gray-500">{assignment.batch}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleExport(assignment.subject, 'excel')}
                      className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Excel
                    </button>
                    <button 
                      onClick={() => handleExport(assignment.subject, 'pdf')}
                      className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> PDF
                    </button>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                      status === 'Submitted' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {status === 'Submitted' ? 'Yearly Plan Submitted' : 'Yearly Plan Draft'}
                    </span>
                  </div>
                </div>
              );
            })
          )}

        </div>
      </div>

    </div>
  );
}
