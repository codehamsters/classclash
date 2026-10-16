"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { joinRoom, selfId, type Room } from "trystero/nostr";
import { gameById, GAMES } from "@/games";

export { selfId };

export type Player = { id: string; name: string };
export type RoomState = {
  v: number;
  players: Player[];
  gameId: string;
  /** peer ids seated in the running game, by seat; empty = lobby */
  seats: string[];
  game: any;
  /** games started so far; rotates who goes first */
  rounds: number;
  note: string;
};
type Intent = { t: "move"; m: any } | { t: "pick"; id: string } | { t: "start" } | { t: "lobby" };

const APP_ID = "classclash-v1";
const MAX_NAME = 16;
const fresh = (name: string): RoomState =>
  ({ v: 1, players: [{ id: selfId, name }], gameId: GAMES[0].id, seats: [], game: null, rounds: 0, note: "" });

/**
 * Serverless room: peers find each other over public Nostr relays, then talk over WebRTC.
 * The earliest-joined player still present is host (the creator, until they leave):
 * it validates every intent and broadcasts the whole state. Everyone keeps the latest
 * state, so if the host drops, the next player picks up from there.
 */
export function useRoom(code: string, name: string, creator: boolean) {
  const [state, setState] = useState<RoomState | null>(() => (creator ? fresh(name) : null));
  const initial = useRef(state);
  const [peers, setPeers] = useState<string[]>([]);
  const send = useRef<(i: Intent) => void>(() => {});
  const claimRef = useRef(() => {});

  useEffect(() => {
    let st = initial.current;
    const present = new Set([selfId]);
    const room: Room = joinRoom({ appId: APP_ID, password: code }, code);
    const stateAct = room.makeAction<any>("state");
    const helloAct = room.makeAction<string>("hello");
    const intentAct = room.makeAction<any>("intent");

    const hostId = () => st?.players.find((p) => present.has(p.id))?.id;
    const commit = (next: Omit<RoomState, "v">) => {
      st = { ...next, v: (st?.v ?? 0) + 1 };
      setState(st);
      stateAct.send(st);
    };

    const apply = (from: string, i: Intent) => {
      if (!st) return;
      const g = gameById(i.t === "pick" ? i.id : st.gameId);
      if (!g) return;
      // only the host may cut a running game short; anyone can move on once it's over
      const running = st.game && !st.game.over;
      if ((i.t === "lobby" || i.t === "start") && running && from !== hostId()) return;
      if (i.t === "move") {
        const seat = st.seats.indexOf(from);
        const next = seat >= 0 && st.game ? g.move(st.game, seat, i.m) : null;
        if (next) commit({ ...st, game: next });
      } else if (i.t === "pick" && !st.seats.length) {
        commit({ ...st, gameId: g.id });
      } else if (i.t === "start") {
        const ps = st.players;
        const k = st.rounds % ps.length;
        const seats = [...ps.slice(k), ...ps.slice(0, k)].slice(0, g.max).map((p) => p.id);
        if (seats.length >= g.min) commit({ ...st, seats, game: g.init(seats.length), rounds: st.rounds + 1, note: "" });
      } else if (i.t === "lobby") {
        commit({ ...st, seats: [], game: null });
      }
    };

    send.current = (i) => {
      const host = hostId();
      if (host === selfId) apply(selfId, i);
      else if (host) intentAct.send(i, { target: host });
    };

    claimRef.current = () => {
      if (st) return;
      st = fresh(name);
      setState(st);
      stateAct.send(st);
    };

    stateAct.onMessage = (data: RoomState, { peerId }) => {
      // once we have a room, only the host we see may change it
      if (st && (peerId !== hostId() || data.v <= st.v)) return;
      st = data;
      setState(st);
      // our hello may have reached the host before it had a room; ask again
      if (!st.players.some((p) => p.id === selfId)) helloAct.send(name, { target: hostId() ?? null });
    };
    helloAct.onMessage = (raw, { peerId }) => {
      if (!st || hostId() !== selfId) return;
      const pname = String(raw).trim().slice(0, MAX_NAME) || "Guest";
      const known = st.players.some((p) => p.id === peerId);
      commit(known ? st : { ...st, players: [...st.players, { id: peerId, name: pname }] });
    };
    intentAct.onMessage = (i, { peerId }) => {
      if (hostId() === selfId) apply(peerId, i);
    };
    room.onPeerJoin = (id) => {
      present.add(id);
      setPeers([...present].filter((p) => p !== selfId));
      helloAct.send(name, { target: id });
    };
    room.onPeerLeave = (id) => {
      present.delete(id);
      setPeers([...present].filter((p) => p !== selfId));
      if (!st || hostId() !== selfId) return;
      const gone = st.players.find((p) => p.id === id);
      if (!gone) return;
      const players = st.players.filter((p) => p.id !== id);
      const midGame = st.seats.includes(id) && st.game && !st.game.over;
      commit(midGame
        ? { ...st, players, seats: [], game: null, note: `${gone.name} left, so the game ended.` }
        : { ...st, players, note: `${gone.name} left.` });
    };

    // tell peers right away instead of waiting ~20s for WebRTC to time out
    const bye = () => room.leave();
    window.addEventListener("pagehide", bye);

    return () => {
      window.removeEventListener("pagehide", bye);
      send.current = () => {};
      claimRef.current = () => {};
      room.leave();
    };
  }, [code, name, creator]);

  const act = useCallback((i: Intent) => send.current(i), []);
  /** nobody answered with a room: start one here instead of waiting forever */
  const claim = useCallback(() => claimRef.current(), []);

  const isHost = state?.players.find((p) => p.id === selfId || peers.includes(p.id))?.id === selfId;

  return { state, peers, act, claim, isHost };
}
