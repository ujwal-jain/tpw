/**
 * Single source of truth for every figure quoted on the site.
 * Each constant has a matching citation in `src/lib/sources.ts` — if you change
 * a number here, change the citation there.
 */

/** Average annual cost per incarcerated person, California (LAO). */
export const ANNUAL_INCARCERATION_COST = 106_000;

/**
 * Average length of a return-to-custody term, in years. The conservative end of
 * the published range — it is what lands return-per-dollar on the coalition's
 * own "$1 saves $5" figure rather than overshooting it.
 */
export const AVG_REINCARCERATION_TERM_YEARS = 1.5;

/** Outcome window used for every recidivism figure on the site. */
export const RECIDIVISM_WINDOW_YEARS = 3;

/** Statewide incarcerated population, used only by the live cost ticker. */
export const STATEWIDE_POPULATION = 94_000;

/**
 * Release cohorts covered by the dataset. The range stops at 2022 on purpose:
 * every cohort shown has completed its full 3-year follow-up window, so no
 * figure on the site rests on a partial window.
 */
export const FIRST_COHORT_YEAR = 2018;
export const LAST_COHORT_YEAR = 2022;

/** TPW's published figures, mirrored so the charts corroborate them. */
export const SHARE_WHO_REENTER = 95;
export const PRISONS_TOTAL = 31;
export const PRISONS_FULLY_SERVED = 1;

/** The 1% Campaign — the actual legislative ask. */
export const CURRENT_REHAB_BUDGET_SHARE = 0.002;
export const TARGET_REHAB_BUDGET_SHARE = 0.01;
export const CAMPAIGN_ANNUAL_DOLLARS = 140_000_000;
export const CURRENT_ANNUAL_DOLLARS = 28_000_000;

export const PROGRAM_TYPE_LABELS: Record<string, string> = {
  education: "Education",
  vocational: "Vocational trades",
  cbt: "Cognitive behavioral",
  substance: "Substance recovery",
  restorative: "Restorative justice",
};

export const DISCLOSURE =
  "Illustrative dataset — modeled to match outcomes published by TPW and CDCR.";
