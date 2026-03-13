'use client';

import { useState, useRef } from 'react';
import gsap from 'gsap';
import { Save, CheckCircle2, ChevronDown, Calendar, FileText } from 'lucide-react';

export default function WeeklyPlan() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const saveBannerRef = useRef<HTMLDivElement>(null);
  
  const triggerAutoSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      gsap.fromTo(saveBannerRef.current, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out' });
    }, 1500);
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
            onChange={triggerAutoSave}
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

        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Learning Objective</label>
            <textarea 
              onChange={triggerAutoSave}
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
