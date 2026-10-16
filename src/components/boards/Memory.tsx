import type { Memory as S } from "@/games/memory";
import Scores from "./Scores";
import type { BoardProps } from "./types";

export default function Memory({ s, me, act, colors, names }: BoardProps<S, number>) {
  const mine = !s.over && s.turn === me;
  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      <Scores scores={s.scores} names={names} colors={colors} turn={s.turn} />
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {s.cards.map((face, i) => {
          const owner = s.owner[i];
          const up = owner >= 0 || s.up.includes(i) || s.miss.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={!mine || up && !s.miss.includes(i)}
              onClick={() => act(i)}
              aria-label={up ? face : `Card ${i + 1}, face down`}
              className={`grid aspect-square place-items-center rounded-lg border-2 text-3xl ${up ? "bg-board-3" : "bg-board-2 enabled:hover:border-chalk/50"} ${s.miss.includes(i) ? "border-c-pink/60" : "border-chalk/20"}`}
              style={owner >= 0 ? { borderColor: colors[owner] } : undefined}
            >
              {up ? face : <span className="font-chalk text-xl text-chalk/25">?</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
