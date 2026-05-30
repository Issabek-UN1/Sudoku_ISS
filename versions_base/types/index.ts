export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type CellValue = number | null;
export type Board = CellValue[][];
export type Notes = number[][][];

export type SudokuPuzzle = {
  puzzle: Board;
  solution: number[][];
  difficulty: Difficulty;
  seed?: string;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  city: string | null;
  created_at: string;
};

export type LeaderboardRow = {
  user_id: string;
  name: string | null;
  avatar: string | null;
  city: string | null;
  total_score: number;
  rank: number;
};

export type GameStats = {
  averageTime: number;
  accuracy: number;
  completed: number;
};
