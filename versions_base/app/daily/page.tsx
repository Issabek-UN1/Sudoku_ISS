import { SudokuGrid } from '@/components/SudokuGrid';
import { Controls } from '@/components/Controls';
import { Timer } from '@/components/Timer';
import { DailyChallenge } from '@/components/DailyChallenge';

export default function DailyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-morning-600">Daily Challenge</p>
          <h1 className="text-3xl font-black">Сегодняшнее утреннее Судоку</h1>
        </div>
        <Timer />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-3xl bg-white p-4 shadow-soft dark:bg-slate-900">
          <SudokuGrid />
          <Controls />
        </section>
        <DailyChallenge />
      </div>
    </main>
  );
}
