'use client';

import clsx from 'clsx';
import { SudokuCell } from './SudokuCell';
import { useGameStore } from '@/lib/zustand/store';

export function SudokuGrid() {
  const board = useGameStore((s) => s.board);
  const fixed = useGameStore((s) => s.fixed);
  const notes = useGameStore((s) => s.notes);
  const selected = useGameStore((s) => s.selected);
  const mistakes = useGameStore((s) => s.mistakes);
  const selectCell = useGameStore((s) => s.selectCell);
  const hasConflict = useGameStore((s) => s.hasConflict);

  return (
    <div className="mx-auto grid max-w-[560px] grid-cols-9 overflow-hidden rounded-2xl border-4 border-slate-900 dark:border-slate-100">
      {board.map((row, r) =>
        row.map((value, c) => (
          <div
            key={`${r}-${c}`}
            className={clsx(
              c === 2 || c === 5 ? 'border-r-4 border-r-slate-900 dark:border-r-slate-100' : '',
              r === 2 || r === 5 ? 'border-b-4 border-b-slate-900 dark:border-b-slate-100' : ''
            )}
          >
            <SudokuCell
              value={value}
              notes={notes[r][c]}
              fixed={fixed[r][c]}
              selected={selected?.row === r && selected?.col === c}
              conflict={hasConflict(r, c)}
              mistaken={mistakes.some((m) => m.row === r && m.col === c)}
              onClick={() => selectCell(r, c)}
            />
          </div>
        ))
      )}
    </div>
  );
}
