'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { BookOpen, ShieldCheck } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    // GSAP Intro Animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.stagger-fade',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );
    }, containerRef);
    
    return () => ctx.revert(); // Cleanup GSAP
  }, []);

  const handleNavigation = (path: string, index: number) => {
    // Subtle exit animation before routing
    gsap.to(cardsRef.current[index], { scale: 0.95, duration: 0.2, ease: 'power2.inOut' });
    setTimeout(() => router.push(path), 200);
  };

  return (
    <div ref={containerRef} className="min-h-[85vh] flex flex-col items-center justify-center p-6">
      
      <div className="text-center mb-12 stagger-fade">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-3">Pallikoodam</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Welcome to the academic planning platform. Please select your portal to continue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl stagger-fade">
        <button
          ref={(el) => { cardsRef.current[0] = el }}
          onClick={() => handleNavigation('/login/teacher', 0)}
          className="group relative bg-white p-8 rounded-3xl border border-soft shadow-soft hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 transform outline-none flex flex-col items-center justify-center text-center"
        >
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 group-hover:bg-gray-100 transition-colors">
            <BookOpen className="w-7 h-7 text-gray-800" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Faculty Portal</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Submit your yearly and weekly lesson plans.
          </p>
        </button>

        <button
          ref={(el) => { cardsRef.current[1] = el }}
          onClick={() => handleNavigation('/login/admin', 1)}
          className="group relative bg-white p-8 rounded-3xl border border-soft shadow-soft hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 transform outline-none flex flex-col items-center justify-center text-center"
        >
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 group-hover:bg-gray-100 transition-colors">
            <ShieldCheck className="w-7 h-7 text-gray-800" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Admin Portal</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Review, track, and export academic submissions.
          </p>
        </button>
      </div>

    </div>
  );
}
