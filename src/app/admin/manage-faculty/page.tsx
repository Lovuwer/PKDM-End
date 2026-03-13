'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { UserPlus, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ManageFaculty() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'creating' | 'success'>('idle');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dash-animate',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleCreateFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('creating');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setName('');
      setEmail('');
      setPassword('');
      
      // Reset back to idle after a few seconds
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto pb-24">
      
      <div className="mb-10 dash-animate">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Manage Faculty</h1>
        <p className="text-gray-500 mt-1">Register new teachers and assign their credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 dash-animate">
        
        {/* Registration Form */}
        <div className="md:col-span-2 bg-white rounded-3xl shadow-soft border border-soft p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mr-4">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-medium text-gray-900">Register New Teacher</h2>
          </div>

          <form onSubmit={handleCreateFaculty} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Jane Doe"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                  <Mail className="w-4 h-4 mr-1.5 text-gray-400" /> Email Address
                </label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@pallikoodam.edu"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center">
                  <Lock className="w-4 h-4 mr-1.5 text-gray-400" /> Initial Password
                </label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between border-t border-gray-50 gap-4 sm:gap-0">
              
              <div className="flex-1 w-full sm:w-auto">
                {status === 'success' && (
                  <div className="flex items-center text-sm font-medium text-green-700">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Teacher account created successfully.
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={status === 'creating'}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-70 flex items-center w-full sm:w-auto justify-center"
              >
                {status === 'creating' ? 'Registering...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-3xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-gray-500" />
              How it works
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              When you create a teacher account, they can immediately log in through the Faculty Portal using the email and password you assign them.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              You will need to manually assign them subjects on the backend after their account is generated.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
