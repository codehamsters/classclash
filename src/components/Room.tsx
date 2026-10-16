"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { GAMES, gameById } from "@/games";
import { selfId, useRoom, type RoomState } from "@/lib/room";
import { CHALK } from "@/lib/ui";
import Stealth from "./Stealth";
import type { BoardProps } from "./boards/types";
import TicTacToe from "./boards/TicTacToe";
import Connect4 from "./boards/Connect4";
import Reversi from "./boards/Reversi";
import Dots from "./boards/Dots";
import Battleship from "./boards/Battleship";
import Hangman from "./boards/Hangman";
import Memory from "./boards/Memory";

const BOARDS: Record<string, ComponentType<BoardProps>> = {
  tictactoe: TicTacToe, connect4: Connect4, reversi: Reversi, dots: Dots, battleship: Battleship, hangman: Hangman, memory: Memory,
};

type Act = ReturnType<typeof useRoom>["act"];

export default function Room({ code, name, creator }: { code: string; name: string; creator: boolean }) {
  const { state, act, claim, isHost } = useRoom(code, name, creator);
  const [hidden, setHidden] = useState(false);
  const [lonely, setLonely] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setHidden((h) => !h); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (state) return;
    const t = setTimeout(() => setLonely(true), 8000);
    return () => clearTimeout(t);
  }, [state]);

  const playing = !!state?.seats.length;
  const color = (id: string) => CHALK[Math.max(0, state?.players.findIndex((p) => p.id === id) ?? 0) % CHALK.length];

  return (
    <>
      <main className="mx-auto w-full max-w-xl px-4 pb-16" aria-hidden={hidden || undefined}>
        <header className="flex items-center justify-between py-3">
          <Link href="/" className="font-chalk text-xl">ClassClash</Link>
          <div className="flex items-center gap-2">
            {playing && <span className="font-chalk text-xl tracking-[0.15em] text-dust" aria-label={`Room code ${code}`}>{code}</span>}
            <button type="button" className="btn min-h-9 px-3 text-sm" onClick={() => setHidden(true)}>Hide</button>
          </div>
        </header>

        {!state ? (
          <section className="pt-10">
            <p className="text-dust">Joining room</p>
            <p className="font-chalk text-8xl font-bold tracking-[0.15em]">{code}</p>
            <p className="mt-6 text-chalk/80">{lonely ? "Nobody's in this room yet." : "Looking for your friends…"}</p>
            {lonely && (
              <button type="button" className="btn-solid mt-4" onClick={claim}>Open this room myself</button>
            )}
          </section>
        ) : playing ? (
          <GameView state={state} act={act} color={color} isHost={isHost} />
        ) : (
          <Lobby state={state} act={act} code={code} color={color} />
        )}
      </main>
      {hidden && <Stealth onDone={() => setHidden(false)} />}
    </>
  );
}

function Lobby({ state, act, code, color }: { state: RoomState; act: Act; code: string; color: (id: string) => string }) {
  const [copied, setCopied] = useState(false);
  const g = gameById(state.gameId)!;
  const n = state.players.length;

  const share = async () => {
    const url = `${location.origin}/r/${code}`;
    try {
      if (navigator.share) await navigator.share({ title: "ClassClash", text: `Join my room: ${code}`, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); }
    } catch {} // share sheet dismissed
  };

  return (
    <div className="pt-6">
      <p className="text-dust">Room code</p>
      <p className="font-chalk text-8xl font-bold leading-none tracking-[0.15em] sm:text-9xl">{code}</p>
      <p className="mt-3 text-chalk/80">
        Friends open ClassClash and type this code.{" "}
        <button type="button" className="underline decoration-chalk/40 underline-offset-4 hover:decoration-chalk" onClick={share}>
          {copied ? "Link copied" : "Share link"}
        </button>
      </p>

      {state.note && <p className="mt-6 rounded-md border border-c-orange/40 px-3 py-2 text-c-orange" role="status">{state.note}</p>}

      <section className="mt-8" aria-labelledby="in-room">
        <h2 id="in-room" className="text-sm text-dust">In the room</h2>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          {state.players.map((p) => (
            <li key={p.id} className="font-chalk text-2xl" style={{ color: color(p.id) }}>
              {p.name}{p.id === selfId && <span className="font-sans text-sm text-dust"> (you)</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="pick">
        <h2 id="pick" className="text-sm text-dust">Pick a game</h2>
        <ul className="mt-2 divide-y divide-chalk/10 border-y border-chalk/10">
          {GAMES.map((x) => {
            const on = x.id === g.id;
            const fits = n >= x.min;
            return (
              <li key={x.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => act({ t: "pick", id: x.id })}
                  className={`flex w-full items-baseline justify-between gap-4 py-3 text-left ${on ? "" : "text-chalk/70 hover:text-chalk"}`}
                >
                  <span className={`font-chalk text-2xl ${on ? "underline decoration-c-yellow decoration-2 underline-offset-[6px]" : ""}`}>{x.name}</span>
                  <span className={`shrink-0 text-sm ${fits ? "text-dust" : "text-c-orange/80"}`}>
                    {x.min === x.max ? `${x.min} players` : `${x.min} to ${x.max}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-6 space-y-2">
        <button type="button" className="btn-solid w-full text-lg" disabled={n < g.min} onClick={() => act({ t: "start" })}>
          Start {g.name}
        </button>
        <p className="text-sm text-dust" role="status">
          {n < g.min ? `${g.name} needs ${g.min} players. Waiting for a friend to join.` : n > g.max ? `${g.max} of you play this round, the rest watch. Turns rotate each game.` : g.blurb}
        </p>
      </div>
    </div>
  );
}

function GameView({ state, act, color, isHost }: { state: RoomState; act: Act; color: (id: string) => string; isHost: boolean }) {
  const g = gameById(state.gameId)!;
  const Board = BOARDS[g.id];
  const s = state.game;
  const me = state.seats.indexOf(selfId);
  const names = state.seats.map((id) => state.players.find((p) => p.id === id)?.name ?? "Someone");
  const colors = state.seats.map(color);

  const status = s.over
    ? s.winners.length === 0 ? "Draw."
      : s.winners.includes(me) ? (s.winners.length > 1 ? "You tied for the win." : "You win.")
      : `${s.winners.map((w: number) => names[w]).join(" and ")} ${s.winners.length > 1 ? "tie for the win." : "wins."}`
    : s.turn === null ? ""
    : s.turn === me ? "Your move." : `${names[s.turn]}'s move.`;

  return (
    <div className="space-y-5 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-chalk text-3xl">{g.name}</h1>
        {me < 0 && <span className="text-sm text-dust">Watching</span>}
      </div>
      <p
        className="min-h-8 font-chalk text-2xl"
        style={{ color: s.over ? (s.winners.length ? colors[s.winners[0]] : undefined) : s.turn !== null ? colors[s.turn] : undefined }}
        role="status"
      >
        {status}
      </p>
      <Board s={s} me={me} act={(m) => act({ t: "move", m })} colors={colors} names={names} />
      {s.over ? (
        <div className="flex gap-2 pt-2">
          <button type="button" className="btn-solid flex-1" onClick={() => act({ t: "start" })}>Play again</button>
          <button type="button" className="btn flex-1" onClick={() => act({ t: "lobby" })}>Change game</button>
        </div>
      ) : isHost ? (
        <button type="button" className="text-sm text-dust underline underline-offset-4 hover:text-chalk" onClick={() => act({ t: "lobby" })}>
          End game for everyone
        </button>
      ) : (
        <Link href="/" className="inline-block text-sm text-dust underline underline-offset-4 hover:text-chalk">
          Leave room
        </Link>
      )}
    </div>
  );
}
