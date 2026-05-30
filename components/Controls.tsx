'use client';

import { useEffect, useState } from 'react';
import { currentAccuracy, useGameStore } from '@/lib/zustand/store';
import { NotesModeToggle } from './NotesModeToggle';
import { submitCompletion } from '@/lib/gameResults';
import { supabase } from '@/lib/supabase';

export function Controls() {
  const setValue = useGameStore((s) => s.setValue);
  const hint = useGameStore((s) => s.hint);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const checkSolution = useGameStore((s) => s.checkSolution);
  const completed = useGameStore((s) => s.completed);
  const submitted = useGameStore((s) => s.submitted);
  const markSubmitted = useGameStore((s) => s.markSubmitted);
  const elapsed = useGameStore((s) => s.elapsed);
  const mistakesCount = useGameStore((s) => s.mistakes.length);
  const difficulty = useGameStore((s) => s.difficulty);
  const mode = useGameStore((s) => s.mode);
  const seed = useGameStore((s) => s.seed);
  const challengeId = useGameStore((s) => s.challengeId);

  const [resultMsg, setResultMsg] = useState<string>('');
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPro() {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        if (!cancelled) setIsPro(false);
        return;
      }

      const { data } = await supabase.from('subscriptions').select('plan,status').eq('user_id', auth.user.id).maybeSingle();
      const plan = typeof (data as any)?.plan === 'string' ? (data as any).plan : '';
      const status = typeof (data as any)?.status === 'string' ? (data as any).status : '';

      const pro = (plan === 'pro_monthly' || plan === 'pro_yearly') && (status === 'active' || status === 'trialing');
      if (!cancelled) setIsPro(pro);
    }

    loadPro();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadPro();
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  function onHint() {
    const FREE_HINTS_PER_GAME = 3;
    if (!isPro && hintsUsed >= FREE_HINTS_PER_GAME) {
      alert('Подсказки без лимита доступны в Pro. Откройте Profile и нажмите “Upgrade to Pro”.');
      return;
    }
    hint();
  }

  useEffect(() => {
    if (!completed) return;
    if (submitted) return;

    (async () => {
      const res = await submitCompletion({
        seed,
        mode,
        difficulty,
        elapsed,
        mistakes: mistakesCount,
        accuracy: currentAccuracy(),
        challengeId
      });

      if ('score' in res) {
        setResultMsg(`Результат сохранён: +${res.score} pts`);
      } else if ('skipped' in res) {
        setResultMsg('Войдите, чтобы сохранить результат в рейтинге.');
      } else {
        setResultMsg(`Не удалось сохранить результат: ${res.error}`);
      }

      markSubmitted();
    })();
  }, [challengeId, completed, difficulty, elapsed, markSubmitted, mistakesCount, mode, seed, submitted]);

  return (
    <div className="mt-5 space-y-4">
      <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} onClick={() => setValue(n)} className="rounded-xl bg-brain-500 py-3 font-bold text-white hover:bg-brain-700">
            {n}
          </button>
        ))}
        <button onClick={() => setValue(null)} className="rounded-xl bg-slate-200 py-3 font-bold dark:bg-slate-700">Clear</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <NotesModeToggle />
        <button onClick={onHint} className="rounded-xl bg-morning-500 px-4 py-2 font-bold text-white">Подсказка</button>
        <button
          onClick={() => alert(checkSolution() ? `Верно! Accuracy: ${currentAccuracy()}%` : 'Пока есть ошибки или пустые клетки')}
          className="rounded-xl bg-slate-900 px-4 py-2 font-bold text-white dark:bg-white dark:text-slate-950"
        >
          Проверить решение
        </button>
        {completed && <span className="rounded-xl bg-green-100 px-4 py-2 font-bold text-green-700">Готово! Badge earned 🏅</span>}
        {resultMsg && <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{resultMsg}</span>}
      </div>
    </div>
  );
}
