'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { CheckSquare, Plus, Trash2, GripVertical, Sparkles } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category: string;
}

const CATEGORIES = [
  { name: 'Academic', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: 'Administrative', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'Personal', color: 'bg-green-100 text-green-700 border-green-200' },
];

const STORAGE_KEY = 'pallikoodam_checklist';

export default function ChecklistPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('Academic');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    const stored = localStorage.getItem('pallikoodam_user');
    if (!stored) { router.push('/login/teacher'); return; }

    const ctx = gsap.context(() => {
      gsap.fromTo('.cl-animate', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [router]);

  // Persist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (!newText.trim()) return;
    const item: ChecklistItem = {
      id: Date.now().toString(),
      text: newText.trim(),
      completed: false,
      category: newCategory,
    };
    setItems(prev => [item, ...prev]);
    setNewText('');
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCompleted = () => {
    setItems(prev => prev.filter(i => !i.completed));
  };

  const filteredItems = items.filter(i => {
    if (filter === 'active') return !i.completed;
    if (filter === 'completed') return i.completed;
    return true;
  });

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getCategoryStyle = (cat: string) => {
    return CATEGORIES.find(c => c.name === cat)?.color || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto pb-8">
      <div className="mb-8 cl-animate">
        <div className="flex items-center mb-1">
          <Sparkles className="w-5 h-5 text-amber-500 mr-2" />
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">My Checklist</h1>
        </div>
        <p className="text-gray-500 text-sm">Organize your tasks, to-dos, and reminders.</p>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="bg-white rounded-2xl shadow-soft border border-soft p-4 sm:p-5 mb-6 cl-animate">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{completedCount} of {totalCount} tasks completed</span>
            <span className="text-sm font-semibold text-gray-900">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-gray-900 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      {/* Add New Task */}
      <div className="bg-white rounded-2xl shadow-soft border border-soft p-4 sm:p-5 mb-6 cl-animate">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
            placeholder="What needs to be done?"
            className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
          />
          <div className="flex gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {CATEGORIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={addItem}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-xl font-medium transition-colors active:scale-95 flex items-center flex-shrink-0"
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-4 cl-animate">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors capitalize ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {f}
            </button>
          ))}
        </div>
        {completedCount > 0 && (
          <button onClick={clearCompleted} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
            Clear completed
          </button>
        )}
      </div>

      {/* Checklist Items */}
      <div className="space-y-2 cl-animate">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft border border-soft p-10 text-center">
            <CheckSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {filter === 'completed' ? 'No completed tasks yet.' : filter === 'active' ? 'All tasks are done! 🎉' : 'No tasks yet. Add one above!'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group bg-white rounded-xl shadow-sm border border-soft p-3 sm:p-4 flex items-center transition-all hover:shadow-md ${
                item.completed ? 'opacity-60' : ''
              }`}
            >
              <GripVertical className="w-4 h-4 text-gray-300 mr-2 sm:mr-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hidden sm:block" />
              
              <button onClick={() => toggleItem(item.id)} className="flex-shrink-0 mr-3">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  item.completed
                    ? 'bg-gray-900 border-gray-900'
                    : 'border-gray-300 hover:border-gray-500'
                }`}>
                  {item.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>

              <div className="flex-grow min-w-0">
                <p className={`text-sm font-medium truncate ${item.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {item.text}
                </p>
              </div>

              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ml-2 flex-shrink-0 ${getCategoryStyle(item.category)}`}>
                {item.category}
              </span>

              <button onClick={() => deleteItem(item.id)}
                className="ml-2 sm:ml-3 p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
