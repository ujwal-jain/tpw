import { InvestmentCalculator } from "@/components/investment-calculator";
import { Kpi, KpiRow, PageHeader } from "@/components/ui";
import { headline } from "@/lib/metrics";
import {
  ANNUAL_INCARCERATION_COST,
  AVG_REINCARCERATION_TERM_YEARS,
  DAILY_INCARCERATION_COST,
  DISCLOSURE,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

const money = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v).toLocaleString()}`;

export default async function SavingsCalculator() {
  const h = await headline();

  // Returns averted per person funded, using the returned-to-prison gap.
  const returnedGap = (h.returned36NotCompleted - h.returned36Completed) / 100;
  // Each person funded also earns credit days, which are avoided bed-days.
  const creditValuePerPerson = h.people ? h.creditValue / h.people : 0;

  return (
    <div className="shell py-16">
      <PageHeader
        eyebrow="Savings calculator"
        title="Move the budget line. Watch what the state stops spending."
        intro="Two returns are counted: sentence credits that shorten time served, and returns to prison that do not happen. Wages, taxes, restitution, court and policing costs, and avoided victimization are all real and all excluded — this is the conservative floor."
      />

      <InvestmentCalculator
        costPerParticipant={h.costPerParticipant}
        completionRate={h.completionRate / 100}
        returnedGap={returnedGap}
        creditValuePerPerson={creditValuePerPerson}
        avertedCostPerReturn={ANNUAL_INCARCERATION_COST * AVG_REINCARCERATION_TERM_YEARS}
      />

      <div className="mt-24">
        <p className="label-xs">What the model is built on</p>
        <div className="mt-8">
          <KpiRow>
            <Kpi
              label="Return per dollar"
              value={`~${h.roi.toFixed(0)}×`}
              note="Avoided bed-days plus avoided returns, against estimated program spend."
              accent
            />
            <Kpi
              label="Cost per person"
              value={money(h.costPerParticipant)}
              note={`The three organizations report serving 225 people a year on ${money(h.spend / h.people * 225)} of combined annual budget.`}
            />
            <Kpi
              label="Return-to-prison gap"
              value={`${(h.returned36NotCompleted - h.returned36Completed).toFixed(1)} pts`}
              note={`${h.returned36Completed.toFixed(1)}% of completers returned within three years, against ${h.returned36NotCompleted.toFixed(1)}% of those who did not complete.`}
              accent
            />
            <Kpi
              label="Credit days earned"
              value={h.creditDays.toLocaleString()}
              note={`${Math.round(h.bedYears)} bed-years, worth about ${money(h.creditValue)}.`}
            />
          </KpiRow>
        </div>
      </div>

      <section className="mt-24 border-t border-rule pt-8">
        <h2 className="font-[family-name:var(--font-poppins)] text-[19px] font-bold tracking-[-0.02em]">
          How the model works
        </h2>
        <dl className="mt-8 grid gap-x-14 gap-y-7 md:grid-cols-2">
          <Method
            k="Avoided bed-days"
            v={`Credit days earned through program completion, priced at $${DAILY_INCARCERATION_COST.toFixed(0)} per day — the state's average daily cost.`}
          />
          <Method
            k="Avoided returns"
            v={`The return-to-prison gap between completers and non-completers, applied to the people funded, priced at ${money(ANNUAL_INCARCERATION_COST * AVG_REINCARCERATION_TERM_YEARS)} per return.`}
          />
          <Method
            k="Program spend"
            v="Each organization's annual budget divided by the people it reports serving that year, applied to everyone in the dataset."
          />
          <Method
            k="What it does not prove"
            v="People who finish a program may differ from people who enroll and do not, in ways the data cannot show. The gap is an association, not proof the program caused it."
          />
        </dl>
      </section>

      <p className="mt-20 border-t border-rule pt-6 text-[13px] text-muted">{DISCLOSURE}</p>
    </div>
  );
}

function Method({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-t border-rule pt-4">
      <dt className="text-[15px] text-ink">{k}</dt>
      <dd className="mt-1.5 text-[14px] leading-relaxed text-muted">{v}</dd>
    </div>
  );
}
