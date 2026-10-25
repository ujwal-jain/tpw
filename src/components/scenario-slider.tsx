"use client";

import { useState } from "react";

const money = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v).toLocaleString()}`;

/**
 * Scales observed per-participant spend and averted cost linearly. Honest about
 * what it is: an extrapolation at current effect size, not a forecast.
 */
export function ScenarioSlider({
  participants,
  spend,
  avertedCost,
}: {
  participants: number;
  spend: number;
  avertedCost: number;
}) {
  const [scale, setScale] = useState(2);

  const projectedSpend = spend * scale;
  const projectedAverted = avertedCost * scale;
  const projectedNet = projectedAverted - projectedSpend;
  const added = projectedNet - (avertedCost - spend);

  return (
    <section className="border-t border-rule pt-8">
      <h2 className="text-[19px] tracking-[-0.02em] text-ink">Scale scenario</h2>
      <p className="measure mt-3 text-[13px] leading-relaxed text-muted">
        If enrollment grew while the measured effect held, this is what the same cohorts
        would have returned. A linear extrapolation at the current effect size — not a
        forecast.
      </p>

      <div className="mt-10 grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <label className="label-xs block" htmlFor="scale">
            Enrollment multiplier
          </label>
          <input
            id="scale"
            type="range"
            min={1}
            max={5}
            step={0.5}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="mt-5 w-full accent-[#d97736]"
          />
          <div className="mt-3 flex justify-between text-[12px] text-muted">
            <span>1×</span>
            <span className="text-ink">{scale.toFixed(1)}×</span>
            <span>5×</span>
          </div>
          <p className="mt-6 text-[14px] text-muted">
            {Math.round(participants * scale).toLocaleString()} participants served
            {scale > 1 && (
              <>
                {" "}
                · {Math.round(participants * (scale - 1)).toLocaleString()} more than today
              </>
            )}
          </p>
        </div>

        <dl className="grid gap-8 md:col-span-7 md:grid-cols-3">
          <Stat label="Program spend" value={money(projectedSpend)} />
          <Stat label="Incarceration cost averted" value={money(projectedAverted)} />
          <Stat label="Net to the state" value={money(projectedNet)} accent />
        </dl>
      </div>

      {scale > 1 && (
        <p className="mt-10 border-t border-rule pt-5 text-[17px] text-ink">
          At {scale.toFixed(1)}× enrollment, the state keeps{" "}
          <span className="text-amber-ink">{money(added)}</span> it currently spends on
          re-incarceration.
        </p>
      )}
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border-t border-rule pt-4">
      <dt className="label-xs">{label}</dt>
      <dd
        className={`mt-2 text-[26px] leading-none tracking-[-0.03em] ${
          accent ? "text-amber-ink" : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
