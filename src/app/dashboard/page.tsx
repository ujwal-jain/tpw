import { FilterBar } from "@/components/filter-bar";
import { CompareLines, EnrollmentArea, TypeBars } from "@/components/charts";
import { ChartBlock, Kpi, KpiRow, PageHeader } from "@/components/ui";
import { parseFilters } from "@/lib/filters";
import {
  costModelByYear,
  costTotals,
  employmentByYear,
  enrollmentByYear,
  facilityOptions,
  outcomeByProgramType,
  recidivismByYear,
  rvrByYear,
  summary,
} from "@/lib/metrics";
import { DISCLOSURE, RECIDIVISM_WINDOW_YEARS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const AMBER = "#d97736";
const MUTED = "#6e6a64";

const money = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v).toLocaleString()}`;

export default async function Dashboard({ searchParams }: PageProps<"/dashboard">) {
  const filters = parseFilters(await searchParams);

  const [s, recid, enroll, byType, rvr, employ, facilities, costYears] = await Promise.all([
    summary(filters),
    recidivismByYear(filters),
    enrollmentByYear(filters),
    outcomeByProgramType(filters),
    rvrByYear(filters),
    employmentByYear(filters),
    facilityOptions(),
    costModelByYear(filters),
  ]);

  const totals = costTotals(costYears, s.participants);
  const compareSeries = [
    { label: "TPW participants", color: AMBER },
    { label: "Comparison group", color: MUTED },
  ];

  return (
    <div className="shell py-16">
      <PageHeader
        eyebrow="Outcome dashboard"
        title="What the programs actually returned, cohort by cohort."
        intro={`Every participant is measured against a risk-matched comparison group drawn from the same facilities and the same release years. Recidivism is a ${RECIDIVISM_WINDOW_YEARS}-year return-to-custody measure, and only cohorts with a completed window appear here.`}
      />

      <FilterBar filters={filters} facilities={facilities} />

      <div className="mt-14">
        <KpiRow>
          <Kpi
            label="3-year recidivism"
            value={`${s.tpwRecidivism.toFixed(1)}%`}
            note={`${s.comparisonRecidivism.toFixed(1)}% for the comparison group — a ${s.gap.toFixed(1)} point reduction.`}
            accent
          />
          <Kpi
            label="Participants served"
            value={s.participants.toLocaleString()}
            note={`${Math.round(s.creditDays / 365).toLocaleString()} years of earned milestone credit across these cohorts.`}
          />
          <Kpi
            label="Program completion"
            value={`${s.completionRate.toFixed(0)}%`}
            note="Share of enrollments finished, rather than withdrawn or still open."
          />
          <Kpi
            label="Net taxpayer savings"
            value={money(totals.netSavings)}
            note={`Incarceration cost averted, less every dollar spent on programming.`}
            accent
          />
        </KpiRow>
      </div>

      <div className="mt-24 space-y-24">
        <ChartBlock
          title="Return to custody within three years, by release cohort"
          note="The gap between these two lines is the entire argument. Both groups come from the same facilities and the same risk bands; one received programming."
          series={compareSeries}
        >
          <CompareLines data={recid} />
        </ChartBlock>

        <ChartBlock
          title="Participants enrolled, by program type"
          note="Unique participants touching each program type per cohort year."
        >
          <EnrollmentArea data={enroll} />
        </ChartBlock>

        <div className="grid gap-20 lg:grid-cols-2">
          <ChartBlock
            title="Recidivism by program type"
            note="Dashed line marks the comparison-group rate for the same filters."
          >
            <TypeBars
              data={byType}
              dataKey="recidivism"
              benchmark={s.comparisonRecidivism}
              benchmarkLabel="No programming"
            />
          </ChartBlock>

          <ChartBlock
            title="Employed within 90 days of release"
            series={compareSeries}
            note="Verified employment, participants against the comparison group."
          >
            <CompareLines data={employ} />
          </ChartBlock>
        </div>

        <ChartBlock
          title="Rule-violation reports per 100 people in custody"
          note="In-custody safety is the metric corrections staff feel first. Lower is safer for everyone inside the facility."
          series={compareSeries}
        >
          <CompareLines data={rvr} unit="rate" />
        </ChartBlock>
      </div>

      <p className="mt-20 border-t border-rule pt-6 text-[13px] text-muted">{DISCLOSURE}</p>
    </div>
  );
}
