'use client';

import type { Difficulty } from '@/types';
import { useGameStore } from '@/lib/zustand/store';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

export function DifficultySelector() {
  const difficulty = useGameStore((s) => s.difficulty);
  const newGame = useGameStore((s) => s.newGame);

  return (
    <div className="flex flex-wrap gap-2">
      {difficulties.map((d) => (
        <button
          key={d}
          onClick={() => newGame(d)}
          className={`rounded-xl px-4 py-2 font-bold ${difficulty === d ? 'bg-brain-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
        >
          {d.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
