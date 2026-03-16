'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { Save, CheckCircle2, ChevronDown, ChevronUp, CalendarDays, RotateCcw, Loader2, AlertCircle, Upload, Sparkles, X } from 'lucide-react';

interface Assignment {
  id: string;
  class: string;
  batch: string;
  subject: string;
}

const ACADEMIC_MONTHS = [
  'June', 'July', 'August', 'September', 'October', 
  'November', 'December', 'January', 'February', 'March'
];

const ACADEMIC_YEARS = [
  '2024-2025',
  '2025-2026',
  '2026-2027',
  '2027-2028'
];

export default function YearlyPlan() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2025-2026');
  const [expandedMonth, setExpandedMonth] = useState<string | null>('June');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  // Track ALL textarea values: { "June_1": "topic...", "June_2": "...", ... }
  const [planData, setPlanData] = useState<Record<string, string>>({});

  // AI Upload state
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiStatus, setAiStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [aiError, setAiError] = useState('');
  
  const saveBannerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  // Load existing plan data when assignment or year is selected
  useEffect(() => {
    if (!selectedSubject || !userId || !selectedAcademicYear) return;
    const assignment = assignments.find(a => a.id === selectedSubject);
    if (!assignment) return;

    fetch(`/api/plans/yearly?userId=${userId}&class=${encodeURIComponent(assignment.class)}&subject=${encodeURIComponent(assignment.subject)}&academicYear=${encodeURIComponent(selectedAcademicYear)}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0 && data[0].draftData) {
          setPlanData(data[0].draftData as Record<string, string>);
        } else {
          setPlanData({});
        }
      })
      .catch(() => setPlanData({}));
  }, [selectedSubject, userId, assignments, selectedAcademicYear]);

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

  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const handleTextChange = (month: string, week: number, value: string) => {
    const key = `${month}_${week}`;
    const updated = { ...planData, [key]: value };
    setPlanData(updated);

    // Debounced auto-save to API
    setSaveStatus('saving');
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(async () => {
      const assignment = assignments.find(a => a.id === selectedSubject);
      if (!assignment || !userId) { setSaveStatus('saved'); return; }
      try {
        await fetch('/api/plans/yearly', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            className: assignment.class,
            subject: assignment.subject,
            academicYear: selectedAcademicYear,
            draftData: updated,
            status: 'DRAFT'
          })
        });
      } catch { /* silent */ }
      setSaveStatus('saved');
      if (saveBannerRef.current) {
        gsap.fromTo(saveBannerRef.current, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out' });
      }
    }, 1500);
  };

  const handleSubmit = async () => {
    const assignment = assignments.find(a => a.id === selectedSubject);
    if (!assignment || !userId) {
      setErrorMsg('Please select an assignment first.');
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }
    setSubmitStatus('submitting');
    try {
      const res = await fetch('/api/plans/yearly', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          className: assignment.class,
          subject: assignment.subject,
          academicYear: selectedAcademicYear,
          draftData: planData,
          status: 'SUBMITTED'
        })
      });
      if (res.ok) {
        setSubmitStatus('success');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setErrorMsg('Failed to submit plan.');
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      }
    } catch {
      setErrorMsg('Network error.');
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const handleDuplicate = () => {
    // Fill all textareas with a template from a hypothetical previous year
    const template: Record<string, string> = {};
    ACADEMIC_MONTHS.forEach(month => {
      [1,2,3,4].forEach(w => {
        template[`${month}_${w}`] = `[Duplicated] ${month} Week ${w} — Review and update topics.`;
      });
    });
    setPlanData(template);
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 800);
  };

  const toggleMonth = (month: string) => {
    setExpandedMonth(expandedMonth === month ? null : month);
  };

  const handleAiUpload = async () => {
    if (!aiFile || !selectedSubject || !userId) return;
    setAiStatus('parsing');
    setAiError('');
    try {
      const fd = new FormData();
      fd.append('file', aiFile);
      const res = await fetch('/api/ai/parse-syllabus', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.success && data.draftData) {
        setPlanData(data.draftData);
        setAiStatus('success');
        // Auto-save to API
        const assignment = assignments.find(a => a.id === selectedSubject);
        if (assignment) {
          await fetch('/api/plans/yearly', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId, 
              className: assignment.class, 
              subject: assignment.subject, 
              academicYear: selectedAcademicYear,
              draftData: data.draftData, 
              status: 'DRAFT' 
            })
          });
        }
        setTimeout(() => { setAiStatus('idle'); setAiFile(null); }, 3000);
      } else {
        setAiError(data.error || 'AI processing failed');
        setAiStatus('error');
        setTimeout(() => setAiStatus('idle'), 5000);
      }
    } catch {
      setAiError('Network error. Please try again.');
      setAiStatus('error');
      setTimeout(() => setAiStatus('idle'), 5000);
    }
  };

  const selectedAssignment = assignments.find(a => a.id === selectedSubject);
  const selectedLabel = selectedAssignment
    ? `${selectedAssignment.subject} - ${selectedAssignment.class} (${selectedAssignment.batch})`
    : '';

  return (
    <div className="max-w-4xl mx-auto pb-24">
      
      <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Yearly Plan</h1>
          <p className="text-gray-500 mt-1 text-sm">Map out your curriculum for the entire academic year.</p>
        </div>
        
        <div 
          ref={saveBannerRef}
          className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
            saveStatus === 'saving' 
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {saveStatus === 'saving' ? (
            <><Save className="w-4 h-4 mr-2 animate-pulse" /> Saving draft...</>
          ) : (
            <><CheckCircle2 className="w-4 h-4 mr-2" /> Draft saved</>
          )}
        </div>
      </div>

      {/* Select Assignment */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-soft border border-soft mb-8">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Select Assignment</label>
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-full text-left flex items-center justify-between py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
              dropdownOpen
                ? 'border-blue-500 bg-white shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
                : selectedSubject
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-200 bg-gray-50'
            }`}
          >
            <span className={`text-sm ${selectedSubject ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {selectedLabel || 'Choose a class and subject...'}
            </span>
            {dropdownOpen ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {dropdownOpen && (
            <div ref={listRef} className="absolute z-50 top-full left-0 w-full mt-2 bg-white rounded-xl border-2 border-blue-500 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
              {assignments.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">No subjects assigned. Contact your admin.</div>
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

      {/* Select Academic Year */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-soft border border-soft mb-8">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Select Academic Year</label>
        <select
          value={selectedAcademicYear}
          onChange={(e) => setSelectedAcademicYear(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          {ACADEMIC_YEARS.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* AI Syllabus Upload Zone */}
      {selectedSubject && (
        <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl border border-violet-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center mr-3">
                <Sparkles className="w-5 h-5 text-violet-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-violet-900">AI Syllabus Parser</h3>
                <p className="text-xs text-violet-600">Upload a CISCE syllabus PDF to auto-generate your yearly plan</p>
              </div>
            </div>
            {aiFile && (
              <button onClick={() => { setAiFile(null); setAiStatus('idle'); }} className="p-1.5 text-violet-400 hover:text-violet-700 rounded-lg hover:bg-violet-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!aiFile ? (
            <label className="flex items-center justify-center border-2 border-dashed border-violet-300 rounded-xl py-5 cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all">
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setAiFile(e.target.files[0]); }} />
              <Upload className="w-5 h-5 text-violet-400 mr-2" />
              <span className="text-sm text-violet-600 font-medium">Drop PDF here or click to browse</span>
            </label>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center bg-white rounded-xl px-4 py-3 border border-violet-200">
                <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center mr-3 text-xs font-bold text-red-700">PDF</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{aiFile.name}</p>
                  <p className="text-xs text-gray-400">{(aiFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              {aiStatus === 'success' && (
                <div className="flex items-center text-sm text-green-700 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Syllabus parsed! Review the auto-filled plan below and edit as needed.
                </div>
              )}
              {aiStatus === 'error' && (
                <div className="flex items-center text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                  <AlertCircle className="w-4 h-4 mr-2" /> {aiError}
                </div>
              )}

              <button onClick={handleAiUpload} disabled={aiStatus === 'parsing'}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center">
                {aiStatus === 'parsing' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> AI is analyzing your syllabus...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate Yearly Plan with AI</>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Accordion Months */}
      <div className="space-y-4">
        {ACADEMIC_MONTHS.map((month) => {
          const isExpanded = expandedMonth === month;
          return (
            <div key={month} className="bg-white border text-gray-900 border-soft shadow-sm rounded-2xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleMonth(month)}
                className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center mr-3 sm:mr-4">
                    <CalendarDays className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-semibold text-base sm:text-lg">{month}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="p-4 sm:p-6 pt-0 space-y-4 border-t border-gray-50">
                  {[1, 2, 3, 4].map((weekNum) => (
                    <div key={weekNum} className="flex flex-col md:flex-row gap-3 sm:gap-4">
                      <div className="w-24 pt-2 sm:pt-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Week {weekNum}</span>
                      </div>
                      <div className="flex-grow">
                        <textarea 
                          placeholder="Enter curriculum topics, chapters, and goals for this week..."
                          value={planData[`${month}_${weekNum}`] || ''}
                          onChange={(e) => handleTextChange(month, weekNum, e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all min-h-[80px] sm:min-h-[100px] resize-none"
                        ></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Submit bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200 p-3 sm:p-4 z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 gap-3 sm:gap-0">
          <div className="w-full sm:w-auto">
            {submitStatus === 'success' && (
              <div className="flex items-center text-sm font-medium text-green-700">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Plan submitted successfully!
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="flex items-center text-sm font-medium text-red-600">
                <AlertCircle className="w-4 h-4 mr-2" /> {errorMsg}
              </div>
            )}
            {submitStatus === 'idle' && (
              <p className="text-sm text-gray-500 hidden sm:block">All changes are auto-saved as drafts.</p>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={handleDuplicate}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 sm:px-6 py-3 rounded-xl font-medium transition-colors flex items-center text-sm flex-1 sm:flex-initial justify-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Duplicate
            </button>
            <button 
              onClick={handleSubmit}
              disabled={submitStatus === 'submitting'}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 sm:px-8 py-3 rounded-xl font-medium transition-transform active:scale-95 disabled:opacity-70 flex items-center flex-1 sm:flex-initial justify-center"
            >
              {submitStatus === 'submitting' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : 'Submit Plan'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
