"use client";

import { useEffect, useState } from "react";
import Countdown from "@/components/Countdown";
import Reveal from "@/components/Reveal";
import PhotoCarousel from "@/components/PhotoCarousel";
import Letter from "@/components/Letter";
import Guestbook from "@/components/Guestbook";
import EarlyGuestbook from "@/components/EarlyGuestbook";
import MarqueeBanner from "@/components/MarqueeBanner";
import { BIRTHDAY_TARGET, MARQUEE_TEXT } from "@/data/content";

type View = "loading" | "early-guestbook" | "countdown" | "reveal";

export default function BirthdaySite() {
  const [view, setView] = useState<View>("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("guestbook") === "1") {
      // window.location isn't available during SSR, so this can't be a lazy
      // initial-state read without risking a hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView("early-guestbook");
      return;
    }

    const forcePreview = params.get("preview") === "1";
    const check = () =>
      setView(
        forcePreview || Date.now() >= BIRTHDAY_TARGET.getTime()
          ? "reveal"
          : "countdown"
      );
    check();
    if (forcePreview) return;
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

  if (view === "loading") {
    // Avoid a flash of the wrong state on first paint.
    return <div className="min-h-dvh w-full bg-blush-50" />;
  }

  if (view === "early-guestbook") {
    return <EarlyGuestbook />;
  }

  if (view === "countdown") {
    return <Countdown />;
  }

  return (
    <>
      <Reveal />
      <MarqueeBanner text={MARQUEE_TEXT} />
      <PhotoCarousel />
      <MarqueeBanner text={MARQUEE_TEXT} />
      <Letter />
      <MarqueeBanner text={MARQUEE_TEXT} />
      <Guestbook />
    </>
  );
}
