'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { Search, Building2, TrendingUp, CheckCircle2, Clock, XCircle, FileDown } from 'lucide-react';

const mockTeachers = [
  { id: '1', name: 'Febin Thomas', initials: 'FT', totalClasses: 2, completed: 1, pending: 1 },
  { id: '2', name: 'Sarah Joseph', initials: 'SJ', totalClasses: 3, completed: 3, pending: 0 },
  { id: '3', name: 'Ajay K', initials: 'AK', totalClasses: 1, completed: 0, pending: 1 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial page load animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dash-animate',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Live search GSAP dropdown
  useEffect(() => {
    if (searchTerm.length > 0) {
      setShowDropdown(true);
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    } else {
      setShowDropdown(false);
    }
  }, [searchTerm]);

  const filteredTeachers = mockTeachers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelectTeacher = (id: string) => {
    router.push(`/admin/teacher/${id}`);
  };

  return (
    <div ref={containerRef}>
      
      <div className="mb-10 dash-animate flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Completion Dashboard</h1>
          <p className="text-gray-500 mt-1">Track faculty submissions and review academic plans.</p>
        </div>

        {/* Live Search Component */}
        <div className="relative w-full md:w-96 z-20">
          <div className="flex items-center px-4 py-3 bg-white rounded-2xl shadow-soft border border-soft transition-all focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search faculty... (e.g., Febin)"
              className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
            />
          </div>

          <div
            ref={dropdownRef}
            className={`absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${
              showDropdown ? 'block' : 'hidden'
            }`}
          >
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <button
                  key={teacher.id}
                  onClick={() => handleSelectTeacher(teacher.id)}
                  className="w-full text-left px-4 py-4 hover:bg-gray-50 flex items-center justify-between transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 font-medium text-gray-600 text-xs">
                      {teacher.initials}
                    </div>
                    <span className="font-medium text-gray-900">{teacher.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                No faculty members found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Table View */}
      <div className="bg-white rounded-3xl shadow-soft border border-soft overflow-hidden dash-animate relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 uppercase text-xs tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Faculty Member</th>
                <th className="px-6 py-4">Total Assignments</th>
                <th className="px-6 py-4">Completed Plans</th>
                <th className="px-6 py-4">Pending Plans</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 font-medium text-gray-600">
                        {teacher.initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{teacher.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-gray-600 font-medium">{teacher.totalClasses}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center text-green-700">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      <span className="font-medium">{teacher.completed}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {teacher.pending > 0 ? (
                      <div className="flex items-center text-amber-700">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="font-medium">{teacher.pending}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-400">
                        <span className="font-medium">0</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleSelectTeacher(teacher.id)}
                      className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// Ensure lucide icon renders cleanly
function ChevronRight(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
}
