import type { ReactNode } from "react";

/** A figure on a hairline row. No cards anywhere on this site. */
export function Kpi({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div className="border-t border-rule pt-5">
      <p className="label-xs">{label}</p>
      <p
        className={`mt-3 font-[family-name:var(--font-poppins)] text-[clamp(1.9rem,3.4vw,2.75rem)] leading-none font-bold tracking-[-0.03em] ${
          accent ? "text-green-ink" : "text-ink"
        }`}
      >
        {value}
      </p>
      {note && <p className="mt-3 text-[13px] leading-relaxed text-muted">{note}</p>}
    </div>
  );
}

export function KpiRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-10 md:grid-cols-4 md:gap-8">{children}</div>;
}

export function ChartBlock({
  title,
  note,
  series,
  children,
}: {
  title: string;
  note?: string;
  series?: { label: string; color: string }[];
  children: ReactNode;
}) {
  return (
    <section className="border-t border-rule pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3">
        <h2 className="font-[family-name:var(--font-poppins)] text-[19px] font-bold tracking-[-0.02em] text-ink">
          {title}
        </h2>
        {series && (
          <div className="flex gap-6">
            {series.map((s) => (
              <span key={s.label} className="flex items-center gap-2 text-[13px] text-muted">
                <span className="h-0.5 w-5" style={{ background: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        )}
      </div>
      {note && <p className="measure mt-3 text-[13px] leading-relaxed text-muted">{note}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <div className="pb-14">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="headline mt-5 max-w-[22ch]">{title}</h1>
      <p className="measure mt-6 text-[17px] leading-relaxed text-muted">{intro}</p>
    </div>
  );
}
