"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { RECIPIENT_NAME } from "@/data/content";
import Bunting from "@/components/Bunting";

const BALLOON_COLORS = [
  "#cc8f3f",
  "#7a2e3a",
  "#f0c78a",
  "#e2a95c",
  "#ff8f66",
  "#f2a7c3",
];
// Emoji instead of hand-built SVG icons — they're pre-rendered by the OS
// and always look right at any size, unlike custom shapes which turned to
// mush (cupcake) or looked disjointed (gift box) once actually small.
const PARTY_EMOJI = ["🎁", "🎈", "🎂", "🎉", "🎊", "🧁", "🍰", "🎀"];
const FLOATING_ITEM_COUNT = 16;

type FloatingItem = {
  left: number;
  size: number;
  emoji: string;
  duration: number;
  delay: number;
};

// Kept out of the 26%-74% band so nothing ever drifts across the card.
// Math.random() can't run during render (the React Compiler flags it as
// impure, even inside useMemo) — but Reveal only ever mounts client-side
// (it's never part of the server-rendered countdown state), so generating
// this once in an effect is safe: no hydration mismatch, and every visitor
// sees a genuinely different arrangement instead of a fixed, quickly
// noticeable repeat.
function useFloatingItems() {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- randomized layout can only be computed post-mount; see comment above.
    setItems(
      Array.from({ length: FLOATING_ITEM_COUNT }, () => {
        const onLeft = Math.random() < 0.5;
        return {
          left: onLeft ? 2 + Math.random() * 24 : 74 + Math.random() * 24,
          size: 24 + Math.random() * 26,
          emoji: PARTY_EMOJI[Math.floor(Math.random() * PARTY_EMOJI.length)],
          duration: 9 + Math.random() * 9,
          delay: -(Math.random() * 20),
        };
      })
    );
  }, []);

  return items;
}

export default function Reveal() {
  const fired = useRef(false);
  const floatingItems = useFloatingItems();

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 65,
        origin: { x: 0 },
        colors: BALLOON_COLORS,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 65,
        origin: { x: 1 },
        colors: BALLOON_COLORS,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    confetti({
      particleCount: 140,
      spread: 100,
      origin: { y: 0.6 },
      colors: BALLOON_COLORS,
    });
  }, []);

  return (
    <section
      className="cv-auto relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
      style={{
        // Layered manually (rather than a Tailwind gradient class) because
        // an inline `background-image` overrides a class-based one entirely
        // — the dot texture and the maroon backdrop have to be one value.
        // A single evenly-spaced layer reads as a deliberate polka-dot grid
        // instead of scattered noise.
        backgroundImage:
          "radial-gradient(circle, rgba(240,199,138,0.22) 2px, transparent 2px), linear-gradient(to bottom, var(--color-maroon-700), var(--color-maroon-900))",
        backgroundSize: "28px 28px, 100% 100%",
        backgroundPosition: "0 0, 0 0",
      }}
    >
      <div className="absolute top-0 left-0 z-10 w-full">
        <Bunting />
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {floatingItems.map((item, i) => (
          <span
            key={i}
            className="absolute bottom-0 block animate-balloon-rise"
            style={{
              left: `${item.left}%`,
              fontSize: item.size,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: -1.5 }}
        transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.15 }}
        className="relative z-10 w-full max-w-md rounded-sm bg-blush-50 px-6 py-10 shadow-2xl shadow-maroon-900/40 sm:px-10 sm:py-12"
      >
        <span
          aria-hidden
          className="absolute -top-4 left-1/2 h-8 w-20 -translate-x-1/2 -rotate-2 rounded-[1px] bg-gold-300/85 shadow-sm"
        />

        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-serif text-lg italic text-gold-500 sm:text-xl"
        >
          It&rsquo;s finally here —
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="font-display mt-2 text-3xl leading-tight font-extrabold text-maroon-900 sm:text-5xl"
        >
          Happy Birthday,
          <br />
          {RECIPIENT_NAME}!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-5 text-sm text-maroon-700/80 sm:text-base"
        >
          Scroll down for a few of our favorite memories, a letter just for
          you, and messages from everyone who loves you.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1.4 }, y: { repeat: Infinity, duration: 1.8 } }}
        className="absolute bottom-8 z-10 text-blush-100/80"
        aria-hidden
      >
        ↓
      </motion.div>
    </section>
  );
}
