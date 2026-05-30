'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';
import { UpgradeToPro } from '@/components/UpgradeToPro';

type SubscriptionInfo = {
  plan: string;
  status: string;
  current_period_end: string | null;
};

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [stats, setStats] = useState<{ averageTime: number; accuracy: number; completed: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isPro =
    subscription &&
    (subscription.plan === 'pro_monthly' || subscription.plan === 'pro_yearly') &&
    (subscription.status === 'active' || subscription.status === 'trialing');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage('');

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        if (!cancelled) {
          setProfile(null);
          setSubscription(null);
          setStats(null);
          setTotalScore(null);
          setLoading(false);
        }
        return;
      }

      const userId = auth.user.id;

      const [profileRes, subRes, leaderboardRes, solutionsRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('subscriptions').select('plan,status,current_period_end').eq('user_id', userId).single(),
        supabase.from('leaderboards').select('total_score').eq('user_id', userId).single(),
        supabase.from('solutions').select('time,accuracy').eq('user_id', userId).order('created_at', { ascending: false }).limit(200)
      ]);

      if (cancelled) return;

      setProfile((profileRes.data ?? null) as UserProfile | null);

      setSubscription(
        subRes.data
          ? {
              plan: (subRes.data as any).plan ?? 'free',
              status: (subRes.data as any).status ?? 'inactive',
              current_period_end: (subRes.data as any).current_period_end ?? null
            }
          : null
      );

      setTotalScore(leaderboardRes.data ? ((leaderboardRes.data as any).total_score ?? 0) : null);

      const rows = (solutionsRes.data as Array<{ time: number; accuracy: number }> | null) ?? [];
      if (rows.length === 0) {
        setStats({ averageTime: 0, accuracy: 0, completed: 0 });
      } else {
        const totalTime = rows.reduce((acc, r) => acc + (r.time ?? 0), 0);
        const totalAcc = rows.reduce((acc, r) => acc + (r.accuracy ?? 0), 0);
        setStats({
          averageTime: Math.round(totalTime / rows.length),
          accuracy: Math.round(totalAcc / rows.length),
          completed: rows.length
        });
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function signIn() {
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }
    location.reload();
  }

  async function signUp() {
    setMessage('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/profile`
      }
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (!data.session) {
      setMessage('Регистрация создана. Проверьте почту, чтобы подтвердить email.');
      return;
    }

    location.reload();
  }

  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/profile` } });
  }

  async function signOut() {
    await supabase.auth.signOut();
    location.reload();
  }

  function formatTime(seconds: number): string {
    if (!seconds) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  const inputClass =
    'mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-950 outline-none focus:ring-2 focus:ring-brain-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white';

  const buttonPrimary = 'mt-3 w-full rounded-xl bg-brain-500 py-3 font-bold text-white hover:bg-brain-700 disabled:opacity-60';
  const buttonSecondary = 'mt-2 w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-800';

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-5 shadow-soft dark:bg-slate-900">
        <div className="text-sm text-slate-600 dark:text-slate-300">Загрузка…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-3xl bg-white p-5 shadow-soft dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">{authMode === 'login' ? 'Войти' : 'Регистрация'}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setAuthMode('login');
                setMessage('');
              }}
              className={`rounded-xl px-3 py-2 text-sm font-bold ${authMode === 'login' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800'}`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setMessage('');
              }}
              className={`rounded-xl px-3 py-2 text-sm font-bold ${authMode === 'signup' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800'}`}
            >
              Sign up
            </button>
          </div>
        </div>

        <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass.replace('mt-3', 'mt-2')} />

        {authMode === 'login' ? (
          <button onClick={signIn} className={buttonPrimary}>Email login</button>
        ) : (
          <button onClick={signUp} className={buttonPrimary}>Создать аккаунт</button>
        )}

        <button onClick={signInGoogle} className={buttonSecondary}>Google OAuth</button>

        {message && (
          <div className="mt-3 rounded-xl bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black">{profile.name ?? profile.email}</h2>
          <p className="text-slate-500 dark:text-slate-300">Город: {profile.city ?? 'не указан'}</p>
        </div>
        <button onClick={signOut} className="rounded-xl bg-slate-100 px-4 py-2 font-bold dark:bg-slate-800">Выйти</button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800"><b>Среднее время</b><br />{formatTime(stats?.averageTime ?? 0)}</div>
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800"><b>Точность</b><br />{stats?.accuracy ?? 0}%</div>
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800"><b>Пройдено</b><br />{stats?.completed ?? 0}</div>
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800"><b>Очки</b><br />{totalScore ?? 0} pts</div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-100 p-4 text-sm dark:bg-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <b>Подписка</b>
          <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {(subscription?.plan ?? 'free').toUpperCase()} · {(subscription?.status ?? 'inactive')}
          </span>
        </div>
        {!isPro && (
          <div className="mt-3">
            <UpgradeToPro />
          </div>
        )}
        {subscription?.current_period_end && (
          <div className="mt-2 text-slate-600 dark:text-slate-300">Оплачено до: {new Date(subscription.current_period_end).toLocaleString('ru-RU')}</div>
        )}
        {!subscription?.current_period_end && (
          <div className="mt-2 text-slate-600 dark:text-slate-300">Free plan. Для Pro нажмите “Upgrade to Pro”.</div>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-morning-100 p-4 text-morning-600">Бейджи: Morning Streak 🏅, Алматы Top 100 🌆</div>
    </div>
  );
}
