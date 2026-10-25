import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { facilities, programs, participants, enrollments, outcomes } from "./schema";
import { FIRST_COHORT_YEAR, LAST_COHORT_YEAR } from "../lib/constants";

/**
 * Deterministic synthetic dataset.
 *
 * Every number comes from a fixed-seed LCG, never Math.random, so the whole
 * team and every demo machine see identical figures. Effect sizes are tuned to
 * published California / RAND correctional-program findings: participants land
 * near 28% three-year recidivism against ~45% for a risk-matched comparison
 * group, employment runs ~14pp higher, and the cost model clears 4x.
 */
let state = 20260424;
const rnd = () => {
  state = (state * 1103515245 + 12345) % 2147483648;
  return state / 2147483648;
};
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)];
const int = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));
const chance = (p: number) => rnd() < p;
/** Weighted pick: [value, weight][]. */
const weighted = <T,>(opts: readonly (readonly [T, number])[]) => {
  const total = opts.reduce((s, [, w]) => s + w, 0);
  let r = rnd() * total;
  for (const [v, w] of opts) if ((r -= w) <= 0) return v;
  return opts[opts.length - 1][0];
};
const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const FACILITY_SEED = [
  { name: "Northern Valley State Prison", region: "North", securityLevel: "Level III" },
  { name: "Cedar Ridge Correctional Facility", region: "North", securityLevel: "Level II" },
  { name: "Delta Basin State Prison", region: "Central", securityLevel: "Level IV" },
  { name: "Mission Flats Rehabilitation Center", region: "Central", securityLevel: "Level I" },
  { name: "Harbor Point State Prison", region: "South", securityLevel: "Level III" },
  { name: "Sierra Verde Correctional Facility", region: "South", securityLevel: "Level II" },
];

const PROGRAM_SEED = [
  { name: "Adult Basic Education & GED", type: "education", cost: 4_200 },
  { name: "College Pathways", type: "education", cost: 5_000 },
  { name: "Welding & Fabrication", type: "vocational", cost: 5_000 },
  { name: "Commercial Driver Training", type: "vocational", cost: 4_800 },
  { name: "Thinking for a Change", type: "cbt", cost: 3_500 },
  { name: "Trauma & Anger Recovery", type: "cbt", cost: 3_600 },
  { name: "Substance Use Recovery", type: "substance", cost: 4_600 },
  { name: "Victim-Offender Dialogue", type: "restorative", cost: 3_200 },
] as const;

const AGE_BANDS = ["18-24", "25-34", "35-44", "45+"] as const;
const RISK_BANDS = [
  ["low", 25],
  ["med", 45],
  ["high", 30],
] as const;

/** Three-year return-to-custody rate with no programming, by risk band. */
const BASE_RECIDIVISM = { low: 0.32, med: 0.45, high: 0.58 };
const BASE_EMPLOYMENT = { low: 0.56, med: 0.47, high: 0.37 };
const BASE_RVR = { low: 1.5, med: 2.4, high: 3.4 };

/** Participants per release cohort (half programmed, half comparison). */
const PER_COHORT = 800;

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(sql);

  await sql`truncate table outcomes, enrollments, participants, programs, facilities restart identity cascade`;

  const fac = await db.insert(facilities).values(FACILITY_SEED).returning();
  const prog = await db
    .insert(programs)
    .values(
      PROGRAM_SEED.map((p) => ({
        name: p.name,
        type: p.type,
        annualCostPerParticipantCents: p.cost * 100,
      })),
    )
    .returning();

  type PRow = typeof participants.$inferInsert;
  type ERow = typeof enrollments.$inferInsert;
  type ORow = typeof outcomes.$inferInsert;

  const pRows: PRow[] = [];
  const meta: { isComparison: boolean; risk: keyof typeof BASE_RECIDIVISM; year: number }[] = [];

  for (let year = FIRST_COHORT_YEAR; year <= LAST_COHORT_YEAR; year++) {
    for (let i = 0; i < PER_COHORT; i++) {
      const isComparison = i % 2 === 1;
      const risk = weighted(RISK_BANDS) as keyof typeof BASE_RECIDIVISM;
      pRows.push({
        facilityId: pick(fac).id,
        cohortYear: year,
        ageBand: pick(AGE_BANDS),
        riskBand: risk,
        isComparison,
      });
      meta.push({ isComparison, risk, year });
    }
  }

  const inserted = await db.insert(participants).values(pRows).returning({ id: participants.id });

  const eRows: ERow[] = [];
  const oRows: ORow[] = [];

  for (let i = 0; i < inserted.length; i++) {
    const id = inserted[i].id;
    const { isComparison, risk, year } = meta[i];

    // Program effect strengthens slightly as delivery matures across cohorts.
    const effect = isComparison ? 1 : 0.68 - 0.02 * (year - FIRST_COHORT_YEAR);

    const releasedOn = iso(year, int(1, 12), int(1, 28));

    if (!isComparison) {
      // 1-3 enrollments, averaging ~1.8 enrollment-years of programming.
      const n = weighted([
        [1, 40],
        [2, 40],
        [3, 20],
      ]);
      for (let k = 0; k < n; k++) {
        const p = pick(prog);
        const months = int(6, 24);
        const startYear = year - (k === 0 ? 2 : 1);
        const startMonth = int(1, 12);
        const status = weighted([
          ["completed", 74],
          ["withdrew", 18],
          ["active", 8],
        ] as const);
        const endMonthAbs = startMonth + months;
        eRows.push({
          participantId: id,
          programId: p.id,
          startedOn: iso(startYear, startMonth, int(1, 28)),
          endedOn:
            status === "active"
              ? null
              : iso(startYear + Math.floor((endMonthAbs - 1) / 12), ((endMonthAbs - 1) % 12) + 1, int(1, 28)),
          status,
          contactHours: months * int(12, 26),
          creditDaysEarned: status === "completed" ? int(30, 120) : 0,
        });
      }
    }

    const recidivated = chance(BASE_RECIDIVISM[risk] * effect);
    const employed = chance(
      Math.min(0.95, BASE_EMPLOYMENT[risk] * (isComparison ? 1 : 1.25)),
    );
    const rvrMean = BASE_RVR[risk] * (isComparison ? 1 : 0.38);

    oRows.push({
      participantId: id,
      releasedOn,
      reincarceratedOn: recidivated
        ? iso(year + int(0, 2), int(1, 12), int(1, 28))
        : null,
      recidivated3yr: recidivated,
      employedAt90d: employed,
      wageBand: employed
        ? weighted(
            isComparison
              ? ([["<$18/hr", 60], ["$18-27/hr", 32], ["$27+/hr", 8]] as const)
              : ([["<$18/hr", 38], ["$18-27/hr", 42], ["$27+/hr", 20]] as const),
          )
        : null,
      rvrCount: Math.max(0, Math.round(rvrMean + (rnd() - 0.5) * 2)),
      restitutionPaidCents:
        (employed ? int(600, 4_200) : int(0, 900)) * 100,
    });
  }

  for (let i = 0; i < eRows.length; i += 1000)
    await db.insert(enrollments).values(eRows.slice(i, i + 1000));
  for (let i = 0; i < oRows.length; i += 1000)
    await db.insert(outcomes).values(oRows.slice(i, i + 1000));

  console.log(
    `seeded: ${fac.length} facilities, ${prog.length} programs, ` +
      `${inserted.length} participants, ${eRows.length} enrollments, ${oRows.length} outcomes`,
  );
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
