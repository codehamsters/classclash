import { BS_N, type Battleship as S, type BattleshipMove } from "@/games/battleship";
import type { BoardProps } from "./types";

/** one 8x8 sea; `fleet` true shows ship positions (only ever your own) */
function Sea({ s, seat, fleet, onFire, label }: { s: S; seat: number; fleet: boolean; onFire?: (i: number) => void; label: string }) {
  const ships = s.ships[seat], shots = s.shots[seat];
  const shipAt = (i: number) => ships.find((sh) => sh.includes(i));
  return (
    <div className="grid grid-cols-8 gap-px overflow-hidden rounded-lg border-2 border-chalk/30 bg-chalk/15" role="grid" aria-label={label}>
      {Array.from({ length: BS_N * BS_N }, (_, i) => {
        const ship = shipAt(i), shot = shots.includes(i);
        const sunk = ship && ship.every((c) => shots.includes(c));
        const canFire = onFire && !shot;
        return (
          <button
            key={i}
            type="button"
            disabled={!canFire}
            onClick={() => onFire?.(i)}
            aria-label={`${String.fromCharCode(65 + Math.floor(i / BS_N))}${(i % BS_N) + 1}${shot ? (ship ? " hit" : " miss") : ""}`}
            className={`grid aspect-square place-items-center ${sunk ? "bg-c-pink/35" : (fleet || shot) && ship ? "bg-chalk/25" : "bg-board-2"} ${canFire ? "hover:bg-board-3" : ""}`}
          >
            {shot && (ship ? <span className="font-chalk text-lg font-bold text-c-pink">✕</span> : <span className="block size-1.5 rounded-full bg-chalk/50" />)}
          </button>
        );
      })}
    </div>
  );
}

export default function Battleship({ s, me, act, names }: BoardProps<S, BattleshipMove>) {
  const foe = 1 - me;

  if (s.phase === "setup") {
    if (me < 0) return <p className="text-dust">Both players are placing their ships.</p>;
    return (
      <div className="mx-auto w-full max-w-sm space-y-4">
        <p className="text-chalk/80">{s.ready[me] ? `Ready. Waiting for ${names[foe]}.` : "Here's your fleet. Shuffle until you like it, then lock it in."}</p>
        <Sea s={s} seat={me} fleet label="Your fleet" />
        {!s.ready[me] && (
          <div className="flex gap-2">
            <button type="button" className="btn flex-1" onClick={() => act({ t: "shuffle" })}>Shuffle ships</button>
            <button type="button" className="btn-solid flex-1" onClick={() => act({ t: "ready" })}>Lock in fleet</button>
          </div>
        )}
        {s.ready[foe] && !s.ready[me] && <p className="text-sm text-dust">{names[foe]} is ready.</p>}
      </div>
    );
  }

  const last = s.last && (
    <p className="text-sm text-dust">
      {s.last.by === me ? "You" : names[s.last.by]} {s.last.sunk ? `sank a ${s.last.sunk}-long ship.` : s.last.hit ? "hit a ship." : "missed."}
    </p>
  );

  if (me < 0) {
    return (
      <div className="mx-auto w-full max-w-sm space-y-4">
        {last}
        {[0, 1].map((p) => (
          <div key={p} className="space-y-1">
            <p className="text-sm text-dust">{names[p]}&apos;s waters</p>
            <Sea s={s} seat={p} fleet={false} label={`${names[p]}'s waters`} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      {last}
      <div className="space-y-1">
        <p className="text-sm text-dust">{names[foe]}&apos;s waters: tap to fire</p>
        <Sea s={s} seat={foe} fleet={false} onFire={!s.over && s.turn === me ? (i) => act({ t: "fire", i }) : undefined} label={`${names[foe]}'s waters`} />
      </div>
      <div className="mx-auto w-2/3 space-y-1">
        <p className="text-sm text-dust">Your fleet</p>
        <Sea s={s} seat={me} fleet label="Your fleet" />
      </div>
    </div>
  );
}
