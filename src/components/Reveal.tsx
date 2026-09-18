"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { RECIPIENT_NAME } from "@/data/content";
import Balloon from "@/components/Balloon";
import Bunting from "@/components/Bunting";

const BALLOON_COLORS = [
  "#cc8f3f",
  "#7a2e3a",
  "#f0c78a",
  "#e2a95c",
  "#fdecdd",
  "#ff8f66",
  "#f2a7c3",
];
// Two bouquets flanking the card, rather than balloons scattered loosely
// across the whole width — reads as a deliberate arrangement instead of
// randomly placed shapes. Sizes step down toward the edge for depth.
const BOUQUETS = [
  { positions: [3, 9, 15], sizes: [40, 54, 46] },
  { positions: [85, 91, 97], sizes: [46, 54, 40] },
];

export default function Reveal() {
  const fired = useRef(false);

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
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
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
        {BOUQUETS.flatMap((bouquet, b) =>
          bouquet.positions.map((left, i) => {
            const key = `${b}-${i}`;
            const size = bouquet.sizes[i];
            return (
              <Balloon
                key={key}
                color={BALLOON_COLORS[(b * 3 + i) % BALLOON_COLORS.length]}
                className="absolute bottom-0 block drop-shadow-lg animate-balloon-rise"
                style={{
                  left: `${left}%`,
                  width: size,
                  height: size * 1.55,
                  animationDuration: `${11 + i * 1.4}s`,
                  animationDelay: `${(b * 3 + i) * -1.1}s`,
                }}
              />
            );
          })
        )}
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
