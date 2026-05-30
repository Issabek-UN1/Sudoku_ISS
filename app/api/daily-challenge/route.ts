import { NextResponse } from 'next/server';
import { dailySeed, generateSudoku } from '@/lib/sudokuGenerator';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const seed = dailySeed();
  const challenge = generateSudoku('medium', seed);

  let challengeId: string | null = null;
  try {
    const admin = supabaseAdmin();
    if (admin) {
      const { data, error } = await admin
        .from('daily_challenges')
        .upsert(
          {
            date: seed,
            seed,
            difficulty: 'medium'
          },
          { onConflict: 'date' }
        )
        .select('id')
        .single();
      if (!error) challengeId = (data as any)?.id ?? null;
    }
  } catch {
    // daily challenge works even without DB upsert
  }

  return NextResponse.json({ seed, difficulty: 'medium', puzzle: challenge.puzzle, solution: challenge.solution, challengeId });
}
