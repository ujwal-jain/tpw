export type Profile = {
  name: string;
  slug: string;
  kicker: string;
  quote: string;
  metrics: string[];
};

/**
 * Portrait sits as a background image over a flat panel, so a missing file
 * degrades to the panel and the subject's name instead of a broken image.
 * Drop photographs at /public/portraits/<slug>.jpg to activate them.
 */
export function PortraitCard({ profile }: { profile: Profile }) {
  return (
    <figure className="group border-t border-rule pt-8 focus-within:outline-none">
      <div
        tabIndex={0}
        className="relative aspect-4/5 w-full bg-panel bg-cover bg-center grayscale transition-[filter] duration-[600ms] ease-out group-hover:grayscale-0 group-focus-within:grayscale-0"
        style={{ backgroundImage: `url(/portraits/${profile.slug}.jpg)` }}
        aria-label={`Portrait of ${profile.name}`}
      >
        <span className="absolute bottom-4 left-4 text-[13px] text-muted">
          {profile.name}
        </span>
      </div>

      <figcaption className="mt-7">
        <p className="label-xs">{profile.kicker}</p>
        <blockquote className="mt-4 text-[17px] leading-[1.5] text-ink">
          “{profile.quote}”
        </blockquote>
        <ul className="mt-6 space-y-1.5">
          {profile.metrics.map((m) => (
            <li key={m} className="text-[13px] text-muted">
              {m}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
