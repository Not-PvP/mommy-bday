"use client";

import { useEffect, useState } from "react";
import { doc, increment, onSnapshot, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { db, isFirebaseConfigured } from "@/lib/firebase";

const COUNTED_FLAG = "mombday-visit-counted";
const LOCAL_COUNT_FLAG = "mombday-visit-local-count";
// Same "reactions" collection as the countdown's excited-reactor — the
// existing firestore.rules already permit any doc under it (scoped to
// +1-at-a-time writes), so this needs no rule changes of its own.
const DOC_PATH = ["reactions", "visitors"] as const;

export default function VisitorCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const storedCount = Number(window.localStorage.getItem(LOCAL_COUNT_FLAG));
    if (storedCount > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage isn't available during SSR, so this can only run post-mount.
      setCount(storedCount);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;
    const unsubscribe = onSnapshot(
      doc(db, ...DOC_PATH),
      (snap) => {
        const serverCount = snap.data()?.count ?? 0;
        setCount((c) => Math.max(c, serverCount));
      },
      () => {
        // Permission-denied until firestore.rules is republished — fail
        // quietly, this is a nice-to-have, not core functionality.
      }
    );
    return () => unsubscribe();
  }, []);

  // Counts each visitor once per browser, not once per page view.
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;
    if (window.localStorage.getItem(COUNTED_FLAG)) return;
    window.localStorage.setItem(COUNTED_FLAG, "1");

    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time visit tally, can only be known post-mount (localStorage + this browser's first render).
    setCount((c) => {
      const next = c + 1;
      window.localStorage.setItem(LOCAL_COUNT_FLAG, String(next));
      return next;
    });

    setDoc(doc(db, ...DOC_PATH), { count: increment(1) }, { merge: true }).catch(
      () => {
        // Non-fatal — the tally is a fun extra, not core functionality.
      }
    );
  }, []);

  if (!isFirebaseConfigured || count === 0) return null;

  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6 }}
      className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-maroon-700 shadow-md shadow-maroon-900/15"
    >
      💛 {count} {count === 1 ? "person has" : "people have"} stopped by to
      celebrate with you
    </motion.p>
  );
}
