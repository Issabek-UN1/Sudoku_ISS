'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SudokuGrid } from '@/components/SudokuGrid';
import { Controls } from '@/components/Controls';
import { Timer } from '@/components/Timer';
import { DailyChallenge } from '@/components/DailyChallenge';
import { useGameStore } from '@/lib/zustand/store';
import type { Board, Difficulty } from '@/types';

type DailyChallengeResponse = {
  seed: string;
  difficulty: Difficulty;
  puzzle: Board;
  solution: number[][];
  challengeId?: string | null;
};

export default function DailyPage() {
  const loadGame = useGameStore((s) => s.loadGame);
  const mode = useGameStore((s) => s.mode);
  const seed = useGameStore((s) => s.seed);

  const daily = useQuery({
    queryKey: ['daily-challenge', 'full'],
    queryFn: async () => {
      const res = await fetch('/api/daily-challenge');
      if (!res.ok) throw new Error('Daily challenge failed');
      return (await res.json()) as DailyChallengeResponse;
    }
  });

  useEffect(() => {
    if (!daily.data) return;
    if (mode === 'daily' && seed === daily.data.seed) return;
    loadGame({
      seed: daily.data.seed,
      mode: 'daily',
      challengeId: daily.data.challengeId ?? null,
      puzzle: daily.data.puzzle,
      solution: daily.data.solution,
      difficulty: daily.data.difficulty
    });
  }, [daily.data, loadGame, mode, seed]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-morning-600">Daily Challenge</p>
          <h1 className="text-3xl font-black">Сегодняшнее утреннее Судоку</h1>
        </div>
        <Timer />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-3xl bg-white p-4 shadow-soft dark:bg-slate-900">
          {daily.isLoading ? (
            <div className="grid place-items-center rounded-2xl border border-slate-200 p-10 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
              Загрузка daily challenge…
            </div>
          ) : daily.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              Не удалось загрузить daily challenge.
            </div>
          ) : (
            <>
              <SudokuGrid />
              <Controls />
            </>
          )}
        </section>
        <DailyChallenge />
      </div>
    </main>
  );
}
