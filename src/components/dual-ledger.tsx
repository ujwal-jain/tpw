import Link from "next/link";
import { ANNUAL_INCARCERATION_COST } from "@/lib/constants";

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** Mid-point of the program cost range, used for the to-scale comparison bar. */
const PROGRAM_COST_MID = 4_250;

export function DualLedger({
  comparisonRecidivism,
  tpwRecidivism,
  rvrReduction,
  employmentLift,
}: {
  comparisonRecidivism: number;
  tpwRecidivism: number;
  rvrReduction: number;
  employmentLift: number;
}) {
  const share = (PROGRAM_COST_MID / ANNUAL_INCARCERATION_COST) * 100;

  return (
    <section id="ledger" className="scroll-mt-16 border-t border-rule">
      <div className="shell section-y">
        <p className="eyebrow">The Dual Ledger</p>
        <h2 className="headline mt-5 max-w-[22ch]">
          Two balance sheets. The same person. The same taxpayer.
        </h2>

        <div className="mt-20 grid gap-16 md:grid-cols-2 md:gap-0">
          {/* Side A — the status quo */}
          <div className="md:pr-16">
            <p className="label-xs">Side A · The cost of inaction</p>
            <p className="mt-6 text-[14px] text-muted">
              Annual cost per incarcerated individual
            </p>
            <p className="figure-xl mt-2 text-muted">
              {money(ANNUAL_INCARCERATION_COST)}+
            </p>

            <p className="label-xs mt-12">The return</p>
            <dl className="mt-4">
              <Row
                k={`${comparisonRecidivism.toFixed(0)}%`}
                v="three-year return-to-custody rate among comparable non-participants"
              />
              <Row k="—" v="Disconnected families, fractured communities, persistent victim harm" />
              <Row k="—" v="Continuous drain on county emergency rooms, shelters, and courts" />
            </dl>

            <p className="mt-10 border-t border-rule pt-5 text-[17px] text-ink">
              Zero wealth created. Zero safety guaranteed.
            </p>
          </div>

          {/* Side B — the intervention */}
          <div className="border-t border-rule pt-16 md:border-t-0 md:border-l md:pt-0 md:pl-16">
            <p className="label-xs">Side B · The ledger of growth</p>
            <p className="mt-6 text-[14px] text-muted">
              Annual cost per program participant
            </p>
            <p className="figure-xl mt-2 text-green-ink">$3,500–5,000</p>

            <p className="label-xs mt-12">The return</p>
            <dl className="mt-4">
              <Row
                k={`${tpwRecidivism.toFixed(0)}%`}
                v="three-year return-to-custody rate among participants"
                accent
              />
              <Row
                k={`−${rvrReduction.toFixed(0)}%`}
                v="rule-violation reports in custody, protecting corrections staff"
                accent
              />
              <Row
                k={`+${employmentLift.toFixed(0)}pts`}
                v="verified employment within 90 days of release, paying local and state taxes"
                accent
              />
              <Row k="—" v="Earned milestone credits, court fines and child support paid reliably" />
            </dl>

            <p className="mt-10 border-t border-rule pt-5 text-[17px] text-ink">
              A taxpayer gained. A recidivism cycle severed.
            </p>
          </div>
        </div>

        {/* To-scale cost comparison. One bar does what a chart cannot. */}
        <div className="mt-24 border-t border-rule pt-10">
          <p className="label-xs">Cost of one year, to scale</p>

          <div className="mt-6 space-y-5">
            <div>
              <div className="h-5 w-full bg-[#3b3f3c]" />
              <p className="mt-2 text-[13px] text-muted">
                Incarceration — {money(ANNUAL_INCARCERATION_COST)}
              </p>
            </div>
            <div>
              <div className="h-5 bg-green" style={{ width: `${share}%` }} />
              <p className="mt-2 text-[13px] text-muted">
                Programming — {money(PROGRAM_COST_MID)} ·{" "}
                <span className="text-ink">{share.toFixed(0)}% of the cost of a cell</span>
              </p>
            </div>
          </div>

          <Link
            href="/savings-calculator"
            className="mt-10 inline-block border-b-2 border-green pb-0.5 text-[15px] text-ink"
          >
            Open the savings calculator →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-5 border-t border-rule py-4">
      <dt className={`text-[17px] ${accent ? "text-green-ink" : "text-muted"}`}>{k}</dt>
      <dd className="text-[15px] leading-relaxed text-muted">{v}</dd>
    </div>
  );
}
