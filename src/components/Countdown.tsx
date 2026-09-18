"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BIRTHDAY_TARGET, COUNTDOWN_HEADLINE, TEASER_LINE } from "@/data/content";
import FloatingDecor from "@/components/FloatingDecor";
import ExcitedReactor from "@/components/ExcitedReactor";
import Bunting from "@/components/Bunting";

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const UNITS: { key: keyof ReturnType<typeof getTimeLeft>; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

const CARD_ACCENTS = ["border-gold-400", "border-coral-400", "border-candy-300", "border-maroon-600"];

function DigitFlip({ value }: { value: string }) {
  return (
    <span className="relative inline-grid h-[1em] place-items-center overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "70%", opacity: 0, scale: 0.7 }}
          animate={{ y: "0%", opacity: 1, scale: 1 }}
          exit={{ y: "-70%", opacity: 0, scale: 0.7 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className="col-start-1 row-start-1"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Countdown() {
  // Starts null so server and client render the same placeholder — the
  // real, clock-dependent value can only be known after mount.
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft> | null>(
    null
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: fills in the post-hydration value immediately instead of waiting a full second for the first tick.
    setTimeLeft(getTimeLeft(BIRTHDAY_TARGET));
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(BIRTHDAY_TARGET));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-blush-50 px-6 text-center">
      {/* morphing blob field */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-24 -left-20 h-80 w-80 bg-gold-300/70 blur-2xl" />
        <div
          className="animate-blob absolute top-1/3 -right-24 h-96 w-96 bg-coral-300/60 blur-2xl"
          style={{ animationDelay: "-5s", animationDuration: "19s" }}
        />
        <div
          className="animate-blob absolute -bottom-28 left-1/4 h-72 w-72 bg-candy-300/50 blur-2xl"
          style={{ animationDelay: "-10s", animationDuration: "13s" }}
        />
        <div
          className="animate-blob absolute -bottom-16 -right-10 h-64 w-64 bg-maroon-600/20 blur-2xl"
          style={{ animationDelay: "-2s", animationDuration: "17s" }}
        />
      </div>

      <FloatingDecor count={7} symbols={["🎈", "✨", "🎉"]} className="text-2xl opacity-70" />

      <div className="absolute top-0 left-0 z-10 w-full">
        <Bunting stringColor="#5c2029" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0, y: -8, rotate: -6 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
          className="font-hand mb-2 text-3xl text-maroon-700 sm:text-4xl"
        >
          {TEASER_LINE}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.25 }}
          className="font-display max-w-sm text-3xl leading-tight font-extrabold text-maroon-900 sm:max-w-none sm:text-5xl md:text-6xl"
        >
          {COUNTDOWN_HEADLINE}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.5 }}
          className="mt-10 grid grid-cols-4 gap-3 sm:gap-6"
        >
          {UNITS.map(({ key, label }, i) => (
            <motion.div
              key={key}
              animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
              className={`relative flex w-16 flex-col items-center rounded-[1.5rem] border-[3px] bg-white pt-4 pb-2.5 shadow-xl shadow-maroon-900/15 sm:w-24 sm:pt-6 sm:pb-3.5 ${CARD_ACCENTS[i % CARD_ACCENTS.length]}`}
            >
              {/* ticket-stub perforation notches + tear line */}
              <span className="absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 rounded-full bg-blush-50" />
              <span className="absolute top-1/2 -right-1.5 h-3 w-3 -translate-y-1/2 rounded-full bg-blush-50" />

              <span className="font-display text-3xl font-black tabular-nums text-maroon-700 sm:text-5xl">
                <DigitFlip value={timeLeft ? String(timeLeft[key]).padStart(2, "0") : "--"} />
              </span>
              <span className="mt-2 w-full border-t-2 border-dashed border-maroon-900/15 pt-1 text-center text-[10px] font-semibold uppercase tracking-widest text-maroon-700/60 sm:mt-3 sm:text-xs">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mt-10 max-w-sm text-sm font-medium text-maroon-700/70"
        >
          September 22 — mark it on your calendar. You won&rsquo;t want to
          miss this one 🎊
        </motion.p>

        <ExcitedReactor />
      </div>
    </section>
  );
}
