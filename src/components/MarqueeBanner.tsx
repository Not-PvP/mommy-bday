export default function MarqueeBanner({ text }: { text: string }) {
  // Repeated enough times that the loop never runs out of copies even on
  // an ultra-wide screen; duplicated as a whole block so the CSS animation
  // (translateX by -50%) loops seamlessly.
  const repeated = Array.from({ length: 10 }, () => text);

  return (
    <div
      aria-hidden
      className="relative z-10 w-full overflow-hidden border-y-4 border-gold-400/70 bg-maroon-900 py-5 shadow-md sm:py-7"
    >
      <div className="animate-marquee flex w-max items-center">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center">
            {repeated.map((t, i) => (
              <span
                key={i}
                className="font-hand mx-5 whitespace-nowrap text-3xl font-bold text-gold-300 uppercase sm:text-5xl"
              >
                {t}
                <span className="mx-5 text-gold-400/70">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
