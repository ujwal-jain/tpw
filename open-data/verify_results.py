"""Check the generated files against the expected numbers. Run after generate_synthetic.py."""
import csv
import collections

P = {r["participant_id"]: r for r in csv.DictReader(open("participants.csv"))}
O = list(csv.DictReader(open("outcomes_synthetic.csv")))
EVENTS = ("returned", "conviction", "arrest")

print("rows:", len(O))
print("36-month outcomes:", dict(collections.Counter(o["outcome_36mo"] for o in O)))
print()
print("org            | completed | known | any reoffense | returned only")
for org in ["Organization A", "Organization B", "Organization C", "ALL"]:
    for c in ("Yes", "No"):
        known = [o for o in O
                 if (org == "ALL" or o["organization"] == org)
                 and P[o["participant_id"]]["completed"] == c
                 and o["outcome_36mo"] in EVENTS + ("none",)]
        anyr = sum(o["outcome_36mo"] in EVENTS for o in known)
        ret = sum(o["outcome_36mo"] == "returned" for o in known)
        print(f"{org:14} | {c:9} | {len(known):5} | {100*anyr/len(known):12.1f}% | {100*ret/len(known):12.1f}%")
print()
for org in ["Organization A", "Organization B", "Organization C"]:
    rows = [o for o in O if o["organization"] == org]
    answered = [o for o in rows if o["housed_90d"]]
    print(org,
          "| credit days:", sum(int(o["credit_days_earned"]) for o in rows),
          "| housed 90d: %.0f%%" % (100 * sum(o["housed_90d"] == "yes" for o in answered) / len(answered)),
          "| working 90d: %.0f%%" % (100 * sum(o["working_or_training_90d"] == "yes" for o in answered) / len(answered)),
          "| mentors:", sum(o["mentoring"] == "yes" for o in rows))
