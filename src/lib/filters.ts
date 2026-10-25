import { FIRST_COHORT_YEAR, LAST_COHORT_YEAR, PROGRAM_TYPE_LABELS } from "./constants";

export type Filters = {
  from: number;
  to: number;
  facilityId: number | null;
  programType: string | null;
};

type Params = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const clampYear = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  if (!Number.isInteger(n)) return fallback;
  return Math.min(LAST_COHORT_YEAR, Math.max(FIRST_COHORT_YEAR, n));
};

export function parseFilters(params: Params): Filters {
  const from = clampYear(one(params.from), FIRST_COHORT_YEAR);
  const to = clampYear(one(params.to), LAST_COHORT_YEAR);
  const facility = Number(one(params.facility));
  const type = one(params.type);
  return {
    from: Math.min(from, to),
    to: Math.max(from, to),
    facilityId: Number.isInteger(facility) && facility > 0 ? facility : null,
    programType: type && type in PROGRAM_TYPE_LABELS ? type : null,
  };
}

/** Build a querystring that preserves current filters while changing one key. */
export function withFilter(f: Filters, key: keyof Filters, value: string | null) {
  const next: Record<string, string> = {
    from: String(f.from),
    to: String(f.to),
  };
  if (f.facilityId) next.facility = String(f.facilityId);
  if (f.programType) next.type = f.programType;

  const paramKey = key === "facilityId" ? "facility" : key === "programType" ? "type" : key;
  if (value === null) delete next[paramKey];
  else next[paramKey] = value;

  return `?${new URLSearchParams(next).toString()}`;
}
