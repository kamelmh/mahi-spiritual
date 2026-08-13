"""
Family Astrology Report Generator
==================================
Generates comprehensive reports for individual members and family-wide analysis.
"""

from typing import Dict, List
from datetime import datetime
import json


def generate_member_report(chart: Dict, transit_analysis: Dict = None, dasha_info: Dict = None) -> str:
    """Generate a comprehensive report for a single family member."""
    name = chart["name"]
    planets = chart.get("planets", {})
    aspects = chart.get("aspects", [])
    yogas = chart.get("yogas", [])

    lines = []
    lines.append(f"# {name} — Complete Astrology Report")
    lines.append(f"> Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("")

    # Birth data
    birth = chart.get("birth", {})
    lines.append("## Birth Data")
    lines.append(f"- Date: {birth.get('year', '?')}-{birth.get('month', '?'):02d}-{birth.get('day', '?'):02d}")
    lines.append(f"- Time: {birth.get('hour', 12):02d}:{birth.get('minute', 0):02d}")
    lines.append(f"- Location: {birth.get('location', {}).get('latitude', '?')}°N, {birth.get('location', {}).get('longitude', '?')}°E")
    lines.append("")

    # Planetary positions
    lines.append("## Sidereal Planetary Positions")
    lines.append("| Planet | Sign | Degree | Nakshatra | Pada | Dignity |")
    lines.append("|--------|------|--------|-----------|------|---------|")
    for planet, data in planets.items():
        if "error" not in data:
            lines.append(f"| {planet} | {data['sign']} | {data['degree']:.1f}° | {data.get('nakshatra', '?')} | {data.get('pada', '?')} | {data.get('dignity', '?')} |")
    lines.append("")

    # Aspects
    if aspects:
        lines.append("## Planetary Aspects")
        lines.append("| Planets | Type | Angle | Nature |")
        lines.append("|---------|------|-------|--------|")
        for asp in aspects[:20]:
            lines.append(f"| {asp['planet1']}-{asp['planet2']} | {asp['type']} | {asp.get('angle', '?')}° | {asp.get('nature', '?')} |")
        lines.append("")

    # Yogas
    if yogas:
        lines.append("## Yogas Detected")
        for yoga in yogas:
            lines.append(f"- **{yoga['type']}**: {yoga.get('significance', '')}")
        lines.append("")

    # Transit analysis
    if transit_analysis:
        lines.append("## Current Transits")
        lines.append(f"- Significant transits: {transit_analysis.get('significant_count', 0)}")
        for pred in transit_analysis.get("predictions", [])[:5]:
            lines.append(f"- {pred.get('planet', '?')} {pred.get('aspect', '?')} {pred.get('natal_planet', '?')}: {pred.get('theme', '')}")
        lines.append("")

    # Dasha info
    if dasha_info:
        lines.append("## Current Dasha Period")
        maha = dasha_info.get("maha_dasha")
        bhukti = dasha_info.get("bhukti")
        if maha:
            lines.append(f"- Maha Dasha: {maha['lord']} ({maha['start']} to {maha['end']})")
        if bhukti:
            lines.append(f"- Bhukti: {bhukti['lord']} ({bhukti['start']} to {bhukti['end']})")
        lines.append("")

    return "\n".join(lines)


def generate_family_summary(charts: Dict) -> str:
    """Generate a family-wide summary report."""
    lines = []
    lines.append("# Family Astrology Summary")
    lines.append(f"> Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("")

    # Member overview
    lines.append("## Family Members")
    lines.append("| Member | Role | Sun | Moon | Rising | Key Nakshatra |")
    lines.append("|--------|------|-----|------|--------|---------------|")
    for name, chart in charts.items():
        role = chart.get("role", "?")
        sun = chart.get("planets", {}).get("Sun", {})
        moon = chart.get("planets", {}).get("Moon", {})
        sun_str = f"{sun.get('sign', '?')} {sun.get('degree', 0):.0f}°" if "error" not in sun else "?"
        moon_str = f"{moon.get('sign', '?')} {moon.get('degree', 0):.0f}°" if "error" not in moon else "?"
        sun_nak = sun.get("nakshatra", "?") if "error" not in sun else "?"
        lines.append(f"| {name} | {role} | {sun_str} | {moon_str} | — | {sun_nak} |")
    lines.append("")

    # Element analysis
    from .research_copilot import detect_elemental_balance
    elemental = detect_elemental_balance(charts)
    lines.append("## Elemental Balance")
    lines.append(f"- Fire: {elemental['percentages'].get('fire', 0)}%")
    lines.append(f"- Earth: {elemental['percentages'].get('earth', 0)}%")
    lines.append(f"- Air: {elemental['percentages'].get('air', 0)}%")
    lines.append(f"- Water: {elemental['percentages'].get('water', 0)}%")
    lines.append(f"- Dominant: {elemental['dominant']}")
    lines.append(f"- Theme: {elemental['family_theme']}")
    lines.append("")

    # Key patterns
    from .research_copilot import detect_family_patterns
    patterns = detect_family_patterns(charts)

    if patterns.get("rahu_ketu_axes", {}).get("shared_axes"):
        lines.append("## Rahu-Ketu Axes")
        for axis in patterns["rahu_ketu_axes"]["shared_axes"]:
            lines.append(f"- {axis['axis']}: {', '.join(axis['rahu_members'] + axis['ketu_members'])}")
        lines.append("")

    if patterns.get("saturn_patterns", {}).get("shared"):
        lines.append("## Shared Saturn Placements")
        for sign, members in patterns["saturn_patterns"]["shared"].items():
            lines.append(f"- Saturn in {sign}: {', '.join(members)}")
        lines.append("")

    if patterns.get("nakshatra_clusters", {}).get("clusters"):
        lines.append("## Shared Nakshatra Clusters")
        for nak, members in patterns["nakshatra_clusters"]["clusters"].items():
            lines.append(f"- {nak}: {', '.join(members)}")
        lines.append("")

    # Investigation questions
    from .research_copilot import generate_investigation_questions
    questions = generate_investigation_questions(charts, patterns)
    if questions:
        lines.append("## Investigation Questions")
        for q in questions[:10]:
            lines.append(f"- [{q['category'].upper()}] {q['question']}")
        lines.append("")

    # Recommendations
    from .research_copilot import generate_recommendations
    recommendations = generate_recommendations(patterns)
    if recommendations:
        lines.append("## Recommendations")
        for r in recommendations:
            lines.append(f"- {r}")
        lines.append("")

    return "\n".join(lines)


def generate_synastry_report(synastry: Dict) -> str:
    """Generate a synastry report between two members."""
    lines = []
    lines.append(f"# Synastry: {synastry['person1']} & {synastry['person2']}")
    lines.append(f"> Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("")

    score = synastry.get("score", {})
    lines.append("## Compatibility Score")
    lines.append(f"- Overall: {score.get('overall', 0)}/100 ({score.get('label', '?')})")
    lines.append(f"- Harmonious aspects: {score.get('harmonious', 0)}")
    lines.append(f"- Challenging aspects: {score.get('challenging', 0)}")
    lines.append(f"- Strong aspects: {score.get('strong', 0)}")
    lines.append("")

    if synastry.get("aspects"):
        lines.append("## Key Aspects")
        lines.append("| Planets | Type | Angle | Nature |")
        lines.append("|---------|------|-------|--------|")
        for asp in synastry["aspects"][:15]:
            lines.append(f"| {asp['planet1']} - {asp['planet2']} | {asp['type']} | {asp.get('angle', '?')}° | {asp.get('nature', '?')} |")
        lines.append("")

    lines.append("## Summary")
    lines.append(synastry.get("summary", ""))
    lines.append("")

    return "\n".join(lines)


def generate_transit_report(transit_analysis: Dict) -> str:
    """Generate a transit report for a member."""
    lines = []
    lines.append(f"# Transit Report: {transit_analysis.get('member', '?')}")
    lines.append(f"> Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("")

    lines.append(f"- Total transits: {transit_analysis.get('transit_count', 0)}")
    lines.append(f"- Significant transits: {transit_analysis.get('significant_count', 0)}")
    lines.append("")

    if transit_analysis.get("significant_transits"):
        lines.append("## Significant Transits")
        for transit in transit_analysis["significant_transits"][:10]:
            lines.append(f"- {transit['transit_planet']} in {transit['transit_sign']} {transit['aspect']} natal {transit['natal_planet']} in {transit['natal_sign']} (orb: {transit['degrees_orb']}°)")
        lines.append("")

    if transit_analysis.get("predictions"):
        lines.append("## Predictions")
        for pred in transit_analysis["predictions"]:
            lines.append(f"- **{pred.get('planet', '?')} {pred.get('aspect', '?')}**: {pred.get('theme', '')}")
            if "advice" in pred:
                lines.append(f"  - Advice: {pred['advice']}")
        lines.append("")

    return "\n".join(lines)


if __name__ == "__main__":
    from .engine import calculate_family_charts

    charts = calculate_family_charts()

    # Generate family summary
    summary = generate_family_summary(charts)
    print(summary[:2000])  # Print first 2000 chars