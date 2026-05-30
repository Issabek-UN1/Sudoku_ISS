import { NextResponse } from 'next/server';
import { dailySeed, generateSudoku } from '@/lib/sudokuGenerator';

export async function GET() {
  const seed = dailySeed();
  const challenge = generateSudoku('medium', seed);
  return NextResponse.json({ seed, difficulty: 'medium', puzzle: challenge.puzzle, solution: challenge.solution });
}
