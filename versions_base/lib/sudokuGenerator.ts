import type { Board, Difficulty, SudokuPuzzle } from '@/types';
import { cloneBoard, isValidMove, solveSudoku } from './sudokuSolver';

const EMPTY: Board = Array.from({ length: 9 }, () => Array(9).fill(null));

const removalsByDifficulty: Record<Difficulty, number> = {
  easy: 38,
  medium: 46,
  hard: 52,
  expert: 58
};

function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

function shuffle<T>(arr: T[], random = Math.random): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function fillBoard(board: Board, random: () => number): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (!board[row][col]) {
        for (const value of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], random)) {
          board[row][col] = value;
          if (isValidMove(board, row, col, value) && fillBoard(board, random)) return true;
          board[row][col] = null;
        }
        return false;
      }
    }
  }
  return true;
}

function countSolutions(board: Board, limit = 2): number {
  const working = cloneBoard(board);
  let count = 0;

  function backtrack(): void {
    if (count >= limit) return;
    let empty: [number, number] | null = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!working[r][c]) {
          empty = [r, c];
          break;
        }
      }
      if (empty) break;
    }
    if (!empty) {
      count++;
      return;
    }
    const [row, col] = empty;
    for (let value = 1; value <= 9; value++) {
      working[row][col] = value;
      if (isValidMove(working, row, col, value)) backtrack();
      working[row][col] = null;
    }
  }

  backtrack();
  return count;
}

export function generateSudoku(difficulty: Difficulty = 'easy', seed = `${Date.now()}`): SudokuPuzzle {
  const random = seededRandom(seed);
  const solutionBoard = cloneBoard(EMPTY);

  // Backtracking выбран потому, что он надежно генерирует валидную полную сетку 9×9.
  // После этого мы удаляем числа и проверяем уникальность решения.
  fillBoard(solutionBoard, random);

  const solution = solutionBoard.map((row) => row.map((cell) => cell ?? 0));
  const puzzle = cloneBoard(solutionBoard);
  let removals = removalsByDifficulty[difficulty];

  const cells = shuffle(
    Array.from({ length: 81 }, (_, index) => [Math.floor(index / 9), index % 9] as const),
    random
  );

  for (const [row, col] of cells) {
    if (removals <= 0) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = null;

    if (countSolutions(puzzle) === 1) {
      removals--;
    } else {
      puzzle[row][col] = backup;
    }
  }

  const solved = solveSudoku(puzzle);
  if (!solved) return generateSudoku(difficulty, `${seed}-retry`);

  return { puzzle, solution, difficulty, seed };
}

export function dailySeed(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
