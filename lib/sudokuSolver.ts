import type { Board } from '@/types';

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function isValidMove(board: Board, row: number, col: number, value: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === value) return false;
  }

  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === value) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) return false;
    }
  }

  return true;
}

export function getConflicts(board: Board, row: number, col: number): boolean {
  const value = board[row][col];
  if (!value) return false;
  return !isValidMove(board, row, col, value);
}

export function findEmpty(board: Board): [number, number] | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!board[r][c]) return [r, c];
    }
  }
  return null;
}

export function solveSudoku(board: Board): Board | null {
  const working = cloneBoard(board);

  function backtrack(): boolean {
    const empty = findEmpty(working);
    if (!empty) return true;

    const [row, col] = empty;
    for (let value = 1; value <= 9; value++) {
      working[row][col] = value;
      if (isValidMove(working, row, col, value) && backtrack()) return true;
      working[row][col] = null;
    }
    return false;
  }

  return backtrack() ? working : null;
}

export function isCompleteAndCorrect(board: Board, solution: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

export function calculateAccuracy(correctMoves: number, totalMoves: number): number {
  if (totalMoves === 0) return 100;
  return Math.round((correctMoves / totalMoves) * 100);
}
