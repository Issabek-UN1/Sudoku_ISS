'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { useGameStore } from '@/lib/zustand/store';
import { useLocalStorageSync } from '@/hooks/useLocalStorageSync';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  const theme = useGameStore((s) => s.theme);

  useLocalStorageSync();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      useGameStore.getState().setTheme(savedTheme);
    }

    const raw = localStorage.getItem('brain-morning-sudoku-state');
    if (!raw) return;
    try {
      const snapshot = JSON.parse(raw);
      if (!snapshot || typeof snapshot !== 'object') return;

      const mode = snapshot.mode === 'daily' ? 'daily' : 'classic';
      const seed = typeof snapshot.seed === 'string' ? snapshot.seed : undefined;
      const challengeId = typeof snapshot.challengeId === 'string' ? snapshot.challengeId : null;
      const puzzle = Array.isArray(snapshot.puzzle) ? snapshot.puzzle : undefined;
      const board = Array.isArray(snapshot.board) ? snapshot.board : undefined;
      const solution = Array.isArray(snapshot.solution) ? snapshot.solution : undefined;
      const notes = Array.isArray(snapshot.notes) ? snapshot.notes : undefined;
      const mistakes = Array.isArray(snapshot.mistakes) ? snapshot.mistakes : undefined;
      const hintsUsed = typeof snapshot.hintsUsed === 'number' ? snapshot.hintsUsed : undefined;
      const elapsed = typeof snapshot.elapsed === 'number' ? snapshot.elapsed : undefined;
      const difficulty = snapshot.difficulty;
      const totalMoves = typeof snapshot.totalMoves === 'number' ? snapshot.totalMoves : undefined;
      const correctMoves = typeof snapshot.correctMoves === 'number' ? snapshot.correctMoves : undefined;
      const completed = typeof snapshot.completed === 'boolean' ? snapshot.completed : undefined;
      const submitted = typeof snapshot.submitted === 'boolean' ? snapshot.submitted : undefined;

      useGameStore.setState((s) => {
        const nextPuzzle = puzzle ?? s.puzzle;
        return {
          ...s,
          mode,
          seed: seed ?? s.seed,
          challengeId,
          puzzle: nextPuzzle,
          board: board ?? s.board,
          solution: solution ?? s.solution,
          fixed: nextPuzzle ? nextPuzzle.map((row: any[]) => row.map(Boolean)) : s.fixed,
          difficulty: (difficulty as any) ?? s.difficulty,
          notes: notes ?? s.notes,
          mistakes: mistakes ?? s.mistakes,
          hintsUsed: hintsUsed ?? s.hintsUsed,
          startedAt: elapsed !== undefined ? Date.now() - elapsed * 1000 : s.startedAt,
          elapsed: elapsed ?? s.elapsed,
          totalMoves: totalMoves ?? s.totalMoves,
          correctMoves: correctMoves ?? s.correctMoves,
          completed: completed ?? s.completed,
          submitted: submitted ?? s.submitted
        };
      });
    } catch {
      // ignore corrupted snapshots
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
