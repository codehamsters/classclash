"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cleanCode, saveName, useStoredName } from "@/lib/ui";
import Room from "./Room";

/** reads the code from the URL and makes sure we have a name before joining */
export default function RoomGate() {
  const code = cleanCode(useParams<{ code: string }>().code);
  const search = useSearchParams();
  // captured once: dropping ?new from the URL must not rejoin as a guest
  const [creator] = useState(() => search.has("new"));
  const stored = useStoredName();
  const [chosen, setName] = useState("");
  const name = chosen || stored;
  const [draft, setDraft] = useState("");

  useEffect(() => {
    // a refresh should rejoin the existing room, not start a fresh one
    if (creator) window.history.replaceState(null, "", `/r/${code}`);
  }, [creator, code]);

  if (name === null) return null;
  if (code.length !== 4) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pt-16">
        <p className="font-chalk text-3xl">That room code doesn&apos;t look right.</p>
        <p className="mt-2 text-dust">Codes are 4 letters, like KQTR.</p>
        <Link href="/" className="btn mt-6">Back to start</Link>
      </main>
    );
  }
  if (!name) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pt-16">
        <p className="text-dust">Joining room</p>
        <p className="font-chalk text-7xl tracking-[0.15em]">{code}</p>
        <form
          className="mt-8 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const n = draft.trim();
            if (n) { saveName(n); setName(n); }
          }}
        >
          <label htmlFor="name" className="block text-sm text-dust">Your name</label>
          <input id="name" className="field" maxLength={16} autoFocus autoComplete="nickname" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button className="btn-solid w-full" disabled={!draft.trim()}>Join room</button>
        </form>
      </main>
    );
  }
  return <Room code={code} name={name} creator={creator} />;
}
