'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { FilePlus2, CalendarDays, TrendingUp, Building2, ChevronRight, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

export default function TeacherDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExport = async (subjectName: string, format: 'pdf' | 'excel') => {
    // Generate mock lesson plan data
    const mockData = [
      ['Date/Month', 'Learning Objective', 'Methodology', 'Status'],
      ['June 2025', 'Introduction to Macroeconomics', 'Lecture & Discussion', 'Completed'],
      ['July 2025', 'National Income Accounting', 'Problem Solving', 'Pending'],
    ];

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Lesson Plan: ${subjectName}`, 14, 22);
      
      autoTable(doc, {
        startY: 30,
        head: [mockData[0]],
        body: mockData.slice(1),
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        headStyles: { fillColor: [17, 24, 39], textColor: [255, 255, 255] },
      });
      
      doc.save(`Lesson_Plan_${subjectName.replace(/\s+/g, '_')}.pdf`);
    } else {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Lesson Plan');
      
      sheet.columns = [
        { header: 'Month / Date', key: 'date', width: 20 },
        { header: 'Learning Objective', key: 'objective', width: 40 },
        { header: 'Methodology', key: 'method', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
      ];
      
      mockData.slice(1).forEach(row => {
        sheet.addRow({
          date: row[0], objective: row[1], method: row[2], status: row[3]
        });
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

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto">
      
      <div className="mb-10 dash-animate">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-gray-500 mt-1">Manage your academic assignments and lessons.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Create Yearly Plan Card */}
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

        {/* Create Weekly Plan Card */}
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
          
          <div className="p-4 flex items-center border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mr-4">
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-grow">
              <h3 className="font-medium text-gray-900">Economics · 11th Standard</h3>
              <p className="text-xs text-gray-500">Batch A</p>
            </div>
            <div className="text-right flex items-center justify-end space-x-2">
              <button 
                onClick={() => handleExport('Economics - 11th Standard', 'excel')}
                className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Excel
              </button>
              <button 
                onClick={() => handleExport('Economics - 11th Standard', 'pdf')}
                className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> PDF
              </button>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 ml-2">
                Yearly Plan Submitted
              </span>
            </div>
          </div>

          <div className="p-4 flex items-center border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mr-4">
              <Building2 className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-grow">
              <h3 className="font-medium text-gray-900">Commerce · 11th Standard</h3>
              <p className="text-xs text-gray-500">Batch B</p>
            </div>
            <div className="text-right flex items-center justify-end space-x-2">
              <button 
                onClick={() => handleExport('Commerce - 11th Standard', 'excel')}
                className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Excel
              </button>
              <button 
                onClick={() => handleExport('Commerce - 11th Standard', 'pdf')}
                className="inline-flex items-center px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> PDF
              </button>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 ml-2">
                Yearly Plan Draft
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
