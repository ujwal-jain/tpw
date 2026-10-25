"""
Generate SYNTHETIC follow-up data for the TPW demo.

Input:  the provided participation CSV (participant_id, organization,
        sessions_attended, completed, age_group)
Output: organizations_synthetic.csv and outcomes_synthetic.csv

Every generated row is marked data_source=SYNTHETIC. Same seed -> same files
for everyone on the team.

Usage:  python generate_synthetic.py participants.csv
"""
import csv
import random
import sys
from datetime import date, timedelta

SEED = 2026
AS_OF = date(2026, 10, 24)          # "today" for deciding which outcomes are still pending
random.seed(SEED)

# ---------- 1. Organization table (one row per org, all invented) ----------
ORGS = [
    # name, program type, prison, county, yearly budget, RAC days per completion
    ("Organization A", "Restorative justice circles", "Prison 1 (fictional)", "Sacramento", 180000, 30),
    ("Organization B", "Arts and theater program", "Prison 2 (fictional)", "Los Angeles", 240000, 40),
    ("Organization C", "Reentry job readiness", "Prison 3 (fictional)", "Fresno", 150000, 20),
]

# ---------- 2. Rules for outcomes ----------
P36_COMPLETED = 0.21       # matches CDCR's RAC-program figure, used as a stand-in
P36_NOT_COMPLETED = 0.40   # close to CDCR's ~40% comparison groups
NO_RESPONSE_RATE = 0.20    # about 1 in 5 people never answer follow-up


def dosage_factor(sessions):
    """More sessions -> slightly lower risk. 1 session = x1.15, 18 sessions = x0.85."""
    return 1.15 - 0.30 * (sessions - 1) / 17


def months_after(d, months):
    return d + timedelta(days=round(months * 30.44))


def main(path):
    with open(path, newline="") as f:
        people = list(csv.DictReader(f))

    org_info = {o[0]: o for o in ORGS}

    with open("organizations_synthetic.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["organization", "program_type", "prison", "county",
                    "annual_program_budget_usd", "rac_days_per_completion",
                    "reporting_year", "data_source"])
        for o in ORGS:
            w.writerow([o[0], o[1], o[2], o[3], o[4], o[5], 2026, "SYNTHETIC"])

    rows = []
    for p in people:
        completed = p["completed"].strip().lower() == "yes"
        sessions = int(p["sessions_attended"])
        org = org_info[p["organization"]]

        # Release dates spread from 2021 to mid-2026, so recent people are still "pending"
        release = date(2021, 1, 1) + timedelta(days=random.randint(0, 2000))
        consent = random.random() < (0.85 if completed else 0.70)
        responds = consent and random.random() >= NO_RESPONSE_RATE

        # Decide if and when this person returns (one draw, so outcomes stay consistent over time)
        p36 = (P36_COMPLETED if completed else P36_NOT_COMPLETED) * dosage_factor(sessions)
        event_month = None
        event_type = "none"
        if random.random() < p36:
            # Most reoffending happens early: 35% by 6 mo, 30% 6-12 mo, 35% 12-36 mo
            r = random.random()
            event_month = random.uniform(1, 6) if r < 0.35 else random.uniform(6, 12) if r < 0.65 else random.uniform(12, 36)
            event_type = random.choices(["returned", "conviction", "arrest"], weights=[0.5, 0.3, 0.2])[0]

        def status_at(m):
            if months_after(release, m) > AS_OF:
                return "pending"            # that check-in date hasn't happened yet
            if not consent:
                return "not_tracked"        # never agreed to follow-up
            if not responds:
                return "no_response"        # agreed, but didn't answer
            if event_month is not None and event_month <= m:
                return event_type
            return "none"

        # 90-day stability questions (only if they answer and 90 days have passed)
        if responds and months_after(release, 3) <= AS_OF:
            housed = "yes" if random.random() < (0.80 if completed else 0.65) else "no"
            working = "yes" if random.random() < (0.55 if completed else 0.40) else "no"
        else:
            housed = working = ""
        mentoring = "yes" if responds and completed and sessions >= 12 and random.random() < 0.15 else ("no" if responds else "")

        rows.append([
            p["participant_id"], p["organization"], release.isoformat(),
            "yes" if consent else "no",
            org[5] if completed else 0,      # credit days earned
            status_at(6), status_at(12), status_at(36),
            housed, working, mentoring, "SYNTHETIC",
        ])

    with open("outcomes_synthetic.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["participant_id", "organization", "release_date", "contact_consent",
                    "credit_days_earned", "outcome_6mo", "outcome_12mo", "outcome_36mo",
                    "housed_90d", "working_or_training_90d", "mentoring", "data_source"])
        w.writerows(rows)

    print(f"Wrote {len(rows)} outcome rows and {len(ORGS)} organization rows.")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "participants.csv")
