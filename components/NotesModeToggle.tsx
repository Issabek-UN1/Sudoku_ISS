'use client';

import { useGameStore } from '@/lib/zustand/store';

export function NotesModeToggle() {
  const notesMode = useGameStore((s) => s.notesMode);
  const toggle = useGameStore((s) => s.toggleNotesMode);
  return (
    <button onClick={toggle} className={`rounded-xl px-4 py-2 font-bold ${notesMode ? 'bg-brain-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
      Notes {notesMode ? 'ON' : 'OFF'}
    </button>
  );
}
