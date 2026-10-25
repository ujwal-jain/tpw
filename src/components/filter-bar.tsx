"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import type { Filters } from "@/lib/filters";
import {
  FIRST_COHORT_YEAR,
  LAST_COHORT_YEAR,
  PROGRAM_TYPE_LABELS,
} from "@/lib/constants";

const YEARS = Array.from(
  { length: LAST_COHORT_YEAR - FIRST_COHORT_YEAR + 1 },
  (_, i) => FIRST_COHORT_YEAR + i,
);

export function FilterBar({
  filters,
  facilities,
}: {
  filters: Filters;
  facilities: { id: number; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const go = (key: string, value: string) => {
    const next = new URLSearchParams({
      from: String(filters.from),
      to: String(filters.to),
      ...(filters.facilityId ? { facility: String(filters.facilityId) } : {}),
      ...(filters.programType ? { type: filters.programType } : {}),
    });
    if (value === "") next.delete(key);
    else next.set(key, value);
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  };

  return (
    <div
      className="flex flex-wrap items-end gap-x-10 gap-y-6 border-t border-rule py-6"
      style={{ opacity: pending ? 0.55 : 1, transition: "opacity 150ms" }}
    >
      <Field label="From cohort">
        <Select value={String(filters.from)} onChange={(v) => go("from", v)}>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="To cohort">
        <Select value={String(filters.to)} onChange={(v) => go("to", v)}>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Facility">
        <Select value={filters.facilityId ? String(filters.facilityId) : ""} onChange={(v) => go("facility", v)}>
          <option value="">All facilities</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Program type">
        <Select value={filters.programType ?? ""} onChange={(v) => go("type", v)}>
          <option value="">All programs</option>
          {Object.entries(PROGRAM_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-xs block">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-b border-rule bg-paper py-1 pr-6 text-[15px] text-ink transition-colors hover:border-amber focus:border-amber focus:outline-none"
    >
      {children}
    </select>
  );
}
