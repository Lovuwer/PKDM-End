'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { Search, CheckCircle2, Clock, ChevronRight, Loader2 } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  assignments: { id: string; class: string; subject: string }[];
  yearlyPlans: { id: string; status: string }[];
  weeklyPlans: { id: string; status: string }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.dash-animate', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' });
    }, containerRef);

    fetch('/api/teachers')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTeachers(data); setLoading(false); })
      .catch(() => setLoading(false));

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      gsap.fromTo(dropdownRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    }
  }, [searchTerm]);

  const filteredTeachers = teachers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getTeacherStats = (teacher: Teacher) => {
    const totalAssignments = teacher.assignments.length;
    const completedYearly = teacher.yearlyPlans.filter(p => p.status === 'SUBMITTED').length;
    const completedWeekly = teacher.weeklyPlans.filter(p => p.status === 'SUBMITTED').length;
    const totalCompleted = completedYearly + completedWeekly;
    const totalPlans = totalAssignments * 2;
    const pending = totalPlans - totalCompleted;
    return { totalAssignments, totalCompleted, pending: Math.max(0, pending) };
  };

  const handleSelectTeacher = (id: string) => {
    router.push(`/admin/teacher/${id}`);
  };

  return (
    <div ref={containerRef}>
      
      <div className="mb-8 sm:mb-10 dash-animate flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Completion Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Track faculty submissions and review academic plans.</p>
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-96 z-30">
          <div className="flex items-center px-4 py-3 bg-white rounded-2xl shadow-soft border border-soft transition-all focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent">
            <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-sm" />
          </div>

          <div ref={dropdownRef}
            className={`absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-40 ${searchTerm.length > 0 ? 'block' : 'hidden'}`}>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <button key={teacher.id} onClick={() => handleSelectTeacher(teacher.id)}
                  className="w-full text-left px-4 py-4 hover:bg-gray-50 flex items-center justify-between transition-colors border-b border-gray-50 last:border-0">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 font-medium text-gray-600 text-xs">
                      {teacher.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{teacher.name}</span>
                      <p className="text-xs text-gray-500">{teacher.assignments.length} subject(s)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">No faculty members found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl shadow-soft border border-soft overflow-hidden dash-animate relative z-10">
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
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Loading teachers...</td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No teachers found. Create one in Manage Faculty.</td></tr>
              ) : (
                teachers.map((teacher) => {
                  const stats = getTeacherStats(teacher);
                  return (
                    <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 font-medium text-gray-600">
                            {teacher.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <p className="font-medium text-gray-900">{teacher.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5"><span className="text-gray-600 font-medium">{stats.totalAssignments}</span></td>
                      <td className="px-6 py-5">
                        <div className="flex items-center text-green-700"><CheckCircle2 className="w-4 h-4 mr-2" /><span className="font-medium">{stats.totalCompleted}</span></div>
                      </td>
                      <td className="px-6 py-5">
                        {stats.pending > 0 ? (
                          <div className="flex items-center text-amber-700"><Clock className="w-4 h-4 mr-2" /><span className="font-medium">{stats.pending}</span></div>
                        ) : (
                          <span className="text-gray-400 font-medium">0</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => handleSelectTeacher(teacher.id)}
                          className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 dash-animate">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-soft border border-soft p-8 text-center text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin inline mr-2" />Loading...
          </div>
        ) : teachers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft border border-soft p-8 text-center text-gray-400">No teachers found.</div>
        ) : (
          teachers.map((teacher) => {
            const stats = getTeacherStats(teacher);
            return (
              <button key={teacher.id} onClick={() => handleSelectTeacher(teacher.id)}
                className="w-full text-left bg-white rounded-2xl shadow-soft border border-soft p-4 hover:shadow-md transition-all active:scale-[0.98]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 font-medium text-gray-600 text-sm">
                      {teacher.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <p className="font-medium text-gray-900">{teacher.name}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-xl py-2">
                    <p className="text-lg font-semibold text-gray-900">{stats.totalAssignments}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Assigned</p>
                  </div>
                  <div className="bg-green-50 rounded-xl py-2">
                    <p className="text-lg font-semibold text-green-700">{stats.totalCompleted}</p>
                    <p className="text-[10px] text-green-600 uppercase tracking-wider">Done</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl py-2">
                    <p className="text-lg font-semibold text-amber-700">{stats.pending}</p>
                    <p className="text-[10px] text-amber-600 uppercase tracking-wider">Pending</p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

    </div>
  );
}
