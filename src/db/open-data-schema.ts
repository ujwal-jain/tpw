import { pgTable, text, integer, date, serial } from "drizzle-orm/pg-core";

/**
 * Mirrors the CSVs in `open-data/` column for column, including `data_source`.
 * The shape is deliberately not normalized: this table is a load target for a
 * file the coalition owns, and divergence between the two would be a bug.
 *
 * `participants.csv` is gitignored — it belongs to HSI and TPW — so nothing
 * here depends on it. Completion is recovered from `credit_days_earned > 0`,
 * which holds because non-completers always receive 0 RAC days. See issue #2
 * for the explicit column that would retire that inference.
 */
export const odOrganizations = pgTable("od_organizations", {
  organization: text("organization").primaryKey(),
  programType: text("program_type").notNull(),
  prison: text("prison").notNull(),
  county: text("county").notNull(),
  annualProgramBudgetUsd: integer("annual_program_budget_usd").notNull(),
  racDaysPerCompletion: integer("rac_days_per_completion").notNull(),
  reportingYear: integer("reporting_year").notNull(),
  dataSource: text("data_source").notNull(),
});

export const odOutcomes = pgTable("od_outcomes", {
  id: serial("id").primaryKey(),
  participantId: text("participant_id").notNull(),
  organization: text("organization").notNull(),
  releaseDate: date("release_date").notNull(),
  contactConsent: text("contact_consent").notNull(),
  creditDaysEarned: integer("credit_days_earned").notNull(),
  outcome6mo: text("outcome_6mo").notNull(),
  outcome12mo: text("outcome_12mo").notNull(),
  outcome36mo: text("outcome_36mo").notNull(),
  housed90d: text("housed_90d"),
  workingOrTraining90d: text("working_or_training_90d"),
  mentoring: text("mentoring"),
  dataSource: text("data_source").notNull(),
});
