# The Human Ledger — TPW Coalition

A dashboard built to argue, in front of a budget committee, that Transformative
Programming Works. Three routes:

| Route | What it does |
| --- | --- |
| `/` | The narrative case — the dual ledger, participant profiles, the four legislative anchors |
| `/dashboard` | Outcome data by release cohort, participants against a risk-matched comparison group |
| `/roi` | The cost model: program spend, incarceration cost averted, return per dollar, scale scenario |

The dataset is synthetic. The schema is the deliverable — swapping in verified
department records changes the numbers on these pages and nothing else.

## Setup

Requires Docker and Node 20+.

```bash
cp .env.example .env
npm install
npm run db:up      # postgres:16 on :5432
npm run db:push    # apply the schema
npm run db:seed    # 4,000 participants across release cohorts 2018-2022
npm run dev
```

`npm run db:reset` tears the volume down and rebuilds from scratch.

The seed is driven by a fixed-seed LCG, never `Math.random`, so every machine
and every demo shows identical figures. If your numbers differ from a
teammate's, you are on a different seed file, not a different run.

## Layout

```
src/db/schema.ts      facilities, programs, participants, enrollments, outcomes
src/db/seed.ts        deterministic synthetic dataset
src/lib/constants.ts  every quoted figure, single source of truth
src/lib/metrics.ts    aggregate queries + the cost model
src/lib/sources.ts    claim -> citation, rendered in the footer
src/components/       charts, filter bar, ledger, portraits
```

Pages are Server Components that query Postgres directly. There is no API layer
and no client data fetching; filters travel through `searchParams` into SQL.

## Design rules

The look is deliberate and easy to wreck. Before merging UI:

- Radius stays at 0 (2px on controls). No cards, no bubbles.
- No shadows, no gradients, no blur panels, no emoji.
- Warm paper ground, charcoal type: `paper #FAF8F4`, `band #F0ECE5`,
  `ink #141414`, `muted #6E6A64`, `rule #DEDAD2`.
- Amber marks intervention and savings, nothing decorative. Two values:
  `amber #D97736` fills graphics (bars, lines, buttons); `amber-ink #A3511E`
  sets type — the brighter value fails contrast below display sizes.
- Sections are separated by hairline rules, not boxes.
- All figures render `tabular-nums`.
- One animation: the `Reveal` fade-up, once, respecting
  `prefers-reduced-motion`.

Audit before pushing:

```bash
grep -rnE "rounded-(sm|md|lg|xl|2xl|3xl|full)|shadow-|gradient" src/
```

If a token edit in `globals.css` does not show up, Turbopack has cached the old
stylesheet. `rm -rf .next` and rebuild.

## Honesty guardrails

Two things must stay on the page, because a staffer who finds either one
missing discards everything else on the site:

1. Chart pages carry the illustrative-dataset disclosure from
   `src/lib/constants.ts`.
2. The participant profiles are labeled composites. They are not real people
   and must never be presented as transcripts.

Cohorts stop at 2022 so every recidivism figure reflects a completed
three-year follow-up window. Do not extend the range without handling partial
windows explicitly.

## Moving to Supabase

Point `DATABASE_URL` at the project's pooled connection string, then
`npm run db:push && npm run db:seed`. No application code changes. Row-level
security only becomes relevant if the site ever writes.
