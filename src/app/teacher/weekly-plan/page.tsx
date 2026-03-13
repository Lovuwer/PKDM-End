'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Save, CheckCircle2, ChevronDown, Calendar, FileText, AlertTriangle, Sparkles } from 'lucide-react';

export default function WeeklyPlan() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const [holidayWarning, setHolidayWarning] = useState('');
  const [suggestedTopic, setSuggestedTopic] = useState('');
  const [learningObjective, setLearningObjective] = useState('');
  
  const saveBannerRef = useRef<HTMLDivElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const holidayRef = useRef<HTMLDivElement>(null);
  
  const triggerAutoSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      gsap.fromTo(saveBannerRef.current, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out' });
    }, 1500);
  };

  useEffect(() => {
    if (!startDate) {
      setHolidayWarning('');
      setSuggestedTopic('');
      return;
    }

    const date = new Date(startDate);
    const month = date.getMonth(); // 0 = Jan, 9 = Oct, 10 = Nov
    
    // 1. Smart Holiday/Event detection warnings
    if (month === 11 && date.getDate() > 20) {
      setHolidayWarning('⚠️ Notice: Approaching Winter Break. Consider lighter review assignments.');
    } else if (month === 9 && date.getDate() > 28) {
      setHolidayWarning('⚠️ Notice: Diwali holidays occur during this week. Less instruction time available.');
    } else if (month === 8 && date.getDate() < 10) {
      setHolidayWarning('⚠️ Notice: Onam week detected. Check school calendar for days off.');
    } else {
      setHolidayWarning('');
    }

    // Animate holiday warning if present
    if (holidayWarning && holidayRef.current) {
      gsap.fromTo(holidayRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4 });
    }

    // 2. Auto-link Weekly Plan to read from Yearly Plan topics
    // In a real app, this would be an API call `fetch('/api/yearly-plan/topic?date=...')`
    if (selectedSubject === 'eco-11a') {
      setSuggestedTopic('Introduction to Macroeconomics (From Yearly Plan: Month 1, Week 1)');
      if (suggestionRef.current) {
        gsap.fromTo(suggestionRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' });
      }
    }

  }, [startDate, selectedSubject, holidayWarning]);

  const acceptSuggestion = () => {
    setLearningObjective('Understand the fundamental differences between micro and macro economics. Key metrics: GDP, Inflation.');
    triggerAutoSave();
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Weekly Plan</h1>
          <p className="text-gray-500 mt-1">Submit specific lesson goals and methods for the week.</p>
        </div>
        
        {/* Auto-save Status indicator */}
        <div 
          ref={saveBannerRef}
          className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-soft mb-8">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Select Assignment</label>
        <div className="relative">
          <select 
            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="" disabled>Choose a class and subject...</option>
            <option value="eco-11a">Economics - 11th Standard (Batch A)</option>
            <option value="com-11b">Commerce - 11th Standard (Batch B)</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-soft">
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" /> Start of Week
          </label>
          <input 
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); triggerAutoSave(); }}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-soft">
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" /> End of Week
          </label>
          <input 
            type="date"
            onChange={triggerAutoSave}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-2xl shadow-soft border border-soft p-6 sm:p-8 space-y-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
            <FileText className="w-5 h-5 text-gray-700" />
          </div>
          <h2 className="text-xl font-medium text-gray-900">Lesson Details</h2>
        </div>

        {holidayWarning && (
          <div ref={holidayRef} className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 flex items-start text-sm mb-4">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{holidayWarning}</p>
          </div>
        )}

        {suggestedTopic && (
          <div ref={suggestionRef} className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-900 flex items-center mb-1.5">
              <Sparkles className="w-4 h-4 mr-1.5 text-blue-600" /> Smart Suggestion
            </h3>
            <p className="text-sm text-blue-800 mb-3">{suggestedTopic}</p>
            <button 
              onClick={acceptSuggestion}
              className="bg-white text-blue-700 border border-blue-200 px-4 py-2 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors"
            >
              Auto-fill Lesson Data
            </button>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Learning Objective</label>
            <textarea 
              value={learningObjective}
              onChange={(e) => { setLearningObjective(e.target.value); triggerAutoSave(); }}
              placeholder="What should the students understand by the end?"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white transition-all min-h-[100px] resize-none"
            ></textarea>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Teaching Method</label>
            <input 
              type="text"
              onChange={triggerAutoSave}
              placeholder="e.g., Interactive lecture, group presentation, case study..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Resources / Materials</label>
              <input 
                type="text" onChange={triggerAutoSave}
                placeholder="Textbooks, PDFs, links"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Assessment Method</label>
              <input 
                type="text" onChange={triggerAutoSave}
                placeholder="Quiz, Q&A, Homework"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Homework Assigned</label>
              <input 
                type="text" onChange={triggerAutoSave}
                placeholder="Details of assignments"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Differentiation Strategy</label>
              <input 
                type="text" onChange={triggerAutoSave}
                placeholder="How to support varied learners"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Submit bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 z-40 transform translate-y-[-env(safe-area-inset-bottom)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6">
          <p className="text-sm text-gray-500 hidden sm:block">All changes are auto-saved as drafts.</p>
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-medium transition-transform active:scale-95 w-full sm:w-auto ml-auto">
            Submit Weekly Plan
          </button>
        </div>
      </div>

    </div>
  );
}
