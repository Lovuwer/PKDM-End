'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LogOut, LayoutDashboard, ShieldCheck, BookOpen, Menu, X, Upload } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pallikoodam_user');
      if (stored) {
        try {
          return JSON.parse(stored).name || '';
        } catch {
          return '';
        }
      }
    }
    return '';
  });



  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Faculty', href: '/admin/manage-faculty', icon: ShieldCheck },
    { name: 'Assign Subjects', href: '/admin/assign-subjects', icon: BookOpen },
    { name: 'Import Data', href: '/admin/import', icon: Upload },
  ];

  const handleSignOut = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="bg-white border-b border-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/admin/dashboard" className="flex items-center flex-shrink-0">
              <img src="/pallikoodam-logo.png" alt="Pallikoodam" className="h-8 object-contain" />
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center mr-2 text-white shadow-sm font-semibold">A</div>
              <span>Admin</span>
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
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center mr-3 text-white font-semibold">A</div>
              <span className="text-sm font-medium text-gray-900">System Administrator</span>
            </div>
            <nav className="py-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
