'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/zustand/store';

export function useLocalStorageSync() {
  const state = useGameStore();

  useEffect(() => {
    localStorage.setItem('brain-morning-sudoku-state', JSON.stringify({
      board: state.board,
      puzzle: state.puzzle,
      solution: state.solution,
      elapsed: state.elapsed,
      difficulty: state.difficulty
    }));
  }, [state.board, state.elapsed, state.difficulty, state.puzzle, state.solution]);
}
