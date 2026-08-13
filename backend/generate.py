"""
Generate JSON data files for the MAHI Spiritual frontend.
Calculates Kamel's chart, family charts, dasha timelines, and transits.
Outputs JSON files to ../frontend/data/

Usage (from project root):
    python -m backend.generate
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime

from .engine import calculate_full_chart, calculate_family_charts, FAMILY_MEMBERS
from .dasha import calculate_dasha_sequence, get_current_dasha
from .transits import analyze_family_transits


FRONTEND_DATA_DIR = Path(__file__).parent.parent / "frontend" / "data"


def ensure_output_dir():
    """Create the frontend data directory if it doesn't exist."""
    FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)


def make_json_serializable(obj):
    """Convert non-serializable types to JSON-compatible formats."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: make_json_serializable(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [make_json_serializable(v) for v in obj]
    return obj


def generate_chart_json():
    """Generate Kamel's natal chart JSON."""
    print("Generating chart.json...")
    kamel = calculate_full_chart("Kamel", 1996, 3, 6, 12, 47, 33.06, 1.00)
    kamel["role"] = FAMILY_MEMBERS["Kamel"]["role"]
    return make_json_serializable(kamel)


def generate_family_json():
    """Generate all family member charts JSON."""
    print("Generating family.json...")
    charts = calculate_family_charts()
    return make_json_serializable(charts)


def generate_dasha_json():
    """Generate Kamel's dasha timeline JSON."""
    print("Generating dasha.json...")
    moon_nakshatra = "Hasta"
    moon_degree = 15.67
    birth_date = datetime(1996, 3, 6, 14, 0)

    dashas = calculate_dasha_sequence(moon_nakshatra, moon_degree, birth_date)
    current = get_current_dasha(birth_date, moon_nakshatra, moon_degree)

    # Serialize dasha objects
    serialized_dashas = []
    for d in dashas:
        serialized_dashas.append({
            "lord": d["lord"],
            "years": d["years"],
            "start": d["start"],
            "end": d["end"],
        })

    return {
        "name": "Kamel",
        "moon_nakshatra": moon_nakshatra,
        "moon_degree_in_nakshatra": moon_degree,
        "balance_of_first_dasha_years": round(
            dashas[0]["years"] if dashas else 0, 2
        ),
        "sequence": serialized_dashas,
        "current": make_json_serializable(current),
    }


def generate_transits_json():
    """Generate current transits for all family members JSON."""
    print("Generating transits.json...")
    charts = calculate_family_charts()
    result = analyze_family_transits(charts)
    return make_json_serializable(result)


def main():
    """Generate all JSON files."""
    ensure_output_dir()

    # Generate and write each JSON file
    files = {
        "chart.json": generate_chart_json,
        "family.json": generate_family_json,
        "dasha.json": generate_dasha_json,
        "transits.json": generate_transits_json,
    }

    for filename, generator in files.items():
        filepath = FRONTEND_DATA_DIR / filename
        data = generator()
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  Written: {filepath}")

    print(f"\nAll JSON files generated in {FRONTEND_DATA_DIR}")


if __name__ == "__main__":
    main()
