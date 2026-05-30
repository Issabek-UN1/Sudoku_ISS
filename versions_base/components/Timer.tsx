'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/zustand/store';

function format(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function Timer() {
  const elapsed = useGameStore((s) => s.elapsed);
  const tick = useGameStore((s) => s.tick);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return <div className="rounded-xl bg-slate-100 px-4 py-2 font-mono text-lg font-black dark:bg-slate-800">⏱ {format(elapsed)}</div>;
}
