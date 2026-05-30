import { create } from 'zustand';
import type { Board, Difficulty, Notes } from '@/types';
import { generateSudoku } from '@/lib/sudokuGenerator';
import { calculateAccuracy, getConflicts, isCompleteAndCorrect } from '@/lib/sudokuSolver';

const emptyNotes = (): Notes => Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [] as number[]));

type Mistake = { row: number; col: number; value: number; at: number };

type GameState = {
  puzzle: Board;
  board: Board;
  solution: number[][];
  fixed: boolean[][];
  difficulty: Difficulty;
  notes: Notes;
  notesMode: boolean;
  selected: { row: number; col: number } | null;
  mistakes: Mistake[];
  startedAt: number;
  elapsed: number;
  totalMoves: number;
  correctMoves: number;
  completed: boolean;
  theme: 'light' | 'dark';
  newGame: (difficulty?: Difficulty, seed?: string) => void;
  selectCell: (row: number, col: number) => void;
  setValue: (value: number | null) => void;
  toggleNote: (value: number) => void;
  toggleNotesMode: () => void;
  tick: () => void;
  hint: () => void;
  checkSolution: () => boolean;
  hasConflict: (row: number, col: number) => boolean;
  toggleTheme: () => void;
};

function fixedFromPuzzle(puzzle: Board): boolean[][] {
  return puzzle.map((row) => row.map(Boolean));
}

export const useGameStore = create<GameState>((set, get) => {
  const initial = generateSudoku('easy');
  return {
    puzzle: initial.puzzle,
    board: initial.puzzle.map((row) => [...row]),
    solution: initial.solution,
    fixed: fixedFromPuzzle(initial.puzzle),
    difficulty: 'easy',
    notes: emptyNotes(),
    notesMode: false,
    selected: null,
    mistakes: [],
    startedAt: Date.now(),
    elapsed: 0,
    totalMoves: 0,
    correctMoves: 0,
    completed: false,
    theme: 'light',

    newGame: (difficulty = 'easy', seed) => {
      const next = generateSudoku(difficulty, seed);
      set({
        puzzle: next.puzzle,
        board: next.puzzle.map((row) => [...row]),
        solution: next.solution,
        fixed: fixedFromPuzzle(next.puzzle),
        difficulty,
        notes: emptyNotes(),
        selected: null,
        mistakes: [],
        startedAt: Date.now(),
        elapsed: 0,
        totalMoves: 0,
        correctMoves: 0,
        completed: false
      });
    },

    selectCell: (row, col) => set({ selected: { row, col } }),

    setValue: (value) => {
      const state = get();
      if (!state.selected) return;
      const { row, col } = state.selected;
      if (state.fixed[row][col]) return;

      if (state.notesMode && value) {
        state.toggleNote(value);
        return;
      }

      const board = state.board.map((r) => [...r]);
      board[row][col] = value;
      const isCorrect = value === null || value === state.solution[row][col];
      const mistakes = isCorrect || value === null ? state.mistakes : [...state.mistakes, { row, col, value, at: Date.now() }];

      set({
        board,
        mistakes,
        totalMoves: value === null ? state.totalMoves : state.totalMoves + 1,
        correctMoves: value && isCorrect ? state.correctMoves + 1 : state.correctMoves,
        completed: isCompleteAndCorrect(board, state.solution)
      });
    },

    toggleNote: (value) => {
      const state = get();
      if (!state.selected) return;
      const { row, col } = state.selected;
      if (state.fixed[row][col]) return;
      const notes = state.notes.map((r) => r.map((cell) => [...cell]));
      notes[row][col] = notes[row][col].includes(value)
        ? notes[row][col].filter((n) => n !== value)
        : [...notes[row][col], value].sort();
      set({ notes });
    },

    toggleNotesMode: () => set((s) => ({ notesMode: !s.notesMode })),

    tick: () => set((s) => ({ elapsed: Math.floor((Date.now() - s.startedAt) / 1000) })),

    hint: () => {
      const state = get();
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (!state.board[row][col]) {
            const board = state.board.map((r) => [...r]);
            board[row][col] = state.solution[row][col];
            set({ board, completed: isCompleteAndCorrect(board, state.solution) });
            return;
          }
        }
      }
    },

    checkSolution: () => isCompleteAndCorrect(get().board, get().solution),
    hasConflict: (row, col) => getConflicts(get().board, row, col),
    toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' }))
  };
});

export function currentAccuracy(): number {
  const state = useGameStore.getState();
  return calculateAccuracy(state.correctMoves, state.totalMoves);
}
