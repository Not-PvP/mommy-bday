"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { RECIPIENT_NAME } from "@/data/content";

export default function MakeAWish() {
  const [blown, setBlown] = useState(false);

  function blow() {
    if (blown) return;
    setBlown(true);
    confetti({
      particleCount: 60,
      spread: 70,
      startVelocity: 28,
      origin: { y: 0.6 },
      colors: ["#e2a95c", "#ff8f66", "#f2a7c3", "#7a2e3a", "#cc8f3f"],
    });
  }

  return (
    <section className="cv-auto relative w-full overflow-hidden bg-blush-50 px-6 py-20 text-center sm:py-28">
      <p className="font-serif text-lg italic text-gold-500">
        A little tradition
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold text-maroon-900 sm:text-4xl">
        Make a Wish, {RECIPIENT_NAME}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-maroon-700/70">
        Every birthday needs one candle to blow out — go on, tap it.
      </p>

      <motion.button
        type="button"
        onClick={blow}
        disabled={blown}
        whileTap={{ scale: 0.9 }}
        whileHover={blown ? undefined : { scale: 1.05 }}
        aria-label="Blow out the candle"
        className="mt-8 text-8xl"
      >
        <motion.span
          animate={
            blown
              ? { opacity: 0, scale: 0.5, y: -16 }
              : { opacity: 1, scale: 1, y: 0 }
          }
          transition={{ duration: 0.5 }}
          className="inline-block"
        >
          🕯️
        </motion.span>
      </motion.button>

      <div className="mt-4 h-8">
        <AnimatePresence>
          {blown && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-hand text-2xl text-maroon-700"
            >
              🌠 Wish made — may it come true.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
