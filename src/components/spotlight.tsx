"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Profile = {
  name: string;
  slug: string;
  kicker: string;
  quote: string;
  metrics: string[];
};

const INTERVAL_MS = 7000;

/**
 * Rotating spotlight. Crossfade only — no slide, no carousel chrome.
 * Auto-advance pauses on hover, on keyboard focus, and under reduced motion.
 */
export function Spotlight({ profiles }: { profiles: Profile[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (next: number) => setIndex((next + profiles.length) % profiles.length),
    [profiles.length],
  );

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % profiles.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, profiles.length]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  };

  const active = profiles[index];

  return (
    <div
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Participant spotlight"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      <div className="grid gap-12 border-t border-rule pt-10 md:grid-cols-12 md:gap-14">
        {/* Portrait. Missing file degrades to a flat panel with the name. */}
        <div className="md:col-span-5">
          <div
            key={active.slug}
            className="fade-slot relative aspect-4/5 w-full bg-band bg-cover bg-center grayscale transition-[filter] duration-[600ms] ease-out hover:grayscale-0"
            style={{ backgroundImage: `url(/portraits/${active.slug}.jpg)` }}
            aria-label={`Portrait of ${active.name}`}
          >
            <span className="absolute bottom-4 left-4 text-[13px] text-muted">
              {active.name}
            </span>
          </div>
        </div>

        <div className="md:col-span-7" aria-live="polite">
          <p className="label-xs">{active.kicker}</p>
          <blockquote
            key={active.slug}
            className="fade-slot mt-6 font-[family-name:var(--font-poppins)] text-[clamp(1.25rem,2.1vw,1.75rem)] leading-[1.35] font-bold tracking-[-0.02em]"
          >
            “{active.quote}”
          </blockquote>

          <p className="mt-6 text-[15px] text-ink">{active.name}</p>

          <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-2">
            {active.metrics.map((m) => (
              <li key={m} className="text-[13px] text-green-ink">
                {m}
              </li>
            ))}
          </ul>

          {/* Numbered hairline tabs. */}
          <div className="mt-12 flex gap-8 border-t border-rule pt-5">
            {profiles.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => go(i)}
                aria-current={i === index}
                className={`pb-1 text-[13px] transition-colors ${
                  i === index
                    ? "border-b-2 border-green text-ink"
                    : "border-b-2 border-transparent text-muted hover:text-ink"
                }`}
              >
                {String(i + 1).padStart(2, "0")} {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
