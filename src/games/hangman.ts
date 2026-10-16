import type { Base, Game } from "./types";
import { leaders } from "./util.ts";

export const MAX_WRONG = 6;

/** each player sets one word per match; everyone else takes turns guessing letters */
export type Hangman = Base & {
  n: number;
  round: number;
  setter: number;
  phase: "set" | "guess" | "reveal";
  word: string;
  guessed: string[];
  wrong: number;
  solved: boolean;
  scores: number[];
};
export type HangmanMove = { t: "set"; w: string } | { t: "guess"; l: string } | { t: "next" };

const nextGuesser = (s: Hangman, from: number) => {
  let t = (from + 1) % s.n;
  if (t === s.setter) t = (t + 1) % s.n;
  return t;
};

const fresh = (n: number, round: number, scores: number[]): Hangman => ({
  turn: round, over: false, winners: [], n, round, setter: round,
  phase: "set", word: "", guessed: [], wrong: 0, solved: false, scores,
});

export const hangman: Game<Hangman, HangmanMove> = {
  id: "hangman",
  name: "Hangman",
  blurb: "Pick a secret word. Everyone else hunts letters.",
  min: 2,
  max: 6,
  init: (n) => fresh(n, 0, Array(n).fill(0)),
  move(prev, seat, m) {
    if (prev.over) return null;
    if (m.t === "set") {
      const w = String(m.w ?? "").trim().toLowerCase();
      if (prev.phase !== "set" || seat !== prev.setter || !/^[a-z]{3,12}$/.test(w)) return null;
      return { ...prev, word: w, phase: "guess", turn: nextGuesser(prev, prev.setter) };
    }
    if (m.t === "guess") {
      const l = String(m.l ?? "").toLowerCase();
      if (prev.phase !== "guess" || seat !== prev.turn || !/^[a-z]$/.test(l) || prev.guessed.includes(l)) return null;
      const s = structuredClone(prev);
      s.guessed.push(l);
      if (!s.word.includes(l)) s.wrong++;
      s.solved = [...s.word].every((c) => s.guessed.includes(c));
      if (s.solved) s.scores = s.scores.map((v, i) => (i === s.setter ? v : v + 1));
      else if (s.wrong >= MAX_WRONG) s.scores[s.setter] += 2;
      if (s.solved || s.wrong >= MAX_WRONG) Object.assign(s, { phase: "reveal", turn: null });
      else s.turn = nextGuesser(s, seat);
      return s;
    }
    if (m.t === "next" && prev.phase === "reveal") {
      if (prev.round + 1 >= prev.n) return { ...prev, over: true, turn: null, winners: leaders(prev.scores) };
      return fresh(prev.n, prev.round + 1, prev.scores);
    }
    return null;
  },
};
