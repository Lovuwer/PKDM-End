'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, LayoutDashboard, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white border-b border-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-8">
            <Link href="/admin/dashboard" className="font-semibold tracking-tight text-gray-900 text-lg flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-gray-900" />
              Admin Portal
            </Link>
            
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/admin/dashboard"
                className={`px-3 py-2 flex items-center rounded-lg text-sm font-medium transition-all ${
                  pathname === '/admin/dashboard'
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Completion Dashboard
              </Link>
              <Link
                href="/admin/manage-faculty"
                className={`px-3 py-2 flex items-center rounded-lg text-sm font-medium transition-all ${
                  pathname.startsWith('/admin/manage-faculty') 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Manage Faculty
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center mr-2 text-white shadow-sm">
                A
              </div>
              <span className="hidden sm:inline">System Administrator</span>
            </div>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <Link 
              href="/"
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
          
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
