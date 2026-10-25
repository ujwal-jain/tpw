# Contributing to the TPW open data tools

These tools are open so that any of TPW's coalition organizations can read them, run them, and make them better. You don't need to be a programmer to help. A good question or a clear issue is a real contribution.

## Propose something new

Anyone can propose a new field, metric, or generation rule. Open an issue that says:

- **What it measures.** For example: "share of people with a job at 6 months."
- **Why a legislator or funder would care.** What decision would this number help someone make?

## Change a rule

1. Edit the constants at the top of `generate_synthetic.py` (`P36_COMPLETED`, `P36_NOT_COMPLETED`, `NO_RESPONSE_RATE`, the `ORGS` list, `dosage_factor`).
2. From inside `open-data/`, run both scripts:
   ```
   python generate_synthetic.py participants.csv
   python verify_results.py
   ```
3. Paste the **full** `verify_results.py` output into your pull request.
4. In the same pull request, update the "Expected results" tables in `README.md` to match the new output. Commit the regenerated `*_synthetic.csv` files too, so everyone uses the same data.

## Keep it synthetic, keep it private

- Every generated row keeps `data_source = SYNTHETIC`. Never present these numbers as real TPW results.
- Never commit real participant data or anything that could identify a person. That includes `participants.csv`, which belongs to Hack for Social Impact and TPW. `.gitignore` keeps it out, so please don't force-add it.

## Every new metric explains itself

When you add a metric, write down:

- **Definition:** what it means in one plain sentence.
- **Formula:** how it is calculated.
- **Inputs:** which columns and files it uses.
- **What it does not prove:** for example, people who finish a program may differ from people who don't in ways the data doesn't show. A lower reoffense rate among completers is an association, not proof that the program caused it.

## Review

TPW maintainers review and approve every change to a metric definition before it is merged. Other changes, such as fixing typos or clarifying docs, can be reviewed by any maintainer.
