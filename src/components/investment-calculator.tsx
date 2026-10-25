"use client";

import { useState } from "react";
import {
  CAMPAIGN_ANNUAL_DOLLARS,
  CURRENT_ANNUAL_DOLLARS,
  CURRENT_REHAB_BUDGET_SHARE,
  TPW_CAMPAIGN_REACH,
  TARGET_REHAB_BUDGET_SHARE,
} from "@/lib/constants";

const MAX = CAMPAIGN_ANNUAL_DOLLARS * 2;
const STEP = 2_000_000;

const big = (v: number) =>
  v >= 1_000_000_000
    ? `$${(v / 1_000_000_000).toFixed(2)}B`
    : `$${Math.round(v / 1_000_000).toLocaleString()}M`;

const pctLabel = (share: number) => `${(share * 100).toFixed(share < 0.01 ? 1 : 0)}%`;

/**
 * The slider is annual state investment, because that is the line item a
 * legislator actually moves. Everything else derives from the open-data layer:
 * cost per person, completion rate, the return-to-prison gap, and credit days
 * all come from the three organizations' records, not from assumptions typed
 * in here. The return is shown as a whole number because program spend is an
 * estimate — see upstream issue #1.
 */
export function InvestmentCalculator({
  costPerParticipant,
  completionRate,
  returnedGap,
  creditValuePerPerson,
  avertedCostPerReturn,
}: {
  costPerParticipant: number;
  completionRate: number;
  returnedGap: number;
  creditValuePerPerson: number;
  avertedCostPerReturn: number;
}) {
  const [dollars, setDollars] = useState(CAMPAIGN_ANNUAL_DOLLARS);

  const participants = dollars / costPerParticipant;
  // Only completers carry the return-to-prison gap.
  const avertedReturns = participants * completionRate * returnedGap;
  const avertedCost =
    avertedReturns * avertedCostPerReturn + participants * creditValuePerPerson;
  const net = avertedCost - dollars;
  const roi = dollars ? avertedCost / dollars : 0;
  const share =
    (dollars / CAMPAIGN_ANNUAL_DOLLARS) * TARGET_REHAB_BUDGET_SHARE;

  const atCampaign = Math.abs(dollars - CAMPAIGN_ANNUAL_DOLLARS) < STEP;

  return (
    <section className="border-t border-rule pt-10">
      <p className="label-xs">Set the annual investment</p>

      <div className="mt-8 grid gap-14 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <p className="figure-xl text-gold-ink">{big(dollars)}</p>
          <p className="mt-3 text-[15px] text-muted">
            per year — {pctLabel(share)} of the corrections budget
          </p>

          <input
            type="range"
            min={0}
            max={MAX}
            step={STEP}
            value={dollars}
            onChange={(e) => setDollars(Number(e.target.value))}
            aria-label="Annual state investment in rehabilitation programming"
            className="mt-8 w-full accent-[#2f6b43]"
          />

          <div className="mt-3 flex justify-between text-[12px] text-muted">
            <span>$0</span>
            <span>{big(MAX)}</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Preset
              onClick={() => setDollars(CURRENT_ANNUAL_DOLLARS)}
              active={Math.abs(dollars - CURRENT_ANNUAL_DOLLARS) < STEP}
              label={`Today · ${pctLabel(CURRENT_REHAB_BUDGET_SHARE)}`}
            />
            <Preset
              onClick={() => setDollars(CAMPAIGN_ANNUAL_DOLLARS)}
              active={atCampaign}
              label={`The 1% Campaign · ${big(CAMPAIGN_ANNUAL_DOLLARS)}`}
            />
          </div>
        </div>

        <dl className="grid gap-8 md:col-span-7 md:grid-cols-2">
          <Stat
            label="People served each year"
            value={Math.round(participants).toLocaleString()}
          />
          <Stat
            label="Return-to-custody terms averted"
            value={Math.round(avertedReturns).toLocaleString()}
          />
          <Stat label="Incarceration cost avoided" value={big(avertedCost)} gold />
          <Stat label="Net savings to the state" value={big(net)} gold />
        </dl>
      </div>

      <p className="mt-12 border-t border-rule pt-6 font-[family-name:var(--font-poppins)] text-[clamp(1.1rem,2vw,1.6rem)] leading-tight font-bold tracking-[-0.02em]">
        {big(dollars)} a year serves{" "}
        <span className="text-green-ink">
          {Math.round(participants).toLocaleString()} people
        </span>{" "}
        and keeps <span className="text-gold-ink">{big(net)}</span> the state would
        otherwise spend putting them back inside.
        <span className="block pt-3 text-[15px] font-normal tracking-normal text-muted">
          About a {roi.toFixed(0)}× return, counting only sentence credits earned and
          returns to prison that do not happen.
          {atCampaign &&
            ` This is the 1% Campaign — raising California's rehabilitation budget from 0.2% to 1%. TPW projects ${TPW_CAMPAIGN_REACH.toLocaleString()} people reached at this funding level; the figure above is drawn from three organizations' actual cost per person, and is the more conservative of the two.`}
        </span>
      </p>
    </section>
  );
}

function Preset({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-2 text-[13px] transition-colors ${
        active
          ? "bg-green text-ink"
          : "border border-rule text-muted hover:border-green hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function Stat({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="border-t border-rule pt-4">
      <dt className="label-xs">{label}</dt>
      <dd
        className={`mt-2 font-[family-name:var(--font-poppins)] text-[30px] leading-none font-bold tracking-[-0.03em] ${
          gold ? "text-gold-ink" : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
