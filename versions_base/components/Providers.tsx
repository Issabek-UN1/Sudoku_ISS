'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { useGameStore } from '@/lib/zustand/store';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  const theme = useGameStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
