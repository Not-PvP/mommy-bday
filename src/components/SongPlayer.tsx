"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const SONG_SRC = "/audio/song.mp3";

// A floating control, not tied to any one section, so the song can keep
// playing while someone scrolls through photos/letter/guestbook. Hides
// itself entirely if no song.mp3 has been added yet — no broken button.
export default function SongPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [available, setAvailable] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onError = () => setAvailable(false);
    audio.addEventListener("error", onError);
    return () => audio.removeEventListener("error", onError);
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setAvailable(false));
    }
  }

  if (!available) return null;

  return (
    <>
      <audio ref={audioRef} src={SONG_SRC} loop preload="metadata" />
      <motion.button
        type="button"
        onClick={toggle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.92 }}
        className="fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-full bg-maroon-700 px-4 py-3 text-blush-50 shadow-xl shadow-maroon-900/30"
        aria-label={playing ? "Pause the song" : "Play a song for her"}
      >
        <motion.span
          animate={playing ? { rotate: [0, 12, -12, 0] } : {}}
          transition={{ repeat: playing ? Infinity : 0, duration: 1.6 }}
          className="text-lg"
        >
          {playing ? "🎵" : "🎶"}
        </motion.span>
        <span className="hidden text-sm font-medium sm:inline">
          {playing ? "Playing" : "Play a song"}
        </span>
      </motion.button>
    </>
  );
}
