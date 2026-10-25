import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { Filters } from "./filters";
import { ANNUAL_INCARCERATION_COST, AVG_REINCARCERATION_TERM_YEARS } from "./constants";

/**
 * Every query here compares programmed participants against the risk-matched
 * comparison group held in the same table. A program-type filter narrows the
 * programmed arm only — the comparison arm stays whole, because shrinking it
 * to "people enrolled in welding" would be a group that does not exist.
 */
const scope = (f: Filters) => sql`
  p.cohort_year between ${f.from} and ${f.to}
  and (${f.facilityId}::int is null or p.facility_id = ${f.facilityId})
  and (
    ${f.programType}::text is null
    or p.is_comparison
    or exists (
      select 1 from enrollments e
      join programs pr on pr.id = e.program_id
      where e.participant_id = p.id and pr.type = ${f.programType}
    )
  )
`;

/**
 * Enrollment spend prorated by time actually enrolled. Programming is in
 * custody, so an enrollment that is still open stops costing at release —
 * without that cap, open enrollments accrue cost forever and deflate the ROI.
 */
const spendExpr = sql`
  sum(
    greatest(
      (least(coalesce(e.ended_on, o.released_on), o.released_on) - e.started_on)::numeric / 365.0,
      0
    ) * pr.annual_cost_per_participant_cents / 100.0
  )
`;

const rows = async <T>(q: ReturnType<typeof sql>): Promise<T[]> =>
  (await db.execute(q)) as unknown as T[];

const n = (v: unknown) => Number(v ?? 0);

export type YearPair = { year: number; tpw: number; comparison: number; tpwN: number };

export async function recidivismByYear(f: Filters): Promise<YearPair[]> {
  const r = await rows<Record<string, unknown>>(sql`
    select p.cohort_year as year,
           avg(o.recidivated_3yr::int) filter (where not p.is_comparison) as tpw,
           avg(o.recidivated_3yr::int) filter (where p.is_comparison) as comparison,
           count(*) filter (where not p.is_comparison) as tpw_n
    from participants p join outcomes o on o.participant_id = p.id
    where ${scope(f)}
    group by 1 order by 1
  `);
  return r.map((x) => ({
    year: n(x.year),
    tpw: n(x.tpw) * 100,
    comparison: n(x.comparison) * 100,
    tpwN: n(x.tpw_n),
  }));
}

export async function employmentByYear(f: Filters): Promise<YearPair[]> {
  const r = await rows<Record<string, unknown>>(sql`
    select p.cohort_year as year,
           avg(o.employed_at_90d::int) filter (where not p.is_comparison) as tpw,
           avg(o.employed_at_90d::int) filter (where p.is_comparison) as comparison,
           count(*) filter (where not p.is_comparison) as tpw_n
    from participants p join outcomes o on o.participant_id = p.id
    where ${scope(f)}
    group by 1 order by 1
  `);
  return r.map((x) => ({
    year: n(x.year),
    tpw: n(x.tpw) * 100,
    comparison: n(x.comparison) * 100,
    tpwN: n(x.tpw_n),
  }));
}

/** Rule-violation reports per 100 people in custody — the staff-safety metric. */
export async function rvrByYear(f: Filters): Promise<YearPair[]> {
  const r = await rows<Record<string, unknown>>(sql`
    select p.cohort_year as year,
           avg(o.rvr_count) filter (where not p.is_comparison) as tpw,
           avg(o.rvr_count) filter (where p.is_comparison) as comparison,
           count(*) filter (where not p.is_comparison) as tpw_n
    from participants p join outcomes o on o.participant_id = p.id
    where ${scope(f)}
    group by 1 order by 1
  `);
  return r.map((x) => ({
    year: n(x.year),
    tpw: n(x.tpw) * 100,
    comparison: n(x.comparison) * 100,
    tpwN: n(x.tpw_n),
  }));
}

export type EnrollmentYear = { year: number } & Record<string, number>;

export async function enrollmentByYear(f: Filters): Promise<EnrollmentYear[]> {
  const r = await rows<Record<string, unknown>>(sql`
    select p.cohort_year as year, pr.type as type, count(distinct p.id) as n
    from participants p
    join enrollments e on e.participant_id = p.id
    join programs pr on pr.id = e.program_id
    where ${scope(f)} and not p.is_comparison
    group by 1, 2 order by 1
  `);
  const byYear = new Map<number, EnrollmentYear>();
  for (const x of r) {
    const y = n(x.year);
    const row = byYear.get(y) ?? ({ year: y } as EnrollmentYear);
    row[String(x.type)] = n(x.n);
    byYear.set(y, row);
  }
  return [...byYear.values()].sort((a, b) => a.year - b.year);
}

export type ProgramTypeOutcome = {
  type: string;
  recidivism: number;
  employment: number;
  participants: number;
};

export async function outcomeByProgramType(f: Filters): Promise<ProgramTypeOutcome[]> {
  const r = await rows<Record<string, unknown>>(sql`
    select pr.type as type,
           avg(o.recidivated_3yr::int) as recid,
           avg(o.employed_at_90d::int) as emp,
           count(distinct p.id) as n
    from participants p
    join outcomes o on o.participant_id = p.id
    join enrollments e on e.participant_id = p.id
    join programs pr on pr.id = e.program_id
    where ${scope(f)} and not p.is_comparison
    group by 1 order by 2
  `);
  return r.map((x) => ({
    type: String(x.type),
    recidivism: n(x.recid) * 100,
    employment: n(x.emp) * 100,
    participants: n(x.n),
  }));
}

export type Summary = {
  tpwRecidivism: number;
  comparisonRecidivism: number;
  gap: number;
  participants: number;
  completionRate: number;
  employmentLift: number;
  creditDays: number;
  rvrReduction: number;
};

export async function summary(f: Filters): Promise<Summary> {
  const [o] = await rows<Record<string, unknown>>(sql`
    select avg(o.recidivated_3yr::int) filter (where not p.is_comparison) as tpw_recid,
           avg(o.recidivated_3yr::int) filter (where p.is_comparison) as cmp_recid,
           avg(o.employed_at_90d::int) filter (where not p.is_comparison) as tpw_emp,
           avg(o.employed_at_90d::int) filter (where p.is_comparison) as cmp_emp,
           avg(o.rvr_count) filter (where not p.is_comparison) as tpw_rvr,
           avg(o.rvr_count) filter (where p.is_comparison) as cmp_rvr,
           count(*) filter (where not p.is_comparison) as participants
    from participants p join outcomes o on o.participant_id = p.id
    where ${scope(f)}
  `);

  const [e] = await rows<Record<string, unknown>>(sql`
    select avg((e.status = 'completed')::int) as completion,
           sum(e.credit_days_earned) as credit_days
    from participants p
    join enrollments e on e.participant_id = p.id
    join programs pr on pr.id = e.program_id
    where ${scope(f)} and not p.is_comparison
      and (${f.programType}::text is null or pr.type = ${f.programType})
  `);

  const tpwRvr = n(o.tpw_rvr);
  const cmpRvr = n(o.cmp_rvr);

  return {
    tpwRecidivism: n(o.tpw_recid) * 100,
    comparisonRecidivism: n(o.cmp_recid) * 100,
    gap: (n(o.cmp_recid) - n(o.tpw_recid)) * 100,
    participants: n(o.participants),
    completionRate: n(e?.completion) * 100,
    employmentLift: (n(o.tpw_emp) - n(o.cmp_emp)) * 100,
    creditDays: n(e?.credit_days),
    rvrReduction: cmpRvr ? ((cmpRvr - tpwRvr) / cmpRvr) * 100 : 0,
  };
}

export type CostYear = {
  year: number;
  spend: number;
  avertedCost: number;
  avertedCases: number;
  netSavings: number;
  cumulativeNet: number;
};

export async function costModelByYear(f: Filters): Promise<CostYear[]> {
  const [recid, spend] = await Promise.all([
    recidivismByYear(f),
    rows<Record<string, unknown>>(sql`
      select p.cohort_year as year, ${spendExpr} as spend
      from participants p
      join outcomes o on o.participant_id = p.id
      join enrollments e on e.participant_id = p.id
      join programs pr on pr.id = e.program_id
      where ${scope(f)} and not p.is_comparison
        and (${f.programType}::text is null or pr.type = ${f.programType})
      group by 1 order by 1
    `),
  ]);

  const spendByYear = new Map(spend.map((x) => [n(x.year), n(x.spend)]));
  let cumulative = 0;

  return recid.map((r) => {
    const avertedCases = ((r.comparison - r.tpw) / 100) * r.tpwN;
    const avertedCost =
      avertedCases * ANNUAL_INCARCERATION_COST * AVG_REINCARCERATION_TERM_YEARS;
    const yearSpend = spendByYear.get(r.year) ?? 0;
    const netSavings = avertedCost - yearSpend;
    cumulative += netSavings;
    return {
      year: r.year,
      spend: yearSpend,
      avertedCost,
      avertedCases,
      netSavings,
      cumulativeNet: cumulative,
    };
  });
}

export type CostTotals = {
  spend: number;
  avertedCost: number;
  avertedCases: number;
  netSavings: number;
  roiMultiple: number;
  costPerAverted: number;
  costPerParticipant: number;
};

export function costTotals(years: CostYear[], participants: number): CostTotals {
  const spend = years.reduce((s, y) => s + y.spend, 0);
  const avertedCost = years.reduce((s, y) => s + y.avertedCost, 0);
  const avertedCases = years.reduce((s, y) => s + y.avertedCases, 0);
  return {
    spend,
    avertedCost,
    avertedCases,
    netSavings: avertedCost - spend,
    roiMultiple: spend ? avertedCost / spend : 0,
    costPerAverted: avertedCases ? spend / avertedCases : 0,
    costPerParticipant: participants ? spend / participants : 0,
  };
}

export async function facilityOptions() {
  return rows<{ id: number; name: string }>(sql`
    select id, name from facilities order by name
  `);
}
