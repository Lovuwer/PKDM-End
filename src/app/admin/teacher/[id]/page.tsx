'use client';

import { useEffect, useRef, useState, use } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ArrowLeft, Download, FileText, CheckCircle2, Clock, CalendarDays, BookOpen, Sheet } from 'lucide-react';

// Require exports only on click to avoid heavy bundles, but for demo we can import directly
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

const MOCK_TEACHER = {
  id: '1',
  name: 'Febin Thomas',
  initials: 'FT',
  subjects: [
    { id: 'sub-1', name: 'Economics', class: '11th Standard', batch: 'Batch A', yearlyStatus: 'Completed', weeklyStatus: 'Pending' },
    { id: 'sub-2', name: 'Commerce', class: '11th Standard', batch: 'Batch B', yearlyStatus: 'Completed', weeklyStatus: 'Completed' }
  ]
};

export default function TeacherProfile({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const containerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dash-animate',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleExportPDF = (subjectName: string) => {
    setExporting('pdf');
    setTimeout(() => {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.text(`Academic Plan: ${subjectName}`, 14, 20);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Faculty: ${MOCK_TEACHER.name} | Batch: 11th Standard`, 14, 30);
      
      // @ts-ignore
      doc.autoTable({
        startY: 40,
        head: [['Month', 'Week', 'Topic', 'Objective']],
        body: [
          ['June', 'Week 1', 'Intro to Microeconomics', 'Understanding basic scarcity'],
          ['June', 'Week 2', 'Demand & Supply', 'Market equilibrium dynamics'],
          ['July', 'Week 1', 'Elasticity', 'Price elasticity of demand calculations']
        ],
        theme: 'grid',
        headStyles: { fillColor: [17, 24, 39] } // Gray-900
      });
      
      doc.save(`Pallikoodam_${subjectName}_Plan.pdf`);
      setExporting(null);
    }, 800);
  };

  const handleExportExcel = async (subjectName: string) => {
    setExporting('excel');
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Academic Plan');
      
      sheet.columns = [
        { header: 'Month', key: 'month', width: 15 },
        { header: 'Week', key: 'week', width: 15 },
        { header: 'Topic', key: 'topic', width: 40 },
        { header: 'Objective', key: 'objective', width: 40 },
      ];
      
      sheet.addRow({ month: 'June', week: 'Week 1', topic: 'Intro to Microeconomics', objective: 'Understanding basic scarcity' });
      sheet.addRow({ month: 'June', week: 'Week 2', topic: 'Demand & Supply', objective: 'Market equilibrium dynamics' });
      sheet.addRow({ month: 'July', week: 'Week 1', topic: 'Elasticity', objective: 'Price elasticity of demand calculations' });
      
      // Style header row
      sheet.getRow(1).font = { bold: true };
      
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Pallikoodam_${subjectName}_Plan.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto pb-24">
      
      <div className="mb-8 dash-animate">
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center gap-6 bg-white p-8 rounded-3xl shadow-soft border border-soft">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center font-medium text-gray-700 text-2xl border border-gray-200">
            {MOCK_TEACHER.initials}
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">{MOCK_TEACHER.name}</h1>
            <p className="text-gray-500 mt-1 flex items-center">
              Faculty Member • ID: PLK-{unwrappedParams.id.padStart(4, '0')}
            </p>
          </div>
        </div>
      </div>

      <div className="dash-animate mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 px-2">Assigned Subjects</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 dash-animate">
        {MOCK_TEACHER.subjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-3xl shadow-soft border border-soft p-8 flex flex-col h-full">
            
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mr-4">
                  <BookOpen className="w-6 h-6 text-gray-800" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900">{subject.name}</h3>
                  <p className="text-gray-500 text-sm mt-0.5">{subject.class} • {subject.batch}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                  <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Yearly Plan
                </div>
                {subject.yearlyStatus === 'Completed' ? (
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
                {subject.weeklyStatus === 'Completed' ? (
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
                onClick={() => handleExportPDF(subject.name)}
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
                onClick={() => handleExportExcel(subject.name)}
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
        ))}
      </div>

    </div>
  );
}
