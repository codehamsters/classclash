import type { Base, Game } from "./types";
import { findLine } from "./util.ts";

export const C4_W = 7, C4_H = 6;
export type Connect4 = Base & { b: number[]; last: number; line: number[] };

export const connect4: Game<Connect4, number> = {
  id: "connect4",
  name: "Connect Four",
  blurb: "Drop discs. Line up four before they do.",
  min: 2,
  max: 2,
  init: () => ({ turn: 0, over: false, winners: [], b: Array(C4_W * C4_H).fill(-1), last: -1, line: [] }),
  move(prev, seat, col) {
    if (prev.over || prev.turn !== seat || col < 0 || col >= C4_W) return null;
    let i = -1;
    for (let r = C4_H - 1; r >= 0; r--) if (prev.b[r * C4_W + col] === -1) { i = r * C4_W + col; break; }
    if (i < 0) return null;
    const s = structuredClone(prev);
    s.b[i] = seat;
    s.last = i;
    const line = findLine(s.b, C4_W, C4_H, i, 4);
    if (line) Object.assign(s, { over: true, winners: [seat], line, turn: null });
    else if (!s.b.includes(-1)) Object.assign(s, { over: true, turn: null });
    else s.turn = 1 - seat;
    return s;
  },
};
