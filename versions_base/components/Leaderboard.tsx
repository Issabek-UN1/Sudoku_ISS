'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { LeaderboardRow } from '@/types';

async function fetchLeaderboard(city?: string): Promise<LeaderboardRow[]> {
  let query = supabase.from('leaderboards_view').select('*').order('rank', { ascending: true }).limit(20);
  if (city) query = query.eq('city', city);
  const { data, error } = await query;
  if (error) throw error;
  return data as LeaderboardRow[];
}

export function Leaderboard() {
  const global = useQuery({ queryKey: ['leaderboard', 'global'], queryFn: () => fetchLeaderboard() });
  const almaty = useQuery({ queryKey: ['leaderboard', 'almaty'], queryFn: () => fetchLeaderboard('Алматы') });

  const renderRows = (rows?: LeaderboardRow[]) => (
    <div className="space-y-2">
      {(rows ?? []).map((row) => (
        <div key={row.user_id} className="flex items-center justify-between rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
          <span className="font-bold">#{row.rank} {row.name ?? 'Player'}</span>
          <span>{row.total_score} pts</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <section className="rounded-3xl bg-white p-5 shadow-soft dark:bg-slate-900">
        <h2 className="mb-3 text-2xl font-black">Глобальный рейтинг</h2>
        {renderRows(global.data)}
      </section>
      <section className="rounded-3xl bg-white p-5 shadow-soft dark:bg-slate-900">
        <h2 className="mb-3 text-2xl font-black">Топ игроков из Алматы</h2>
        {renderRows(almaty.data)}
      </section>
    </div>
  );
}
