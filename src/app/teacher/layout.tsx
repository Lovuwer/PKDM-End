'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, BookOpen, Calendar, LayoutDashboard, Menu, X, CheckSquare } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('pallikoodam_user');
    if (stored) {
      try { setUserName(JSON.parse(stored).name || ''); } catch { setUserName(''); }
    }
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem('pallikoodam_user');
    router.push('/');
  };

  const initial = userName ? userName.charAt(0).toUpperCase() : '?';

  const navItems = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Yearly Plans', href: '/teacher/yearly-plan', icon: BookOpen },
    { name: 'Weekly Plans', href: '/teacher/weekly-plan', icon: Calendar },
    { name: 'Checklist', href: '/teacher/checklist', icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="bg-white border-b border-soft sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/teacher/dashboard" className="flex items-center flex-shrink-0">
              <img src="/pallikoodam-logo.png" alt="Pallikoodam" className="h-8 object-contain" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={`px-3 py-2 flex items-center rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                    <Icon className="w-4 h-4 mr-2" />{item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center text-sm font-medium text-gray-700">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2 text-gray-600 border border-gray-200 font-semibold">{initial}</div>
              <span>{userName || 'Teacher'}</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
            <button onClick={handleSignOut} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors" title="Sign Out">
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 font-semibold text-gray-600">{initial}</div>
              <span className="text-sm font-medium text-gray-900">{userName || 'Teacher'}</span>
            </div>
            <nav className="py-2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-gray-50 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Icon className="w-5 h-5 mr-3" />{item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
