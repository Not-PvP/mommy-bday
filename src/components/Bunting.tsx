const FLAG_COLORS = ["#e2a95c", "#ff8f66", "#f2a7c3", "#cc8f3f", "#fdecdd", "#7a2e3a"];

// A strip of party flags strung along a drooping line, each swaying gently
// like real paper bunting — a physical, handmade motif instead of an
// abstract lighting effect.
export default function Bunting({
  count = 9,
  stringColor = "#fdecdd",
}: {
  count?: number;
  stringColor?: string;
}) {
  const width = 400;
  const height = 70;
  const sag = 34;
  const stringY = (t: number) => 6 + sag * 4 * t * (1 - t);

  const flags = Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    const x = t * width;
    const y = stringY(t);
    return { x, y, color: FLAG_COLORS[i % FLAG_COLORS.length] };
  });

  const stringPath = Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    return `${t === 0 ? "M" : "L"}${(t * width).toFixed(1)},${stringY(t).toFixed(1)}`;
  }).join(" ");

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="block h-16 w-full sm:h-20"
    >
      <path d={stringPath} stroke={stringColor} strokeOpacity="0.55" strokeWidth="1.5" fill="none" />
      {flags.map((flag, i) => (
        <polygon
          key={i}
          points={`${flag.x - 13},${flag.y} ${flag.x + 13},${flag.y} ${flag.x},${flag.y + 30}`}
          fill={flag.color}
          className="animate-wiggle origin-top"
          style={{
            transformOrigin: `${flag.x}px ${flag.y}px`,
            animationDelay: `${(i % 5) * -0.5}s`,
            animationDuration: `${2.4 + (i % 3) * 0.4}s`,
          }}
        />
      ))}
    </svg>
  );
}
