'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Sparkles, X, Loader2, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { getFieldLabels } from '@/lib/fieldConfig';

interface Assignment {
  id: string;
  class: string;
  batch: string;
  subject: string;
}

interface WeeklyPlanData {
  id: string;
  class: string;
  subject: string;
  startDate: string;
  endDate: string;
  status: string;
  learningObjective?: string;
  teachingMethod?: string;
  field1?: string;
  field2?: string;
  field3?: string;
  field4?: string;
  isCompleted?: boolean;
}

interface YearlyPlanData {
  draftData?: Record<string, string>;
}

const ACADEMIC_MONTHS = [
  { name: 'June', year: 2025, month: 5 },
  { name: 'July', year: 2025, month: 6 },
  { name: 'August', year: 2025, month: 7 },
  { name: 'September', year: 2025, month: 8 },
  { name: 'October', year: 2025, month: 9 },
  { name: 'November', year: 2025, month: 10 },
  { name: 'December', year: 2025, month: 11 },
  { name: 'January', year: 2026, month: 0 },
  { name: 'February', year: 2026, month: 1 },
  { name: 'March', year: 2026, month: 2 },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeeksOfMonth(year: number, month: number) {
  const weeks: { start: Date; end: Date; days: (Date | null)[] }[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const currentWeekStart = new Date(firstDay);
  // Adjust to Monday
  const dayOfWeek = currentWeekStart.getDay();
  if (dayOfWeek === 0) currentWeekStart.setDate(currentWeekStart.getDate() - 6);
  else if (dayOfWeek !== 1) currentWeekStart.setDate(currentWeekStart.getDate() - (dayOfWeek - 1));

  while (currentWeekStart <= lastDay || currentWeekStart.getMonth() === month) {
    const days: (Date | null)[] = [];
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 5); // Mon-Sat

    for (let i = 0; i < 6; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      if (d.getMonth() === month) {
        days.push(new Date(d));
      } else {
        days.push(null);
      }
    }

    if (days.some(d => d !== null)) {
      weeks.push({
        start: new Date(currentWeekStart),
        end: weekEnd,
        days
      });
    }

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    if (weeks.length >= 6) break;
  }
  return weeks;
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function getWeekStatus(weekStart: Date, weekEnd: Date, plans: WeeklyPlanData[]): 'submitted' | 'draft' | 'empty' {
  const ws = formatDate(weekStart);
  const we = formatDate(weekEnd);
  for (const plan of plans) {
    const ps = plan.startDate.split('T')[0];
    const pe = plan.endDate.split('T')[0];
    if (ps === ws || pe === we || (ps >= ws && ps <= we)) {
      return plan.status === 'SUBMITTED' ? 'submitted' : 'draft';
    }
  }
  return 'empty';
}

function findPlanForWeek(weekStart: Date, weekEnd: Date, plans: WeeklyPlanData[]): WeeklyPlanData | null {
  const ws = formatDate(weekStart);
  const we = formatDate(weekEnd);
  for (const plan of plans) {
    const ps = plan.startDate.split('T')[0];
    const pe = plan.endDate.split('T')[0];
    if (ps === ws || pe === we || (ps >= ws && ps <= we)) {
      return plan;
    }
  }
  return null;
}

export default function WeeklyPlan() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pallikoodam_user');
      if (stored) {
        try {
          return JSON.parse(stored).id || '';
        } catch {
          return '';
        }
      }
    }
    return '';
  });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlanData[]>([]);
  const [yearlyPlanData, setYearlyPlanData] = useState<Record<string, string>>({});

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<{ start: Date; end: Date } | null>(null);
  const [formData, setFormData] = useState({
    learningObjective: '',
    teachingMethod: '',
    field1: '',
    field2: '',
    field3: '',
    field4: '',
    isCompleted: false,
  });

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [smartSuggestion, setSmartSuggestion] = useState('');

  // Keep track of auth redirect
  useEffect(() => {
    const stored = localStorage.getItem('pallikoodam_user');
    if (!stored) {
      router.push('/login/teacher');
    }
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/assignments?userId=${userId}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAssignments(data); })
      .catch(() => {});
  }, [userId]);

  // Fetch existing weekly plans when assignment selected
  const fetchPlans = useCallback(() => {
    if (!userId || !selectedSubject) return;
    const assignment = assignments.find(a => a.id === selectedSubject);
    if (!assignment) return;
    fetch(`/api/plans/weekly?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWeeklyPlans(data.filter((p: WeeklyPlanData) => p.class === assignment.class && p.subject === assignment.subject));
        }
      })
      .catch(() => {});
  }, [userId, selectedSubject, assignments]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  // Fetch yearly plan for smart suggestions
  useEffect(() => {
    if (!userId || !selectedSubject) return;
    const assignment = assignments.find(a => a.id === selectedSubject);
    if (!assignment) return;
    fetch(`/api/plans/yearly?userId=${userId}&class=${encodeURIComponent(assignment.class)}&subject=${encodeURIComponent(assignment.subject)}`)
      .then(r => r.json())
      .then((data: YearlyPlanData[]) => {
        if (Array.isArray(data) && data.length > 0 && data[0].draftData) {
          setYearlyPlanData(data[0].draftData as Record<string, string>);
        } else {
          setYearlyPlanData({});
        }
      })
      .catch(() => setYearlyPlanData({}));
  }, [userId, selectedSubject, assignments]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (dropdownOpen && listRef.current) {
      gsap.fromTo(listRef.current, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' });
    }
  }, [dropdownOpen]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo('.cal-animate', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' });
    }
  }, []);

  const openWeekModal = (weekStart: Date, weekEnd: Date) => {
    setSelectedWeek({ start: weekStart, end: weekEnd });

    // Check if plan exists for this week
    const existingPlan = findPlanForWeek(weekStart, weekEnd, weeklyPlans);
    if (existingPlan) {
      setFormData({
        learningObjective: existingPlan.learningObjective || '',
        teachingMethod: existingPlan.teachingMethod || '',
        field1: existingPlan.field1 || '',
        field2: existingPlan.field2 || '',
        field3: existingPlan.field3 || '',
        field4: existingPlan.field4 || '',
        isCompleted: existingPlan.isCompleted || false,
      });
    } else {
      setFormData({ learningObjective: '', teachingMethod: '', field1: '', field2: '', field3: '', field4: '', isCompleted: false });
    }

    // Smart suggestion from yearly plan
    const acMonth = ACADEMIC_MONTHS[currentMonthIdx];
    if (acMonth) {
      const weekNum = getWeeksOfMonth(acMonth.year, acMonth.month).findIndex(
        w => formatDate(w.start) === formatDate(weekStart)
      ) + 1;
      const key = `${acMonth.name}_${weekNum}`;
      const suggestion = yearlyPlanData[key];
      setSmartSuggestion(suggestion || '');
    }

    setModalOpen(true);
    setSubmitStatus('idle');
    setTimeout(() => {
      if (modalRef.current) {
        gsap.fromTo(modalRef.current, { x: '100%', opacity: 0 }, { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' });
      }
    }, 10);
  };

  const closeModal = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        x: '100%', opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => { setModalOpen(false); setSelectedWeek(null); setSmartSuggestion(''); }
      });
    } else {
      setModalOpen(false);
    }
  };

  const selectedAssignment = assignments.find(a => a.id === selectedSubject);

  const handleSubmit = async (status: 'DRAFT' | 'SUBMITTED') => {
    if (!selectedWeek || !userId || !selectedAssignment) return;

    setSubmitStatus('submitting');
    try {
      const existingPlan = findPlanForWeek(selectedWeek.start, selectedWeek.end, weeklyPlans);
      
      const payload = {
        id: existingPlan?.id,
        userId,
        className: selectedAssignment.class,
        subject: selectedAssignment.subject,
        startDate: formatDate(selectedWeek.start),
        endDate: formatDate(selectedWeek.end),
        learningObjective: formData.learningObjective,
        teachingMethod: formData.teachingMethod,
        field1: formData.field1,
        field2: formData.field2,
        field3: formData.field3,
        field4: formData.field4,
        status,
        isCompleted: formData.isCompleted,
      };

      const res = await fetch('/api/plans/weekly', {
        method: existingPlan ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSubmitStatus('success');
        fetchPlans();
        setTimeout(() => closeModal(), 1500);
      } else {
        setErrorMsg('Failed to save plan.');
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      }
    } catch {
      setErrorMsg('Network error.');
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const acceptSuggestion = () => {
    setFormData(prev => ({ ...prev, learningObjective: smartSuggestion }));
  };

  const generateWeeklyPlan = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai/weekly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedAssignment?.subject,
          className: selectedAssignment?.class,
          topic: smartSuggestion || '',
          labels
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.aiData) {
        setFormData(prev => ({
          ...prev,
          learningObjective: data.aiData.learningObjective || prev.learningObjective,
          teachingMethod: data.aiData.teachingMethod || prev.teachingMethod,
          field1: data.aiData.field1 || prev.field1,
          field2: data.aiData.field2 || prev.field2,
          field3: data.aiData.field3 || prev.field3,
          field4: data.aiData.field4 || prev.field4,
        }));
      } else {
        setErrorMsg(data.error || 'Failed to generate plan.');
      }
    } catch {
      setErrorMsg('Network error while connecting to AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBulkWeeklyPlans = async () => {
    if (!selectedAssignment || !userId) return;
    setIsGeneratingBulk(true);
    
    // Identify missing weeks and correlate with YearlyPlanData topics
    const missingWeeks = [];
    for (let currentMonthIdx = 0; currentMonthIdx < ACADEMIC_MONTHS.length; currentMonthIdx++) {
      const acMonth = ACADEMIC_MONTHS[currentMonthIdx];
      const monthWeeks = getWeeksOfMonth(acMonth.year, acMonth.month);
      
      for (let i = 0; i < monthWeeks.length; i++) {
         const w = monthWeeks[i];
         const exists = findPlanForWeek(w.start, w.end, weeklyPlans);
         if (!exists) {
            const topicKey = `${acMonth.name}_${i + 1}`;
            missingWeeks.push({
              academicMonth: acMonth.name,
              weekNum: i + 1,
              startDate: formatDate(w.start),
              endDate: formatDate(w.end),
              topic: yearlyPlanData[topicKey] || ''
            });
         }
      }
    }

    if (missingWeeks.length === 0) {
      alert('All weeks have already been planned!');
      setIsGeneratingBulk(false);
      return;
    }

    try {
      const res = await fetch('/api/ai/bulk-weekly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subject: selectedAssignment.subject,
          className: selectedAssignment.class,
          weeksToGenerate: missingWeeks,
          labels
        })
      });

      if (res.ok) {
        fetchPlans(); // Refresh the list
        alert(`Successfully generated and saved ${missingWeeks.length} weekly plans with AI!`);
      } else {
        alert('Failed to bulk generate. See console.');
      }
    } catch {
      alert('Network error during bulk generation.');
    } finally {
      setIsGeneratingBulk(false);
    }
  };

  const selectedLabel = selectedAssignment
    ? `${selectedAssignment.subject} - ${selectedAssignment.class} (${selectedAssignment.batch})`
    : '';

  const labels = getFieldLabels(selectedAssignment?.subject || '');
  const currentAcademicMonth = ACADEMIC_MONTHS[currentMonthIdx];
  const weeks = currentAcademicMonth ? getWeeksOfMonth(currentAcademicMonth.year, currentAcademicMonth.month) : [];

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto pb-8">
      
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4 cal-animate">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Weekly Planner</h1>
          <p className="text-gray-500 mt-1 text-sm">Click any week on the calendar to create or edit your lesson plan.</p>
        </div>
      </div>

      {/* Select Assignment */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-soft border border-soft mb-6 cal-animate">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Select Assignment</label>
        <div ref={dropdownRef} className="relative">
          <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-full text-left flex items-center justify-between py-3 px-4 rounded-xl border-2 transition-all duration-200 ${dropdownOpen ? 'border-blue-500 bg-white shadow-[0_0_0_3px_rgba(59,130,246,0.15)]' : selectedSubject ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50'}`}>
            <span className={`text-sm ${selectedSubject ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{selectedLabel || 'Choose a class and subject...'}</span>
            {dropdownOpen ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {dropdownOpen && (
            <div ref={listRef} className="absolute z-50 top-full left-0 w-full mt-2 bg-white rounded-xl border-2 border-blue-500 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
              {assignments.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">No subjects assigned.</div>
              ) : assignments.map(a => (
                <button key={a.id} type="button" onClick={() => { setSelectedSubject(a.id); setDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-gray-50 last:border-0 ${a.id === selectedSubject ? 'text-blue-600 font-semibold bg-blue-50/60' : 'text-gray-800 hover:bg-gray-50'}`}>
                  {a.subject} - {a.class} ({a.batch})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Navigation */}
      {selectedSubject && (
        <div className="cal-animate">
          <div className="bg-white rounded-2xl shadow-soft border border-soft overflow-hidden">
            {/* Month Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gray-900 text-white">
              <button onClick={() => setCurrentMonthIdx(Math.max(0, currentMonthIdx - 1))}
                disabled={currentMonthIdx === 0}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-semibold">{currentAcademicMonth?.name} {currentAcademicMonth?.year}</h2>
                <p className="text-xs text-gray-300 mt-0.5">Academic Month {currentMonthIdx + 1} of 10</p>
              </div>
              <button onClick={() => setCurrentMonthIdx(Math.min(9, currentMonthIdx + 1))}
                disabled={currentMonthIdx === 9}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-6 border-b border-gray-100">
              {DAYS.map(day => (
                <div key={day} className="text-center py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{day}</div>
              ))}
            </div>

            {/* Week Rows */}
            {weeks.map((week, wi) => {
              const status = getWeekStatus(week.start, week.end, weeklyPlans);
              const plan = findPlanForWeek(week.start, week.end, weeklyPlans);
              const isCompleted = plan?.isCompleted;

              const statusColors = {
                submitted: isCompleted 
                  ? 'bg-green-100 hover:bg-green-200 border-l-4 border-l-green-600' 
                  : 'bg-green-50 hover:bg-green-100/70 border-l-4 border-l-green-400',
                draft: 'bg-amber-50 hover:bg-amber-100/70 border-l-4 border-l-amber-400',
                empty: 'bg-white hover:bg-gray-50 border-l-4 border-l-transparent',
              };
              return (
                <button
                  key={wi}
                  onClick={() => openWeekModal(week.start, week.end)}
                  className={`w-full grid grid-cols-6 transition-all cursor-pointer group ${statusColors[status]} relative ${wi < weeks.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  {isCompleted && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {week.days.map((day, di) => (
                    <div key={di} className={`py-3 sm:py-4 text-center text-sm transition-colors ${day ? (isCompleted ? 'text-gray-900 line-through opacity-70' : 'text-gray-900 font-medium') : 'text-gray-300'}`}>
                      {day ? day.getDate() : ''}
                    </div>
                  ))}
                </button>
              );
            })}

            {/* Legend */}
            <div className="px-4 sm:px-6 py-3 bg-gray-50 flex items-center gap-4 sm:gap-6 text-xs text-gray-500 border-t border-gray-100">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500"></div> Submitted</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-amber-400"></div> Draft</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gray-200 border border-gray-300"></div> Empty</div>
            </div>
          </div>

          {/* Month Quick Nav */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
             <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {ACADEMIC_MONTHS.map((m, i) => (
                <button key={m.name} onClick={() => setCurrentMonthIdx(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${i === currentMonthIdx ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {m.name.substring(0, 3)}
                </button>
              ))}
            </div>
            
            <button 
              onClick={generateBulkWeeklyPlans}
              disabled={isGeneratingBulk}
              className="mt-4 sm:mt-0 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center shadow-sm"
            >
              {isGeneratingBulk ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2 text-purple-600" />}
              {isGeneratingBulk ? 'AI is Generating the Year...' : 'Bulk Auto-Plan Missing Weeks'}
            </button>
          </div>
        </div>
      )}

      {/* Slide-out Modal */}
      {modalOpen && selectedWeek && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div ref={modalRef} className="relative w-full max-w-lg bg-white shadow-2xl h-full overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  Week of {selectedWeek.start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {selectedWeek.end.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{selectedAssignment?.subject} • {selectedAssignment?.class}</p>
              </div>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Smart Suggestion */}
              {smartSuggestion && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-blue-900 flex items-center mb-1.5">
                    <Sparkles className="w-4 h-4 mr-1.5 text-blue-600" /> Smart Suggestion from Yearly Plan
                  </h4>
                  <p className="text-sm text-blue-800 mb-3 leading-relaxed">{smartSuggestion}</p>
                  <button onClick={acceptSuggestion}
                    className="bg-white text-blue-700 border border-blue-200 px-4 py-2 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors">
                    Use as Learning Objective
                  </button>
                </div>
              )}

              {/* Form Fields with Dynamic Labels */}
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">Lesson Plan Details</h4>
                  
                  <div className="flex items-center gap-3">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.isCompleted} 
                        onChange={(e) => setFormData(p => ({ ...p, isCompleted: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500 relative mr-2"></div>
                      <span className="text-xs font-medium text-gray-700">Mark Taught</span>
                    </label>

                    <button 
                      onClick={generateWeeklyPlan}
                      disabled={isGenerating}
                      className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors flex items-center"
                    >
                      {isGenerating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                      {isGenerating ? 'Generating...' : 'Magic Autofill with AI'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{labels.learningObjective}</label>
                  <textarea value={formData.learningObjective} onChange={(e) => setFormData(p => ({ ...p, learningObjective: e.target.value }))}
                    placeholder={`Enter ${labels.learningObjective.toLowerCase()}...`}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all min-h-[80px] resize-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{labels.teachingMethod}</label>
                  <input type="text" value={formData.teachingMethod} onChange={(e) => setFormData(p => ({ ...p, teachingMethod: e.target.value }))}
                    placeholder={`Enter ${labels.teachingMethod.toLowerCase()}...`}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{labels.field1}</label>
                    <input type="text" value={formData.field1} onChange={(e) => setFormData(p => ({ ...p, field1: e.target.value }))}
                      placeholder={`Enter ${labels.field1.toLowerCase()}...`}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{labels.field2}</label>
                    <input type="text" value={formData.field2} onChange={(e) => setFormData(p => ({ ...p, field2: e.target.value }))}
                      placeholder={`Enter ${labels.field2.toLowerCase()}...`}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{labels.field3}</label>
                    <input type="text" value={formData.field3} onChange={(e) => setFormData(p => ({ ...p, field3: e.target.value }))}
                      placeholder={`Enter ${labels.field3.toLowerCase()}...`}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{labels.field4}</label>
                    <input type="text" value={formData.field4} onChange={(e) => setFormData(p => ({ ...p, field4: e.target.value }))}
                      placeholder={`Enter ${labels.field4.toLowerCase()}...`}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="flex items-center text-sm font-medium text-green-700 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Plan saved successfully!
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="flex items-center text-sm font-medium text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                  <AlertCircle className="w-4 h-4 mr-2" /> {errorMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleSubmit('DRAFT')} disabled={submitStatus === 'submitting'}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors flex items-center justify-center disabled:opacity-70">
                  {submitStatus === 'submitting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Draft</>}
                </button>
                <button onClick={() => handleSubmit('SUBMITTED')} disabled={submitStatus === 'submitting'}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-medium transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-70">
                  {submitStatus === 'submitting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Submit</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
