import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Pallikoodam - Faculty Portal',
  description: 'Manage yearly and weekly lesson plans',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col relative pb-16`}>
        <main className="flex-grow flex flex-col">
          {children}
        </main>

        {/* Universal Footer as required by design constrains */}
        <footer className="fixed bottom-2 right-4 text-[10px] text-gray-300 opacity-60 pointer-events-none z-50">
          Made by: Joel Tom K
        </footer>
      </body>
    </html>
  );
}
