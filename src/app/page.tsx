import Link from "next/link";
import { Spotlight, type Profile } from "@/components/spotlight";
import { AnchorList, type Anchor } from "@/components/anchor-list";
import { Reveal } from "@/components/reveal";
import { Wordmark } from "@/components/wordmark";
import { CompareLines } from "@/components/charts";
import { ChartBlock, Kpi, KpiRow } from "@/components/ui";
import { costModelByYear, costTotals, recidivismByYear, summary } from "@/lib/metrics";
import { parseFilters } from "@/lib/filters";
import {
  ANNUAL_INCARCERATION_COST,
  CAMPAIGN_ANNUAL_DOLLARS,
  DISCLOSURE,
  FIRST_COHORT_YEAR,
  LAST_COHORT_YEAR,
  PRISONS_FULLY_SERVED,
  PRISONS_TOTAL,
  RECIDIVISM_WINDOW_YEARS,
  SHARE_WHO_REENTER,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

const GREEN = "#74c088";
const MUTED = "#5f6360";

const money = (v: number) =>
  v >= 1_000_000_000
    ? `$${(v / 1_000_000_000).toFixed(2)}B`
    : v >= 1_000_000
      ? `$${(v / 1_000_000).toFixed(0)}M`
      : `$${Math.round(v).toLocaleString()}`;

const PROFILES: Profile[] = [
  {
    name: "Marcus",
    slug: "marcus",
    kicker: "The cost of delay",
    quote:
      "They spent six figures a year keeping me in a concrete cell with nothing to read. It took an 8-week peer mentorship workshop to teach me how to build a business. Why did that take ten years to get?",
    metrics: ["420 days saved", "Small business owner", "0 contacts in 4 years"],
  },
  {
    name: "Elena",
    slug: "elena",
    kicker: "The ripple effect",
    quote:
      "When you lock up a mother without rehabilitation, you aren’t just punishing her. You’re sentencing her kids to the same trajectory. TPW didn’t just change my life; it kept my daughter out of the system.",
    metrics: ["Hired day 45 post-release", "Reunited family", "Full restitution paid"],
  },
  {
    name: "David",
    slug: "david",
    kicker: "From balance sheet to public asset",
    quote:
      "I was an expense line item to the state for twelve years. Today, I supervise a crew of twelve and pay state taxes every April.",
    metrics: ["Union carpenter", "0 infractions during enrollment"],
  },
  {
    name: "Sergeant Ruiz",
    slug: "ruiz",
    kicker: "Inside the yard",
    quote:
      "Everyone argues about rehabilitation like it is charity. On my yard it is staffing. The housing units running programs are the units where my officers stop writing violations and start going home on time.",
    metrics: [
      "19 years in corrections",
      "Programming yard supervisor",
      "Write-ups down by more than half",
    ],
  },
];

export default async function Home() {
  const filters = parseFilters({});
  const [s, years, recid] = await Promise.all([
    summary(filters),
    costModelByYear(filters),
    recidivismByYear(filters),
  ]);
  const totals = costTotals(years, s.participants);

  // Derive the gap from the rounded rates the page actually prints, so "21% vs
  // 44%" never sits next to a gap of 24 points.
  const gapPts = Math.round(s.comparisonRecidivism) - Math.round(s.tpwRecidivism);

  const campaignParticipants = Math.round(
    CAMPAIGN_ANNUAL_DOLLARS / totals.costPerParticipant,
  );

  // Three points, each carrying a number this page already proved.
  const anchors: Anchor[] = [
    {
      title: "It saves money",
      body: "Returned to the state for every dollar spent, counting avoided incarceration alone.",
      figure: `${totals.roiMultiple.toFixed(1)}×`,
      href: "/savings-calculator",
    },
    {
      title: "It prevents crime",
      body: "Fewer people return to custody within three years. Fewer crimes, fewer victims.",
      figure: `−${gapPts}pts`,
      href: "#evidence",
    },
    {
      title: "It fills jobs",
      body: "More participants are working within 90 days of release, in trades the state cannot staff.",
      figure: `+${s.employmentLift.toFixed(0)}pts`,
      href: "#evidence",
    },
  ];

  return (
    <>
      {/* 1 — Hero */}
      <section className="border-b border-rule bg-green">
        <div className="shell flex min-h-[calc(100vh-4rem)] flex-col justify-center py-24">
          <Wordmark size="lg" />

          <h1 className="display mt-10 max-w-[18ch]">
            Transformative programming works. The budget doesn’t reflect it.
          </h1>

          <p className="measure mt-9 text-[19px] leading-relaxed text-ink/80">
            California spends ${ANNUAL_INCARCERATION_COST.toLocaleString()} a year to hold
            one person in a cell, and a fraction of one percent of that budget preparing
            anyone to come home. {SHARE_WHO_REENTER}% of them come home anyway.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
            <Link
              href="/savings-calculator"
              className="bg-ink px-7 py-3.5 text-[15px] font-medium text-paper transition-opacity hover:opacity-90"
            >
              Open the savings calculator
            </Link>
            <a
              href="#evidence"
              className="border-b-2 border-ink/30 pb-0.5 text-[15px] text-ink transition-colors hover:border-ink"
            >
              See the outcome data
            </a>
          </div>
        </div>
      </section>

      {/* 2 — The failing system */}
      <Reveal>
        <section className="border-t border-rule">
          <div className="shell section-y">
            <p className="eyebrow">The failing system</p>
            <h2 className="headline mt-5 max-w-[20ch]">
              The status quo is not neutral. It is expensive and it does not work.
            </h2>

            <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
              <BigStat
                value={`${SHARE_WHO_REENTER}%`}
                label="of California's incarcerated citizens will reenter society"
              />
              <BigStat
                value={`${s.comparisonRecidivism.toFixed(0)}%`}
                label={`are reincarcerated within ${RECIDIVISM_WINDOW_YEARS} years of release without programming`}
              />
              <BigStat
                value={`${PRISONS_FULLY_SERVED} of ${PRISONS_TOTAL}`}
                label="California prisons is fully served by community programming today"
              />
            </div>
          </div>
        </section>
      </Reveal>

      {/* 3 — The evidence */}
      <section id="evidence" className="scroll-mt-16 border-t border-rule">
        <div className="shell section-y">
          <p className="eyebrow">The evidence</p>
          <h2 className="headline mt-5 max-w-[22ch]">
            {s.participants.toLocaleString()} people, five release cohorts, one completed
            follow-up window.
          </h2>
          <p className="measure mt-6 text-[17px] leading-relaxed text-muted">
            Every participant is measured against a risk-matched comparison group drawn
            from the same facilities, the same risk bands, and the same release years.
          </p>

          <div className="mt-16">
            <KpiRow>
              <Kpi
                label="3-year recidivism"
                value={`${s.tpwRecidivism.toFixed(0)}%`}
                note={`${s.comparisonRecidivism.toFixed(0)}% without programming — a ${gapPts} point reduction.`}
                accent
              />
              <Kpi
                label="People served"
                value={s.participants.toLocaleString()}
                note={`Across release cohorts ${FIRST_COHORT_YEAR}–${LAST_COHORT_YEAR}.`}
              />
              <Kpi
                label="Employed at 90 days"
                value={`+${s.employmentLift.toFixed(0)}pts`}
                note="Verified employment within 90 days of release, against the comparison group."
              />
              <Kpi
                label="Net taxpayer savings"
                value={money(totals.netSavings)}
                note="Incarceration cost averted, less every dollar spent on programming."
                accent
              />
            </KpiRow>
          </div>

          <div className="mt-24">
            <ChartBlock
              title="Return to custody within three years, by release cohort"
              note="The gap between these two lines is the entire argument. Both groups come from the same facilities and the same risk bands; one received programming."
              series={[
                { label: "With programming", color: GREEN },
                { label: "Without programming", color: MUTED },
              ]}
            >
              <CompareLines data={recid} />
            </ChartBlock>
          </div>

          <p className="mt-16 border-t border-rule pt-6 text-[13px] text-muted">
            {DISCLOSURE}
          </p>
        </div>
      </section>

      {/* 4 — Spotlight */}
      <Reveal>
        <section className="border-t border-rule bg-band">
          <div className="shell section-y">
            <p className="eyebrow">Faces behind the figures</p>
            <h2 className="headline mt-5 max-w-[20ch]">
              Accountability isn’t just paid in time. It’s paid in purpose.
            </h2>

            <div className="mt-16">
              <Spotlight profiles={PROFILES} />
            </div>

            <p className="mt-14 border-t border-rule pt-6 text-[13px] text-muted">
              Composite profiles drawn from program participant outcomes. Quotes and
              milestones illustrate patterns in the dataset; they do not describe an
              identifiable individual.
            </p>
          </div>
        </section>
      </Reveal>

      {/* 5 — The policy decision */}
      <Reveal>
        <section className="border-t border-rule">
          <div className="shell section-y">
            <p className="eyebrow">The policy decision</p>
            <h2 className="headline mt-5 max-w-[20ch]">
              Recidivism is not an accident. It is a budget choice.
            </h2>

            <AnchorList anchors={anchors} />
          </div>
        </section>
      </Reveal>

      {/* 6 — The ask. Last thing on the page. */}
      <section className="border-t border-rule bg-green">
        <div className="shell section-y">
          <p className="label-xs !text-ink/70">The ask</p>
          <h2 className="display mt-6 max-w-[16ch]">One percent.</h2>

          <p className="measure mt-9 text-[19px] leading-relaxed text-ink/80">
            California directs about two tenths of one percent of its corrections budget
            to rehabilitation programming. Raising it to one percent —{" "}
            {money(CAMPAIGN_ANNUAL_DOLLARS)} a year to community organizations — funds{" "}
            {campaignParticipants.toLocaleString()} people a year at the cost measured on
            this page.
          </p>

          <Link
            href="/savings-calculator"
            className="mt-12 inline-block bg-ink px-7 py-3.5 text-[15px] font-medium text-paper transition-opacity hover:opacity-90"
          >
            Price it yourself →
          </Link>

          <div className="mt-20 grid gap-10 border-t border-ink/20 pt-10 md:grid-cols-2 md:gap-0">
            <div className="md:pr-14">
              <p className="label-xs !text-ink/70">For lawmakers & staff</p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/80">
                District-level outcome data, cohort tables, and a briefing for your
                committee.
              </p>
              <a
                href="mailto:policy@tpwcoalition.org?subject=Legislative%20briefing%20%26%20district%20data"
                className="mt-6 inline-block border-b-2 border-ink pb-0.5 text-[15px] text-ink"
              >
                Request a legislative briefing →
              </a>
            </div>

            <div className="border-t border-ink/20 pt-10 md:border-t-0 md:border-l md:pt-0 md:pl-14">
              <p className="label-xs !text-ink/70">For institutional funders</p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/80">
                Co-fund expansion where the cost model shows the steepest return.
              </p>
              <a
                href="mailto:partners@tpwcoalition.org?subject=Coalition%20partnership"
                className="mt-6 inline-block border-b-2 border-ink pb-0.5 text-[15px] text-ink"
              >
                Partner with the coalition →
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BigStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t-2 border-ink pt-5">
      <p className="figure-xl">{value}</p>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">{label}</p>
    </div>
  );
}
