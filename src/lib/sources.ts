import {
  ANNUAL_INCARCERATION_COST,
  AVG_REINCARCERATION_TERM_YEARS,
  DISCLOSURE,
  FIRST_COHORT_YEAR,
  LAST_COHORT_YEAR,
} from "./constants";

/**
 * Claim → citation. Every headline figure on the site appears here. If a number
 * changes in `constants.ts` or in page copy, its citation changes with it —
 * that coupling is the point.
 */
export const SOURCES: { claim: string; citation: string }[] = [
  {
    claim: `$${ANNUAL_INCARCERATION_COST.toLocaleString()} average annual cost per incarcerated person`,
    citation:
      "California Legislative Analyst's Office, annual per-inmate cost estimate, CDCR budget series.",
  },
  {
    claim: "Nearly all incarcerated Californians are eventually released",
    citation:
      "CDCR population and release data; the overwhelming majority of people in state custody return to communities.",
  },
  {
    claim: "Three-year return-to-custody rate above 40% without programming",
    citation:
      "CDCR Recidivism Report, three-year conviction and return-to-custody rates by release cohort.",
  },
  {
    claim: "Correctional education reduces the odds of recidivism",
    citation:
      "RAND Corporation meta-analysis of correctional education, including post-release employment effects.",
  },
  {
    claim: `${AVG_REINCARCERATION_TERM_YEARS} year average return-to-custody term`,
    citation: "Modeling assumption applied uniformly across the cost model.",
  },
  {
    claim: `Release cohorts ${FIRST_COHORT_YEAR}–${LAST_COHORT_YEAR}`,
    citation:
      "Cohorts are cut off at " +
      LAST_COHORT_YEAR +
      " so every figure reflects a completed three-year follow-up window.",
  },
  {
    claim: "Participant outcome records",
    citation: DISCLOSURE + " No figure on this site describes an identifiable person.",
  },
];
