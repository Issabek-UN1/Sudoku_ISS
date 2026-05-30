import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Brain Morning Sudoku',
  description: 'Утреннее Судоку с AI Coach, Daily Challenge и рейтингом городов.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen bg-morning-50 text-slate-950 antialiased dark:bg-slate-950 dark:text-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
