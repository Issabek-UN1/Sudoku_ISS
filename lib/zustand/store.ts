import { create } from "zustand";
import type { Board, Difficulty, Notes } from "@/types";
import { generateSudoku } from "@/lib/sudokuGenerator";
import {
  calculateAccuracy,
  getConflicts,
  isCompleteAndCorrect,
} from "@/lib/sudokuSolver";

const emptyNotes = (): Notes =>
  Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => [] as number[]),
  );

type Mistake = { row: number; col: number; value: number; at: number };

type GameMode = "classic" | "daily";

type GameState = {
  seed: string;
  mode: GameMode;
  challengeId: string | null;
  puzzle: Board;
  board: Board;
  solution: number[][];
  fixed: boolean[][];
  difficulty: Difficulty;
  notes: Notes;
  notesMode: boolean;
  selected: { row: number; col: number } | null;
  mistakes: Mistake[];
  hintsUsed: number;
  startedAt: number;
  elapsed: number;
  totalMoves: number;
  correctMoves: number;
  completed: boolean;
  submitted: boolean;
  theme: "light" | "dark";
  newGame: (difficulty?: Difficulty, seed?: string) => void;
  loadGame: (input: {
    seed: string;
    mode: GameMode;
    challengeId?: string | null;
    puzzle: Board;
    solution: number[][];
    difficulty: Difficulty;
  }) => void;
  markSubmitted: () => void;
  selectCell: (row: number, col: number) => void;
  setValue: (value: number | null) => void;
  toggleNote: (value: number) => void;
  toggleNotesMode: () => void;
  tick: () => void;
  hint: () => void;
  checkSolution: () => boolean;
  hasConflict: (row: number, col: number) => boolean;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
};

function fixedFromPuzzle(puzzle: Board): boolean[][] {
  return puzzle.map((row) => row.map(Boolean));
}

export const useGameStore = create<GameState>((set, get) => {
  const initial = generateSudoku("easy");
  return {
    seed: initial.seed ?? `${Date.now()}`,
    mode: "classic",
    challengeId: null,
    puzzle: initial.puzzle,
    board: initial.puzzle.map((row) => [...row]),
    solution: initial.solution,
    fixed: fixedFromPuzzle(initial.puzzle),
    difficulty: "easy",
    notes: emptyNotes(),
    notesMode: false,
    selected: null,
    mistakes: [],
    hintsUsed: 0,
    startedAt: Date.now(),
    elapsed: 0,
    totalMoves: 0,
    correctMoves: 0,
    completed: false,
    submitted: false,
    theme: "light",

    newGame: (difficulty = "easy", seed) => {
      const next = generateSudoku(difficulty, seed);
      set({
        seed: next.seed ?? seed ?? `${Date.now()}`,
        mode: "classic",
        challengeId: null,
        puzzle: next.puzzle,
        board: next.puzzle.map((row) => [...row]),
        solution: next.solution,
        fixed: fixedFromPuzzle(next.puzzle),
        difficulty,
        notes: emptyNotes(),
        selected: null,
        mistakes: [],
        hintsUsed: 0,
        startedAt: Date.now(),
        elapsed: 0,
        totalMoves: 0,
        correctMoves: 0,
        completed: false,
        submitted: false,
      });
    },

    loadGame: ({
      seed,
      mode,
      challengeId = null,
      puzzle,
      solution,
      difficulty,
    }) => {
      set({
        seed,
        mode,
        challengeId,
        puzzle,
        board: puzzle.map((row) => [...row]),
        solution,
        fixed: fixedFromPuzzle(puzzle),
        difficulty,
        notes: emptyNotes(),
        selected: null,
        mistakes: [],
        hintsUsed: 0,
        startedAt: Date.now(),
        elapsed: 0,
        totalMoves: 0,
        correctMoves: 0,
        completed: false,
        submitted: false,
      });
    },

    markSubmitted: () => set({ submitted: true }),

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
      const mistakes =
        isCorrect || value === null
          ? state.mistakes
          : [...state.mistakes, { row, col, value, at: Date.now() }];

      // Clear pencil notes in this cell when a definitive value is placed
      const notes =
        value !== null
          ? state.notes.map((r, ri) =>
              r.map((cell, ci) => (ri === row && ci === col ? [] : cell)),
            )
          : state.notes;

      set({
        board,
        notes,
        mistakes,
        totalMoves: value === null ? state.totalMoves : state.totalMoves + 1,
        correctMoves:
          value && isCorrect ? state.correctMoves + 1 : state.correctMoves,
        completed: isCompleteAndCorrect(board, state.solution),
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

    tick: () =>
      set((s) => ({ elapsed: Math.floor((Date.now() - s.startedAt) / 1000) })),

    hint: () => {
      const state = get();

      // Prefer the selected cell if it's empty, otherwise use the first empty cell
      const target = (() => {
        const sel = state.selected;
        if (
          sel &&
          !state.board[sel.row][sel.col] &&
          !state.fixed[sel.row][sel.col]
        ) {
          return sel;
        }
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            if (!state.board[row][col]) return { row, col };
          }
        }
        return null;
      })();

      if (!target) return;
      const board = state.board.map((r) => [...r]);
      board[target.row][target.col] = state.solution[target.row][target.col];
      // Clear notes for the hinted cell
      const notes = state.notes.map((r, ri) =>
        r.map((cell, ci) =>
          ri === target.row && ci === target.col ? [] : cell,
        ),
      );
      set({
        board,
        notes,
        completed: isCompleteAndCorrect(board, state.solution),
        hintsUsed: state.hintsUsed + 1,
      });
    },

    checkSolution: () => isCompleteAndCorrect(get().board, get().solution),
    hasConflict: (row, col) => getConflicts(get().board, row, col),
    setTheme: (theme) => set({ theme }),
    toggleTheme: () =>
      set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
  };
});

export function currentAccuracy(): number {
  const state = useGameStore.getState();
  return calculateAccuracy(state.correctMoves, state.totalMoves);
}
