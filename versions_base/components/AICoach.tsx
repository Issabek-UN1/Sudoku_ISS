'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/zustand/store';

export function AICoach() {
  const [question, setQuestion] = useState('Почему эта цифра подходит? Объясни стратегией кандидатов.');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const board = useGameStore((s) => s.board);
  const selected = useGameStore((s) => s.selected);

  async function ask() {
    setLoading(true);
    setAnswer('');
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board, selected, question })
      });
      const data = await res.json();
      setAnswer(data.answer ?? 'AI Coach временно недоступен.');
    } catch {
      setAnswer('Ошибка соединения с AI Coach.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft dark:bg-slate-900">
      <h2 className="text-xl font-bold">AI Coach</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Объясняет кандидатов, скрытые пары и пошаговые стратегии.</p>
      <textarea value={question} onChange={(e) => setQuestion(e.target.value)} className="mt-3 w-full rounded-xl border p-3 text-sm text-slate-950" rows={3} />
      <button onClick={ask} disabled={loading} className="mt-3 w-full rounded-xl bg-brain-500 px-4 py-2 font-bold text-white disabled:opacity-60">
        {loading ? 'Думаю...' : 'Спросить AI-тренера'}
      </button>
      {answer && <div className="mt-3 rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">{answer}</div>}
    </div>
  );
}
