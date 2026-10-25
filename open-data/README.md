# Instructions: generate the TPW synthetic outcome data

Everything here lives in the `open-data/` folder of the repo. You need three files:

- `generate_synthetic.py`: creates the synthetic files
- `verify_results.py`: checks the output against the expected numbers below
- `participants.csv`: the original HSI file "Participation Data Across 3 Organizations" (1,200 rows), downloaded from the TPW Supplementary Info doc and renamed. It is not in the repo (it belongs to Hack for Social Impact and TPW, and `.gitignore` keeps it out). Download it and save it as `open-data/participants.csv`.

See `CONTRIBUTING.md` before proposing changes.

## Context

We are building a demo for Hack for Social Impact 2026 for Transformative Programming Works (TPW). The provided dataset only says who attended and completed a program. It has nothing about what happened after release. We generate a clearly labeled SYNTHETIC follow-up layer so the reporting tool can show recidivism, dollars saved, bed-years, credits, and ROI.

Rules that must not change:

- Every generated row keeps `data_source = SYNTHETIC`. Never present these numbers as real TPW results.
- Do not edit `participants.csv`. It is the real (given) layer.
- Do not change `SEED = 2026` or `AS_OF = 2026-10-24` unless the team agrees. The expected numbers depend on them.
- Use plain Python 3 (no installs needed).

## Steps

1. Save `participants.csv` into `open-data/`, next to the two scripts. Check that it has exactly these headers:
   `participant_id,organization,sessions_attended,completed,age_group` and 1,200 data rows.
2. From the repo root, run:
   ```
   cd open-data
   python generate_synthetic.py participants.csv
   ```
   Expected output: `Wrote 1200 outcome rows and 3 organization rows.`
   It creates (or overwrites) `outcomes_synthetic.csv` and `organizations_synthetic.csv` in `open-data/`. Both scripts read and write in the current folder, so always run them from inside `open-data/`. On macOS, use `python3` if `python` is not found.
3. Still inside `open-data/`, run:
   ```
   python verify_results.py
   ```
4. Compare the printout with the expected results below. They should match exactly. If they don't, see "If the numbers don't match".
5. Import the three CSVs into Google Sheets as separate tabs: `participants`, `outcomes`, `organizations`. Join on `participant_id` (participants ↔ outcomes) and on `organization` (outcomes ↔ organizations).

## Expected results

36-month outcome counts (all 1,200 people):

| Status | Count | Meaning |
|---|---|---|
| pending | 564 | Released less than 36 months before Oct 24, 2026 |
| none | 270 | Answered, no arrest, conviction or return |
| not_tracked | 141 | Never agreed to follow-up |
| no_response | 107 | Agreed, but didn't answer |
| returned | 60 | Returned to prison |
| conviction | 33 | New conviction |
| arrest | 25 | Arrested |

Reoffense within 36 months, among people with a known 36-month answer:

| Org | Completed | Known | Any reoffense | Returned only |
|---|---|---|---|---|
| A | Yes | 84 | 19.0% | 11.9% |
| A | No | 43 | 37.2% | 16.3% |
| B | Yes | 82 | 26.8% | 15.9% |
| B | No | 43 | 44.2% | 20.9% |
| C | Yes | 80 | 27.5% | 12.5% |
| C | No | 56 | 41.1% | 19.6% |
| All | Yes | 246 | 24.4% | 13.4% |
| All | No | 142 | 40.8% | 19.0% |

Other per-org numbers:

| Org | Credit days earned | Housed at 90 days | Working or training at 90 days | Mentors |
|---|---|---|---|---|
| A | 7,380 | 70% | 52% | 10 |
| B | 9,440 | 78% | 48% | 12 |
| C | 4,420 | 72% | 52% | 10 |

"Any reoffense" counts arrest, conviction, or return. "Returned only" is the team's primary metric definition (Potential Metrics tab). Always label which one a chart uses.

## How the data is generated

| Column | Rule |
|---|---|
| Organization table | Invented: program type, fictional prison, county, yearly budget ($150K to $240K), RAC days per completion (A 30, B 40, C 20), participants served in the reporting year (A 75, B 80, C 70) |
| Cost per participant (ROI) | `annual_program_budget_usd / participants_served_in_reporting_year`, both for the same reporting year: A $2,400, B $3,000, C about $2,143. This is the denominator of return per dollar: (value of credit days earned + value of returns averted) ÷ (cost per participant × participants). |
| `release_date` | Random date between Jan 1, 2021 and mid-2026 |
| `contact_consent` | Yes for 85% of completers, 70% of non-completers |
| `credit_days_earned` | Completers get their org's RAC days, non-completers 0 |
| Reoffense chance | Completers 21% (CDCR's figure for RAC-eligible programs), non-completers 40% (CDCR's ~40% comparison groups), multiplied by a sessions factor: 1 session × 1.15 down to 18 sessions × 0.85 |
| When it happens | 35% in months 1 to 6, 30% in months 6 to 12, 35% in months 12 to 36 |
| What happens | Returned 50%, conviction 30%, arrest 20% |
| Outcomes at 6/12/36 months | One draw per person so the timeline is consistent. `pending` if the check-in date is after Oct 24, 2026; `not_tracked` without consent; `no_response` for 20% of those who consented |
| Housed / working at 90 days | Completers 80% / 55%, non-completers 65% / 40% |
| `mentoring` | 15% of completers with 12 or more sessions |
| `age_group` | Not used. It stays in `participants.csv` as given, often blank |

Why the generated rates differ slightly from 21% and 40%: each org only has about 40 to 85 people with a full 36-month answer, so random variation of a few points is expected. That is also why reports should show a range, not a single number.

## Changing the story

All rule values are constants near the top of `generate_synthetic.py` (`P36_COMPLETED`, `P36_NOT_COMPLETED`, `NO_RESPONSE_RATE`, the `ORGS` list, and the `dosage_factor` function). If you change any of them, the expected numbers above no longer apply: re-run both scripts and share the new `verify_results.py` output with the team so everyone uses the same files.

## If the numbers don't match

- Check `participants.csv` is the original file: 1,200 rows, orgs cycling A, B, C, row P0001 = `Organization A,14,Yes,18-29`, row P1200 = `Organization C,7,No,`.
- Check `SEED = 2026` and `AS_OF = date(2026, 10, 24)` in the script.
- Check nobody sorted or filtered the input file. Row order matters because the random draws happen row by row.
- Use Python 3.8 or later.

## Contributing

This folder is open to TPW's coalition organizations, so anyone can propose new fields, metrics, and generation rules. `participants.csv` belongs to Hack for Social Impact and TPW: download it separately as described above, and never commit it. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to propose and submit changes.

## Sources for the base rates

- CDCR Statewide Recidivism Report, FY 2018-19 (45.6% no enhanced credits; 21.1% RAC-eligible programs): https://www.cdcr.ca.gov/research/wp-content/uploads/sites/174/2024/02/Statewide-Recidivism-Report-for-Individuals-Released-in-Fiscal-Year-2018-19.pdf
- CDCR Recidivism Rates for Individuals with Rehabilitative Program Achievements, FY 2019-20 (~40% comparison groups): https://www.cdcr.ca.gov/research/wp-content/uploads/sites/174/2025/11/Recidivism-Rates-for-Individuals-with-Rehabilitative-Program-Achievements-Released-in-FY-2019-20.pdf
