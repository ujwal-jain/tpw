import { CumulativeNet, SpendVsAverted } from "@/components/charts";
import { InvestmentCalculator } from "@/components/investment-calculator";
import { ChartBlock, Kpi, KpiRow, PageHeader } from "@/components/ui";
import { parseFilters } from "@/lib/filters";
import { costModelByYear, costTotals, summary } from "@/lib/metrics";
import {
  ANNUAL_INCARCERATION_COST,
  AVG_REINCARCERATION_TERM_YEARS,
  DISCLOSURE,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

const money = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v).toLocaleString()}`;

export default async function SavingsCalculator() {
  const filters = parseFilters({});
  const [s, years] = await Promise.all([summary(filters), costModelByYear(filters)]);
  const t = costTotals(years, s.participants);

  return (
    <div className="shell py-16">
      <PageHeader
        eyebrow="Savings calculator"
        title="Move the budget line. Watch what the state stops spending."
        intro="Avoided incarceration is the only return counted here. Wages earned, taxes paid, restitution collected, and victimization avoided are all real and all excluded — this is the conservative floor, not the ceiling."
      />

      <InvestmentCalculator
        costPerParticipant={t.costPerParticipant}
        gapFraction={s.gap / 100}
        avertedCostPerAvertedReturn={
          ANNUAL_INCARCERATION_COST * AVG_REINCARCERATION_TERM_YEARS
        }
      />

      <div className="mt-24">
        <p className="label-xs">What the model is built on</p>
        <div className="mt-8">
          <KpiRow>
            <Kpi
              label="Return per dollar"
              value={`${t.roiMultiple.toFixed(1)}×`}
              note="Incarceration cost averted for every dollar of program spend, measured across the cohorts on this site."
              accent
            />
            <Kpi
              label="Cost per participant"
              value={money(t.costPerParticipant)}
              note={`Total programming per person, against ${money(ANNUAL_INCARCERATION_COST)} for a single year in a cell.`}
            />
            <Kpi
              label="Recidivism gap"
              value={`${Math.round(s.comparisonRecidivism) - Math.round(s.tpwRecidivism)} pts`}
              note={`${s.tpwRecidivism.toFixed(0)}% of participants return within three years, against ${s.comparisonRecidivism.toFixed(0)}% of the comparison group.`}
              accent
            />
            <Kpi
              label="Cost per averted return"
              value={money(t.costPerAverted)}
              note={`Against ${money(ANNUAL_INCARCERATION_COST * AVG_REINCARCERATION_TERM_YEARS)} to incarcerate that same person again.`}
            />
          </KpiRow>
        </div>
      </div>

      <div className="mt-24 space-y-24">
        <ChartBlock
          title="Program spend against incarceration cost averted"
          note={`Averted cost is the recidivism gap applied to each cohort, priced at ${money(ANNUAL_INCARCERATION_COST)} per year across an average ${AVG_REINCARCERATION_TERM_YEARS}-year return term.`}
          series={[
            { label: "Program spend", color: "#3b3f3c" },
            { label: "Cost averted", color: "#efc75e" },
          ]}
        >
          <SpendVsAverted data={years} />
        </ChartBlock>

        <ChartBlock
          title="Cumulative net savings"
          note="Running total of averted cost less program spend, by release cohort."
        >
          <CumulativeNet data={years} />
        </ChartBlock>

        <section className="border-t border-rule pt-8">
          <h2 className="font-[family-name:var(--font-poppins)] text-[19px] font-bold tracking-[-0.02em]">
            How the model works
          </h2>
          <dl className="mt-8 grid gap-x-14 gap-y-7 md:grid-cols-2">
            <Method
              k="Averted returns"
              v="Comparison-group recidivism rate minus participant rate, multiplied by the number of participants released in that cohort."
            />
            <Method
              k="Averted cost"
              v={`Averted returns × ${money(ANNUAL_INCARCERATION_COST)} per year × ${AVG_REINCARCERATION_TERM_YEARS} years, the average return-to-custody term.`}
            />
            <Method
              k="Program spend"
              v="Each enrollment priced at its program's annual per-participant cost, prorated by the time the person was actually enrolled."
            />
            <Method
              k="Excluded on purpose"
              v="Wages, tax receipts, restitution, child support, averted court and policing costs, and avoided victimization. Counting them would roughly double the return."
            />
          </dl>
        </section>
      </div>

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
