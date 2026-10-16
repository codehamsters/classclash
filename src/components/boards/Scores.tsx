export default function Scores({ scores, names, colors, turn }: { scores: number[]; names: string[]; colors: string[]; turn: number | null }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1" aria-label="Scores">
      {scores.map((v, i) => (
        <li key={i} className={`flex items-baseline gap-2 ${turn === i ? "" : "opacity-60"}`}>
          <span className="font-chalk text-2xl" style={{ color: colors[i] }}>{v}</span>
          <span className="text-sm">{names[i]}</span>
        </li>
      ))}
    </ul>
  );
}
