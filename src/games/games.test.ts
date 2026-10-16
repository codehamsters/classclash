// run: npm test  (node's built-in runner, types stripped natively)
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Game } from "./types";
import { tictactoe } from "./tictactoe.ts";
import { connect4 } from "./connect4.ts";
import { reversi, canPlay } from "./reversi.ts";
import { dots } from "./dots.ts";
import { battleship, FLEET } from "./battleship.ts";
import { hangman, MAX_WRONG } from "./hangman.ts";
import { memory } from "./memory.ts";

/** apply [seat, move] pairs, failing on any illegal move */
function play<S, M>(g: Game<any, M>, s: S, moves: [number, M][]): any {
  for (const [seat, m] of moves) {
    const next = g.move(s as any, seat, m);
    assert.ok(next, `illegal: seat ${seat} ${JSON.stringify(m)}`);
    s = next;
  }
  return s;
}

test("tictactoe: row win, turn order, no overwrite", () => {
  const s0 = tictactoe.init(2);
  assert.equal(tictactoe.move(s0, 1, 0), null);
  const s = play(tictactoe, s0, [[0, 0], [1, 3], [0, 1], [1, 4], [0, 2]]);
  assert.deepEqual(s.winners, [0]);
  assert.equal(s.over, true);
  assert.equal(tictactoe.move(play(tictactoe, s0, [[0, 4]]), 1, 4), null);
});

test("tictactoe: draw", () => {
  const s = play(tictactoe, tictactoe.init(2), [[0, 0], [1, 1], [0, 2], [1, 4], [0, 3], [1, 5], [0, 7], [1, 6], [0, 8]]);
  assert.equal(s.over, true);
  assert.deepEqual(s.winners, []);
});

test("connect4: vertical win and full column", () => {
  const s = play(connect4, connect4.init(2), [[0, 0], [1, 1], [0, 0], [1, 1], [0, 0], [1, 1], [0, 0]]);
  assert.deepEqual(s.winners, [0]);
  let c = connect4.init(2);
  for (let k = 0; k < 6; k++) c = connect4.move(c, k % 2, 3)!;
  assert.equal(connect4.move(c, 0, 3), null);
});

test("reversi: opening flip and illegal move", () => {
  const s0 = reversi.init(2);
  assert.equal(reversi.move(s0, 0, 0), null);
  const s = play(reversi, s0, [[0, 19]]);
  assert.equal(s.b[27], 0);
  assert.equal(s.turn, 1);
  assert.ok(canPlay(s.b, 1));
});

test("dots: closing a box scores and keeps the turn", () => {
  // 4x4 boxes: h index r*4+c, v index r*5+c; box 0 needs h0, h4, v0, v1
  const s = play(dots, dots.init(2), [[0, { d: "h", i: 0 }], [1, { d: "h", i: 4 }], [0, { d: "v", i: 0 }], [1, { d: "v", i: 1 }]]);
  assert.equal(s.box[0], 1);
  assert.equal(s.scores[1], 1);
  assert.equal(s.turn, 1);
  assert.equal(dots.move(s, 1, { d: "h", i: 0 }), null);
});

test("dots: 3 players rotate, bigger grid", () => {
  const s = play(dots, dots.init(3), [[0, { d: "h", i: 0 }], [1, { d: "h", i: 1 }], [2, { d: "h", i: 2 }]]);
  assert.equal(s.R, 5);
  assert.equal(s.turn, 0);
});

test("battleship: fleet valid, setup then sink everything", () => {
  let s = battleship.init(2);
  for (const fleet of s.ships) {
    const cells = fleet.flat();
    assert.equal(new Set(cells).size, FLEET.reduce((a, b) => a + b));
    assert.deepEqual(fleet.map((f: number[]) => f.length), FLEET);
  }
  assert.equal(battleship.move(s, 0, { t: "fire", i: 0 }), null);
  s = play(battleship, s, [[0, { t: "ready" }], [1, { t: "ready" }]]);
  assert.equal(s.phase, "play");
  assert.equal(battleship.move(s, 0, { t: "shuffle" }), null);
  const targets = s.ships[1].flat();
  const misses = Array.from({ length: 64 }, (_, i) => i).filter((i) => !s.ships[0].flat().includes(i));
  for (let k = 0; k < targets.length; k++) {
    s = play(battleship, s, [[0, { t: "fire", i: targets[k] }]]);
    if (!s.over) s = play(battleship, s, [[1, { t: "fire", i: misses[k] }]]);
  }
  assert.deepEqual(s.winners, [0]);
});

test("hangman: solve, hang, rotate setter, finish", () => {
  let s = hangman.init(2);
  assert.equal(hangman.move(s, 0, { t: "set", w: "a1" }), null);
  s = play(hangman, s, [[0, { t: "set", w: "Cat" }], [1, { t: "guess", l: "c" }], [1, { t: "guess", l: "a" }], [1, { t: "guess", l: "t" }]]);
  assert.equal(s.phase, "reveal");
  assert.deepEqual(s.scores, [0, 1]);
  s = play(hangman, s, [[1, { t: "next" }], [1, { t: "set", w: "dog" }]]);
  for (const l of "uvwxyz".slice(0, MAX_WRONG)) s = play(hangman, s, [[0, { t: "guess", l }]]);
  assert.deepEqual(s.scores, [0, 3]);
  s = play(hangman, s, [[0, { t: "next" }]]);
  assert.equal(s.over, true);
  assert.deepEqual(s.winners, [1]);
});

test("hangman: guessers rotate around the setter", () => {
  const s = play(hangman, hangman.init(3), [[0, { t: "set", w: "zebra" }], [1, { t: "guess", l: "q" }]]);
  assert.equal(s.turn, 2);
  assert.equal(play(hangman, s, [[2, { t: "guess", l: "j" }]]).turn, 1);
});

test("memory: match keeps turn, miss passes it", () => {
  const s0 = memory.init(2);
  const a = s0.cards.indexOf("🍕"), b = s0.cards.lastIndexOf("🍕");
  const other = s0.cards.findIndex((c: string) => c !== "🍕");
  let s = play(memory, s0, [[0, a], [0, b]]);
  assert.equal(s.scores[0], 1);
  assert.equal(s.turn, 0);
  s = play(memory, s, [[0, other], [0, s.cards.findIndex((c: string, i: number) => c !== s.cards[other] && s.owner[i] === -1 && i !== other)]]);
  assert.equal(s.turn, 1);
  assert.equal(s.miss.length, 2);
});
