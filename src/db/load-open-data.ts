import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { odOrganizations, odOutcomes } from "./open-data-schema";

/**
 * Loads the two committed CSVs from `open-data/` into Postgres.
 *
 * This is a load, not a transform: whatever the coalition's generator produces
 * is what lands in the table. If these numbers disagree with
 * `open-data/verify_results.py`, this loader is wrong, not the data.
 */
const DIR = join(process.cwd(), "open-data");

/**
 * Minimal CSV reader — these files have no quoted fields or embedded commas.
 * The generator writes CRLF, so headers are trimmed too; without that the last
 * column's key carries a \r and every lookup silently returns undefined.
 */
function readCsv(file: string): Record<string, string>[] {
  const lines = readFileSync(join(DIR, file), "utf8").trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, (cells[i] ?? "").trim()]));
  });
}

const nullable = (v: string) => (v === "" ? null : v);

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(sql);

  const orgs = readCsv("organizations_synthetic.csv");
  const outcomes = readCsv("outcomes_synthetic.csv");

  await sql`truncate table od_outcomes, od_organizations restart identity cascade`;

  await db.insert(odOrganizations).values(
    orgs.map((o) => ({
      organization: o.organization,
      programType: o.program_type,
      prison: o.prison,
      county: o.county,
      annualProgramBudgetUsd: Number(o.annual_program_budget_usd),
      racDaysPerCompletion: Number(o.rac_days_per_completion),
      reportingYear: Number(o.reporting_year),
      dataSource: o.data_source,
    })),
  );

  const rows = outcomes.map((r) => ({
    participantId: r.participant_id,
    organization: r.organization,
    releaseDate: r.release_date,
    contactConsent: r.contact_consent,
    creditDaysEarned: Number(r.credit_days_earned),
    outcome6mo: r.outcome_6mo,
    outcome12mo: r.outcome_12mo,
    outcome36mo: r.outcome_36mo,
    housed90d: nullable(r.housed_90d),
    workingOrTraining90d: nullable(r.working_or_training_90d),
    mentoring: nullable(r.mentoring),
    dataSource: r.data_source,
  }));

  // Drizzle builds one SQL node per value, so bulk inserts go in batches.
  for (let i = 0; i < rows.length; i += 500)
    await db.insert(odOutcomes).values(rows.slice(i, i + 500));

  const synthetic = rows.filter((r) => r.dataSource === "SYNTHETIC").length;
  console.log(
    `loaded ${orgs.length} organizations, ${rows.length} outcome rows ` +
      `(${synthetic} marked SYNTHETIC)`,
  );

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
