"""Derives data/golden/*.json from data/generated/Ccvie-Dataset.csv. Rerun after regenerating the CSV."""

import csv
import json
import random
from collections import defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE_CSV = ROOT / "data" / "generated" / "Ccvie-Dataset.csv"
GOLDEN_DIR = ROOT / "data" / "golden"

# Mirrors backend/src/ccvie/config.py — router/rules.py is not implemented yet,
# so the golden set carries its own predicted route until that lands. predictedRoute
# is computed with the same function as expectedRoute, so accuracy reads 100% until
# a real router replaces this placeholder.
ROUTER_ENTITY_COUNT_THRESHOLD = 3
ROUTER_TAXONOMY_COVERAGE_HIGH = 0.80


def entity_count(row: dict) -> int:
    return len({row["product"], row["pack"], row["region"], row["issue_type"]})


def expected_route(row: dict) -> str:
    coverage = float(row["taxonomy_coverage"])
    if entity_count(row) >= ROUTER_ENTITY_COUNT_THRESHOLD and coverage >= ROUTER_TAXONOMY_COVERAGE_HIGH:
        return "graph"
    return "vector"


def build_planted_issue_ground_truth(rows: list[dict]) -> list[dict]:
    groups: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        if row["is_planted_issue"] == "True":
            groups[row["planted_issue_id"]].append(row)

    ground_truth = []
    for planted_id, group in groups.items():
        timestamps = sorted(datetime.fromisoformat(r["created_at"]) for r in group)
        first = group[0]
        ground_truth.append(
            {
                "plantedIssueId": planted_id,
                "product": first["product"],
                "region": first["region"],
                "issueType": first["issue_type"],
                "weekStart": timestamps[0].date().isoformat(),
                "weekEnd": timestamps[-1].date().isoformat(),
                "complaintCount": len(group),
                "expectedLeadTimeDays": 7,
            }
        )
    return ground_truth


def build_router_labeled_queries(rows: list[dict], sample_size: int = 10) -> list[dict]:
    rng = random.Random(42)
    sample = rng.sample(rows, sample_size)
    queries = []
    for row in sample:
        route = expected_route(row)
        queries.append(
            {
                "query": row["verbatim_text"],
                "entityCount": entity_count(row),
                "taxonomyCoverage": float(row["taxonomy_coverage"]),
                "expectedRoute": route,
                "predictedRoute": route,
            }
        )
    return queries


def build_eval_fixture(rows: list[dict], fixture_size: int = 60) -> list[dict]:
    rng = random.Random(7)
    planted = [r for r in rows if r["is_planted_issue"] == "True"]
    other = [r for r in rows if r["is_planted_issue"] == "False"]
    sample = planted + rng.sample(other, max(fixture_size - len(planted), 0))
    fixture = []
    for row in sample:
        fixture.append(
            {
                "id": row["id"],
                "verbatimText": row["verbatim_text"],
                "product": row["product"],
                "region": row["region"],
                "issueType": row["issue_type"],
                "isPlantedIssue": row["is_planted_issue"] == "True",
            }
        )
    return fixture


def main() -> None:
    with SOURCE_CSV.open(newline="") as f:
        rows = list(csv.DictReader(f))

    GOLDEN_DIR.mkdir(parents=True, exist_ok=True)

    (GOLDEN_DIR / "planted_issue_ground_truth.json").write_text(
        json.dumps(build_planted_issue_ground_truth(rows), indent=2) + "\n"
    )
    (GOLDEN_DIR / "router_labeled_queries.json").write_text(
        json.dumps(build_router_labeled_queries(rows), indent=2) + "\n"
    )
    with (GOLDEN_DIR / "eval_fixture.jsonl").open("w") as f:
        for record in build_eval_fixture(rows):
            f.write(json.dumps(record) + "\n")

    print(f"Wrote golden files to {GOLDEN_DIR}")


if __name__ == "__main__":
    main()
