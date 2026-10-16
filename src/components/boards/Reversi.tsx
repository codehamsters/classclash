import { flips, type Reversi as S } from "@/games/reversi";
import Scores from "./Scores";
import type { BoardProps } from "./types";

export default function Reversi({ s, me, act, colors, names }: BoardProps<S, number>) {
  const mine = !s.over && s.turn === me;
  const counts = [0, 1].map((p) => s.b.filter((v) => v === p).length);
  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      <Scores scores={counts} names={names} colors={colors} turn={s.turn} />
      {s.passed && !s.over && <p className="text-sm text-dust">{names[1 - (s.turn ?? 0)]} had no move, so {names[s.turn ?? 0]} goes again.</p>}
      <div className="grid grid-cols-8 gap-px overflow-hidden rounded-lg border-2 border-chalk/30 bg-chalk/20">
        {s.b.map((v, i) => {
          const legal = mine && v === -1 && flips(s.b, me, i).length > 0;
          return (
            <button
              key={i}
              type="button"
              disabled={!legal}
              onClick={() => act(i)}
              aria-label={`Row ${Math.floor(i / 8) + 1}, column ${(i % 8) + 1}`}
              className={`grid aspect-square place-items-center bg-board-2 ${legal ? "hover:bg-board-3" : ""}`}
            >
              {v >= 0 ? (
                <span className={`block size-4/5 rounded-full ${i === s.last ? "ring-2 ring-chalk/70" : ""}`} style={{ background: colors[v] }} />
              ) : legal ? (
                <span className="block size-1/5 rounded-full bg-chalk/40" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
