'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Save, CheckCircle2, ChevronDown, CalendarDays } from 'lucide-react';

const ACADEMIC_MONTHS = [
  'June', 'July', 'August', 'September', 'October', 
  'November', 'December', 'January', 'February', 'March'
];

export default function YearlyPlan() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [expandedMonth, setExpandedMonth] = useState<string | null>('June');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const saveBannerRef = useRef<HTMLDivElement>(null);
  
  // Fake auto-save trigger
  const triggerAutoSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      gsap.fromTo(saveBannerRef.current, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out' });
    }, 1500);
  };

  const toggleMonth = (month: string) => {
    setExpandedMonth(expandedMonth === month ? null : month);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Yearly Plan</h1>
          <p className="text-gray-500 mt-1">Map out your curriculum for the entire academic year.</p>
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

      {/* Accordion Months */}
      <div className="space-y-4">
        {ACADEMIC_MONTHS.map((month) => {
          const isExpanded = expandedMonth === month;
          return (
            <div key={month} className="bg-white border text-gray-900 border-soft shadow-sm rounded-2xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleMonth(month)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center mr-4">
                    <CalendarDays className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-semibold text-lg">{month}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Collapsible Content */}
              <div 
                className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
              >
                <div className="p-6 pt-0 space-y-4 border-t border-gray-50">
                  {[1, 2, 3, 4].map((weekNum) => (
                    <div key={weekNum} className="flex flex-col md:flex-row gap-4">
                      <div className="w-24 pt-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Week {weekNum}</span>
                      </div>
                      <div className="flex-grow">
                        <textarea 
                          placeholder="Enter curriculum topics, chapters, and goals for this week..."
                          onChange={triggerAutoSave}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all min-h-[100px] resize-none"
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
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 z-40 transform translate-y-[-env(safe-area-inset-bottom)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6">
          <p className="text-sm text-gray-500 hidden sm:block">All changes are auto-saved as drafts.</p>
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-medium transition-transform active:scale-95 ml-auto w-full sm:w-auto">
            Submit Academic Plan
          </button>
        </div>
      </div>

    </div>
  );
}
