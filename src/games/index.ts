import type { Game } from "./types";
import { tictactoe } from "./tictactoe.ts";
import { connect4 } from "./connect4.ts";
import { reversi } from "./reversi.ts";
import { dots } from "./dots.ts";
import { battleship } from "./battleship.ts";
import { hangman } from "./hangman.ts";
import { memory } from "./memory.ts";

export const GAMES: Game[] = [tictactoe, connect4, dots, battleship, hangman, memory, reversi];
export const gameById = (id: string | null) => GAMES.find((g) => g.id === id);
