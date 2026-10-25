import Link from "next/link";
import { DualLedger } from "@/components/dual-ledger";
import { PortraitCard, type Profile } from "@/components/portrait-card";
import { AnchorList, type Anchor } from "@/components/anchor-list";
import { Reveal } from "@/components/reveal";
import { costModelByYear, costTotals, summary } from "@/lib/metrics";
import { parseFilters } from "@/lib/filters";
import { ANNUAL_INCARCERATION_COST, FIRST_COHORT_YEAR, LAST_COHORT_YEAR } from "@/lib/constants";

export const dynamic = "force-dynamic";

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
];

export default async function Home() {
  const filters = parseFilters({});
  const [s, years] = await Promise.all([summary(filters), costModelByYear(filters)]);
  const totals = costTotals(years, s.participants);

  const anchors: Anchor[] = [
    {
      title: "Fiscal conservatism",
      body: `Every dollar invested in verifiable rehabilitation returns ${totals.roiMultiple.toFixed(1)} dollars in avoided re-arrest, re-adjudication, and re-incarceration costs across the cohorts tracked here.`,
      figure: `${totals.roiMultiple.toFixed(1)}×`,
      href: "/roi",
    },
    {
      title: "Public safety first",
      body: `Participants return to custody at ${s.tpwRecidivism.toFixed(0)}% within three years against ${s.comparisonRecidivism.toFixed(0)}% for a risk-matched comparison group. Lower recidivism is fewer crimes committed and fewer people harmed.`,
      figure: `−${s.gap.toFixed(0)}pts`,
      href: "/dashboard",
    },
    {
      title: "Workforce integration",
      body: "California faces severe labor shortages in the skilled trades. Rehabilitation pipelines move people directly into those gaps, verified at 90 days post-release.",
      figure: `+${s.employmentLift.toFixed(0)}pts`,
      href: "/dashboard",
    },
    {
      title: "Data transparency",
      body: "Participants are tracked from enrollment through post-release milestones on a published schema, so every figure on this site can be audited rather than asserted.",
      figure: `${s.participants.toLocaleString()}`,
      href: "/dashboard",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="shell flex min-h-[calc(100vh-4rem)] flex-col justify-center py-24">
          <p className="eyebrow">A public policy crisis hidden in plain sight</p>

          <h1 className="display mt-8 max-w-[17ch]">
            We spend ${ANNUAL_INCARCERATION_COST.toLocaleString()} a year to cage human
            potential.{" "}
            <span className="text-amber-ink">
              We spend next to nothing to prepare it to come home.
            </span>
          </h1>

          <p className="measure mt-10 text-[19px] leading-relaxed text-muted">
            Nearly every incarcerated Californian will walk back out through the prison
            gates. We can keep bankrolling a system designed to fail them — and us — or we
            can invest in the programs that break the cycle for good.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
            <a
              href="#ledger"
              className="bg-amber px-7 py-3.5 text-[15px] font-medium text-ink transition-opacity hover:opacity-90"
            >
              Examine the ledger
            </a>
            <Link
              href="/roi"
              className="border-b border-rule pb-0.5 text-[15px] text-muted transition-colors hover:border-amber hover:text-ink"
            >
              Read the legislative cost model
            </Link>
          </div>
        </div>
      </section>

      <Reveal>
        <DualLedger
          comparisonRecidivism={s.comparisonRecidivism}
          tpwRecidivism={s.tpwRecidivism}
          rvrReduction={s.rvrReduction}
          employmentLift={s.employmentLift}
        />
      </Reveal>

      {/* Faces behind the figures */}
      <Reveal>
        <section className="border-t border-rule">
          <div className="shell section-y">
            <p className="eyebrow">Faces behind the figures</p>
            <h2 className="headline mt-5 max-w-[20ch]">
              Accountability isn’t just paid in time. It’s paid in purpose.
            </h2>

            <div className="mt-20 grid gap-14 md:grid-cols-3 md:gap-10">
              {PROFILES.map((p) => (
                <PortraitCard key={p.slug} profile={p} />
              ))}
            </div>

            <p className="mt-16 border-t border-rule pt-6 text-[13px] text-muted">
              Composite profiles drawn from program participant outcomes. Quotes and
              milestones illustrate patterns in the dataset; they do not describe an
              identifiable individual.
            </p>
          </div>
        </section>
      </Reveal>

      {/* The legislative imperative */}
      <Reveal>
        <section className="border-t border-rule">
          <div className="shell section-y">
            <p className="eyebrow">The policy decision</p>
            <h2 className="headline mt-5 max-w-[20ch]">
              Recidivism is not an accident. It is a budget choice.
            </h2>

            <p className="measure mt-10 text-[17px] leading-relaxed text-muted">
              Every legislative session, California debates criminal justice through the
              lens of fear or fiscal constraint. But the math is settled: starving
              evidence-backed in-custody rehabilitation while fully funding failed
              containment is neither tough on crime nor fiscally conservative. It is
              negligence.
            </p>

            <AnchorList anchors={anchors} />

            <p className="mt-10 text-[13px] text-muted">
              Figures reflect release cohorts {FIRST_COHORT_YEAR}–{LAST_COHORT_YEAR}, each
              with a completed three-year follow-up window.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Conscience closer */}
      <section className="border-t border-rule bg-band">
        <div className="shell section-y">
          <h2 className="headline max-w-[18ch]">
            Look at the ledger. Which side will you stand on?
          </h2>

          <p className="measure mt-8 text-[17px] leading-relaxed text-muted">
            Whether you hold a legislative vote or capital to invest, doing nothing votes
            for the cycle to continue. Stand with the programs proven to bring people home
            for good.
          </p>

          <div className="mt-16 grid gap-10 border-t border-rule pt-10 md:grid-cols-2 md:gap-0">
            <div className="md:pr-14">
              <p className="label-xs">For lawmakers & staff</p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                District-level outcome data, cohort tables, and a briefing for your
                committee.
              </p>
              <a
                href="mailto:policy@tpwcoalition.org?subject=Legislative%20briefing%20%26%20district%20data"
                className="mt-6 inline-block border-b border-amber pb-0.5 text-[15px] text-ink"
              >
                Request a legislative briefing →
              </a>
            </div>

            <div className="border-t border-rule pt-10 md:border-t-0 md:border-l md:pt-0 md:pl-14">
              <p className="label-xs">For institutional funders</p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                Co-fund program expansion where the cost model shows the steepest return.
              </p>
              <a
                href="mailto:partners@tpwcoalition.org?subject=Coalition%20partnership"
                className="mt-6 inline-block border-b border-amber pb-0.5 text-[15px] text-ink"
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
