"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PHOTOS, type Photo } from "@/data/content";
import FloatingDecor from "@/components/FloatingDecor";

const ROTATIONS = [-3, 2, -2, 3, -2.5, 2.5];
const TAPE_COLORS = [
  "bg-gold-300/80",
  "bg-blush-200/90",
  "bg-maroon-600/40",
  "bg-gold-400/70",
];

function PhotoIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9 text-maroon-700/35">
      <rect
        x="4"
        y="9"
        width="40"
        height="30"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="15" cy="19" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6 33 L17 22 L25 30 L32 23 L42 33"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhotoCard({
  photo,
  index,
  distance,
  cardRef,
}: {
  photo: Photo;
  index: number;
  distance: number;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  const [failed, setFailed] = useState(false);
  const rotation = ROTATIONS[index % ROTATIONS.length];
  const isActive = distance === 0;
  const clampedDistance = Math.min(Math.abs(distance), 2);

  return (
    <div
      ref={cardRef}
      className="w-[74vw] shrink-0 snap-center sm:w-[340px]"
      style={{ perspective: 900 }}
    >
      <motion.figure
        animate={{
          rotate: isActive ? 0 : rotation,
          scale: 1 - clampedDistance * 0.12,
          opacity: 1 - clampedDistance * 0.32,
          rotateY: isActive ? 0 : Math.sign(distance) * 10,
          y: isActive ? 0 : 10,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="relative rounded-[2px] bg-white p-3 pb-7 shadow-xl shadow-maroon-900/25"
      >
        <span
          aria-hidden
          className={`absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 -rotate-2 rounded-[1px] ${TAPE_COLORS[index % TAPE_COLORS.length]} shadow-sm`}
        />

        <div className="aspect-[4/5] w-full overflow-hidden bg-blush-100">
          {!failed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.src}
              alt={photo.caption}
              onError={() => setFailed(true)}
              draggable={false}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-blush-200 to-gold-300 px-4 text-center">
              <PhotoIcon />
              <span className="font-serif text-xs italic text-maroon-700/60">
                Add {photo.src.replace("/photos/", "")}
              </span>
            </div>
          )}
        </div>

        <figcaption className="mt-3 truncate text-center font-hand text-lg text-maroon-700/80">
          {photo.caption}
        </figcaption>
      </motion.figure>
    </div>
  );
}

export default function PhotoCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Scrolls only the carousel's own track — never the page. (scrollIntoView
  // would also drag the whole page vertically if the carousel wasn't
  // already fully in view, which is what was causing the jump-to-carousel
  // bug during autoplay.)
  const goTo = (index: number) => {
    const container = scrollerRef.current;
    const clamped = ((index % PHOTOS.length) + PHOTOS.length) % PHOTOS.length;
    const card = cardRefs.current[clamped];
    if (!container || !card) return;
    const target = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
    container.scrollTo({ left: target, behavior: "smooth" });
  };

  // Tracks which card is centered in the scroller as the user swipes.
  useEffect(() => {
    const container = scrollerRef.current;
    if (!container) return;

    let raf = 0;
    const updateActive = () => {
      const center = container.scrollLeft + container.clientWidth / 2;
      let closest = 0;
      let closestDist = Infinity;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const dist = Math.abs(cardCenter - center);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      setActiveIndex(closest);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActive);
    };

    updateActive();
    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Gentle autoplay — only while the carousel is actually on screen, and it
  // backs off as soon as the visitor touches it.
  useEffect(() => {
    const container = scrollerRef.current;
    if (!container) return;

    let isVisible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.6 }
    );
    observer.observe(container);

    let lastInteraction = Date.now();
    const markInteraction = () => {
      lastInteraction = Date.now();
      setHasInteracted(true);
    };
    container.addEventListener("pointerdown", markInteraction);
    container.addEventListener("wheel", markInteraction, { passive: true });

    const interval = setInterval(() => {
      if (!isVisible) return;
      if (Date.now() - lastInteraction < 4200) return;
      lastInteraction = Date.now();
      goTo(activeIndexRef.current + 1);
    }, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      container.removeEventListener("pointerdown", markInteraction);
      container.removeEventListener("wheel", markInteraction);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-blush-50 py-20 sm:py-28">
      <FloatingDecor count={5} symbols={["✦", "✧", "❀"]} className="text-gold-400/40" />

      <div className="relative mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <p className="font-serif text-lg italic text-gold-500">
            A little scrapbook
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-maroon-900 sm:text-4xl">
            Memories With You
          </h2>
          <svg
            aria-hidden
            width="120"
            height="14"
            viewBox="0 0 120 14"
            className="mx-auto mt-3 text-gold-400"
          >
            <path
              d="M2 8 C 20 2, 40 14, 60 8 S 100 2, 118 8"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      </div>

      <div className="relative flex items-center">
        <button
          type="button"
          aria-label="Previous photo"
          onClick={() => goTo(activeIndex - 1)}
          className="absolute left-2 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white/80 text-maroon-700 shadow-md transition-transform hover:scale-105 sm:flex md:left-6"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={() => goTo(activeIndex + 1)}
          className="absolute right-2 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white/80 text-maroon-700 shadow-md transition-transform hover:scale-105 sm:flex md:right-6"
        >
          ›
        </button>

        <div
          ref={scrollerRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-[13vw] py-6 sm:px-[calc(50%-190px)]"
          style={{ scrollPaddingInline: "13vw" }}
        >
          {PHOTOS.map((photo, i) => (
            <PhotoCard
              key={photo.src}
              photo={photo}
              index={i}
              distance={i - activeIndex}
              cardRef={(el) => {
                cardRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {PHOTOS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to photo ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all ${
              i === activeIndex ? "w-6 bg-maroon-600" : "w-2 bg-maroon-600/25"
            }`}
          />
        ))}
      </div>

      <motion.p
        animate={{ opacity: hasInteracted ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="mt-3 text-center text-xs tracking-wide text-maroon-700/50"
      >
        swipe to browse ✦
      </motion.p>
    </section>
  );
}
