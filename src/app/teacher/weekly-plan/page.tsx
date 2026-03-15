'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { Save, CheckCircle2, ChevronDown, ChevronUp, Calendar, FileText, AlertTriangle, Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface Assignment {
  id: string;
  class: string;
  batch: string;
  subject: string;
}

export default function WeeklyPlan() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [holidayWarning, setHolidayWarning] = useState('');
  const [suggestedTopic, setSuggestedTopic] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userId, setUserId] = useState('');

  // Track all form field values
  const [formData, setFormData] = useState({
    learningObjective: '',
    teachingMethod: '',
    resources: '',
    assessment: '',
    homework: '',
    differentiation: ''
  });
  
  const saveBannerRef = useRef<HTMLDivElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const holidayRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('pallikoodam_user');
    if (!stored) { router.push('/login/teacher'); return; }
    const user = JSON.parse(stored);
    setUserId(user.id);

    fetch(`/api/assignments?userId=${user.id}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAssignments(data); })
      .catch(() => {});
  }, [router]);

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
  
  const triggerAutoSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      if (saveBannerRef.current) {
        gsap.fromTo(saveBannerRef.current, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out' });
      }
    }, 1500);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    triggerAutoSave();
  };

  useEffect(() => {
    if (!startDate) { setHolidayWarning(''); setSuggestedTopic(''); return; }
    const date = new Date(startDate);
    const month = date.getMonth();
    
    if (month === 11 && date.getDate() > 20) {
      setHolidayWarning('⚠️ Notice: Approaching Winter Break. Consider lighter review assignments.');
    } else if (month === 9 && date.getDate() > 28) {
      setHolidayWarning('⚠️ Notice: Diwali holidays occur during this week. Less instruction time available.');
    } else if (month === 8 && date.getDate() < 10) {
      setHolidayWarning('⚠️ Notice: Onam week detected. Check school calendar for days off.');
    } else {
      setHolidayWarning('');
    }

    if (holidayWarning && holidayRef.current) {
      gsap.fromTo(holidayRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4 });
    }

    if (selectedSubject) {
      setSuggestedTopic('Auto-linked from Yearly Plan for this assignment.');
      if (suggestionRef.current) {
        gsap.fromTo(suggestionRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' });
      }
    }
  }, [startDate, selectedSubject, holidayWarning]);

  const selectedAssignment = assignments.find(a => a.id === selectedSubject);
  const selectedLabel = selectedAssignment
    ? `${selectedAssignment.subject} - ${selectedAssignment.class} (${selectedAssignment.batch})`
    : '';

  const acceptSuggestion = () => {
    setFormData(prev => ({ ...prev, learningObjective: 'Auto-filled from Yearly Plan curriculum topics.' }));
    triggerAutoSave();
  };

  const handleSubmit = async () => {
    const assignment = assignments.find(a => a.id === selectedSubject);
    if (!assignment || !userId || !startDate) {
      setErrorMsg('Please select an assignment and set the start date.');
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }
    setSubmitStatus('submitting');
    try {
      const res = await fetch('/api/plans/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          className: assignment.class,
          subject: assignment.subject,
          field1: formData.learningObjective,
          field2: formData.teachingMethod,
          field3: formData.resources,
          field4: `${formData.assessment} | ${formData.homework} | ${formData.differentiation}`,
          status: 'SUBMITTED'
        })
      });
      if (res.ok) {
        setSubmitStatus('success');
        setFormData({ learningObjective: '', teachingMethod: '', resources: '', assessment: '', homework: '', differentiation: '' });
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

  return (
    <div className="max-w-4xl mx-auto pb-24">
      
      <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">Weekly Plan</h1>
          <p className="text-gray-500 mt-1 text-sm">Submit specific lesson goals and methods for the week.</p>
        </div>
        <div 
          ref={saveBannerRef}
          className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
            saveStatus === 'saving' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {saveStatus === 'saving' ? (<><Save className="w-4 h-4 mr-2 animate-pulse" /> Saving...</>) : (<><CheckCircle2 className="w-4 h-4 mr-2" /> Draft saved</>)}
        </div>
      </div>

      {/* Select Assignment */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-soft border border-soft mb-8">
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

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-soft border border-soft">
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> Start of Week</label>
          <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); triggerAutoSave(); }}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-soft border border-soft">
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> End of Week</label>
          <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); triggerAutoSave(); }}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-2xl shadow-soft border border-soft p-4 sm:p-8 space-y-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-4"><FileText className="w-5 h-5 text-gray-700" /></div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900">Lesson Details</h2>
        </div>

        {holidayWarning && (
          <div ref={holidayRef} className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 flex items-start text-sm">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" /><p className="leading-relaxed">{holidayWarning}</p>
          </div>
        )}

        {suggestedTopic && selectedSubject && (
          <div ref={suggestionRef} className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-900 flex items-center mb-1.5"><Sparkles className="w-4 h-4 mr-1.5 text-blue-600" /> Smart Suggestion</h3>
            <p className="text-sm text-blue-800 mb-3">{suggestedTopic}</p>
            <button onClick={acceptSuggestion} className="bg-white text-blue-700 border border-blue-200 px-4 py-2 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors">Auto-fill Lesson Data</button>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Learning Objective</label>
            <textarea value={formData.learningObjective} onChange={(e) => updateField('learningObjective', e.target.value)}
              placeholder="What should the students understand by the end?"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all min-h-[80px] sm:min-h-[100px] resize-none" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Teaching Method</label>
            <input type="text" value={formData.teachingMethod} onChange={(e) => updateField('teachingMethod', e.target.value)}
              placeholder="e.g., Interactive lecture, group presentation, case study..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Resources / Materials</label>
              <input type="text" value={formData.resources} onChange={(e) => updateField('resources', e.target.value)}
                placeholder="Textbooks, PDFs, links" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Assessment Method</label>
              <input type="text" value={formData.assessment} onChange={(e) => updateField('assessment', e.target.value)}
                placeholder="Quiz, Q&A, Homework" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Homework Assigned</label>
              <input type="text" value={formData.homework} onChange={(e) => updateField('homework', e.target.value)}
                placeholder="Details of assignments" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Differentiation Strategy</label>
              <input type="text" value={formData.differentiation} onChange={(e) => updateField('differentiation', e.target.value)}
                placeholder="How to support varied learners" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Submit */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200 p-3 sm:p-4 z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 gap-3 sm:gap-0">
          <div className="w-full sm:w-auto">
            {submitStatus === 'success' && <div className="flex items-center text-sm font-medium text-green-700"><CheckCircle2 className="w-4 h-4 mr-2" /> Weekly plan submitted!</div>}
            {submitStatus === 'error' && <div className="flex items-center text-sm font-medium text-red-600"><AlertCircle className="w-4 h-4 mr-2" /> {errorMsg}</div>}
            {submitStatus === 'idle' && <p className="text-sm text-gray-500 hidden sm:block">All changes are auto-saved as drafts.</p>}
          </div>
          <button onClick={handleSubmit} disabled={submitStatus === 'submitting'}
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-medium transition-transform active:scale-95 w-full sm:w-auto disabled:opacity-70 flex items-center justify-center">
            {submitStatus === 'submitting' ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>) : 'Submit Weekly Plan'}
          </button>
        </div>
      </div>

    </div>
  );
}
