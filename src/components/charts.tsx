"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PROGRAM_TYPE_LABELS } from "@/lib/constants";

const AMBER = "#d97736";
const MUTED = "#6e6a64";
const RULE = "#dedad2";
const INK = "#141414";
const SPEND = "#4a453f";
const CURSOR = "#efece6";

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
          stroke={AMBER}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Unique participants enrolled, stacked by program type. */
export function EnrollmentArea({ data }: { data: ({ year: number } & Record<string, number>)[] }) {
  const types = Object.keys(PROGRAM_TYPE_LABELS);
  // A single amber ramp, dark to light — no second hue enters the palette.
  const shades = ["#8d481e", "#b35f29", "#d97736", "#e9a269", "#f2cda8"];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
        {grid}
        <XAxis dataKey="year" {...axis} />
        <YAxis {...axis} width={54} />
        <Tooltip content={<Tip fmt={(v) => v.toLocaleString()} />} cursor={{ stroke: RULE }} />
        {types.map((t, i) => (
          <Area
            key={t}
            type="monotone"
            dataKey={t}
            name={PROGRAM_TYPE_LABELS[t]}
            stackId="1"
            stroke={shades[i]}
            fill={shades[i]}
            fillOpacity={0.9}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Horizontal bars, one row per program type. */
export function TypeBars({
  data,
  dataKey,
  benchmark,
  benchmarkLabel,
}: {
  data: { type: string; recidivism: number; employment: number }[];
  dataKey: "recidivism" | "employment";
  benchmark?: number;
  benchmarkLabel?: string;
}) {
  const rows = data.map((d) => ({ ...d, label: PROGRAM_TYPE_LABELS[d.type] ?? d.type }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
        <CartesianGrid horizontal={false} stroke={RULE} />
        <XAxis type="number" {...axis} tickFormatter={pct} />
        <YAxis type="category" dataKey="label" {...axis} width={132} />
        <Tooltip content={<Tip fmt={pct} />} cursor={{ fill: CURSOR }} />
        {benchmark !== undefined && (
          <ReferenceLine
            x={benchmark}
            stroke={MUTED}
            strokeDasharray="3 3"
            label={{
              value: benchmarkLabel,
              fill: MUTED,
              fontSize: 11,
              position: "insideTopRight",
            }}
          />
        )}
        <Bar dataKey={dataKey} name={dataKey === "recidivism" ? "Recidivism" : "Employed at 90d"}>
          {rows.map((r) => (
            <Cell key={r.type} fill={AMBER} />
          ))}
        </Bar>
      </BarChart>
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
        <Bar dataKey="avertedCost" name="Incarceration cost averted" fill={AMBER} />
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
          stroke={AMBER}
          strokeWidth={2}
          dot={{ r: 2.5, fill: AMBER, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
