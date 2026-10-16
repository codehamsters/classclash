import type { Base, Game } from "./types";
import { findLine } from "./util.ts";

export type TicTacToe = Base & { b: number[]; line: number[] };

export const tictactoe: Game<TicTacToe, number> = {
  id: "tictactoe",
  name: "Tic-Tac-Toe",
  blurb: "Three in a row. Ten seconds a round.",
  min: 2,
  max: 2,
  init: () => ({ turn: 0, over: false, winners: [], b: Array(9).fill(-1), line: [] }),
  move(prev, seat, i) {
    if (prev.over || prev.turn !== seat || prev.b[i] !== -1) return null;
    const s = structuredClone(prev);
    s.b[i] = seat;
    const line = findLine(s.b, 3, 3, i, 3);
    if (line) Object.assign(s, { over: true, winners: [seat], line, turn: null });
    else if (!s.b.includes(-1)) Object.assign(s, { over: true, turn: null });
    else s.turn = 1 - seat;
    return s;
  },
};
