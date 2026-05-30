'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: row } = await supabase.from('users').select('*').eq('id', data.user.id).single();
      setProfile(row as UserProfile);
    });
  }, []);

  async function signIn() {
    await supabase.auth.signInWithPassword({ email, password });
    location.reload();
  }

  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/profile` } });
  }

  if (!profile) {
    return (
      <div className="rounded-3xl bg-white p-5 shadow-soft dark:bg-slate-900">
        <h2 className="text-2xl font-black">Войти</h2>
        <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-3 w-full rounded-xl border p-3 text-slate-950" />
        <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border p-3 text-slate-950" />
        <button onClick={signIn} className="mt-3 w-full rounded-xl bg-brain-500 py-3 font-bold text-white">Email login</button>
        <button onClick={signInGoogle} className="mt-2 w-full rounded-xl bg-slate-900 py-3 font-bold text-white">Google OAuth</button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-soft dark:bg-slate-900">
      <h2 className="text-3xl font-black">{profile.name ?? profile.email}</h2>
      <p className="text-slate-500">Город: {profile.city ?? 'не указан'}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800"><b>Среднее время</b><br />08:40</div>
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800"><b>Точность</b><br />94%</div>
        <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800"><b>Пройдено</b><br />27</div>
      </div>
      <div className="mt-4 rounded-xl bg-morning-100 p-4 text-morning-600">Бейджи: Morning Streak 🏅, Алматы Top 100 🌆</div>
    </div>
  );
}
