'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

export function DailyChallenge() {
  const { data, isLoading } = useQuery({
    queryKey: ['daily-challenge'],
    queryFn: async () => {
      const res = await fetch('/api/daily-challenge');
      if (!res.ok) throw new Error('Daily challenge failed');
      return res.json();
    }
  });

  return (
    <div className="rounded-3xl bg-gradient-to-br from-morning-500 to-brain-500 p-5 text-white shadow-soft">
      <h2 className="text-xl font-black">Daily Challenge</h2>
      <p className="mt-2 text-sm opacity-90">Одинаковое Судоку для всех. Рейтинг по времени и точности.</p>
      <p className="mt-3 font-mono text-sm">{isLoading ? 'Загрузка...' : `Seed: ${data.seed}`}</p>
      <Link href="/daily" className="mt-4 inline-block rounded-xl bg-white px-4 py-2 font-bold text-brain-700">
        Играть сегодня
      </Link>
    </div>
  );
}
