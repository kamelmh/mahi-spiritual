"""
Transit Tracking System
=======================
Tracks current planetary transits against natal charts.
Provides daily, weekly, and monthly transit predictions for each family member.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from .engine import calculate_planetary_positions, get_sign, get_nakshatra, get_sign_lord


# Transit themes for each planet in each sign
TRANSIT_THEMES = {
    "Saturn": {
        "themes": {
            "Aries": "Discipline in action, patience with new beginnings",
            "Taurus": "Restriction of resources, patience with values",
            "Gemini": "Communication challenges, structured thinking",
            "Cancer": "Emotional restriction, family responsibility",
            "Leo": "Authority challenges, creative discipline",
            "Virgo": "Health focus, service-oriented discipline",
            "Libra": "Relationship restructuring, balance through effort",
            "Scorpio": "Deep transformation, crisis and renewal",
            "Sagittarius": "Philosophical testing, belief restructuring",
            "Capricorn": "Strong position, structural authority",
            "Aquarius": "Innovation through discipline, community service",
            "Pisces": "Spiritual testing, dissolution of ego",
        }
    },
    "Jupiter": {
        "themes": {
            "Aries": "Expansion through independence, new ventures",
            "Taurus": "Growth in resources, material abundance",
            "Gemini": "Communication expansion, learning opportunities",
            "Cancer": "EXALTED — Greatest expansion through nurturing",
            "Leo": "Creative expansion, leadership opportunities",
            "Virgo": "DEBILITATED — Expansion through service and detail",
            "Libra": "Relationship expansion, balance and harmony",
            "Scorpio": "Deep transformation, shared resources growth",
            "Sagittarius": "OWN SIGN — Strong expansion through wisdom",
            "Capricorn": "DEBILITATED — Expansion through structure and responsibility",
            "Aquarius": "Innovation expansion, community growth",
            "Pisces": "OWN SIGN — Strong expansion through spirituality",
        }
    },
    "Rahu": {
        "themes": {
            "Aries": "Obsession with action and independence",
            "Taurus": "Obsession with resources and stability",
            "Gemini": "Obsession with communication and variety",
            "Cancer": "Obsession with home and emotions",
            "Leo": "Obsession with creativity and authority",
            "Virgo": "Obsession with perfection and service",
            "Libra": "Obsession with relationships and balance",
            "Scorpio": "Obsession with transformation and depth",
            "Sagittarius": "Obsession with philosophy and expansion",
            "Capricorn": "Obsession with structure and ambition",
            "Aquarius": "Obsession with innovation and freedom",
            "Pisces": "Obsession with spirituality and dissolution",
        }
    }
}


def get_current_transits(date: datetime = None) -> Dict:
    """
    Get current planetary positions for transit analysis.
    """
    if date is None:
        date = datetime.now()

    positions = calculate_planetary_positions(
        date.year, date.month, date.day, date.hour, date.minute
    )
    return positions


def analyze_transits_for_member(member_chart: Dict, transit_positions: Dict) -> Dict:
    """
    Analyze how current transits affect a specific family member.
    """
    member_name = member_chart["name"]
    natal_planets = member_chart.get("planets", {})

    transits = []
    significant_transits = []

    for transit_planet, transit_data in transit_positions.items():
        if "error" in transit_data or transit_planet in ["Uranus", "Neptune", "Pluto"]:
            continue

        transit_sign = transit_data["sign"]
        transit_degree = transit_data["degree"]
        transit_nakshatra = transit_data.get("nakshatra", "Unknown")

        # Check aspects to natal planets
        for natal_planet, natal_data in natal_planets.items():
            if "error" in natal_data or natal_planet in ["Uranus", "Neptune", "Pluto"]:
                continue

            diff = abs(transit_data["sidereal"] - natal_data["sidereal"])
            if diff > 180:
                diff = 360 - diff

            aspect_types = [
                {"name": "conjunction", "angle": 0, "orb": 5, "intensity": "strong"},
                {"name": "opposition", "angle": 180, "orb": 5, "intensity": "strong"},
                {"name": "trine", "angle": 120, "orb": 5, "intensity": "mild"},
                {"name": "square", "angle": 90, "orb": 5, "intensity": "moderate"},
            ]

            for asp in aspect_types:
                if abs(diff - asp["angle"]) <= asp["orb"]:
                    transit_info = {
                        "transit_planet": transit_planet,
                        "transit_sign": transit_sign,
                        "natal_planet": natal_planet,
                        "natal_sign": natal_data["sign"],
                        "aspect": asp["name"],
                        "intensity": asp["intensity"],
                        "degrees_orb": round(abs(diff - asp["angle"]), 1),
                    }
                    transits.append(transit_info)

                    if asp["intensity"] in ["strong", "moderate"]:
                        significant_transits.append(transit_info)

    # Generate predictions
    predictions = generate_transit_predictions(significant_transits, transit_positions, natal_planets)

    return {
        "member": member_name,
        "transit_count": len(transits),
        "significant_count": len(significant_transits),
        "significant_transits": significant_transits,
        "predictions": predictions,
    }


def generate_transit_predictions(significant_transits: List[Dict], transit_positions: Dict, natal_planets: Dict) -> List[Dict]:
    """Generate natural language predictions from transits."""
    predictions = []

    for transit in significant_transits:
        planet = transit["transit_planet"]
        aspect = transit["aspect"]
        natal = transit["natal_planet"]

        prediction = {
            "planet": planet,
            "aspect": aspect,
            "natal_planet": natal,
        }

        # Saturn transits
        if planet == "Saturn":
            if aspect == "conjunction":
                prediction["theme"] = "Saturn Return or Saturn transit — major life restructuring"
                prediction["advice"] = "Accept responsibility, build structures, be patient"
            elif aspect == "opposition":
                prediction["theme"] = "Saturn opposition — testing of relationships and partnerships"
                prediction["advice"] = "Review partnerships, accept limits, build maturity"
            elif aspect == "square":
                prediction["theme"] = "Saturn square — obstacles and growth through challenge"
                prediction["advice"] = "Work through obstacles, build discipline, avoid shortcuts"
            elif aspect == "trine":
                prediction["theme"] = "Saturn trine — steady progress, earned rewards"
                prediction["advice"] = "Capitalize on stability, build on foundations"

        # Jupiter transits
        elif planet == "Jupiter":
            if aspect == "conjunction":
                prediction["theme"] = "Jupiter transit — expansion and growth"
                prediction["advice"] = "Embrace opportunities, expand horizons, be generous"
            elif aspect == "opposition":
                prediction["theme"] = "Jupiter opposition — awareness of excess"
                prediction["advice"] = "Balance expansion with responsibility"
            elif aspect == "trine":
                prediction["theme"] = "Jupiter trine — natural luck and flow"
                prediction["advice"] = "Follow opportunities, trust intuition"

        # Rahu transits
        elif planet == "Rahu":
            if aspect == "conjunction":
                prediction["theme"] = "Rahu transit — karmic lesson, obsession"
                prediction["advice"] = "Face fears, embrace growth, avoid obsession"

        # Mars transits
        elif planet == "Mars":
            if aspect == "conjunction":
                prediction["theme"] = "Mars transit — energy surge, action needed"
                prediction["advice"] = "Direct energy positively, avoid conflict"
            elif aspect == "square":
                prediction["theme"] = "Mars square — frustration, need for patience"
                prediction["advice"] = "Channel energy carefully, avoid impulsive action"

        # Sun transits
        elif planet == "Sun":
            if aspect == "conjunction":
                prediction["theme"] = "Solar return — personal new year, identity focus"
                prediction["advice"] = "Focus on self-expression, vitality"

        # Moon transits (quick, less significant)
        elif planet == "Moon":
            if aspect == "conjunction":
                prediction["theme"] = "Monthly lunar return — emotional refresh"
                prediction["advice"] = "Check in with emotions, set monthly intentions"

        if "theme" in prediction:
            predictions.append(prediction)

    return predictions


def get_weekly_transit_forecast(charts: Dict, target_date: datetime = None) -> Dict:
    """
    Get weekly transit forecast for all family members.
    """
    if target_date is None:
        target_date = datetime.now()

    # Get transits for each day of the week
    forecasts = {}
    for name, chart in charts.items():
        daily_forecasts = []
        for day_offset in range(7):
            day = target_date + timedelta(days=day_offset)
            day_transits = get_current_transits(day)
            analysis = analyze_transits_for_member(chart, day_transits)
            daily_forecasts.append({
                "date": day.strftime("%Y-%m-%d"),
                "weekday": day.strftime("%A"),
                "significant_transits": analysis["significant_count"],
                "predictions": analysis["predictions"],
            })

        forecasts[name] = {
            "member": name,
            "daily_forecasts": daily_forecasts,
            "weekly_highlights": summarize_weekly_forecasts(daily_forecasts),
        }

    return forecasts


def summarize_weekly_forecasts(daily_forecasts: List[Dict]) -> List[str]:
    """Summarize weekly forecasts into key themes."""
    highlights = []
    all_predictions = []

    for day in daily_forecasts:
        all_predictions.extend(day["predictions"])

    # Count planet frequencies
    planet_count = {}
    for pred in all_predictions:
        planet = pred.get("planet", "Unknown")
        planet_count[planet] = planet_count.get(planet, 0) + 1

    for planet, count in sorted(planet_count.items(), key=lambda x: -x[1]):
        if count >= 3:
            highlights.append(f"{planet} active ({count} aspects this week)")

    return highlights


def analyze_family_transits(charts: Dict) -> Dict:
    """
    Analyze transits for all family members and find family-wide themes.
    """
    current_transits = get_current_transits()
    member_analyses = {}

    for name, chart in charts.items():
        member_analyses[name] = analyze_transits_for_member(chart, current_transits)

    # Find family-wide transit themes
    family_themes = []
    transit_planets = set()
    for analysis in member_analyses.values():
        for transit in analysis.get("significant_transits", []):
            transit_planets.add(transit["transit_planet"])

    # Generate family themes
    if "Saturn" in transit_planets:
        family_themes.append("Saturn is transiting — family-wide themes of responsibility and structure")
    if "Jupiter" in transit_planets:
        family_themes.append("Jupiter is transiting — family-wide themes of expansion and growth")
    if "Rahu" in transit_planets:
        family_themes.append("Rahu is transiting — family-wide themes of karmic lessons and obsession")

    return {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "current_transits": {k: v for k, v in current_transits.items() if "error" not in v},
        "member_analyses": member_analyses,
        "family_themes": family_themes,
    }


if __name__ == "__main__":
    from .engine import calculate_family_charts

    charts = calculate_family_charts()
    print("FAMILY TRANSIT ANALYSIS")
    print("=" * 60)

    result = analyze_family_transits(charts)

    print(f"\nDate: {result['date']}")
    print(f"\nCurrent Transits:")
    for planet, data in result["current_transits"].items():
        print(f"  {planet:10} {data['sign']:12} {data['degree']:.1f}° {data.get('nakshatra', '')}")

    print(f"\nFamily Themes:")
    for theme in result["family_themes"]:
        print(f"  - {theme}")

    print(f"\nMember Analyses:")
    for name, analysis in result["member_analyses"].items():
        print(f"  {name}: {analysis['significant_count']} significant transits")
        for pred in analysis.get("predictions", [])[:2]:
            print(f"    {pred.get('planet', '?')} {pred.get('aspect', '?')} {pred.get('natal_planet', '?')}: {pred.get('theme', '')}")