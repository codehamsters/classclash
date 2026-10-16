// Every game state is plain JSON so the host can broadcast it to peers as-is.
export type Base = {
  /** seat whose move it is; null when everyone acts at once (e.g. setup) */
  turn: number | null;
  over: boolean;
  /** winning seats once over; empty + over = draw */
  winners: number[];
};

export type Game<S extends Base = any, M = any> = {
  id: string;
  name: string;
  blurb: string;
  /** how to play, one short sentence per step */
  rules: string[];
  min: number;
  max: number;
  init: (players: number) => S;
  /** returns the next state, or null if the move is illegal */
  move: (state: S, seat: number, move: M) => S | null;
};
