"use client";

import { useEffect } from "react";
import clsx from "clsx";
import { SudokuCell } from "./SudokuCell";
import { useGameStore } from "@/lib/zustand/store";

export function SudokuGrid() {
  const board = useGameStore((s) => s.board);
  const fixed = useGameStore((s) => s.fixed);
  const notes = useGameStore((s) => s.notes);
  const selected = useGameStore((s) => s.selected);
  const mistakes = useGameStore((s) => s.mistakes);
  const selectCell = useGameStore((s) => s.selectCell);
  const hasConflict = useGameStore((s) => s.hasConflict);
  const completed = useGameStore((s) => s.completed);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (completed) return;

      const { selected, selectCell } = useGameStore.getState();

      // Arrow key navigation
      if (
        selected &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
        const { row, col } = selected;
        if (e.key === "ArrowUp") selectCell(Math.max(0, row - 1), col);
        if (e.key === "ArrowDown") selectCell(Math.min(8, row + 1), col);
        if (e.key === "ArrowLeft") selectCell(row, Math.max(0, col - 1));
        if (e.key === "ArrowRight") selectCell(row, Math.min(8, col + 1));
        return;
      }

      // Number input 1–9
      if (/^[1-9]$/.test(e.key)) {
        useGameStore.getState().setValue(Number(e.key));
        return;
      }

      // Delete / Backspace clears the cell
      if (e.key === "Delete" || e.key === "Backspace") {
        useGameStore.getState().setValue(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [completed]);

  return (
    <div className="mx-auto grid max-w-[560px] grid-cols-9 overflow-hidden rounded-2xl border-4 border-slate-900 dark:border-slate-100">
      {board.map((row, r) =>
        row.map((value, c) => (
          <div
            key={`${r}-${c}`}
            className={clsx(
              c === 2 || c === 5
                ? "border-r-4 border-r-slate-900 dark:border-r-slate-100"
                : "",
              r === 2 || r === 5
                ? "border-b-4 border-b-slate-900 dark:border-b-slate-100"
                : "",
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
        )),
      )}
    </div>
  );
}
