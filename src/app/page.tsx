import Link from "next/link";
import { Spotlight, type Profile } from "@/components/spotlight";
import { AnchorList, type Anchor } from "@/components/anchor-list";
import { Reveal } from "@/components/reveal";
import { Wordmark } from "@/components/wordmark";
import { CoverageBar, ReentryBars, ReoffenseWindows } from "@/components/charts";
import { ChartBlock, Kpi, KpiRow } from "@/components/ui";
import {
  byOrganization,
  followUpCoverage,
  headline,
  reentryAt90Days,
  reoffenseByWindow,
} from "@/lib/metrics";
import {
  ANNUAL_INCARCERATION_COST,
  CAMPAIGN_ANNUAL_DOLLARS,
  DISCLOSURE,
  PRISONS_FULLY_SERVED,
  PRISONS_TOTAL,
  SHARE_WHO_REENTER,
  STATEWIDE_RECIDIVISM,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

const GREEN = "#74c088";
const SPEND = "#3b3f3c";

const money = (v: number) => {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) {
    const m = v / 1_000_000;
    return `$${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  return `$${Math.round(v).toLocaleString()}`;
};

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
  const [h, windows, coverage, reentry, orgs] = await Promise.all([
    headline(),
    reoffenseByWindow(),
    followUpCoverage(),
    reentryAt90Days(),
    byOrganization(),
  ]);

  const gapPts =
    Math.round(h.reoff36NotCompleted) - Math.round(h.reoff36Completed);
  const campaignParticipants = Math.round(
    CAMPAIGN_ANNUAL_DOLLARS / h.costPerParticipant,
  );

  const reentryData = [
    {
      measure: "Housed",
      completed: reentry.housedCompleted,
      notCompleted: reentry.housedNotCompleted,
    },
    {
      measure: "Working or in training",
      completed: reentry.workingCompleted,
      notCompleted: reentry.workingNotCompleted,
    },
  ];

  const groupSeries = [
    { label: "Completed a program", color: GREEN },
    { label: "Did not complete", color: SPEND },
  ];

  const anchors: Anchor[] = [
    {
      title: "It saves money",
      body: "Returned to the state for every dollar spent, counting avoided bed-days and avoided returns.",
      figure: `~${h.roi.toFixed(0)}×`,
      href: "/savings-calculator",
    },
    {
      title: "It prevents crime",
      body: "Fewer people reoffend within three years. Fewer crimes, fewer victims.",
      figure: `−${gapPts}pts`,
      href: "#evidence",
    },
    {
      title: "It shortens sentences earned",
      body: `${h.creditDays.toLocaleString()} credit days earned — ${Math.round(h.bedYears)} bed-years the state does not pay for.`,
      figure: `${Math.round(h.bedYears)}`,
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
                value={`${STATEWIDE_RECIDIVISM}%`}
                label="are reincarcerated within 3 years of release"
              />
              <BigStat
                value={`${PRISONS_FULLY_SERVED} of ${PRISONS_TOTAL}`}
                label="California prisons is fully served by community programming today"
              />
            </div>

            <p className="mt-12 text-[13px] text-muted">
              Statewide figures published by TPW. The outcome data below comes from three
              coalition organizations.
            </p>
          </div>
        </section>
      </Reveal>

      {/* 3 — The evidence */}
      <section id="evidence" className="scroll-mt-16 border-t border-rule">
        <div className="shell section-y">
          <p className="eyebrow">The evidence</p>
          <h2 className="headline mt-5 max-w-[24ch]">
            What three organizations can already show for{" "}
            {h.people.toLocaleString()} people.
          </h2>
          <p className="measure mt-6 text-[17px] leading-relaxed text-muted">
            Everyone here enrolled in a program. The comparison is between people who
            finished and people who did not — not a randomized control. Follow-up is
            voluntary and still in progress, so every figure below shows how many people
            it was measured on.
          </p>

          <div className="mt-16">
            <KpiRow>
              <Kpi
                label="Reoffense at 36 months"
                value={`${h.reoff36Completed.toFixed(1)}%`}
                note={`Among ${h.known36Completed} completers with an answer, against ${h.reoff36NotCompleted.toFixed(1)}% of ${h.known36NotCompleted} who did not complete.`}
                accent
              />
              <Kpi
                label="Completion rate"
                value={`${h.completionRate.toFixed(0)}%`}
                note={`${h.completers.toLocaleString()} of ${h.people.toLocaleString()} people finished their program.`}
              />
              <Kpi
                label="Credit days earned"
                value={h.creditDays.toLocaleString()}
                note={`${Math.round(h.bedYears)} bed-years, worth about ${money(h.creditValue)} at the state's average daily cost.`}
              />
              <Kpi
                label="Return per dollar"
                value={`~${h.roi.toFixed(0)}×`}
                note="Avoided bed-days plus avoided returns, against estimated program spend."
                accent
              />
            </KpiRow>
          </div>

          <div className="mt-24 space-y-24">
            <ChartBlock
              title="Reoffense rate at 6, 12, and 36 months"
              note={`Arrest, conviction, or return to prison. The gap widens the longer people are followed. Measured on ${windows[0].knownCompleted + windows[0].knownNotCompleted} people at 6 months, falling to ${windows[2].knownCompleted + windows[2].knownNotCompleted} at 36 months as follow-up is still in progress.`}
              series={groupSeries}
            >
              <ReoffenseWindows data={windows} />
            </ChartBlock>

            <ChartBlock
              title="Where the follow-up stands"
              note={`All ${h.people.toLocaleString()} people, by what is known at the 36-month mark. Most have simply not been out long enough to ask. The distance between consent and an answer is the part that needs funding.`}
            >
              <CoverageBar data={coverage} />
            </ChartBlock>

            <ChartBlock
              title="Housing and work at 90 days after release"
              note={`Measured on the ${(reentry.knownCompleted + reentry.knownNotCompleted).toLocaleString()} people who gave an answer.`}
              series={groupSeries}
            >
              <ReentryBars data={reentryData} />
            </ChartBlock>

            <section className="border-t border-rule pt-8">
              <h2 className="font-[family-name:var(--font-poppins)] text-[19px] font-bold tracking-[-0.02em]">
                By organization
              </h2>
              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-[14px]">
                  <thead>
                    <tr className="label-xs">
                      <th className="border-b border-rule pb-3 font-semibold">
                        Organization
                      </th>
                      <th className="border-b border-rule pb-3 font-semibold">People</th>
                      <th className="border-b border-rule pb-3 font-semibold">
                        Completed
                      </th>
                      <th className="border-b border-rule pb-3 font-semibold">
                        Reoffense at 36mo
                      </th>
                      <th className="border-b border-rule pb-3 font-semibold">
                        Credit days
                      </th>
                      <th className="border-b border-rule pb-3 font-semibold">Budget</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgs.map((o) => (
                      <tr key={o.organization}>
                        <td className="border-b border-rule py-4">
                          <span className="block text-ink">{o.organization}</span>
                          <span className="text-[13px] text-muted">
                            {o.programType} · {o.county}
                          </span>
                        </td>
                        <td className="border-b border-rule py-4">{o.people}</td>
                        <td className="border-b border-rule py-4">
                          {o.completionRate.toFixed(0)}%
                        </td>
                        <td className="border-b border-rule py-4">
                          <span className="text-green-ink">
                            {o.reoff36.toFixed(1)}%
                          </span>
                          <span className="text-muted"> (n={o.known36})</span>
                        </td>
                        <td className="border-b border-rule py-4">
                          {o.creditDays.toLocaleString()}
                        </td>
                        <td className="border-b border-rule py-4">
                          {money(o.budget)}/yr
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <p className="measure mt-16 border-t border-rule pt-6 text-[13px] leading-relaxed text-muted">
            {DISCLOSURE} People who finish a program may differ from people who enroll and
            do not, in ways this data cannot show. A lower reoffense rate among completers
            is an association, not proof that the program caused it.
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
            {money(CAMPAIGN_ANNUAL_DOLLARS)} a year to community organizations — would
            fund roughly {campaignParticipants.toLocaleString()} people a year at what
            these three organizations spend per person.
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
