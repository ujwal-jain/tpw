/**
 * Single source of truth for every figure quoted on the site.
 * Each constant has a matching citation in `src/lib/sources.ts` — if you change
 * a number here, change the citation there.
 */

/** Average annual cost per incarcerated person, California (LAO). */
export const ANNUAL_INCARCERATION_COST = 106_000;

/** Average length of a return-to-custody term, in years. */
export const AVG_REINCARCERATION_TERM_YEARS = 2.1;

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

export const PROGRAM_TYPE_LABELS: Record<string, string> = {
  education: "Education",
  vocational: "Vocational trades",
  cbt: "Cognitive behavioral",
  substance: "Substance recovery",
  restorative: "Restorative justice",
};

export const DISCLOSURE =
  "Illustrative dataset — modeled on published California outcomes.";
