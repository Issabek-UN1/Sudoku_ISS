'use client';

import { useGameStore } from '@/lib/zustand/store';

export function ThemeToggle() {
  const theme = useGameStore((s) => s.theme);
  const toggleTheme = useGameStore((s) => s.toggleTheme);
  return <button onClick={toggleTheme} className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">{theme === 'dark' ? '☀️' : '🌙'}</button>;
}
