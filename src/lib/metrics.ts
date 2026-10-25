import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  ANNUAL_INCARCERATION_COST,
  AVG_REINCARCERATION_TERM_YEARS,
  DAILY_INCARCERATION_COST,
} from "./constants";

/**
 * Every metric here reads the open-data layer loaded from `open-data/`.
 *
 * Two things shape all of it. There is no comparison group: the contrast is
 * people who completed a program against people who enrolled and did not, which
 * is self-selection, not a control. And follow-up is incomplete — only 388 of
 * 1,200 people have a known 36-month answer — so every rate carries the
 * denominator it was computed from, and no caller may render one without it.
 *
 * Completion is `credit_days_earned > 0`, because non-completers always receive
 * zero RAC days. Issue #2 upstream would replace that inference.
 */

const REOFFENSE = sql`('arrest','conviction','returned')`;
const KNOWN = sql`('arrest','conviction','returned','none')`;

const rows = async <T>(q: ReturnType<typeof sql>): Promise<T[]> =>
  (await db.execute(q)) as unknown as T[];

const n = (v: unknown) => Number(v ?? 0);

export type WindowRow = {
  window: string;
  months: number;
  completed: number;
  notCompleted: number;
  knownCompleted: number;
  knownNotCompleted: number;
};

/**
 * Any reoffense — arrest, conviction, or return — at each follow-up window.
 * The widening gap across windows is the strongest signal in this dataset.
 */
export async function reoffenseByWindow(): Promise<WindowRow[]> {
  const windows = [
    { col: sql`outcome_6mo`, label: "6 months", months: 6 },
    { col: sql`outcome_12mo`, label: "12 months", months: 12 },
    { col: sql`outcome_36mo`, label: "36 months", months: 36 },
  ];

  const out: WindowRow[] = [];
  for (const w of windows) {
    const [r] = await rows<Record<string, unknown>>(sql`
      select
        count(*) filter (where credit_days_earned > 0 and ${w.col} in ${KNOWN}) as known_c,
        count(*) filter (where credit_days_earned = 0 and ${w.col} in ${KNOWN}) as known_n,
        count(*) filter (where credit_days_earned > 0 and ${w.col} in ${REOFFENSE}) as reoff_c,
        count(*) filter (where credit_days_earned = 0 and ${w.col} in ${REOFFENSE}) as reoff_n
      from od_outcomes
    `);
    const knownC = n(r.known_c);
    const knownN = n(r.known_n);
    out.push({
      window: w.label,
      months: w.months,
      completed: knownC ? (n(r.reoff_c) / knownC) * 100 : 0,
      notCompleted: knownN ? (n(r.reoff_n) / knownN) * 100 : 0,
      knownCompleted: knownC,
      knownNotCompleted: knownN,
    });
  }
  return out;
}

export type Headline = {
  people: number;
  completers: number;
  completionRate: number;
  /** Any reoffense at 36 months. */
  reoff36Completed: number;
  reoff36NotCompleted: number;
  known36Completed: number;
  known36NotCompleted: number;
  /** Returned to prison only — the coalition's primary definition. */
  returned36Completed: number;
  returned36NotCompleted: number;
  creditDays: number;
  bedYears: number;
  creditValue: number;
  avertedReturns: number;
  avertedValue: number;
  spend: number;
  costPerParticipant: number;
  roi: number;
};

export async function headline(): Promise<Headline> {
  const [r] = await rows<Record<string, unknown>>(sql`
    select
      count(*) as people,
      count(*) filter (where credit_days_earned > 0) as completers,
      sum(credit_days_earned) as credit_days,
      count(*) filter (where credit_days_earned > 0 and outcome_36mo in ${KNOWN}) as known_c,
      count(*) filter (where credit_days_earned = 0 and outcome_36mo in ${KNOWN}) as known_n,
      count(*) filter (where credit_days_earned > 0 and outcome_36mo in ${REOFFENSE}) as reoff_c,
      count(*) filter (where credit_days_earned = 0 and outcome_36mo in ${REOFFENSE}) as reoff_n,
      count(*) filter (where credit_days_earned > 0 and outcome_36mo = 'returned') as ret_c,
      count(*) filter (where credit_days_earned = 0 and outcome_36mo = 'returned') as ret_n
    from od_outcomes
  `);

  const [b] = await rows<Record<string, unknown>>(sql`
    select
      sum(annual_program_budget_usd) as budget,
      sum(participants_served_in_reporting_year) as served_per_year
    from od_organizations
  `);

  const people = n(r.people);
  const completers = n(r.completers);
  const knownC = n(r.known_c);
  const knownN = n(r.known_n);

  const returned36Completed = knownC ? (n(r.ret_c) / knownC) * 100 : 0;
  const returned36NotCompleted = knownN ? (n(r.ret_n) / knownN) * 100 : 0;

  const creditDays = n(r.credit_days);
  const creditValue = creditDays * DAILY_INCARCERATION_COST;

  // Returns averted applies the returned-only gap to everyone who completed.
  const avertedReturns =
    completers * ((returned36NotCompleted - returned36Completed) / 100);
  const avertedValue =
    avertedReturns * ANNUAL_INCARCERATION_COST * AVG_REINCARCERATION_TERM_YEARS;

  // Cost per person comes straight from the organization file now that it
  // reports how many people each annual budget serves (upstream issue #1).
  // Spend for this population is that rate applied to everyone in it.
  const servedPerYear = n(b.served_per_year);
  const costPerParticipant = servedPerYear ? n(b.budget) / servedPerYear : 0;
  const spend = costPerParticipant * people;

  return {
    people,
    completers,
    completionRate: people ? (completers / people) * 100 : 0,
    reoff36Completed: knownC ? (n(r.reoff_c) / knownC) * 100 : 0,
    reoff36NotCompleted: knownN ? (n(r.reoff_n) / knownN) * 100 : 0,
    known36Completed: knownC,
    known36NotCompleted: knownN,
    returned36Completed,
    returned36NotCompleted,
    creditDays,
    bedYears: creditDays / 365,
    creditValue,
    avertedReturns,
    avertedValue,
    spend,
    costPerParticipant,
    roi: spend ? (creditValue + avertedValue) / spend : 0,
  };
}

export type CoverageRow = { status: string; label: string; count: number };

const COVERAGE_LABELS: Record<string, string> = {
  pending: "Too recent to ask",
  none: "Answered — no reoffense",
  not_tracked: "Never consented to follow-up",
  no_response: "Consented, did not answer",
  returned: "Returned to prison",
  conviction: "New conviction",
  arrest: "Arrested",
};

/** Where the 1,200 people stand at the 36-month mark. Shown, not buried. */
export async function followUpCoverage(): Promise<CoverageRow[]> {
  const r = await rows<Record<string, unknown>>(sql`
    select outcome_36mo as status, count(*) as count
    from od_outcomes group by 1
  `);
  const order = Object.keys(COVERAGE_LABELS);
  return r
    .map((x) => ({
      status: String(x.status),
      label: COVERAGE_LABELS[String(x.status)] ?? String(x.status),
      count: n(x.count),
    }))
    .sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
}

export type Reentry = {
  housedCompleted: number;
  housedNotCompleted: number;
  workingCompleted: number;
  workingNotCompleted: number;
  knownCompleted: number;
  knownNotCompleted: number;
};

/** Housing and work at 90 days, among people who gave an answer. */
export async function reentryAt90Days(): Promise<Reentry> {
  const [r] = await rows<Record<string, unknown>>(sql`
    select
      count(*) filter (where credit_days_earned > 0) as known_c,
      count(*) filter (where credit_days_earned = 0) as known_n,
      count(*) filter (where credit_days_earned > 0 and housed_90d = 'yes') as housed_c,
      count(*) filter (where credit_days_earned = 0 and housed_90d = 'yes') as housed_n,
      count(*) filter (where credit_days_earned > 0 and working_or_training_90d = 'yes') as work_c,
      count(*) filter (where credit_days_earned = 0 and working_or_training_90d = 'yes') as work_n
    from od_outcomes
    where housed_90d in ('yes','no')
  `);
  const kc = n(r.known_c);
  const kn = n(r.known_n);
  return {
    housedCompleted: kc ? (n(r.housed_c) / kc) * 100 : 0,
    housedNotCompleted: kn ? (n(r.housed_n) / kn) * 100 : 0,
    workingCompleted: kc ? (n(r.work_c) / kc) * 100 : 0,
    workingNotCompleted: kn ? (n(r.work_n) / kn) * 100 : 0,
    knownCompleted: kc,
    knownNotCompleted: kn,
  };
}

export type OrgRow = {
  organization: string;
  programType: string;
  county: string;
  people: number;
  completionRate: number;
  known36: number;
  reoff36: number;
  creditDays: number;
  budget: number;
};

export async function byOrganization(): Promise<OrgRow[]> {
  const r = await rows<Record<string, unknown>>(sql`
    select
      o.organization,
      g.program_type,
      g.county,
      g.annual_program_budget_usd as budget,
      count(*) as people,
      count(*) filter (where o.credit_days_earned > 0) as completers,
      sum(o.credit_days_earned) as credit_days,
      count(*) filter (where o.credit_days_earned > 0 and o.outcome_36mo in ${KNOWN}) as known_c,
      count(*) filter (where o.credit_days_earned > 0 and o.outcome_36mo in ${REOFFENSE}) as reoff_c
    from od_outcomes o
    join od_organizations g on g.organization = o.organization
    group by 1, 2, 3, 4
    order by 1
  `);

  return r.map((x) => {
    const people = n(x.people);
    const knownC = n(x.known_c);
    return {
      organization: String(x.organization),
      programType: String(x.program_type),
      county: String(x.county),
      people,
      completionRate: people ? (n(x.completers) / people) * 100 : 0,
      known36: knownC,
      reoff36: knownC ? (n(x.reoff_c) / knownC) * 100 : 0,
      creditDays: n(x.credit_days),
      budget: n(x.budget),
    };
  });
}
