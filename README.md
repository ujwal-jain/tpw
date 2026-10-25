# TPW — the case, and the savings calculator

One link you hand to legislative staff. They scroll once and see the whole argument;
the calculator prices the ask.

| Route | What it does |
| --- | --- |
| `/` | The single-page case — the failing system, the dual ledger, the outcome data, a rotating spotlight, the four legislative anchors, and the 1% ask |
| `/savings-calculator` | Move the annual budget line and watch what the state stops spending |

An independent prototype built for Transformative Programming Works. Not an official
TPW publication.

## The numbers

The dataset is synthetic but it is tuned to reproduce the figures TPW publishes, so the
charts corroborate thetpw.org instead of competing with it:

| | published | this site |
| --- | --- | --- |
| 3-year reincarceration, no programming | 44% | 44% |
| 3-year reincarceration, with programming | 21% | 21% |
| Return per dollar | $5 | 5.0× |
| People reached | 19,043 | 19,050 |
| The 1% Campaign | $140M/yr, 95,215 reached | $140M funds 18,494/yr → ~92k over five years |

The schema is the real deliverable. Swapping in verified member records changes the
numbers on these pages and nothing else.

## Setup

Requires Docker and Node 20+.

```bash
cp .env.example .env
npm install
npm run db:up      # postgres:16 on :5432
npm run db:push    # apply the schema
npm run db:seed    # ~38,000 participants across release cohorts 2018-2022
npm run dev
```

`npm run db:reset` tears the volume down and rebuilds. Seeding takes a minute or two.

The seed is driven by a fixed-seed LCG, never `Math.random`, so every machine and every
demo shows identical figures. If your numbers differ from a teammate's, you are on a
different seed file, not a different run. Every bulk insert goes in 1,000-row batches —
Drizzle builds one SQL node per value and a single 38k-row insert overflows the stack.

## Layout

```
src/db/schema.ts      facilities, programs, participants, enrollments, outcomes
src/db/seed.ts        deterministic synthetic dataset
src/lib/constants.ts  every quoted figure, single source of truth
src/lib/metrics.ts    aggregate queries + the cost model
src/lib/sources.ts    claim -> citation, rendered in the footer
src/components/       charts, dual ledger, spotlight, investment calculator
```

Pages are Server Components that query Postgres directly. No API layer, no client data
fetching. There is no filter UI by design — on a single narrative page a mid-scroll
filter invites a staffer to fiddle instead of read, so all interactivity lives in the
calculator. `Filters`/`parseFilters` stay because `metrics.ts` takes them; pages pass
defaults.

## Design rules

The look is deliberate and easy to wreck. Before merging UI:

- Radius stays at 0 (2px on controls). No cards, no bubbles, no shadows, no gradients,
  no emoji. Sections are separated by hairline rules.
- Palette: `paper #FFFFFF`, `ink #0F0F0F`, `muted #5F6360`, `rule #E3E6E1`,
  `band #F4F7F3`.
- **Green is the intervention. Gold is money. Ink is the status quo.** A gold bar never
  means a program and a green bar never means a dollar.
- Each accent has a fill and an ink value, because neither brand color passes contrast
  as small type: `green #74C088` / `green-ink #2F6B43`, `gold #EFC75E` /
  `gold-ink #8A6412`. Fills for graphics, ink values for text.
- Display type is Poppins 700/800; body is Inter Tight. All figures `tabular-nums`.
- Two animations only: the `Reveal` scroll fade and the spotlight crossfade. Both
  respect `prefers-reduced-motion`.

Audit before pushing:

```bash
grep -rnE "rounded-(sm|md|lg|xl|2xl|3xl|full)|shadow-|gradient" src/
```

If a token edit in `globals.css` does not show up, Turbopack has cached the old
stylesheet. `rm -rf .next` and rebuild.

## Honesty guardrails

Three things stay on the page, because a staffer who finds any of them missing discards
everything else:

1. Chart sections carry the illustrative-dataset disclosure from `src/lib/constants.ts`.
2. The spotlight profiles are labeled composites. They are not real people and must
   never be presented as transcripts.
3. The footer states this is an independent prototype, not an official TPW publication.

Cohorts stop at 2022 so every recidivism figure reflects a completed three-year
follow-up window. Do not extend the range without handling partial windows explicitly.

Rounded rates and the gap between them are derived from the same rounded values — never
print "21% vs 44%" next to a 24-point gap.

## Portraits

Drop photographs at `public/portraits/{marcus,elena,david,ruiz}.jpg`, 4:5, at least
800×1000. Missing files degrade to a flat panel with the subject's name.

## Moving to Supabase

Point `DATABASE_URL` at the project's pooled connection string, then
`npm run db:push && npm run db:seed`. No application code changes.
