"""
Research Copilot — AI-Powered Family Astrology Analysis
=======================================================
Smart investigation system for deep family chart analysis.
Detects patterns, generates insights, and provides recommendations.
"""

from typing import Dict, List, Tuple, Optional
from datetime import datetime
import json


# Family member profiles
MEMBER_PROFILES = {
    "Kamel": {
        "generation": "millennial",
        "role": "subject",
        "key_placements": ["Sun Aquarius", "Moon Scorpio", "Rahu Virgo", "Ketu Pisces"],
        "life_themes": ["Spiritual teaching", "Innovation", "Service", "Writing"],
    },
    "Kheireddine": {
        "generation": "millennial",
        "role": "brother",
        "key_placements": ["Sun Libra", "Moon Virgo", "Rahu Capricorn", "Ketu Cancer"],
        "life_themes": ["Balance", "Service", "Structure", "Family"],
    },
    "Ikram": {
        "generation": "gen_z",
        "role": "sister",
        "key_placements": ["Sun Leo", "Moon Virgo", "Rahu Aquarius", "Ketu Leo"],
        "life_themes": ["Creativity", "Service", "Innovation", "Self-expression"],
    },
    "Ghofran": {
        "generation": "gen_alpha",
        "role": "half_sister",
        "key_placements": ["Sun Virgo", "Moon Libra", "Rahu Aquarius", "Ketu Leo"],
        "life_themes": ["Service", "Balance", "Innovation", "New paradigm"],
    },
    "Zohra": {
        "generation": "gen_x",
        "role": "mother",
        "key_placements": ["Sun Scorpio", "Moon Sagittarius", "Rahu Leo", "Ketu Aquarius"],
        "life_themes": ["Transformation", "Wisdom", "Tradition", "Family"],
    },
    "Father": {
        "generation": "boomer",
        "role": "father",
        "key_placements": ["Sun Pisces", "Moon Taurus", "Rahu Leo", "Ketu Aquarius"],
        "life_themes": ["Spirituality", "Stability", "Teaching", "Tradition"],
    },
    "Oumkeltoum": {
        "generation": "millennial",
        "role": "step_mother",
        "key_placements": ["Sun Cancer", "Moon Gemini", "Rahu Virgo", "Ketu Pisces"],
        "life_themes": ["Nurturing", "Communication", "Service", "Spirituality"],
    },
    "Sara": {
        "generation": "gen_z",
        "role": "sister_figure",
        "key_placements": ["Sun Taurus", "Moon Aquarius", "Rahu Gemini", "Ketu Sagittarius"],
        "life_themes": ["Stability", "Innovation", "Communication", "Freedom"],
    },
}


def detect_family_patterns(charts: Dict) -> Dict:
    """
    Detect deep patterns across all family charts.
    """
    patterns = {
        "elemental_balance": detect_elemental_balance(charts),
        "nakshatra_clusters": detect_nakshatra_clusters(charts),
        "rahu_ketu_axes": detect_rahu_ketu_axes(charts),
        "saturn_patterns": detect_saturn_patterns(charts),
        "jupiter_patterns": detect_jupiter_patterns(charts),
        "mars_patterns": detect_mars_patterns(charts),
        "moon_patterns": detect_moon_patterns(charts),
        "mercury_patterns": detect_mercury_patterns(charts),
        "venus_patterns": detect_venus_patterns(charts),
        "sun_patterns": detect_sun_patterns(charts),
        "generational_themes": detect_generational_themes(charts),
    }

    return patterns


def detect_elemental_balance(charts: Dict) -> Dict:
    """Analyze elemental balance across the family."""
    elements = {"fire": 0, "earth": 0, "air": 0, "water": 0}
    element_signs = {
        "fire": ["Aries", "Leo", "Sagittarius"],
        "earth": ["Taurus", "Virgo", "Capricorn"],
        "air": ["Gemini", "Libra", "Aquarius"],
        "water": ["Cancer", "Scorpio", "Pisces"],
    }

    for name, chart in charts.items():
        for planet, data in chart.get("planets", {}).items():
            if "error" in data or planet in ["Uranus", "Neptune", "Pluto"]:
                continue
            sign = data["sign"]
            for element, signs in element_signs.items():
                if sign in signs:
                    elements[element] += 1

    total = sum(elements.values())
    return {
        "counts": elements,
        "percentages": {k: round(v/total*100, 1) if total > 0 else 0 for k, v in elements.items()},
        "dominant": max(elements, key=elements.get),
        "family_theme": get_element_family_theme(max(elements, key=elements.get)),
    }


def get_element_family_theme(element: str) -> str:
    """Get family theme for dominant element."""
    themes = {
        "fire": "Family expresses through action, passion, and creativity",
        "earth": "Family expresses through practical work, stability, and material success",
        "air": "Family expresses through communication, ideas, and social connections",
        "water": "Family expresses through emotions, intuition, and spiritual depth",
    }
    return themes.get(element, "Unknown")


def detect_nakshatra_clusters(charts: Dict) -> Dict:
    """Detect clusters of same nakshatra across family."""
    nakshatra_members = {}

    for name, chart in charts.items():
        for planet, data in chart.get("planets", {}).items():
            if "error" in data or planet in ["Uranus", "Neptune", "Pluto"]:
                continue
            nak = data.get("nakshatra", "Unknown")
            if nak not in nakshatra_members:
                nakshatra_members[nak] = []
            nakshatra_members[nak].append(f"{name}.{planet}")

    # Find clusters (2+ planets in same nakshatra)
    clusters = {nak: members for nak, members in nakshatra_members.items() if len(members) >= 2}

    return {
        "clusters": clusters,
        "count": len(clusters),
        "family_theme": f"{len(clusters)} shared nakshatra energies across family members",
    }


def detect_rahu_ketu_axes(charts: Dict) -> Dict:
    """Detect Rahu-Ketu axis patterns across family."""
    rahu_positions = {}
    ketu_positions = {}

    for name, chart in charts.items():
        planets = chart.get("planets", {})
        if "Rahu" in planets and "error" not in planets["Rahu"]:
            rahu_sign = planets["Rahu"]["sign"]
            if rahu_sign not in rahu_positions:
                rahu_positions[rahu_sign] = []
            rahu_positions[rahu_sign].append(name)

        if "Ketu" in planets and "error" not in planets["Ketu"]:
            ketu_sign = planets["Ketu"]["sign"]
            if ketu_sign not in ketu_positions:
                ketu_positions[ketu_sign] = []
            ketu_positions[ketu_sign].append(name)

    # Find shared axes
    shared_axes = []
    for rahu_sign, rahu_members in rahu_positions.items():
        for ketu_sign, ketu_members in ketu_positions.items():
            if rahu_sign != ketu_sign:
                # Check if they form an axis (opposite signs)
                rahu_idx = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"].index(rahu_sign)
                ketu_idx = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"].index(ketu_sign)
                if abs(rahu_idx - ketu_idx) == 6:
                    shared_axes.append({
                        "axis": f"{rahu_sign} Rahu / {ketu_sign} Ketu",
                        "rahu_members": rahu_members,
                        "ketu_members": ketu_members,
                    })

    return {
        "rahu_positions": rahu_positions,
        "ketu_positions": ketu_positions,
        "shared_axes": shared_axes,
        "family_theme": f"{len(shared_axes)} shared Rahu-Ketu axes across family",
    }


def detect_saturn_patterns(charts: Dict) -> Dict:
    """Detect Saturn placement patterns."""
    saturn_signs = {}
    for name, chart in charts.items():
        if "Saturn" in chart.get("planets", {}):
            data = chart["planets"]["Saturn"]
            if "error" not in data:
                sign = data["sign"]
                if sign not in saturn_signs:
                    saturn_signs[sign] = []
                saturn_signs[sign].append(name)

    return {"placements": saturn_signs, "shared": {k: v for k, v in saturn_signs.items() if len(v) > 1}}


def detect_jupiter_patterns(charts: Dict) -> Dict:
    """Detect Jupiter placement patterns."""
    jupiter_signs = {}
    for name, chart in charts.items():
        if "Jupiter" in chart.get("planets", {}):
            data = chart["planets"]["Jupiter"]
            if "error" not in data:
                sign = data["sign"]
                dignity = data.get("dignity", "neutral")
                if sign not in jupiter_signs:
                    jupiter_signs[sign] = []
                jupiter_signs[sign].append({"name": name, "dignity": dignity})

    return {"placements": jupiter_signs}


def detect_mars_patterns(charts: Dict) -> Dict:
    """Detect Mars placement patterns."""
    mars_signs = {}
    for name, chart in charts.items():
        if "Mars" in chart.get("planets", {}):
            data = chart["planets"]["Mars"]
            if "error" not in data:
                sign = data["sign"]
                dignity = data.get("dignity", "neutral")
                if sign not in mars_signs:
                    mars_signs[sign] = []
                mars_signs[sign].append({"name": name, "dignity": dignity})

    return {"placements": mars_signs}


def detect_moon_patterns(charts: Dict) -> Dict:
    """Detect Moon placement patterns (emotional family dynamics)."""
    moon_signs = {}
    for name, chart in charts.items():
        if "Moon" in chart.get("planets", {}):
            data = chart["planets"]["Moon"]
            if "error" not in data:
                sign = data["sign"]
                nak = data.get("nakshatra", "Unknown")
                if sign not in moon_signs:
                    moon_signs[sign] = []
                moon_signs[sign].append({"name": name, "nakshatra": nak})

    return {"placements": moon_signs}


def detect_mercury_patterns(charts: Dict) -> Dict:
    """Detect Mercury placement patterns (communication styles)."""
    mercury_signs = {}
    for name, chart in charts.items():
        if "Mercury" in chart.get("planets", {}):
            data = chart["planets"]["Mercury"]
            if "error" not in data:
                sign = data["sign"]
                if sign not in mercury_signs:
                    mercury_signs[sign] = []
                mercury_signs[sign].append(name)

    return {"placements": mercury_signs}


def detect_venus_patterns(charts: Dict) -> Dict:
    """Detect Venus placement patterns (love and relationship styles)."""
    venus_signs = {}
    for name, chart in charts.items():
        if "Venus" in chart.get("planets", {}):
            data = chart["planets"]["Venus"]
            if "error" not in data:
                sign = data["sign"]
                dignity = data.get("dignity", "neutral")
                if sign not in venus_signs:
                    venus_signs[sign] = []
                venus_signs[sign].append({"name": name, "dignity": dignity})

    return {"placements": venus_signs}


def detect_sun_patterns(charts: Dict) -> Dict:
    """Detect Sun placement patterns (identity and purpose)."""
    sun_signs = {}
    for name, chart in charts.items():
        if "Sun" in chart.get("planets", {}):
            data = chart["planets"]["Sun"]
            if "error" not in data:
                sign = data["sign"]
                nak = data.get("nakshatra", "Unknown")
                if sign not in sun_signs:
                    sun_signs[sign] = []
                sun_signs[sign].append({"name": name, "nakshatra": nak})

    return {"placements": sun_signs}


def detect_generational_themes(charts: Dict) -> Dict:
    """Detect generational patterns (outer planet placements)."""
    generations = {}
    for name, chart in charts.items():
        birth_year = chart.get("birth", {}).get("year", 0)
        if birth_year < 1965:
            gen = "boomer"
        elif birth_year < 1981:
            gen = "gen_x"
        elif birth_year < 1997:
            gen = "millennial"
        elif birth_year < 2013:
            gen = "gen_z"
        else:
            gen = "gen_alpha"

        if gen not in generations:
            generations[gen] = []
        generations[gen].append(name)

    return generations


def generate_investigation_questions(charts: Dict, patterns: Dict) -> List[Dict]:
    """
    Generate smart investigation questions based on detected patterns.
    """
    questions = []

    # Check Rahu-Ketu axes
    if patterns.get("rahu_ketu_axes", {}).get("shared_axes"):
        for axis in patterns["rahu_ketu_axes"]["shared_axes"]:
            questions.append({
                "category": "karmic",
                "question": f"What shared karmic lessons exist around {axis['axis']} axis?",
                "members": axis["rahu_members"] + axis["ketu_members"],
                "importance": "high",
            })

    # Check Saturn patterns
    if patterns.get("saturn_patterns", {}).get("shared"):
        for sign, members in patterns["saturn_patterns"]["shared"].items():
            questions.append({
                "category": "discipline",
                "question": f"What shared discipline patterns exist for {', '.join(members)} with Saturn in {sign}?",
                "members": members,
                "importance": "high",
            })

    # Check elemental imbalance
    elemental = patterns.get("elemental_balance", {})
    if elemental.get("dominant"):
        dominant = elemental["dominant"]
        if elemental["percentages"].get(dominant, 0) > 40:
            questions.append({
                "category": "balance",
                "question": f"The family has {elemental['percentages'][dominant]}% {dominant} energy. What areas need more balance?",
                "importance": "medium",
            })

    # Check Mars patterns (conflict areas)
    if patterns.get("mars_patterns", {}).get("placements"):
        for sign, members in patterns["mars_patterns"]["placements"].items():
            if len(members) > 1:
                names = [m["name"] for m in members]
                questions.append({
                    "category": "conflict",
                    "question": f"What conflict patterns exist between {', '.join(names)} with Mars in {sign}?",
                    "members": names,
                    "importance": "medium",
                })

    # Check Moon patterns (emotional dynamics)
    if patterns.get("moon_patterns", {}).get("placements"):
        for sign, members in patterns["moon_patterns"]["placements"].items():
            if len(members) > 1:
                names = [m["name"] for m in members]
                questions.append({
                    "category": "emotional",
                    "question": f"What emotional patterns are shared by {', '.join(names)} with Moon in {sign}?",
                    "members": names,
                    "importance": "medium",
                })

    return questions


def generate_family_report(charts: Dict) -> Dict:
    """
    Generate comprehensive family astrology report.
    """
    patterns = detect_family_patterns(charts)
    questions = generate_investigation_questions(charts, patterns)

    # Calculate family karma summary
    karma_summary = {
        "rahu_ketu_axes": len(patterns.get("rahu_ketu_axes", {}).get("shared_axes", [])),
        "shared_nakshatras": patterns.get("nakshatra_clusters", {}).get("count", 0),
        "elemental_dominant": patterns.get("elemental_balance", {}).get("dominant", "Unknown"),
        "investigation_questions": len(questions),
    }

    return {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "family_members": list(charts.keys()),
        "patterns": patterns,
        "karma_summary": karma_summary,
        "investigation_questions": questions,
        "recommendations": generate_recommendations(patterns),
    }


def generate_recommendations(patterns: Dict) -> List[str]:
    """Generate family recommendations based on patterns."""
    recommendations = []

    # Based on elemental balance
    elemental = patterns.get("elemental_balance", {})
    dominant = elemental.get("dominant")
    if dominant == "water":
        recommendations.append("Family has strong water energy — encourage emotional expression and spiritual practice")
    elif dominant == "earth":
        recommendations.append("Family has strong earth energy — ground spiritual insights into practical action")
    elif dominant == "air":
        recommendations.append("Family has strong air energy — channel communication into teaching and writing")
    elif dominant == "fire":
        recommendations.append("Family has strong fire energy — direct passion into creative and spiritual projects")

    # Based on Rahu-Ketu
    rahu = patterns.get("rahu_ketu_axes", {})
    if rahu.get("shared_axes"):
        recommendations.append(f"Multiple shared Rahu-Ketu axes — family has strong karmic connections, work on collective liberation")

    # Based on Saturn
    saturn = patterns.get("saturn_patterns", {})
    if saturn.get("shared"):
        for sign, members in saturn["shared"].items():
            recommendations.append(f"{', '.join(members)} share Saturn in {sign} — work together on shared discipline lessons")

    return recommendations


if __name__ == "__main__":
    from .engine import calculate_family_charts

    charts = calculate_family_charts()
    report = generate_family_report(charts)

    print("FAMILY ASTROLOGY RESEARCH REPORT")
    print("=" * 60)
    print(f"\nGenerated: {report['generated_at']}")
    print(f"Members: {', '.join(report['family_members'])}")

    print(f"\nPatterns Detected:")
    print(f"  Rahu-Ketu axes: {report['karma_summary']['rahu_ketu_axes']}")
    print(f"  Shared nakshatras: {report['karma_summary']['shared_nakshatras']}")
    print(f"  Dominant element: {report['karma_summary']['elemental_dominant']}")

    print(f"\nInvestigation Questions: {len(report['investigation_questions'])}")
    for q in report["investigation_questions"][:5]:
        print(f"  [{q['category']}] {q['question']}")

    print(f"\nRecommendations:")
    for r in report["recommendations"]:
        print(f"  - {r}")
