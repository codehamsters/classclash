import { useState } from "react";
import { MAX_WRONG, type Hangman as S, type HangmanMove } from "@/games/hangman";
import Scores from "./Scores";
import type { BoardProps } from "./types";

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

function Gallows({ wrong }: { wrong: number }) {
  const parts = [
    <circle key="h" cx="70" cy="38" r="10" />,
    <line key="b" x1="70" y1="48" x2="70" y2="80" />,
    <line key="la" x1="70" y1="58" x2="56" y2="70" />,
    <line key="ra" x1="70" y1="58" x2="84" y2="70" />,
    <line key="ll" x1="70" y1="80" x2="58" y2="98" />,
    <line key="rl" x1="70" y1="80" x2="82" y2="98" />,
  ];
  return (
    <svg viewBox="0 0 110 115" className="h-32 w-auto" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" role="img" aria-label={`${wrong} of ${MAX_WRONG} wrong guesses`}>
      <path d="M10 110h60M25 110V8h45v20" className="opacity-50" />
      {parts.slice(0, wrong)}
    </svg>
  );
}

export default function Hangman({ s, me, act, colors, names }: BoardProps<S, HangmanMove>) {
  const [word, setWord] = useState("");
  const setter = s.setter === me;
  const valid = /^[a-zA-Z]{3,12}$/.test(word.trim());

  if (s.phase === "set") {
    return (
      <div className="mx-auto w-full max-w-sm space-y-4">
        <Scores scores={s.scores} names={names} colors={colors} turn={null} />
        <p className="text-dust">Round {s.round + 1} of {s.n}</p>
        {setter ? (
          <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (valid) { act({ t: "set", w: word }); setWord(""); } }}>
            <label htmlFor="secret" className="block text-chalk/80">Pick a secret word for the others to guess.</label>
            <input
              id="secret" className="field font-chalk text-2xl tracking-widest" autoComplete="off" autoCapitalize="none" spellCheck={false}
              maxLength={12} value={word} onChange={(e) => setWord(e.target.value.replace(/[^a-zA-Z]/g, ""))}
            />
            <p className="text-sm text-dust">3 to 12 letters, no spaces.</p>
            <button className="btn-solid w-full" disabled={!valid}>Set word</button>
          </form>
        ) : (
          <p className="text-chalk/80">{names[s.setter]} is picking a word.</p>
        )}
      </div>
    );
  }

  const show = s.phase === "reveal" || setter;
  const myTurn = s.phase === "guess" && s.turn === me;
  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      <Scores scores={s.scores} names={names} colors={colors} turn={null} />
      <div className="flex items-end gap-4">
        <Gallows wrong={s.wrong} />
        <p className="pb-2 text-sm text-dust">{MAX_WRONG - s.wrong} wrong guesses left. {names[s.setter]} set this one.</p>
      </div>
      <p className="flex flex-wrap gap-2 font-chalk text-4xl" aria-label="Word">
        {[...s.word].map((c, i) => {
          const got = s.guessed.includes(c);
          return (
            <span key={i} className={`w-[1ch] border-b-2 border-chalk/50 text-center ${!got && show ? "text-dust" : ""}`}>
              {got || show ? c.toUpperCase() : " "}
            </span>
          );
        })}
      </p>
      {s.phase === "reveal" ? (
        <div className="space-y-3">
          <p className="text-chalk/80">{s.solved ? "Solved. Every guesser scores a point." : `Hanged. ${names[s.setter]} scores 2.`}</p>
          {!s.over && <button type="button" className="btn-solid w-full" onClick={() => act({ t: "next" })}>Next round</button>}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1.5">
          {LETTERS.map((l) => {
            const used = s.guessed.includes(l);
            const hit = used && s.word.includes(l);
            return (
              <button
                key={l}
                type="button"
                disabled={!myTurn || used}
                onClick={() => act({ t: "guess", l })}
                className={`min-h-11 rounded-md border font-chalk text-xl uppercase ${used ? (hit ? "border-c-mint/50 text-c-mint" : "border-transparent text-dust/50 line-through") : "border-chalk/30 enabled:hover:bg-chalk/10 disabled:text-chalk/50"}`}
              >
                {l}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
