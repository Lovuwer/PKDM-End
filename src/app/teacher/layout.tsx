'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, BookOpen, Calendar, LayoutDashboard } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('pallikoodam_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setUserName(user.name || '');
      } catch {
        setUserName('');
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('pallikoodam_user');
    router.push('/');
  };

  const initial = userName ? userName.charAt(0).toUpperCase() : '?';

  const navItems = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Yearly Plans', href: '/teacher/yearly-plan', icon: BookOpen },
    { name: 'Weekly Plans', href: '/teacher/weekly-plan', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white border-b border-soft sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          <div className="flex items-center space-x-8">
            <Link href="/teacher/dashboard" className="font-semibold tracking-tight text-gray-900 text-lg">
              Pallikoodam
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 flex items-center rounded-lg text-sm font-medium transition-all ${isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2 text-gray-600 border border-gray-200 font-semibold">
                {initial}
              </div>
              <span className="hidden sm:inline">{userName || 'Teacher'}</span>
            </div>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
