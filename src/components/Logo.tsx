/** the app mark: a chalk cross with X and O squaring off. Same drawing as src/app/icon.svg */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#26362f" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32.4 9c-.7 14.6.6 31.2-.5 46M9 32.6c15.2-.9 30.8.7 46-.4" stroke="#e9e6da" strokeWidth="3" opacity=".7" />
        <path d="M12.5 12.8l11.6 11.4M24 12.4L12.8 24.3" stroke="#f2d16b" strokeWidth="5" />
        <path d="M44.2 36.3c4.6-.2 7.6 3.3 7.4 7.6-.2 4.5-3.6 7.6-7.7 7.5-4.4-.1-7.4-3.6-7.3-7.7.1-4.1 3.4-7.6 7.9-7.3z" stroke="#f29bb2" strokeWidth="5" />
      </g>
    </svg>
  );
}
