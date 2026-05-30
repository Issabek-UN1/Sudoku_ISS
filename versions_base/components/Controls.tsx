'use client';

import { currentAccuracy, useGameStore } from '@/lib/zustand/store';
import { NotesModeToggle } from './NotesModeToggle';

export function Controls() {
  const setValue = useGameStore((s) => s.setValue);
  const hint = useGameStore((s) => s.hint);
  const checkSolution = useGameStore((s) => s.checkSolution);
  const completed = useGameStore((s) => s.completed);

  return (
    <div className="mt-5 space-y-4">
      <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} onClick={() => setValue(n)} className="rounded-xl bg-brain-500 py-3 font-bold text-white hover:bg-brain-700">
            {n}
          </button>
        ))}
        <button onClick={() => setValue(null)} className="rounded-xl bg-slate-200 py-3 font-bold dark:bg-slate-700">Clear</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <NotesModeToggle />
        <button onClick={hint} className="rounded-xl bg-morning-500 px-4 py-2 font-bold text-white">Подсказка</button>
        <button
          onClick={() => alert(checkSolution() ? `Верно! Accuracy: ${currentAccuracy()}%` : 'Пока есть ошибки или пустые клетки')}
          className="rounded-xl bg-slate-900 px-4 py-2 font-bold text-white dark:bg-white dark:text-slate-950"
        >
          Проверить решение
        </button>
        {completed && <span className="rounded-xl bg-green-100 px-4 py-2 font-bold text-green-700">Готово! Badge earned 🏅</span>}
      </div>
    </div>
  );
}
