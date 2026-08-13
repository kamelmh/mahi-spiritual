"""
Family Astrology CLI
====================
Command-line interface for all family astrology tools.
"""

import sys
import json
from datetime import datetime


def main():
    """Main CLI entry point."""
    if len(sys.argv) < 2:
        print_help()
        return

    command = sys.argv[1]

    if command == "chart":
        cmd_chart()
    elif command == "family":
        cmd_family()
    elif command == "synastry":
        cmd_synastry()
    elif command == "transits":
        cmd_transits()
    elif command == "dasha":
        cmd_dasha()
    elif command == "research":
        cmd_research()
    elif command == "report":
        cmd_report()
    elif command == "help":
        print_help()
    else:
        print(f"Unknown command: {command}")
        print_help()


def print_help():
    """Print help message."""
    print("""
Family Astrology System v2.0
============================

Commands:
  chart <name>              Calculate natal chart for a family member
  family                    Calculate charts for all family members
  synastry <name1> <name2>  Synastry analysis between two members
  transits [name]           Current transit analysis (all or specific member)
  dasha <name>              Vimshottari dasha analysis
  research                  Family pattern detection and research
  report <name>             Generate comprehensive report for a member
  report family             Generate family summary report

Family Members:
  Kamel, Kheireddine, Ikram, Ghofran, Zohra, Father, Oumkeltoum, Sara

Examples:
  python -m family_astrology.cli chart Kamel
  python -m family_astrology.cli synastry Kamel Father
  python -m family_astrology.cli transits Kamel
  python -m family_astrology.cli research
  python -m family_astrology.cli report family
""")


def cmd_chart():
    """Calculate and display a natal chart."""
    if len(sys.argv) < 3:
        print("Usage: chart <name>")
        print("Available: Kamel, Kheireddine, Ikram, Ghofran, Zohra, Father, Oumkeltoum, Sara")
        return

    name = sys.argv[2]
    from .engine import calculate_family_charts

    charts = calculate_family_charts()
    if name not in charts:
        print(f"Unknown member: {name}")
        return

    chart = charts[name]
    print(f"\n{'='*60}")
    print(f"  {name} — Natal Chart")
    print(f"{'='*60}")
    print(f"\nBirth: {chart['birth']['year']}-{chart['birth']['month']:02d}-{chart['birth']['day']:02d} {chart['birth']['hour']:02d}:{chart['birth']['minute']:02d}")
    print(f"Role: {chart.get('role', 'Unknown')}")

    print(f"\n{'Planet':<10} {'Sign':<12} {'Degree':<8} {'Nakshatra':<20} {'Pada':<5} {'Dignity':<12}")
    print("-" * 67)
    for planet, data in chart["planets"].items():
        if "error" not in data:
            print(f"{planet:<10} {data['sign']:<12} {data['degree']:<8.1f} {data.get('nakshatra', '?'):<20} {data.get('pada', '?'):<5} {data.get('dignity', '?'):<12}")

    if chart.get("aspects"):
        print(f"\nAspects: {len(chart['aspects'])}")
        for asp in chart["aspects"][:10]:
            print(f"  {asp['planet1']}-{asp['planet2']}: {asp['type']} ({asp.get('angle', '?')}°)")

    if chart.get("yogas"):
        print(f"\nYogas: {len(chart['yogas'])}")
        for yoga in chart["yogas"][:5]:
            print(f"  {yoga['type']}: {yoga.get('significance', '')}")


def cmd_family():
    """Calculate charts for all family members."""
    from .engine import calculate_family_charts

    charts = calculate_family_charts()
    print(f"\n{'='*60}")
    print(f"  FAMILY CHARTS — {len(charts)} Members")
    print(f"{'='*60}")

    for name, chart in charts.items():
        sun = chart["planets"].get("Sun", {})
        moon = chart["planets"].get("Moon", {})
        sun_str = f"{sun.get('sign', '?')} {sun.get('degree', 0):.0f}°" if "error" not in sun else "?"
        moon_str = f"{moon.get('sign', '?')} {moon.get('degree', 0):.0f}°" if "error" not in moon else "?"
        print(f"\n{name:<15} {chart.get('role', '?'):<25} Sun: {sun_str:<15} Moon: {moon_str}")


def cmd_synastry():
    """Calculate synastry between two members."""
    if len(sys.argv) < 4:
        print("Usage: synastry <name1> <name2>")
        return

    name1, name2 = sys.argv[2], sys.argv[3]
    from .engine import calculate_family_charts
    from .synastry import calculate_synastry

    charts = calculate_family_charts()
    if name1 not in charts or name2 not in charts:
        print(f"Unknown member(s): {name1}, {name2}")
        return

    synastry = calculate_synastry(charts[name1], charts[name2])
    print(f"\n{'='*60}")
    print(f"  SYNASTRY: {name1} & {name2}")
    print(f"{'='*60}")

    score = synastry["score"]
    print(f"\nCompatibility: {score['overall']}/100 ({score['label']})")
    print(f"Harmonious: {score['harmonious']} | Challenging: {score['challenging']} | Strong: {score['strong']}")

    print(f"\nKey Aspects:")
    for asp in synastry["aspects"][:10]:
        print(f"  {asp['planet1']}-{asp['planet2']}: {asp['type']} ({asp.get('angle', '?')}°)")

    print(f"\n{synastry['summary']}")


def cmd_transits():
    """Show current transits."""
    from .engine import calculate_family_charts
    from .transits import analyze_family_transits

    charts = calculate_family_charts()

    if len(sys.argv) >= 3:
        name = sys.argv[2]
        if name in charts:
            from .transits import get_current_transits, analyze_transits_for_member
            transits = get_current_transits()
            analysis = analyze_transits_for_member(charts[name], transits)
            print(f"\n{'='*60}")
            print(f"  TRANSITS: {name}")
            print(f"{'='*60}")
            print(f"\nSignificant transits: {analysis['significant_count']}")
            for pred in analysis.get("predictions", []):
                print(f"  {pred.get('planet', '?')} {pred.get('aspect', '?')}: {pred.get('theme', '')}")
        else:
            print(f"Unknown member: {name}")
    else:
        result = analyze_family_transits(charts)
        print(f"\n{'='*60}")
        print(f"  FAMILY TRANSITS — {result['date']}")
        print(f"{'='*60}")

        print(f"\nCurrent Positions:")
        for planet, data in result["current_transits"].items():
            print(f"  {planet:<10} {data['sign']:<12} {data['degree']:.1f}°")

        print(f"\nFamily Themes:")
        for theme in result["family_themes"]:
            print(f"  - {theme}")

        print(f"\nMember Analyses:")
        for name, analysis in result["member_analyses"].items():
            print(f"  {name}: {analysis['significant_count']} significant transits")


def cmd_dasha():
    """Show dasha analysis."""
    if len(sys.argv) < 3:
        print("Usage: dasha <name>")
        return

    name = sys.argv[2]
    from .engine import calculate_family_charts
    from .dasha import calculate_dasha_sequence, get_current_dasha

    charts = calculate_family_charts()
    if name not in charts:
        print(f"Unknown member: {name}")
        return

    chart = charts[name]
    moon = chart["planets"].get("Moon", {})
    if "error" in moon:
        print("Cannot calculate dasha — Moon position unknown")
        return

    moon_nak = moon.get("nakshatra", "Rohini")
    moon_deg = moon.get("degree", 0)

    birth = chart["birth"]
    birth_date = datetime(birth["year"], birth["month"], birth["day"], birth["hour"], birth["minute"])

    print(f"\n{'='*60}")
    print(f"  DASHA: {name}")
    print(f"{'='*60}")
    print(f"\nMoon Nakshatra: {moon_nak} ({moon_deg:.1f}°)")

    dashas = calculate_dasha_sequence(moon_nak, moon_deg, birth_date)
    print(f"\n{'Lord':<10} {'Years':<8} {'Start':<12} {'End':<12}")
    print("-" * 42)
    for dasha in dashas:
        print(f"{dasha['lord']:<10} {dasha['years']:<8} {dasha['start']:<12} {dasha['end']:<12}")

    current = get_current_dasha(birth_date, moon_nak, moon_deg)
    print(f"\nCurrent (Today):")
    if current["maha_dasha"]:
        print(f"  Maha Dasha: {current['maha_dasha']['lord']}")
    if current["bhukti"]:
        print(f"  Bhukti: {current['bhukti']['lord']}")


def cmd_research():
    """Run family pattern research."""
    from .engine import calculate_family_charts
    from .research_copilot import generate_family_report

    charts = calculate_family_charts()
    report = generate_family_report(charts)

    print(f"\n{'='*60}")
    print(f"  FAMILY RESEARCH REPORT")
    print(f"{'='*60}")
    print(f"\nGenerated: {report['generated_at']}")

    karma = report["karma_summary"]
    print(f"\nKarma Summary:")
    print(f"  Rahu-Ketu axes: {karma['rahu_ketu_axes']}")
    print(f"  Shared nakshatras: {karma['shared_nakshatras']}")
    print(f"  Dominant element: {karma['elemental_dominant']}")

    print(f"\nInvestigation Questions ({len(report['investigation_questions'])}):")
    for q in report["investigation_questions"][:5]:
        print(f"  [{q['category']}] {q['question']}")

    print(f"\nRecommendations:")
    for r in report["recommendations"]:
        print(f"  - {r}")


def cmd_report():
    """Generate comprehensive report."""
    if len(sys.argv) < 3:
        print("Usage: report <name> | report family")
        return

    target = sys.argv[2]
    from .engine import calculate_family_charts

    charts = calculate_family_charts()

    if target == "family":
        from .report import generate_family_summary
        summary = generate_family_summary(charts)
        print(summary)
    elif target in charts:
        from .report import generate_member_report
        from .transits import get_current_transits, analyze_transits_for_member
        from .dasha import calculate_dasha_sequence, get_current_dasha

        chart = charts[target]
        transits = get_current_transits()
        transit_analysis = analyze_transits_for_member(chart, transits)

        moon = chart["planets"].get("Moon", {})
        dasha_info = None
        if "error" not in moon:
            birth = chart["birth"]
            birth_date = datetime(birth["year"], birth["month"], birth["day"], birth["hour"], birth["minute"])
            dasha_info = get_current_dasha(birth_date, moon.get("nakshatra", "Rohini"), moon.get("degree", 0))

        report = generate_member_report(chart, transit_analysis, dasha_info)
        print(report)
    else:
        print(f"Unknown target: {target}")


if __name__ == "__main__":
    main()
