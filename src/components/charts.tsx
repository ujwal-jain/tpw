"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GREEN = "#74c088";
const MUTED = "#5f6360";
const RULE = "#e3e6e1";
const SPEND = "#3b3f3c";
const CURSOR = "#f4f7f3";

const axis = {
  stroke: MUTED,
  tick: { fill: MUTED, fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const;

const grid = <CartesianGrid vertical={false} stroke={RULE} />;

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-rule bg-paper p-3 text-[13px] leading-relaxed">{children}</div>
  );
}

type TipProps = {
  active?: boolean;
  label?: string | number;
  payload?: { name?: string; value?: number; color?: string; dataKey?: string }[];
  fmt?: (v: number) => string;
};

function Tip({ active, label, payload, fmt = (v) => v.toFixed(1) }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <Panel>
      <div className="text-muted">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="mt-1 flex gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="ml-auto tabular-nums text-ink">{fmt(Number(p.value))}</span>
        </div>
      ))}
    </Panel>
  );
}

const pct = (v: number) => `${v.toFixed(1)}%`;

/** Any reoffense at each follow-up window, completers vs non-completers. */
export function ReoffenseWindows({
  data,
}: {
  data: {
    window: string;
    completed: number;
    notCompleted: number;
    knownCompleted: number;
    knownNotCompleted: number;
  }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }} barGap={6}>
        {grid}
        <XAxis dataKey="window" {...axis} />
        <YAxis {...axis} tickFormatter={pct} width={54} />
        <Tooltip content={<Tip fmt={pct} />} cursor={{ fill: CURSOR }} />
        <Bar dataKey="notCompleted" name="Did not complete" fill={SPEND} />
        <Bar dataKey="completed" name="Completed a program" fill={GREEN} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * One bar over everyone in the dataset, split by 36-month follow-up status.
 * Outcomes are ink; the unanswered segments are neutral, because "we have not
 * asked yet" is neither a good nor a bad result.
 */
const COVERAGE_FILL: Record<string, string> = {
  none: GREEN,
  returned: "#0f0f0f",
  conviction: "#3b3f3c",
  arrest: "#6b716c",
  pending: "#d8dcd7",
  no_response: "#c2c8c2",
  not_tracked: "#aab1ab",
};

export function CoverageBar({
  data,
}: {
  data: { status: string; label: string; count: number }[];
}) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      <div className="flex h-10 w-full overflow-hidden">
        {data.map((d) => (
          <div
            key={d.status}
            title={`${d.label}: ${d.count}`}
            style={{
              width: `${(d.count / total) * 100}%`,
              background: COVERAGE_FILL[d.status] ?? MUTED,
            }}
          />
        ))}
      </div>

      <dl className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((d) => (
          <div key={d.status} className="flex items-baseline gap-3">
            <span
              className="mt-1 h-3 w-3 shrink-0"
              style={{ background: COVERAGE_FILL[d.status] ?? MUTED }}
              aria-hidden
            />
            <div>
              <dt className="text-[14px] text-ink">{d.count.toLocaleString()}</dt>
              <dd className="text-[13px] leading-snug text-muted">{d.label}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Housing and work at 90 days, completers vs non-completers. */
export function ReentryBars({
  data,
}: {
  data: { measure: string; completed: number; notCompleted: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }} barGap={6}>
        {grid}
        <XAxis dataKey="measure" {...axis} />
        <YAxis {...axis} tickFormatter={pct} width={54} />
        <Tooltip content={<Tip fmt={pct} />} cursor={{ fill: CURSOR }} />
        <Bar dataKey="notCompleted" name="Did not complete" fill={SPEND} />
        <Bar dataKey="completed" name="Completed a program" fill={GREEN} />
      </BarChart>
    </ResponsiveContainer>
  );
}
