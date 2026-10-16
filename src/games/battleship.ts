import type { Base, Game } from "./types";

export const BS_N = 8;
export const FLEET = [4, 3, 3, 2, 2];

/** ships[seat] = list of ships, each a list of cells; shots[seat] = cells fired at seat's board */
export type Battleship = Base & {
  phase: "setup" | "play";
  ships: number[][][];
  ready: boolean[];
  shots: number[][];
  last: { by: number; i: number; hit: boolean; sunk: number } | null;
};
export type BattleshipMove = { t: "shuffle" } | { t: "ready" } | { t: "fire"; i: number };

// shortcut: every peer receives the whole state, so a player could read enemy ships in devtools; fine for friends, needs per-peer state if this goes competitive
export function randomFleet(): number[][] {
  const used = new Set<number>();
  return FLEET.map((len) => {
    for (;;) {
      const horiz = Math.random() < 0.5;
      const x = Math.floor(Math.random() * (horiz ? BS_N - len + 1 : BS_N));
      const y = Math.floor(Math.random() * (horiz ? BS_N : BS_N - len + 1));
      const cells = Array.from({ length: len }, (_, k) => (horiz ? y * BS_N + x + k : (y + k) * BS_N + x));
      if (cells.some((c) => used.has(c))) continue;
      cells.forEach((c) => used.add(c));
      return cells;
    }
  });
}

export const battleship: Game<Battleship, BattleshipMove> = {
  id: "battleship",
  name: "Battleship",
  blurb: "Hide your fleet. Hunt theirs.",
  rules: [
    "Shuffle until you like your fleet, then lock it in. Ships are 4, 3, 3, 2 and 2 squares long.",
    "Take turns firing at a square in your opponent's waters. ✕ is a hit, a dot is a miss.",
    "Sink every ship in their fleet to win.",
  ],
  min: 2,
  max: 2,
  init: () => ({
    turn: null, over: false, winners: [], phase: "setup",
    ships: [randomFleet(), randomFleet()], ready: [false, false], shots: [[], []], last: null,
  }),
  move(prev, seat, m) {
    if (prev.over) return null;
    const s = structuredClone(prev);
    if (m.t === "shuffle" || m.t === "ready") {
      if (s.phase !== "setup" || s.ready[seat]) return null;
      if (m.t === "shuffle") s.ships[seat] = randomFleet();
      else s.ready[seat] = true;
      if (s.ready.every(Boolean)) Object.assign(s, { phase: "play", turn: 0 });
      return s;
    }
    if (m.t !== "fire" || s.phase !== "play" || s.turn !== seat || m.i < 0 || m.i >= BS_N * BS_N) return null;
    const foe = 1 - seat;
    if (s.shots[foe].includes(m.i)) return null;
    s.shots[foe].push(m.i);
    const ship = s.ships[foe].find((sh) => sh.includes(m.i));
    const sunk = ship && ship.every((c) => s.shots[foe].includes(c)) ? ship.length : 0;
    s.last = { by: seat, i: m.i, hit: !!ship, sunk };
    if (s.ships[foe].flat().every((c) => s.shots[foe].includes(c))) Object.assign(s, { over: true, turn: null, winners: [seat] });
    else s.turn = foe;
    return s;
  },
};
