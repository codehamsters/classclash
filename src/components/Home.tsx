"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cleanCode, newCode, saveName, useStoredName } from "@/lib/ui";

export default function Home() {
  const router = useRouter();
  const stored = useStoredName();
  const [typed, setName] = useState<string | null>(null);
  const name = typed ?? stored ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const go = (c: string, isNew: boolean) => {
    const n = name.trim();
    if (!n) return setError("Add your name so friends know who joined.");
    saveName(n);
    router.push(`/r/${c}${isNew ? "?new=1" : ""}`);
  };

  return (
    <div className="mt-10 space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm text-dust">Your name</label>
        <input
          id="name" className="field mt-1" maxLength={16} autoComplete="nickname" value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          aria-describedby={error ? "name-error" : undefined}
        />
        {error && <p id="name-error" className="mt-1 text-sm text-c-pink">{error}</p>}
      </div>

      <button type="button" className="btn-solid w-full text-lg" onClick={() => go(newCode(), true)}>
        Start a room
      </button>

      <form
        className="flex gap-2"
        onSubmit={(e) => { e.preventDefault(); if (code.length === 4) go(code, false); }}
      >
        <label htmlFor="code" className="sr-only">Room code</label>
        <input
          id="code" className="field font-chalk text-xl tracking-[0.3em] uppercase" placeholder="Code"
          autoComplete="off" autoCapitalize="characters" spellCheck={false} inputMode="text"
          value={code} onChange={(e) => setCode(cleanCode(e.target.value))}
        />
        <button className="btn shrink-0" disabled={code.length !== 4}>Join room</button>
      </form>
    </div>
  );
}
