'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { BookOpen, UserCheck, Layers, Users, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Loader2 } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
}

// Full Pallikoodam school structure from pallikoodam.org
const CLASS_GROUPS = [
  { label: 'Play School (Kalari)', options: ['Nursery', 'LKG', 'UKG'] },
  { label: 'Junior School', options: ['Class 1', 'Class 2', 'Class 3', 'Class 4'] },
  { label: 'Middle School', options: ['Class 5', 'Class 6', 'Class 7', 'Class 8'] },
  { label: 'High School (ICSE)', options: ['Class 9', 'Class 10'] },
  { label: 'ISC', options: ['Class 11', 'Class 12'] },
];

const BATCH_OPTIONS = ['Batch A', 'Batch B', 'Batch C'];

// Custom dropdown component matching the design reference
function CustomDropdown({ 
  label, 
  icon: Icon, 
  step, 
  value, 
  onChange, 
  placeholder, 
  options,
  grouped 
}: {
  label: string;
  icon: React.ComponentType<any>;
  step: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  options?: string[];
  grouped?: { label: string; options: string[] }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      gsap.fromTo(listRef.current, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' });
    }
  }, [open]);

  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
        <Icon className="w-4 h-4 mr-1.5 text-gray-400" /> {step}. {label}
      </label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full text-left flex items-center justify-between py-3.5 px-4 rounded-xl border-2 transition-all duration-200 ${
            open
              ? 'border-blue-500 bg-white shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
              : value
                ? 'border-gray-200 bg-white'
                : 'border-gray-200 bg-gray-50'
          }`}
        >
          <span className={`text-sm ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
            {value || placeholder}
          </span>
          {open ? (
            <ChevronUp className="w-5 h-5 text-blue-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {open && (
          <div 
            ref={listRef}
            className="absolute z-50 top-full left-0 w-full mt-2 bg-white rounded-xl border-2 border-blue-500 shadow-xl overflow-hidden max-h-64 overflow-y-auto"
          >
            {grouped ? (
              grouped.map((group) => (
                <div key={group.label}>
                  <div className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100 sticky top-0">
                    {group.label}
                  </div>
                  {group.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { onChange(opt); setOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-gray-50 last:border-0 ${
                        opt === value
                          ? 'text-blue-600 font-semibold bg-blue-50/60'
                          : 'text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ))
            ) : (
              options?.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-gray-50 last:border-0 ${
                    opt === value
                      ? 'text-blue-600 font-semibold bg-blue-50/60'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssignSubjects() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedTeacherName, setSelectedTeacherName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [status, setStatus] = useState<'idle' | 'assigning' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dash-animate',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }, containerRef);

    fetch('/api/teachers')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTeachers(data);
      })
      .catch(() => {});

    return () => ctx.revert();
  }, []);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !selectedClass || !selectedBatch || !subjectName) {
      setErrorMsg('Please fill in all fields');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setStatus('assigning');
    setErrorMsg('');

    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedTeacher,
          className: selectedClass,
          batch: selectedBatch,
          subject: subjectName
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setSelectedClass('');
        setSelectedBatch('');
        setSubjectName('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setErrorMsg(data.error || 'Failed to assign subject');
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  // Teacher dropdown needs special handling (id vs name)
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
  const teacherRef = useRef<HTMLDivElement>(null);
  const teacherListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (teacherRef.current && !teacherRef.current.contains(e.target as Node)) setTeacherDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (teacherDropdownOpen && teacherListRef.current) {
      gsap.fromTo(teacherListRef.current, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' });
    }
  }, [teacherDropdownOpen]);

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
            <p className="text-sm text-gray-500">This assignment will appear instantly on the selected teacher&apos;s portal.</p>
          </div>
        </div>

        <form onSubmit={handleAssignSubmit} className="space-y-6">
          
          {/* Step 1: Select Teacher (custom dropdown) */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <UserCheck className="w-4 h-4 mr-1.5 text-gray-400" /> 1. Select Faculty Member
            </label>
            <div ref={teacherRef} className="relative">
              <button
                type="button"
                onClick={() => setTeacherDropdownOpen(!teacherDropdownOpen)}
                className={`w-full text-left flex items-center justify-between py-3.5 px-4 rounded-xl border-2 transition-all duration-200 ${
                  teacherDropdownOpen
                    ? 'border-blue-500 bg-white shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
                    : selectedTeacher
                      ? 'border-gray-200 bg-white'
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                <span className={`text-sm ${selectedTeacher ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {selectedTeacherName || 'Choose a teacher...'}
                </span>
                {teacherDropdownOpen ? (
                  <ChevronUp className="w-5 h-5 text-blue-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {teacherDropdownOpen && (
                <div
                  ref={teacherListRef}
                  className="absolute z-50 top-full left-0 w-full mt-2 bg-white rounded-xl border-2 border-blue-500 shadow-xl overflow-hidden max-h-64 overflow-y-auto"
                >
                  {teachers.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-400 text-sm">
                      No teachers registered yet.
                    </div>
                  ) : (
                    teachers.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTeacher(t.id);
                          setSelectedTeacherName(t.name);
                          setTeacherDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-gray-50 last:border-0 ${
                          t.id === selectedTeacher
                            ? 'text-blue-600 font-semibold bg-blue-50/60'
                            : 'text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        {t.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Step 2: Class (grouped by school division) */}
            <CustomDropdown
              label="Select Class / Standard"
              icon={Layers}
              step="2"
              value={selectedClass}
              onChange={setSelectedClass}
              placeholder="Choose a class..."
              grouped={CLASS_GROUPS}
            />

            {/* Step 3: Batch */}
            <CustomDropdown
              label="Select Batch"
              icon={Users}
              step="3"
              value={selectedBatch}
              onChange={setSelectedBatch}
              placeholder="Choose a batch..."
              options={BATCH_OPTIONS}
            />
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
              placeholder="e.g., Economics, Mathematics, Physics"
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all"
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
              {status === 'error' && (
                <div className="flex items-center text-sm font-medium text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errorMsg}
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={status === 'assigning'}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-70 flex items-center w-full sm:w-auto justify-center"
            >
              {status === 'assigning' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
              ) : (
                'Assign to Faculty'
              )}
            </button>
          </div>
          
        </form>
      </div>

    </div>
  );
}
