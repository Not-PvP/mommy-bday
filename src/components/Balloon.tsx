import type { CSSProperties } from "react";

export default function Balloon({
  color,
  className,
  style,
}: {
  color: string;
  className?: string;
  style?: CSSProperties;
}) {
  const gradientId = `balloon-gradient-${color.replace("#", "")}`;

  return (
    <svg
      viewBox="0 0 64 100"
      className={className}
      style={style}
      aria-hidden
    >
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="35%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>

      {/* string */}
      <path
        d="M32 78 C 30 84, 35 88, 32 94 C 29 98, 34 100, 32 100"
        fill="none"
        stroke={color}
        strokeOpacity="0.5"
        strokeWidth="1.2"
      />

      {/* knot */}
      <path d="M28 74 L36 74 L32 82 Z" fill={color} />

      {/* body */}
      <path
        d="M32 2
           C 12 2, 2 22, 2 40
           C 2 62, 16 78, 32 78
           C 48 78, 62 62, 62 40
           C 62 22, 52 2, 32 2
           Z"
        fill={`url(#${gradientId})`}
      />

      {/* gloss highlight */}
      <ellipse cx="21" cy="24" rx="8" ry="12" fill="#ffffff" opacity="0.4" />
    </svg>
  );
}
