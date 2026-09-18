"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
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
import FloatingDecor from "@/components/FloatingDecor";

type Entry = {
  id: string;
  name: string;
  message: string;
  imageUrl: string | null;
  noteColor: string | null;
  createdAt: Timestamp | null;
  reactions: number;
};

const COLLECTION = "guestbook";

const AVATAR_COLORS = ["#cc8f3f", "#7a2e3a", "#e2a95c", "#5c2029", "#b97a86"];
// Also the picker options in the form — kept as one list so "what colors
// can a note be" only needs updating in one place.
const NOTE_COLOR_OPTIONS = [
  { value: "#fff3da", label: "Cream" },
  { value: "#ffe6d9", label: "Peach" },
  { value: "#fbe1e8", label: "Rose" },
  { value: "#f5e9d8", label: "Blush" },
  { value: "#f7e2b8", label: "Gold" },
  { value: "#ffd9c7", label: "Coral" },
];
const NOTE_COLORS = NOTE_COLOR_OPTIONS.map((c) => c.value);
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

function NoteImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="mb-3 max-h-56 w-full rounded-sm object-cover"
    />
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
      style={{ backgroundColor: entry.noteColor ?? NOTE_COLORS[index % NOTE_COLORS.length] }}
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

      {entry.imageUrl && <NoteImage src={entry.imageUrl} />}

      <p className="whitespace-pre-wrap text-maroon-900">{entry.message}</p>

      <div className="mt-3 flex justify-end">
        <ReactButton entry={entry} />
      </div>
    </motion.div>
  );
}

export default function Guestbook({
  eyebrow = "From all of us",
  heading = "Guestbooks",
  description = "Leave Mommy Sonia a birthday message — it’ll show up below for everyone.",
  badge,
}: {
  eyebrow?: string;
  heading?: string;
  description?: string;
  badge?: ReactNode;
} = {}) {
  // isFirebaseConfigured is a build-time constant, so this stays identical
  // between server and client renders (no hydration mismatch).
  const [entries, setEntries] = useState<Entry[] | null>(
    isFirebaseConfigured ? null : []
  );
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [noteColor, setNoteColor] = useState(NOTE_COLOR_OPTIONS[0].value);
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error" | "bad-url"
  >("idle");

  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEntries(
        snapshot.docs.map((d) => ({
          id: d.id,
          name: d.data().name ?? "Anonymous",
          message: d.data().message ?? "",
          imageUrl: d.data().imageUrl ?? null,
          noteColor: d.data().noteColor ?? null,
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

    const trimmedUrl = imageUrl.trim();
    if (trimmedUrl && !/^https:\/\/.+/i.test(trimmedUrl)) {
      setStatus("bad-url");
      return;
    }

    setStatus("sending");
    try {
      await addDoc(collection(db, COLLECTION), {
        name: name.trim().slice(0, 60),
        message: message.trim().slice(0, 500),
        ...(trimmedUrl ? { imageUrl: trimmedUrl.slice(0, 300) } : {}),
        noteColor,
        createdAt: serverTimestamp(),
        reactions: 0,
      });
      setName("");
      setMessage("");
      setImageUrl("");
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="cv-auto relative w-full overflow-hidden bg-blush-50 px-6 py-20 sm:py-28">
      <FloatingDecor count={5} symbols={["♥", "✧", "❀"]} className="text-gold-400/35" />

      <div className="relative mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          {badge && <div className="mb-4 flex justify-center">{badge}</div>}
          <p className="font-serif text-lg italic text-gold-500">{eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-maroon-900 sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-3 text-sm text-maroon-700/70">{description}</p>
        </div>

        {!isFirebaseConfigured && (
          <div className="mb-8 rounded-xl border border-gold-400/50 bg-gold-300/20 px-4 py-3 text-sm text-maroon-700">
            Guestbook setup needed: add your Firebase config to{" "}
            <code className="rounded bg-white/60 px-1 py-0.5">.env.local</code>{" "}
            to turn this on. See README.md.
          </div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20, rotate: -1 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          className="relative mb-14 space-y-4 rounded-sm border border-maroon-900/10 bg-white px-6 py-8 shadow-xl shadow-maroon-900/10 sm:px-8"
        >
          <span
            aria-hidden
            className="absolute -top-3 left-10 h-7 w-16 -rotate-3 rounded-[1px] bg-gold-300/80 shadow-sm"
          />
          <span
            aria-hidden
            className="absolute top-4 right-4 flex h-12 w-12 rotate-6 items-center justify-center rounded-full border-2 border-dashed border-maroon-900/15 font-hand text-lg text-maroon-900/30"
          >
            ✉️
          </span>

          <div>
            <label className="mb-1 block text-xs font-medium tracking-wide text-maroon-700/70 uppercase">
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              required
              disabled={!isFirebaseConfigured}
              placeholder="e.g. Gelo"
              className="w-full rounded-lg border border-maroon-900/10 bg-white px-3 py-2 text-maroon-900 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-300 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium tracking-wide text-maroon-700/70 uppercase">
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
          <div>
            <label className="mb-1 block text-xs font-medium tracking-wide text-maroon-700/70 uppercase">
              GIF or photo link{" "}
              <span className="normal-case text-maroon-700/40">(optional)</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                if (status === "bad-url") setStatus("idle");
              }}
              maxLength={300}
              disabled={!isFirebaseConfigured}
              placeholder="Paste a Giphy or image link (https://...)"
              className="w-full rounded-lg border border-maroon-900/10 bg-white px-3 py-2 text-maroon-900 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-300 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-maroon-700/50">
              Find one on{" "}
              <a
                href="https://giphy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-maroon-700"
              >
                giphy.com
              </a>
              , right-click it, and copy the image link.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium tracking-wide text-maroon-700/70 uppercase">
              Sticky note color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {NOTE_COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={!isFirebaseConfigured}
                  onClick={() => setNoteColor(option.value)}
                  aria-label={option.label}
                  aria-pressed={noteColor === option.value}
                  className="h-9 w-9 rounded-full transition-transform disabled:opacity-50"
                  style={{
                    backgroundColor: option.value,
                    boxShadow:
                      noteColor === option.value
                        ? "0 0 0 2px white, 0 0 0 4px var(--color-maroon-700)"
                        : "0 0 0 1px rgba(58,20,24,0.12)",
                    transform: noteColor === option.value ? "scale(1.1)" : undefined,
                  }}
                />
              ))}
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={!isFirebaseConfigured || status === "sending"}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-maroon-700 px-4 py-2.5 font-medium text-blush-50 transition-colors hover:bg-maroon-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden>💌</span>
            {status === "sending" ? "Sending…" : "Sign the guestbook"}
          </motion.button>
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
          {status === "bad-url" && (
            <p className="text-center text-sm text-red-700">
              That link doesn&rsquo;t look right — it should start with
              https://
            </p>
          )}
        </motion.form>
      </div>

      <div className="relative mx-auto max-w-3xl">
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
