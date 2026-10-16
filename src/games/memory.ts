import type { Base, Game } from "./types";
import { leaders, shuffle } from "./util.ts";

const FACES = ["🍕", "🚀", "🐙", "🎸", "🌵", "🦊", "🍩", "⚡", "🎲", "🪐"];

/** up = cards flipped this turn; miss = last failed pair, shown until the next flip */
export type Memory = Base & { n: number; cards: string[]; owner: number[]; up: number[]; miss: number[]; scores: number[] };

export const memory: Game<Memory, number> = {
  id: "memory",
  name: "Memory",
  blurb: "Flip two. Remember everything.",
  min: 2,
  max: 6,
  init: (n) => ({
    turn: 0, over: false, winners: [], n,
    cards: shuffle([...FACES, ...FACES]),
    owner: Array(FACES.length * 2).fill(-1),
    up: [], miss: [], scores: Array(n).fill(0),
  }),
  move(prev, seat, i) {
    if (prev.over || prev.turn !== seat || prev.owner[i] !== -1 || prev.up.includes(i)) return null;
    const s = structuredClone(prev);
    if (!s.up.length) s.miss = [];
    s.up.push(i);
    if (s.up.length < 2) return s;
    const [a, b] = s.up;
    s.up = [];
    if (s.cards[a] === s.cards[b]) {
      s.owner[a] = s.owner[b] = seat;
      s.scores[seat]++;
      if (!s.owner.includes(-1)) Object.assign(s, { over: true, turn: null, winners: leaders(s.scores) });
    } else {
      s.miss = [a, b];
      s.turn = (seat + 1) % s.n;
    }
    return s;
  },
};
