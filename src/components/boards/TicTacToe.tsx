import type { TicTacToe as S } from "@/games/tictactoe";
import type { BoardProps } from "./types";

const MARK = ["X", "O"];

export default function TicTacToe({ s, me, act, colors }: BoardProps<S, number>) {
  const mine = !s.over && s.turn === me;
  return (
    <div className="mx-auto grid w-full max-w-xs grid-cols-3">
      {s.b.map((v, i) => (
        <button
          key={i}
          type="button"
          disabled={!mine || v !== -1}
          onClick={() => act(i)}
          aria-label={`Square ${i + 1}${v >= 0 ? `, ${MARK[v]}` : ""}`}
          className={`aspect-square border-chalk/40 font-chalk text-6xl font-bold ${i % 3 < 2 ? "border-r-2" : ""} ${i < 6 ? "border-b-2" : ""} ${mine && v === -1 ? "hover:bg-chalk/5" : ""} ${s.line.length && !s.line.includes(i) ? "opacity-35" : ""}`}
          style={{ color: v >= 0 ? colors[v] : undefined }}
        >
          {v >= 0 ? MARK[v] : ""}
        </button>
      ))}
    </div>
  );
}
