import { supabase } from '@/lib/supabase';
import type { Difficulty } from '@/types';

type GameMode = 'classic' | 'daily';

export function calculateScore(input: {
  elapsed: number;
  accuracy: number;
  mistakes: number;
  difficulty: Difficulty;
  mode: GameMode;
}): number {
  const difficultyMultiplier: Record<Difficulty, number> = {
    easy: 1,
    medium: 1.2,
    hard: 1.5,
    expert: 2
  };

  const timePenalty = Math.min(1800, Math.max(0, input.elapsed)) * 1;
  const mistakePenalty = Math.max(0, input.mistakes) * 30;
  const accuracyBonus = Math.round(Math.max(0, Math.min(100, input.accuracy)) * 8);

  const base = input.mode === 'daily' ? 600 : 400;
  const raw = (base + accuracyBonus - timePenalty - mistakePenalty) * (difficultyMultiplier[input.difficulty] ?? 1);
  return Math.max(0, Math.round(raw));
}

export async function submitCompletion(input: {
  seed: string;
  mode: GameMode;
  difficulty: Difficulty;
  elapsed: number;
  mistakes: number;
  accuracy: number;
  challengeId: string | null;
}): Promise<{ score: number } | { skipped: true } | { error: string }> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) return { error: authError.message };
  if (!authData.user) return { skipped: true };

  const score = calculateScore({
    elapsed: input.elapsed,
    accuracy: input.accuracy,
    mistakes: input.mistakes,
    difficulty: input.difficulty,
    mode: input.mode
  });

  const insertSolution = await supabase.from('solutions').insert({
    user_id: authData.user.id,
    challenge_id: input.mode === 'daily' ? input.challengeId : null,
    time: Math.max(0, Math.round(input.elapsed)),
    errors: Math.max(0, Math.round(input.mistakes)),
    accuracy: Math.max(0, Math.min(100, input.accuracy)),
    difficulty: input.difficulty
  });

  if (insertSolution.error) return { error: insertSolution.error.message };

  const current = await supabase.from('leaderboards').select('total_score').eq('user_id', authData.user.id).single();

  const currentScore = current.data?.total_score ?? 0;
  const nextScore = currentScore + score;

  const update = await supabase
    .from('leaderboards')
    .upsert({ user_id: authData.user.id, total_score: nextScore, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

  if (update.error) return { error: update.error.message };

  return { score };
}
