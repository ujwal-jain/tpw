import {
  ANNUAL_INCARCERATION_COST,
  AVG_REINCARCERATION_TERM_YEARS,
  CAMPAIGN_ANNUAL_DOLLARS,
  DISCLOSURE,
  FIRST_COHORT_YEAR,
  LAST_COHORT_YEAR,
  PRISONS_FULLY_SERVED,
  PRISONS_TOTAL,
} from "./constants";

/**
 * Claim → citation. Every headline figure on the site appears here. If a number
 * changes in `constants.ts` or in page copy, its citation changes with it —
 * that coupling is the point.
 */
export const SOURCES: { claim: string; citation: string }[] = [
  {
    claim: "95% of California's incarcerated citizens will reenter society",
    citation: "Transformative Programming Works, thetpw.org.",
  },
  {
    claim: "44% are reincarcerated within three years of release",
    citation:
      "Transformative Programming Works, thetpw.org; consistent with CDCR recidivism reporting by release cohort.",
  },
  {
    claim: "Community-based programming cuts reincarceration to 21%",
    citation:
      "Transformative Programming Works, thetpw.org — roughly twice as effective at keeping people from returning.",
  },
  {
    claim: `Only ${PRISONS_FULLY_SERVED} of ${PRISONS_TOTAL} California prisons is fully served today`,
    citation: "Transformative Programming Works, thetpw.org.",
  },
  {
    claim: "$1 invested in rehabilitation saves $5 in incarceration costs",
    citation:
      "Transformative Programming Works, thetpw.org. The cost model on this site reproduces this ratio from participant-level records.",
  },
  {
    claim: `The 1% Campaign — raising California's rehabilitation budget from 0.2% to 1%, about $${(CAMPAIGN_ANNUAL_DOLLARS / 1_000_000).toFixed(0)}M a year`,
    citation:
      "Transformative Programming Works, thetpw.org. TPW projects this would reach 95,215 people.",
  },
  {
    claim: `$${ANNUAL_INCARCERATION_COST.toLocaleString()} average annual cost per incarcerated person`,
    citation:
      "California Legislative Analyst's Office, per-inmate cost estimate. The current published figure is higher; the lower value is used throughout.",
  },
  {
    claim: `${AVG_REINCARCERATION_TERM_YEARS}-year average return-to-custody term`,
    citation:
      "Modeling assumption applied uniformly, chosen at the conservative end of the published range.",
  },
  {
    claim: `Release cohorts ${FIRST_COHORT_YEAR}–${LAST_COHORT_YEAR}`,
    citation: `Cohorts stop at ${LAST_COHORT_YEAR} so every figure reflects a completed three-year follow-up window.`,
  },
  {
    claim: "Outcome data from three coalition organizations",
    citation:
      "Participation records for 1,200 people provided by Hack for Social Impact and TPW. The post-release follow-up layer is generated and carries data_source = SYNTHETIC on every row; see open-data/README.md for the generator and its base rates.",
  },
  {
    claim: "Base rates behind the generated follow-up layer",
    citation:
      "CDCR Statewide Recidivism Report FY 2018-19 (21.1% for RAC-eligible programs) and CDCR Recidivism Rates for Individuals with Rehabilitative Program Achievements FY 2019-20 (~40% comparison groups).",
  },
  {
    claim: "Completers compared with non-completers",
    citation:
      "Not a randomized control. People who finish a program may differ from people who enroll and do not, in ways the data cannot show — the gap is an association, not proof of cause.",
  },
  {
    claim: "Participant outcome records",
    citation: DISCLOSURE + " No figure on this site describes an identifiable person.",
  },
];
