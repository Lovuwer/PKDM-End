'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import { UserPlus, Mail, Lock, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function TeacherRegister() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login/teacher'), 2500);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6">
      <main ref={containerRef} className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
            <UserPlus className="w-6 h-6 text-gray-800" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2 text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm">Register with your school email to access the Faculty Portal.</p>
        </div>

        {success ? (
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-soft text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Registration Successful!</h2>
            <p className="text-sm text-gray-500 mb-4">Redirecting you to the login page...</p>
            <Link href="/login/teacher" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Go to Login →</Link>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="bg-white p-6 rounded-3xl shadow-soft border border-soft space-y-4">
            
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl flex items-start border border-red-100">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-blue-50 text-blue-800 text-xs px-4 py-3 rounded-xl border border-blue-100 leading-relaxed">
              <strong>Note:</strong> Your school email must already be in the system (imported by your administrator). If you see an error, contact your admin.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">School Email</label>
              <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@pallikoodam.org"
                  className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Create Password</label>
              <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
                <Lock className="w-5 h-5 text-gray-400 mr-3" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
                <Lock className="w-5 h-5 text-gray-400 mr-3" />
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center group disabled:opacity-70">
              {loading ? (<Loader2 className="w-5 h-5 animate-spin" />) : (<>Register <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" /></>)}
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <Link href="/login/teacher" className="text-gray-900 font-medium hover:underline">Sign In</Link>
            </p>
          </form>
        )}

      </main>
    </div>
  );
}
