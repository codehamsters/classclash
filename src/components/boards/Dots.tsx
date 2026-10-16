import type { Dots as S, DotsMove } from "@/games/dots";
import Scores from "./Scores";
import type { BoardProps } from "./types";

const DOT = "22px"; // dot rows double as the tap target for lines

export default function Dots({ s, me, act, colors, names }: BoardProps<S, DotsMove>) {
  const mine = !s.over && s.turn === me;
  const { R, C } = s;
  const track = (n: number) => Array.from({ length: 2 * n + 1 }, (_, k) => (k % 2 ? "1fr" : DOT)).join(" ");

  const line = (d: "h" | "v", i: number, row: number, col: number) => {
    const v = (d === "h" ? s.h : s.v)[i];
    return (
      <button
        key={d + i}
        type="button"
        disabled={!mine || v !== -1}
        onClick={() => act({ d, i })}
        aria-label={`${d === "h" ? "Horizontal" : "Vertical"} line ${i + 1}`}
        className={`group grid place-items-center ${mine && v === -1 ? "cursor-pointer" : ""}`}
        style={{ gridRow: row, gridColumn: col }}
      >
        <span
          className={`block rounded-full ${d === "h" ? "h-1 w-full" : "h-full w-1"} ${v === -1 ? (mine ? "bg-chalk/10 group-hover:bg-chalk/45" : "bg-chalk/10") : ""}`}
          style={v >= 0 ? { background: colors[v] } : undefined}
        />
      </button>
    );
  };

  const cells = [];
  for (let r = 0; r <= R; r++) {
    for (let c = 0; c <= C; c++) {
      cells.push(<span key={`d${r}-${c}`} className="m-auto block size-2 rounded-full bg-chalk" style={{ gridRow: 2 * r + 1, gridColumn: 2 * c + 1 }} />);
      if (c < C) cells.push(line("h", r * C + c, 2 * r + 1, 2 * c + 2));
      if (r < R) cells.push(line("v", r * (C + 1) + c, 2 * r + 2, 2 * c + 1));
      if (r < R && c < C) {
        const o = s.box[r * C + c];
        cells.push(
          <span
            key={`b${r}-${c}`}
            className="grid place-items-center font-chalk text-2xl"
            style={{ gridRow: 2 * r + 2, gridColumn: 2 * c + 2, ...(o >= 0 && { background: `${colors[o]}2e`, color: colors[o] }) }}
          >
            {o >= 0 ? names[o].slice(0, 1).toUpperCase() : ""}
          </span>,
        );
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      <Scores scores={s.scores} names={names} colors={colors} turn={s.turn} />
      <div className="grid aspect-square w-full" style={{ gridTemplateColumns: track(C), gridTemplateRows: track(R) }}>
        {cells}
      </div>
    </div>
  );
}
