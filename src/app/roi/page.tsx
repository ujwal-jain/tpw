import { FilterBar } from "@/components/filter-bar";
import { CumulativeNet, SpendVsAverted } from "@/components/charts";
import { ScenarioSlider } from "@/components/scenario-slider";
import { ChartBlock, Kpi, KpiRow, PageHeader } from "@/components/ui";
import { parseFilters } from "@/lib/filters";
import { costModelByYear, costTotals, facilityOptions, summary } from "@/lib/metrics";
import {
  ANNUAL_INCARCERATION_COST,
  AVG_REINCARCERATION_TERM_YEARS,
  DISCLOSURE,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

const money = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v).toLocaleString()}`;

export default async function Roi({ searchParams }: PageProps<"/roi">) {
  const filters = parseFilters(await searchParams);

  const [s, years, facilities] = await Promise.all([
    summary(filters),
    costModelByYear(filters),
    facilityOptions(),
  ]);
  const t = costTotals(years, s.participants);

  return (
    <div className="shell py-16">
      <PageHeader
        eyebrow="The cost model"
        title="What the state spends, and what it stops spending."
        intro="Avoided incarceration is the only return counted here. Wages earned, taxes paid, restitution collected, and victimization avoided are all real and all excluded — the figures below are the conservative floor."
      />

      <FilterBar filters={filters} facilities={facilities} />

      <div className="mt-14">
        <KpiRow>
          <Kpi
            label="Return per dollar"
            value={`${t.roiMultiple.toFixed(1)}×`}
            note="Incarceration cost averted for every dollar of program spend."
            accent
          />
          <Kpi
            label="Net savings to the state"
            value={money(t.netSavings)}
            note={`${Math.round(t.avertedCases).toLocaleString()} return-to-custody terms averted across these cohorts.`}
            accent
          />
          <Kpi
            label="Cost per averted return"
            value={money(t.costPerAverted)}
            note={`Against ${money(ANNUAL_INCARCERATION_COST * AVG_REINCARCERATION_TERM_YEARS)} to incarcerate that same person again.`}
          />
          <Kpi
            label="Cost per participant"
            value={money(t.costPerParticipant)}
            note={`Total programming per person, against ${money(ANNUAL_INCARCERATION_COST)} for a single year in a cell.`}
          />
        </KpiRow>
      </div>

      <div className="mt-24 space-y-24">
        <ChartBlock
          title="Program spend against incarceration cost averted"
          note={`Averted cost is the recidivism gap applied to each cohort, priced at ${money(ANNUAL_INCARCERATION_COST)} per year across an average ${AVG_REINCARCERATION_TERM_YEARS}-year return term.`}
          series={[
            { label: "Program spend", color: "#4a453f" },
            { label: "Cost averted", color: "#d97736" },
          ]}
        >
          <SpendVsAverted data={years} />
        </ChartBlock>

        <ChartBlock
          title="Cumulative net savings"
          note="Running total of averted cost less program spend, by cohort year."
        >
          <CumulativeNet data={years} />
        </ChartBlock>

        <ScenarioSlider
          participants={s.participants}
          spend={t.spend}
          avertedCost={t.avertedCost}
        />

        <section className="border-t border-rule pt-8">
          <h2 className="text-[19px] tracking-[-0.02em] text-ink">How the model works</h2>
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
