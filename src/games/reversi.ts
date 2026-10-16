import type { Base, Game } from "./types";
import { leaders } from "./util.ts";

export type Reversi = Base & { b: number[]; last: number; passed: boolean };

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

/** discs flipped if `seat` plays at i; empty = illegal */
export function flips(b: number[], seat: number, i: number): number[] {
  if (b[i] !== -1) return [];
  const out: number[] = [];
  for (const [dx, dy] of DIRS) {
    const run: number[] = [];
    let x = (i % 8) + dx, y = Math.floor(i / 8) + dy;
    while (x >= 0 && x < 8 && y >= 0 && y < 8 && b[y * 8 + x] === 1 - seat) {
      run.push(y * 8 + x);
      x += dx;
      y += dy;
    }
    if (run.length && x >= 0 && x < 8 && y >= 0 && y < 8 && b[y * 8 + x] === seat) out.push(...run);
  }
  return out;
}

export const canPlay = (b: number[], seat: number) => b.some((_, i) => flips(b, seat, i).length > 0);

export const reversi: Game<Reversi, number> = {
  id: "reversi",
  name: "Reversi",
  blurb: "Flank to flip. Most discs at the end wins.",
  min: 2,
  max: 2,
  init() {
    const b = Array(64).fill(-1);
    b[27] = b[36] = 1;
    b[28] = b[35] = 0;
    return { turn: 0, over: false, winners: [], b, last: -1, passed: false };
  },
  move(prev, seat, i) {
    if (prev.over || prev.turn !== seat) return null;
    const f = flips(prev.b, seat, i);
    if (!f.length) return null;
    const s = structuredClone(prev);
    for (const j of [i, ...f]) s.b[j] = seat;
    s.last = i;
    s.passed = false;
    if (canPlay(s.b, 1 - seat)) s.turn = 1 - seat;
    else if (canPlay(s.b, seat)) s.passed = true; // opponent has no move: same player goes again
    else {
      const count = [0, 1].map((p) => s.b.filter((v) => v === p).length);
      Object.assign(s, { over: true, turn: null, winners: count[0] === count[1] ? [] : leaders(count) });
    }
    return s;
  },
};
