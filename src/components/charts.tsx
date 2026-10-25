"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GREEN = "#74c088";
const GOLD = "#efc75e";
const MUTED = "#5f6360";
const RULE = "#e3e6e1";
const INK = "#0f0f0f";
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
const money = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v).toLocaleString()}`;

/** Participants vs risk-matched comparison group, over release cohorts. */
export function CompareLines({
  data,
  unit = "pct",
  tpwLabel = "TPW participants",
  comparisonLabel = "Comparison group",
}: {
  data: { year: number; tpw: number; comparison: number }[];
  unit?: "pct" | "rate";
  tpwLabel?: string;
  comparisonLabel?: string;
}) {
  const fmt = unit === "pct" ? pct : (v: number) => v.toFixed(0);
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
        {grid}
        <XAxis dataKey="year" {...axis} />
        <YAxis {...axis} tickFormatter={fmt} width={54} />
        <Tooltip content={<Tip fmt={fmt} />} cursor={{ stroke: RULE }} />
        <Line
          type="monotone"
          dataKey="comparison"
          name={comparisonLabel}
          stroke={MUTED}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="tpw"
          name={tpwLabel}
          stroke={GREEN}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Program spend against incarceration cost averted, per cohort year. */
export function SpendVsAverted({
  data,
}: {
  data: { year: number; spend: number; avertedCost: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
        {grid}
        <XAxis dataKey="year" {...axis} />
        <YAxis {...axis} tickFormatter={money} width={64} />
        <Tooltip content={<Tip fmt={money} />} cursor={{ fill: CURSOR }} />
        <Bar dataKey="spend" name="Program spend" fill={SPEND} />
        <Bar dataKey="avertedCost" name="Incarceration cost averted" fill={GOLD} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Cumulative net savings, with the break-even crossing marked. */
export function CumulativeNet({ data }: { data: { year: number; cumulativeNet: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
        {grid}
        <XAxis dataKey="year" {...axis} />
        <YAxis {...axis} tickFormatter={money} width={64} />
        <Tooltip content={<Tip fmt={money} />} cursor={{ stroke: RULE }} />
        <ReferenceLine
          y={0}
          stroke={INK}
          strokeWidth={1}
          label={{ value: "Break-even", fill: MUTED, fontSize: 11, position: "insideTopLeft" }}
        />
        <Line
          type="monotone"
          dataKey="cumulativeNet"
          name="Cumulative net savings"
          stroke={GOLD}
          strokeWidth={2.5}
          dot={{ r: 2.5, fill: GOLD, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
