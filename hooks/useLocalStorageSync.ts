'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/zustand/store';

export function useLocalStorageSync() {
  const state = useGameStore();

  useEffect(() => {
    localStorage.setItem(
      'brain-morning-sudoku-state',
      JSON.stringify({
        version: 1,
        mode: state.mode,
        seed: state.seed,
        challengeId: state.challengeId,
        puzzle: state.puzzle,
        board: state.board,
        solution: state.solution,
        difficulty: state.difficulty,
        notes: state.notes,
        mistakes: state.mistakes,
        hintsUsed: state.hintsUsed,
        elapsed: state.elapsed,
        totalMoves: state.totalMoves,
        correctMoves: state.correctMoves,
        completed: state.completed,
        submitted: state.submitted
      })
    );
  }, [
    state.mode,
    state.seed,
    state.challengeId,
    state.board,
    state.puzzle,
    state.solution,
    state.difficulty,
    state.notes,
    state.mistakes,
    state.hintsUsed,
    state.elapsed,
    state.totalMoves,
    state.correctMoves,
    state.completed,
    state.submitted
  ]);
}
