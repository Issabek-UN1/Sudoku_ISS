'use client';

import { useState } from 'react';

export function UpgradeToPro() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-xl bg-morning-500 px-4 py-2 font-black text-white">Upgrade to Pro</button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-w-md rounded-3xl bg-white p-6 text-slate-950 shadow-soft">
            <h2 className="text-2xl font-black">Brain Morning Pro</h2>
            <p className="mt-2 text-slate-600">$4.99/мес или $49.99/год</p>
            <ul className="mt-4 list-disc pl-5 text-sm">
              <li>Кастомные скины сетки</li>
              <li>Безлимитные hints</li>
              <li>Без рекламы</li>
              <li>Expert+ уровни</li>
            </ul>
            <button onClick={() => alert('Stripe Checkout mock: подключите price_id для production.')} className="mt-5 w-full rounded-xl bg-brain-500 py-3 font-bold text-white">
              Continue to Stripe
            </button>
            <button onClick={() => setOpen(false)} className="mt-2 w-full rounded-xl bg-slate-100 py-3 font-bold">Закрыть</button>
          </div>
        </div>
      )}
    </>
  );
}
