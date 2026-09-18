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
  const id = color.replace("#", "");
  const gradientId = `balloon-fill-${id}`;
  const shadeId = `balloon-shade-${id}`;

  return (
    <svg viewBox="0 0 64 100" className={className} style={style} aria-hidden>
      <defs>
        {/* Main body light — brightest near the upper-left, fading to the
            true color, so the balloon reads as curved plastic rather than
            a flat tinted shape. */}
        <radialGradient id={gradientId} cx="34%" cy="24%" r="85%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="22%" stopColor={color} stopOpacity="0.9" />
          <stop offset="75%" stopColor={color} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
        {/* Falloff shadow on the lower-right edge for volume. */}
        <radialGradient id={shadeId} cx="75%" cy="80%" r="45%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* string, gently curved */}
      <path
        d="M32 82 C 29 87, 36 90, 32 95 C 29 98, 35 99, 33 100"
        fill="none"
        stroke={color}
        strokeOpacity="0.55"
        strokeWidth="1.1"
      />

      {/* knot */}
      <path d="M28.5 78 L35.5 78 L32 86 Z" fill={color} />

      {/* body — wide rounded top tapering to a narrower base, like real
          latex under its own weight, instead of a plain circle/blob. */}
      <path
        d="M32 2
           C 50 2, 61 19, 61 39
           C 61 58, 51 71, 38 78
           C 35 79.5, 29 79.5, 26 78
           C 13 71, 3 58, 3 39
           C 3 19, 14 2, 32 2
           Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M32 2
           C 50 2, 61 19, 61 39
           C 61 58, 51 71, 38 78
           C 35 79.5, 29 79.5, 26 78
           C 13 71, 3 58, 3 39
           C 3 19, 14 2, 32 2
           Z"
        fill={`url(#${shadeId})`}
      />

      {/* tight specular highlight for a glossy, inflated look */}
      <ellipse
        cx="19"
        cy="19"
        rx="6"
        ry="10"
        fill="#ffffff"
        opacity="0.55"
        transform="rotate(-18 19 19)"
      />
    </svg>
  );
}
