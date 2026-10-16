export default function Rules({ rules, className = "" }: { rules: string[]; className?: string }) {
  return (
    <ol className={`list-decimal space-y-1.5 pl-5 text-chalk/80 marker:font-chalk marker:text-dust ${className}`}>
      {rules.map((r) => <li key={r}>{r}</li>)}
    </ol>
  );
}
