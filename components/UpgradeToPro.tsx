'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function UpgradeToPro() {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function goToStripe() {
    setError('');
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError('Сначала войдите в аккаунт (Profile), затем оформите подписку.');
        return;
      }

      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });

      const payload = await res.json();
      if (!res.ok) {
        setError(payload?.error ?? 'Stripe checkout error');
        return;
      }

      if (payload?.url) {
        window.location.href = payload.url;
        return;
      }

      setError('Stripe checkout URL не получен.');
    } catch {
      setError('Ошибка соединения со Stripe.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-xl bg-morning-500 px-4 py-2 font-black text-white">Upgrade to Pro</button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-w-md rounded-3xl bg-white p-6 text-slate-950 shadow-soft dark:bg-slate-900 dark:text-slate-50">
            <h2 className="text-2xl font-black">Brain Morning Pro</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">$4.99/мес или $49.99/год</p>
            <ul className="mt-4 list-disc pl-5 text-sm">
              <li>Кастомные скины сетки</li>
              <li>Безлимитные hints</li>
              <li>Без рекламы</li>
              <li>Expert+ уровни</li>
            </ul>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setPlan('monthly')}
                className={`rounded-xl px-4 py-2 font-bold ${plan === 'monthly' ? 'bg-brain-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPlan('yearly')}
                className={`rounded-xl px-4 py-2 font-bold ${plan === 'yearly' ? 'bg-brain-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
              >
                Yearly
              </button>
            </div>

            {error && <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{error}</div>}

            <button
              onClick={goToStripe}
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-brain-500 py-3 font-bold text-white disabled:opacity-60"
            >
              {loading ? 'Перенаправляю…' : 'Continue to Stripe'}
            </button>
            <button onClick={() => setOpen(false)} className="mt-2 w-full rounded-xl bg-slate-100 py-3 font-bold dark:bg-slate-800">Закрыть</button>
          </div>
        </div>
      )}
    </>
  );
}
