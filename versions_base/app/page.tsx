import Link from 'next/link';
import { SudokuGrid } from '@/components/SudokuGrid';
import { Controls } from '@/components/Controls';
import { Timer } from '@/components/Timer';
import { DifficultySelector } from '@/components/DifficultySelector';
import { AICoach } from '@/components/AICoach';
import { DailyChallenge } from '@/components/DailyChallenge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UpgradeToPro } from '@/components/UpgradeToPro';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white/80 p-4 shadow-soft dark:bg-slate-900/80">
        <div>
          <p className="text-sm font-semibold text-morning-600">Brain Morning Sudoku</p>
          <h1 className="text-2xl font-black md:text-4xl">Разогрей мозг за 10 минут</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/daily">Daily</Link>
          <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/leaderboard">Leaderboard</Link>
          <Link className="rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="/profile">Profile</Link>
          <ThemeToggle />
          <UpgradeToPro />
        </nav>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl bg-white p-4 shadow-soft dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <DifficultySelector />
            <Timer />
          </div>
          <SudokuGrid />
          <Controls />
        </div>

        <aside className="space-y-4">
          <DailyChallenge />
          <AICoach />
          <div className="rounded-3xl bg-white p-5 shadow-soft dark:bg-slate-900">
            <h2 className="text-xl font-bold">Утренний режим</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Короткие сессии 5–10 минут, мотивация и прогресс: «Сегодня ты решил на 15% быстрее».
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
