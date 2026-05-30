'use client';

import clsx from 'clsx';

type Props = {
  value: number | null;
  notes: number[];
  fixed: boolean;
  selected: boolean;
  conflict: boolean;
  mistaken: boolean;
  onClick: () => void;
};

export function SudokuCell({ value, notes, fixed, selected, conflict, mistaken, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative aspect-square border border-slate-300 text-center text-xl font-bold transition md:text-3xl dark:border-slate-700',
        'focus:outline-none focus:ring-2 focus:ring-brain-500',
        fixed ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white' : 'bg-white text-brain-700 dark:bg-slate-950 dark:text-morning-100',
        selected && 'bg-morning-100 dark:bg-brain-700/40',
        conflict && 'bg-red-100 text-red-700 dark:bg-red-950',
        mistaken && 'after:absolute after:right-1 after:top-1 after:h-2 after:w-2 after:rounded-full after:bg-red-500'
      )}
    >
      {value ? (
        value
      ) : (
        <span className="grid h-full grid-cols-3 grid-rows-3 p-1 text-[10px] font-medium text-slate-400 md:text-xs">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i}>{notes.includes(i + 1) ? i + 1 : ''}</span>
          ))}
        </span>
      )}
    </button>
  );
}
