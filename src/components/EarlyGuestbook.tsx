"use client";

import Guestbook from "@/components/Guestbook";
import { RECIPIENT_NAME } from "@/data/content";

// A private, unlisted view for family to leave messages before the
// countdown ends. Reads and writes the exact same Firestore collection as
// the guestbook shown after the real reveal — nothing separate to sync.
export default function EarlyGuestbook() {
  return (
    <main className="min-h-dvh w-full bg-blush-50 pt-14">
      <Guestbook
        eyebrow="Shh, it's a secret"
        heading={`An Early Message for ${RECIPIENT_NAME}`}
        description="Write your message whenever, and it'll already be here when the site opens for real on her birthday."
        badge={
          <span className="font-hand -rotate-2 rounded-full border-2 border-dashed border-gold-400 bg-gold-300/20 px-4 py-1 text-base text-maroon-700">
            🤫 private early-access link
          </span>
        }
      />
    </main>
  );
}
