"""
Family Synastry Engine
======================
Analyzes relationships between family members through chart comparison.
Includes composite charts, Davison charts, and karmic connection scoring.
"""

from typing import Dict, List, Tuple, Optional
from datetime import datetime
import math


# Synastry aspect interpretation
SYNASTRY_ASPECTS = {
    "conjunction": {
        "nature": "strong",
        "description": "Intense connection, fusion of energies",
        "family": "Deep bond, shared purpose, can be overwhelming",
    },
    "opposition": {
        "nature": "challenging",
        "description": "Attraction through contrast, tension, growth",
        "family": "Mirroring each other, projected qualities, balance",
    },
    "trine": {
        "nature": "harmonious",
        "description": "Natural flow, ease, comfort",
        "family": "Easy rapport, shared understanding, support",
    },
    "square": {
        "nature": "challenging",
        "description": "Friction, growth through challenge",
        "family": "Conflict areas, lessons, development through struggle",
    },
    "sextile": {
        "nature": "harmonious",
        "description": "Opportunity, cooperation, gentle support",
        "family": "Mutual support, shared interests, cooperation",
    },
}


def calculate_synastry(person1_chart: Dict, person2_chart: Dict) -> Dict:
    """
    Calculate synastry aspects between two charts.
    Maps one person's planets to the other's houses.
    """
    aspects = []

    planets1 = person1_chart.get("planets", {})
    planets2 = person2_chart.get("planets", {})

    for p1_name, p1_data in planets1.items():
        if "error" in p1_data:
            continue
        for p2_name, p2_data in planets2.items():
            if "error" in p2_data:
                continue

            # Calculate angular distance
            diff = abs(p1_data["sidereal"] - p2_data["sidereal"])
            if diff > 180:
                diff = 360 - diff

            # Check aspects
            aspect_types = [
                {"name": "conjunction", "angle": 0, "orb": 8},
                {"name": "opposition", "angle": 180, "orb": 8},
                {"name": "trine", "angle": 120, "orb": 8},
                {"name": "square", "angle": 90, "orb": 8},
                {"name": "sextile", "angle": 60, "orb": 6},
            ]

            for asp in aspect_types:
                if abs(diff - asp["angle"]) <= asp["orb"]:
                    aspects.append({
                        "planet1": f"{person1_chart['name']}.{p1_name}",
                        "planet2": f"{person2_chart['name']}.{p2_name}",
                        "type": asp["name"],
                        "angle": round(diff, 1),
                        "exactness": round(abs(asp["angle"] - diff), 1),
                        "nature": SYNASTRY_ASPECTS[asp["name"]]["nature"],
                        "description": SYNASTRY_ASPECTS[asp["name"]]["family"],
                    })

    # Calculate compatibility score
    score = calculate_compatibility_score(aspects)

    return {
        "person1": person1_chart["name"],
        "person2": person2_chart["name"],
        "aspects": aspects,
        "score": score,
        "summary": generate_synastry_summary(aspects, score),
    }


def calculate_compatibility_score(aspects: List[Dict]) -> Dict:
    """Calculate overall compatibility score from synastry aspects."""
    score = 50  # Base score
    harmonious = 0
    challenging = 0
    strong = 0

    for asp in aspects:
        if asp["nature"] == "harmonious":
            harmonious += 1
            score += 5
        elif asp["nature"] == "challenging":
            challenging += 1
            score -= 3
        elif asp["nature"] == "strong":
            strong += 1
            score += 3

    # Normalize score to 0-100
    score = max(0, min(100, score))

    return {
        "overall": score,
        "harmonious": harmonious,
        "challenging": challenging,
        "strong": strong,
        "label": get_score_label(score),
    }


def get_score_label(score: int) -> str:
    """Get descriptive label for compatibility score."""
    if score >= 80:
        return "Excellent - Deep karmic bond"
    elif score >= 65:
        return "Good - Strong connection"
    elif score >= 50:
        return "Average - Mixed dynamics"
    elif score >= 35:
        return "Challenging - Growth through friction"
    else:
        return "Difficult - Significant tension"


def generate_synastry_summary(aspects: List[Dict], score: Dict) -> str:
    """Generate a natural language summary of the synastry."""
    if not aspects:
        return "No significant aspects found between charts."

    # Group by planet pairs
    planet_aspects = {}
    for asp in aspects:
        key = f"{asp['planet1'].split('.')[1]}-{asp['planet2'].split('.')[1]}"
        if key not in planet_aspects:
            planet_aspects[key] = []
        planet_aspects[key].append(asp)

    summary_parts = []

    # Highlight most significant aspects
    conjunctions = [a for a in aspects if a["type"] == "conjunction"]
    if conjunctions:
        summary_parts.append(f"Strong conjunctions: {len(conjunctions)} (deep fusion of energies)")

    oppositions = [a for a in aspects if a["type"] == "opposition"]
    if oppositions:
        summary_parts.append(f"Oppositions: {len(oppositions)} (tension and growth)")

    trines = [a for a in aspects if a["type"] == "trine"]
    if trines:
        summary_parts.append(f"Trines: {len(trines)} (natural harmony)")

    squares = [a for a in aspects if a["type"] == "square"]
    if squares:
        summary_parts.append(f"Squares: {len(squares)} (challenge and development)")

    return f"Score: {score['overall']}/100 ({score['label']}). " + "; ".join(summary_parts)


def calculate_composite_chart(chart1: Dict, chart2: Dict) -> Dict:
    """
    Calculate composite chart (midpoint chart).
    The average of two charts — represents the relationship itself.
    """
    composite_planets = {}

    planets1 = chart1.get("planets", {})
    planets2 = chart2.get("planets", {})

    for planet in planets1:
        if planet in planets2 and "error" not in planets1[planet] and "error" not in planets2[planet]:
            # Calculate midpoint
            lon1 = planets1[planet]["sidereal"]
            lon2 = planets2[planet]["sidereal"]

            # Shortest arc midpoint
            diff = (lon2 - lon1) % 360
            if diff > 180:
                diff = diff - 360
            midpoint = (lon1 + diff / 2) % 360

            from .engine import get_sign, get_nakshatra, get_dignity
            sign, degree = get_sign(midpoint)
            nakshatra = get_nakshatra(midpoint)

            composite_planets[planet] = {
                "sidereal": round(midpoint, 2),
                "sign": sign,
                "degree": round(degree, 2),
                "nakshatra": nakshatra["name"],
                "pada": nakshatra["pada"],
            }

    return {
        "person1": chart1["name"],
        "person2": chart2["name"],
        "planets": composite_planets,
        "description": "Composite chart represents the relationship itself — the entity created by the union.",
    }


def calculate_family_synastry(charts: Dict) -> Dict:
    """
    Calculate synastry for all family member pairs.
    Returns a matrix of compatibility scores.
    """
    members = list(charts.keys())
    pairs = []
    matrix = {}

    for i, m1 in enumerate(members):
        matrix[m1] = {}
        for j, m2 in enumerate(members):
            if i == j:
                matrix[m1][m2] = {"score": 100, "label": "Self"}
                continue

            if j < i:
                # Use cached reverse pair
                matrix[m1][m2] = matrix[m2][m1]
                continue

            # Calculate synastry
            synastry = calculate_synastry(charts[m1], charts[m2])
            pairs.append(synastry)
            matrix[m1][m2] = synastry["score"]

    # Find strongest and weakest connections
    strongest = None
    weakest = None
    max_score = 0
    min_score = 100

    for pair in pairs:
        score = pair["score"]["overall"]
        if score > max_score:
            max_score = score
            strongest = pair
        if score < min_score:
            min_score = score
            weakest = pair

    return {
        "pairs": pairs,
        "matrix": matrix,
        "strongest": {"pair": f"{strongest['person1']}-{strongest['person2']}", "score": strongest["score"]} if strongest else None,
        "weakest": {"pair": f"{weakest['person1']}-{weakest['person2']}", "score": weakest["score"]} if weakest else None,
    }


def analyze_karmic_connections(charts: Dict) -> List[Dict]:
    """
    Analyze karmic connections across the family.
    Looks for Rahu/Ketu axes, Saturn aspects, and shared nakshatras.
    """
    karmic_connections = []

    members = list(charts.keys())
    for i, m1 in enumerate(members):
        for j, m2 in enumerate(members[i+1:], i+1):
            chart1 = charts[m1]
            chart2 = charts[m2]

            planets1 = chart1.get("planets", {})
            planets2 = chart2.get("planets", {})

            # Check Rahu-Ketu axis
            if "Rahu" in planets1 and "Ketu" in planets2:
                rahu1 = planets1["Rahu"]["sidereal"]
                ketu2 = planets2["Ketu"]["sidereal"]
                if abs(rahu1 - ketu2) < 10 or abs(rahu1 - ketu2 - 180) < 10:
                    karmic_connections.append({
                        "type": "rahu_ketu_axis",
                        "members": [m1, m2],
                        "description": f"{m1}'s Rahu aligns with {m2}'s Ketu — karmic connection across lifetimes",
                    })

            # Check shared nakshatras
            for p1 in planets1:
                if p1 in ["Uranus", "Neptune", "Pluto"]:
                    continue
                if p1 in planets2 and "error" not in planets1[p1] and "error" not in planets2[p1]:
                    if planets1[p1].get("nakshatra") == planets2[p1].get("nakshatra"):
                        karmic_connections.append({
                            "type": "shared_nakshatra",
                            "members": [m1, m2],
                            "planet": p1,
                            "nakshatra": planets1[p1]["nakshatra"],
                            "description": f"{m1} and {m2} share {p1} in {planets1[p1]['nakshatra']} — similar energy expression",
                        })

            # Check Saturn aspects (karmic lessons)
            if "Saturn" in planets1 and "Saturn" in planets2:
                sat_diff = abs(planets1["Saturn"]["sidereal"] - planets2["Saturn"]["sidereal"])
                if sat_diff < 10:
                    karmic_connections.append({
                        "type": "saturn_conjunction",
                        "members": [m1, m2],
                        "description": f"{m1} and {m2} share Saturn placement — shared karmic lessons",
                    })

    return karmic_connections


if __name__ == "__main__":
    # Test synastry with sample charts
    from .engine import calculate_full_chart

    kamel = calculate_full_chart("Kamel", 1996, 3, 6, 14, 0)
    father = calculate_full_chart("Father", 1961, 3, 31, 12, 0)

    print("SYNASTRY: Kamel vs Father")
    print("=" * 60)

    synastry = calculate_synastry(kamel, father)
    print(f"\nScore: {synastry['score']['overall']}/100 ({synastry['score']['label']})")
    print(f"Aspects: {len(synastry['aspects'])}")

    for asp in synastry["aspects"][:10]:
        print(f"  {asp['planet1']}-{asp['planet2']}: {asp['type']} ({asp['angle']}°) - {asp['description']}")