"use client";

import { useEffect, useRef, useState } from "react";
import { doc, increment, onSnapshot, setDoc } from "firebase/firestore";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { db, isFirebaseConfigured } from "@/lib/firebase";

const REACTED_FLAG = "mombday-excited-reacted";
const LOCAL_COUNT_FLAG = "mombday-excited-local-count";
const DOC_PATH = ["reactions", "excited"] as const;

export default function ExcitedReactor() {
  // Starts at 0 (not null) so "Be the first to react!" shows immediately
  // even before the Firestore subscription connects — this is a build-time
  // constant-free default, so it's identical between server and client.
  const [count, setCount] = useState(0);
  const [reacted, setReacted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // localStorage isn't available during SSR, so this can't be a lazy
    // initial-state read without risking a hydration mismatch — it has to
    // run once after mount instead.
    if (window.localStorage.getItem(REACTED_FLAG)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReacted(true);
    }
    const storedCount = Number(window.localStorage.getItem(LOCAL_COUNT_FLAG));
    if (storedCount > 0) {
      setCount(storedCount);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;
    const unsubscribe = onSnapshot(
      doc(db, ...DOC_PATH),
      (snap) => {
        const serverCount = snap.data()?.count ?? 0;
        // Never let a lagging/blocked server read regress what this visitor
        // has already seen locally (e.g. their own tap before rules were
        // published) — always show whichever is higher.
        setCount((c) => Math.max(c, serverCount));
      },
      () => {
        // Permission-denied until firestore.rules is republished with the
        // reactions match — fail quietly, the button still works locally.
      }
    );
    return () => unsubscribe();
  }, []);

  async function react() {
    if (!db || reacted) return;
    setReacted(true);
    window.localStorage.setItem(REACTED_FLAG, "1");
    // Optimistic bump, persisted locally too so it survives a reload even
    // if the Firestore write below silently fails (e.g. rules not yet
    // published) — the tapper's own count should never revert to 0.
    setCount((c) => {
      const next = c + 1;
      window.localStorage.setItem(LOCAL_COUNT_FLAG, String(next));
      return next;
    });

    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      confetti({
        particleCount: 40,
        spread: 60,
        startVelocity: 32,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: rect.top / window.innerHeight,
        },
        colors: ["#e2a95c", "#ff8f66", "#f2a7c3", "#7a2e3a"],
      });
    }

    try {
      await setDoc(doc(db, ...DOC_PATH), { count: increment(1) }, { merge: true });
    } catch {
      // Non-fatal — the tally is a fun extra, not core functionality.
    }
  }

  if (!isFirebaseConfigured) return null;

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="font-hand text-2xl text-maroon-700">Are you excited?</p>
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={react}
        disabled={reacted}
        whileTap={{ scale: 0.9 }}
        animate={reacted ? { scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] } : {}}
        transition={{ duration: 0.5 }}
        className={`flex items-center gap-2 rounded-full border-[3px] px-6 py-3 text-lg font-bold shadow-lg transition-colors ${
          reacted
            ? "border-gold-400 bg-gold-400 text-maroon-900"
            : "border-gold-400 bg-white text-maroon-700 hover:bg-gold-300/30"
        }`}
      >
        <span className="text-2xl">🎉</span>
        {reacted ? "Yes, so excited!" : "Tap to react"}
      </motion.button>
      <motion.p
        key={count}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-medium text-maroon-700/70"
      >
        {count > 0
          ? `${count} ${count === 1 ? "person is" : "people are"} excited so far 🎊`
          : "Be the first to react!"}
      </motion.p>
    </div>
  );
}
