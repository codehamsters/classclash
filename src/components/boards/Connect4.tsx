import { C4_H, C4_W, type Connect4 as S } from "@/games/connect4";
import type { BoardProps } from "./types";

export default function Connect4({ s, me, act, colors }: BoardProps<S, number>) {
  const mine = !s.over && s.turn === me;
  return (
    <div className="mx-auto grid w-full max-w-sm grid-cols-7 gap-1 rounded-xl border-2 border-chalk/30 p-1.5">
      {Array.from({ length: C4_W }, (_, c) => (
        <button
          key={c}
          type="button"
          disabled={!mine || s.b[c] !== -1}
          onClick={() => act(c)}
          aria-label={`Drop in column ${c + 1}`}
          className={`grid gap-1 rounded-md p-0.5 ${mine && s.b[c] === -1 ? "hover:bg-chalk/10" : ""}`}
        >
          {Array.from({ length: C4_H }, (_, r) => {
            const i = r * C4_W + c, v = s.b[i];
            const dim = s.line.length > 0 && !s.line.includes(i);
            return (
              <span
                key={r}
                className={`block aspect-square rounded-full border-2 ${i === s.last && !s.over ? "ring-2 ring-chalk/60 ring-offset-1 ring-offset-board" : ""} ${dim ? "opacity-40" : ""}`}
                style={v >= 0 ? { background: colors[v], borderColor: colors[v] } : { borderColor: "rgb(233 230 218 / 0.14)" }}
              />
            );
          })}
        </button>
      ))}
    </div>
  );
}
