"use client";

import { useEffect, useState } from "react";
import Countdown from "@/components/Countdown";
import Reveal from "@/components/Reveal";
import PhotoCarousel from "@/components/PhotoCarousel";
import Letter from "@/components/Letter";
import Guestbook from "@/components/Guestbook";
import MarqueeBanner from "@/components/MarqueeBanner";
import { BIRTHDAY_TARGET, MARQUEE_TEXT } from "@/data/content";

export default function BirthdaySite() {
  const [showReveal, setShowReveal] = useState<boolean | null>(null);

  useEffect(() => {
    const forcePreview =
      new URLSearchParams(window.location.search).get("preview") === "1";
    const check = () =>
      setShowReveal(forcePreview || Date.now() >= BIRTHDAY_TARGET.getTime());
    check();
    if (forcePreview) return;
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

  if (showReveal === null) {
    // Avoid a flash of the wrong state on first paint.
    return <div className="min-h-dvh w-full bg-blush-50" />;
  }

  if (!showReveal) {
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
