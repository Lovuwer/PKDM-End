'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { BookOpen, Mail, Lock, ArrowRight } from 'lucide-react';

export default function TeacherLogin() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/teacher/dashboard');
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6">
      <main ref={containerRef} className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
            <BookOpen className="w-6 h-6 text-gray-800" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2 text-gray-900">Faculty Portal</h1>
          <p className="text-gray-500 text-sm">Sign in to manage your academic plans.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-6 rounded-3xl shadow-soft border border-soft space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email</label>
            <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@pallikoodam.edu"
                className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Password</label>
            <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
              <Lock className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center group"
          >
            Sign In
            <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
          
        </form>

      </main>
    </div>
  );
}
