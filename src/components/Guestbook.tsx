"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { db, isFirebaseConfigured } from "@/lib/firebase";

type Entry = {
  id: string;
  name: string;
  message: string;
  createdAt: Timestamp | null;
  reactions: number;
};

const COLLECTION = "guestbook";

const AVATAR_COLORS = ["#cc8f3f", "#7a2e3a", "#e2a95c", "#5c2029", "#b97a86"];
const NOTE_COLORS = ["#fff3da", "#ffe6d9", "#fbe1e8", "#f5e9d8"];
const ROTATIONS = [-2.5, 2, -1.5, 3, -3, 1.5];

function avatarColor(name: string) {
  const hash = Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function ReactButton({ entry }: { entry: Entry }) {
  const [busy, setBusy] = useState(false);

  async function react() {
    if (!db || busy) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, COLLECTION, entry.id), {
        reactions: increment(1),
      });
    } catch {
      // Non-fatal — reactions are a nice-to-have, not core functionality.
    } finally {
      setTimeout(() => setBusy(false), 500);
    }
  }

  return (
    <motion.button
      type="button"
      onClick={react}
      disabled={busy}
      whileTap={{ scale: 1.3 }}
      aria-label="React with a heart"
      className="flex shrink-0 items-center gap-1 self-start rounded-full bg-maroon-900/8 px-2.5 py-1 text-sm text-maroon-700 transition-colors hover:bg-maroon-900/15 disabled:opacity-70"
    >
      <span>❤️</span>
      {entry.reactions > 0 && (
        <span className="text-xs font-semibold tabular-nums">
          {entry.reactions}
        </span>
      )}
    </motion.button>
  );
}

function NoteCard({ entry, index }: { entry: Entry; index: number }) {
  const rotation = ROTATIONS[index % ROTATIONS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: rotation * 2, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation, scale: 1 }}
      whileHover={{ rotate: 0, scale: 1.03, y: -3 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: (index % 6) * 0.06 }}
      className="relative mb-5 break-inside-avoid rounded-sm px-5 py-4 shadow-lg shadow-maroon-900/15"
      style={{ backgroundColor: NOTE_COLORS[index % NOTE_COLORS.length] }}
    >
      {/* folded corner */}
      <span
        aria-hidden
        className="absolute top-0 right-0 h-5 w-5"
        style={{
          background:
            "linear-gradient(135deg, transparent 50%, rgba(58,20,24,0.12) 50%)",
        }}
      />

      <div className="mb-3 flex items-center gap-2">
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold text-white"
          style={{ backgroundColor: avatarColor(entry.name) }}
        >
          {entry.name.trim().charAt(0).toUpperCase() || "?"}
        </span>
        <p className="font-hand text-xl text-maroon-700">{entry.name}</p>
      </div>

      <p className="whitespace-pre-wrap text-maroon-900">{entry.message}</p>

      <div className="mt-3 flex justify-end">
        <ReactButton entry={entry} />
      </div>
    </motion.div>
  );
}

export default function Guestbook() {
  // isFirebaseConfigured is a build-time constant, so this stays identical
  // between server and client renders (no hydration mismatch).
  const [entries, setEntries] = useState<Entry[] | null>(
    isFirebaseConfigured ? null : []
  );
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEntries(
        snapshot.docs.map((d) => ({
          id: d.id,
          name: d.data().name ?? "Anonymous",
          message: d.data().message ?? "",
          createdAt: d.data().createdAt ?? null,
          reactions: d.data().reactions ?? 0,
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !db) return;

    setStatus("sending");
    try {
      await addDoc(collection(db, COLLECTION), {
        name: name.trim().slice(0, 60),
        message: message.trim().slice(0, 500),
        createdAt: serverTimestamp(),
        reactions: 0,
      });
      setName("");
      setMessage("");
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="w-full bg-blush-50 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <p className="font-serif text-lg italic text-gold-500">
            From all of us
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-maroon-900 sm:text-4xl">
            Family Guestbook
          </h2>
          <p className="mt-3 text-sm text-maroon-700/70">
            Leave Mommy Sonia a birthday message — it&rsquo;ll show up below
            for everyone.
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className="mb-8 rounded-xl border border-gold-400/50 bg-gold-300/20 px-4 py-3 text-sm text-maroon-700">
            Guestbook setup needed: add your Firebase config to{" "}
            <code className="rounded bg-white/60 px-1 py-0.5">.env.local</code>{" "}
            to turn this on. See README.md.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mb-14 space-y-4 rounded-2xl bg-white/70 p-6 shadow-md shadow-maroon-900/5"
        >
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-maroon-700/70">
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              required
              disabled={!isFirebaseConfigured}
              placeholder="e.g. Tita Baby"
              className="w-full rounded-lg border border-maroon-900/10 bg-white px-3 py-2 text-maroon-900 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-300 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-maroon-700/70">
              Your message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              required
              rows={3}
              disabled={!isFirebaseConfigured}
              placeholder="Happy birthday, Mommy Sonia!"
              className="w-full resize-none rounded-lg border border-maroon-900/10 bg-white px-3 py-2 text-maroon-900 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-300 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!isFirebaseConfigured || status === "sending"}
            className="w-full rounded-lg bg-maroon-700 px-4 py-2.5 font-medium text-blush-50 transition-colors hover:bg-maroon-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Sign the guestbook"}
          </button>
          {status === "sent" && (
            <p className="text-center text-sm text-maroon-700">
              Thank you — your message was saved 💛
            </p>
          )}
          {status === "error" && (
            <p className="text-center text-sm text-red-700">
              Something went wrong — please try again.
            </p>
          )}
        </form>
      </div>

      <div className="mx-auto max-w-3xl">
        {entries === null && (
          <p className="text-center text-sm text-maroon-700/60">
            Loading messages…
          </p>
        )}
        {entries?.length === 0 && isFirebaseConfigured && (
          <p className="text-center text-sm text-maroon-700/60">
            Be the first to leave a message!
          </p>
        )}
        <div className="columns-1 gap-5 sm:columns-2">
          {entries?.map((entry, i) => (
            <NoteCard key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
