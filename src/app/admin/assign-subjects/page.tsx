'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { BookOpen, UserCheck, Layers, Users, CheckCircle2, ChevronDown } from 'lucide-react';

const mockTeachers = [
  { id: '1', name: 'Febin Thomas' },
  { id: '2', name: 'Sarah Joseph' },
  { id: '3', name: 'Ajay K' },
];

const mockClasses = ['10th Standard', '11th Standard', '12th Standard'];
const mockBatches = ['Batch A', 'Batch B', 'Batch C'];

export default function AssignSubjects() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [status, setStatus] = useState<'idle' | 'assigning' | 'success'>('idle');

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

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('assigning');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setSelectedClass('');
      setSelectedBatch('');
      setSubjectName('');
      
      // Reset back to idle after a few seconds
      setTimeout(() => setStatus('idle'), 3000);
    }, 1200);
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto pb-24">
      
      <div className="mb-10 dash-animate">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Assign Subjects</h1>
        <p className="text-gray-500 mt-1">Bind specific classes, batches, and subjects to faculty members.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-soft p-8 dash-animate">
        <div className="flex items-center mb-8 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mr-4 border border-gray-200">
            <BookOpen className="w-6 h-6 text-gray-800" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">New Assignment</h2>
            <p className="text-sm text-gray-500">This assignment will appear instantly on the selected teacher's portal.</p>
          </div>
        </div>

        <form onSubmit={handleAssignSubmit} className="space-y-6">
          
          {/* Step 1: Select Teacher */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <UserCheck className="w-4 h-4 mr-1.5 text-gray-400" /> 1. Select Faculty Member
            </label>
            <div className="relative">
              <select 
                required
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 py-3.5 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="" disabled>Choose a teacher...</option>
                {mockTeachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Step 2: Class */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Layers className="w-4 h-4 mr-1.5 text-gray-400" /> 2. Select Class / Standard
              </label>
              <div className="relative">
                <select 
                  required
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 py-3.5 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="" disabled>Choose a class...</option>
                  {mockClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Step 3: Batch */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-gray-400" /> 3. Select Batch
              </label>
              <div className="relative">
                <select 
                  required
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 py-3.5 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  <option value="" disabled>Choose a batch...</option>
                  {mockBatches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Step 4: Subject Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <BookOpen className="w-4 h-4 mr-1.5 text-gray-400" /> 4. Subject Name
            </label>
            <input 
              type="text" 
              required
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g., Economics, Advanced Mathematics"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
            />
          </div>

          <div className="pt-6 mt-4 flex flex-col-reverse sm:flex-row items-center justify-between border-t border-gray-100 gap-4 sm:gap-0">
            <div className="flex-1 w-full sm:w-auto">
              {status === 'success' && (
                <div className="flex items-center text-sm font-medium text-green-700">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Subject successfully assigned to Teacher.
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={status === 'assigning'}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-70 flex items-center w-full sm:w-auto justify-center"
            >
              {status === 'assigning' ? 'Publishing Assignment...' : 'Assign to Faculty'}
            </button>
          </div>
          
        </form>
      </div>

    </div>
  );
}
