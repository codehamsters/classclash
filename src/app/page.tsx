import { GAMES } from "@/games";
import Home from "@/components/Home";

const players = (min: number, max: number) => (min === max ? `${min} players` : `${min} to ${max} players`);

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-10 sm:pt-16">
      <h1 className="font-chalk text-6xl font-bold leading-none tracking-tight sm:text-7xl">ClassClash</h1>
      <p className="mt-4 max-w-md text-lg text-chalk/80">
        Games for when class drags and your friend sits across the room. No talking, no sound, no sign-up.
      </p>

      <Home />

      <section aria-labelledby="games" className="mt-14">
        <h2 id="games" className="font-chalk text-2xl">On the board today</h2>
        <ul className="mt-3 divide-y divide-chalk/10 border-y border-chalk/10">
          {GAMES.map((g) => (
            <li key={g.id} className="flex items-baseline justify-between gap-4 py-3">
              <div>
                <p className="font-chalk text-xl">{g.name}</p>
                <p className="text-sm text-dust">{g.blurb}</p>
              </div>
              <p className="shrink-0 text-sm text-dust">{players(g.min, g.max)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how" className="mt-12">
        <h2 id="how" className="font-chalk text-2xl">How it works</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-chalk/80 marker:font-chalk marker:text-dust">
          <li>Start a room. You get a 4-letter code.</li>
          <li>Your friends open ClassClash and type the code.</li>
          <li>Play in silence. Tap Hide, or press Esc, to swap the screen for lecture notes.</li>
        </ol>
        <p className="mt-4 text-sm text-dust">
          Phones connect to each other directly. Nothing is stored on a server, and the room disappears when everyone leaves.
        </p>
      </section>
    </main>
  );
}
