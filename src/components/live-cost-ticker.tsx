"use client";

import { useEffect, useState } from "react";
import { ANNUAL_INCARCERATION_COST, STATEWIDE_POPULATION } from "@/lib/constants";

const YEAR_TOTAL = ANNUAL_INCARCERATION_COST * STATEWIDE_POPULATION;

function accruedNow() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1).getTime();
  const end = new Date(now.getFullYear() + 1, 0, 1).getTime();
  return YEAR_TOTAL * ((now.getTime() - start) / (end - start));
}

/** Statewide incarceration cost accrued since January 1, ticking live. */
export function LiveCostTicker() {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      setValue(accruedNow());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="hidden text-right lg:block">
      <div className="label-xs">Statewide incarceration cost accrued this year</div>
      <div className="text-[15px] tabular-nums text-ink">
        {value === null ? "—" : `$${Math.floor(value).toLocaleString()}`}
      </div>
    </div>
  );
}
