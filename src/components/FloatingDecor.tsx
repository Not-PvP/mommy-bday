const DEFAULT_SYMBOLS = ["✦", "♥", "✧"];

export default function FloatingDecor({
  count = 6,
  symbols = DEFAULT_SYMBOLS,
  className = "text-gold-300/50",
}: {
  count?: number;
  symbols?: string[];
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`absolute bottom-0 block select-none text-xl animate-drift-up ${className}`}
          style={{
            left: `${((i + 1) * 97) % 100}%`,
            animationDuration: `${13 + ((i * 7) % 10)}s`,
            animationDelay: `${-(i * 3.1)}s`,
          }}
        >
          {symbols[i % symbols.length]}
        </span>
      ))}
    </div>
  );
}
