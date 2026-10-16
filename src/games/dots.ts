import type { Base, Game } from "./types";
import { leaders } from "./util.ts";

/** h: (R+1)*C horizontal lines, v: R*(C+1) vertical lines; -1 = undrawn, else seat */
export type Dots = Base & { n: number; R: number; C: number; h: number[]; v: number[]; box: number[]; scores: number[] };
export type DotsMove = { d: "h" | "v"; i: number };

export const dots: Game<Dots, DotsMove> = {
  id: "dots",
  name: "Dots & Boxes",
  blurb: "Close a box, take another turn.",
  rules: [
    "Take turns drawing one line between two neighbouring dots.",
    "Draw the fourth side of a box to claim it, then take another turn.",
    "When every box is claimed, whoever has the most boxes wins.",
  ],
  min: 2,
  max: 6,
  init(n) {
    const R = n <= 2 ? 4 : 5, C = R;
    return {
      turn: 0, over: false, winners: [], n, R, C,
      h: Array((R + 1) * C).fill(-1),
      v: Array(R * (C + 1)).fill(-1),
      box: Array(R * C).fill(-1),
      scores: Array(n).fill(0),
    };
  },
  move(prev, seat, { d, i }) {
    const lines = d === "h" ? prev.h : d === "v" ? prev.v : null;
    if (prev.over || prev.turn !== seat || !lines || lines[i] !== -1) return null;
    const s = structuredClone(prev);
    const { R, C } = s;
    (d === "h" ? s.h : s.v)[i] = seat;
    const r = d === "h" ? Math.floor(i / C) : Math.floor(i / (C + 1));
    const c = d === "h" ? i % C : i % (C + 1);
    const touched = d === "h" ? [[r - 1, c], [r, c]] : [[r, c - 1], [r, c]];
    let closed = 0;
    for (const [br, bc] of touched) {
      if (br < 0 || br >= R || bc < 0 || bc >= C) continue;
      const b = br * C + bc;
      const done = s.h[br * C + bc] >= 0 && s.h[(br + 1) * C + bc] >= 0 && s.v[br * (C + 1) + bc] >= 0 && s.v[br * (C + 1) + bc + 1] >= 0;
      if (done && s.box[b] === -1) {
        s.box[b] = seat;
        s.scores[seat]++;
        closed++;
      }
    }
    if (!s.box.includes(-1)) Object.assign(s, { over: true, turn: null, winners: leaders(s.scores) });
    else if (!closed) s.turn = (seat + 1) % s.n;
    return s;
  },
};
