#!/usr/bin/env python3
"""
Complete Family Chart — Using VERIFIED Positions from Master Calculations
Uses the actual confirmed planetary positions from MASTER_FAMILY_CALCULATIONS.md
and calculates Placidus house cusps for accurate house placements.
"""

import sys
import os
sys.path.insert(0, r"C:\Users\Admin\AstrologyWorkspace")

from family_astrology.houses import (
    calculate_houses_placidus, get_house_for_planet, get_sign_from_degree, HOUSE_MEANINGS
)

# El Bayadh coordinates
LAT = 34.07
LON = 1.33


def format_degree(deg):
    """Format decimal degrees to D M'"""
    d = int(deg)
    m = int((deg - d) * 60)
    return f"{d}deg {m:02d}'"


# ============================================================
# VERIFIED PLANETARY POSITIONS FROM MASTER_FAMILY_CALCULATIONS.md
# Source: External astrology software (astro-seek.com)
# Ayanamsa: Lahiri
# ============================================================

FAMILY_CHARTS = {
    "KAMEL": {
        "birth": {"year": 1996, "month": 3, "day": 6, "hour": 14, "minute": 0},
        "time_accuracy": "ACCURATE - Exact time from family",
        "ascendant_sign": "Gemini",
        "ascendant_degree": 21.52,
        "planets": {
            "Sun":     {"sign": "Aquarius", "degree": 22.43, "sidereal": 322.43, "nakshatra": "Purva Bhadra", "pada": 1},
            "Moon":    {"sign": "Scorpio",  "degree": 5.83,  "sidereal": 215.83, "nakshatra": "Anuradha",    "pada": 2},
            "Mercury": {"sign": "Aquarius", "degree": 4.65,  "sidereal": 304.65, "nakshatra": "Dhanishta",   "pada": 4},
            "Venus":   {"sign": "Capricorn","degree": 6.68,  "sidereal": 276.68, "nakshatra": "U.Ashadha",   "pada": 4},
            "Mars":    {"sign": "Aries",    "degree": 18.55, "sidereal": 18.55,  "nakshatra": "Bharani",     "pada": 3},
            "Jupiter": {"sign": "Sagittarius","degree": 18.83,"sidereal": 258.83,"nakshatra": "P.Ashadha",   "pada": 2},
            "Saturn":  {"sign": "Aquarius", "degree": 2.27,  "sidereal": 302.27, "nakshatra": "Dhanishta",   "pada": 4},
            "Rahu":    {"sign": "Virgo",    "degree": 25.25, "sidereal": 145.25, "nakshatra": "Chitra",      "pada": 1},
            "Ketu":    {"sign": "Pisces",   "degree": 25.25, "sidereal": 325.25, "nakshatra": "Revati",      "pada": 3},
        }
    },
    "KHEIREDDINE": {
        "birth": {"year": 1992, "month": 10, "day": 4, "hour": 18, "minute": 0},
        "time_accuracy": "ACCURATE - Family records",
        "ascendant_sign": "Virgo",
        "ascendant_degree": 28.57,
        "planets": {
            "Sun":     {"sign": "Libra",    "degree": 17.32, "sidereal": 197.32, "nakshatra": "Swati",        "pada": 3},
            "Moon":    {"sign": "Virgo",    "degree": 21.87, "sidereal": 151.87, "nakshatra": "Hasta",        "pada": 2},
            "Mercury": {"sign": "Leo",      "degree": 1.00,  "sidereal": 121.00, "nakshatra": "Magha",        "pada": 1},
            "Venus":   {"sign": "Cancer",   "degree": 17.12, "sidereal": 107.12, "nakshatra": "Ashlesha",     "pada": 3},
            "Mars":    {"sign": "Cancer",   "degree": 17.85, "sidereal": 107.85, "nakshatra": "Ashlesha",     "pada": 4},
            "Jupiter": {"sign": "Libra",    "degree": 4.90,  "sidereal": 184.90, "nakshatra": "Swati",        "pada": 1},
            "Saturn":  {"sign": "Sagittarius","degree": 18.23,"sidereal": 258.23,"nakshatra": "P.Ashadha",    "pada": 2},
            "Rahu":    {"sign": "Capricorn","degree": 1.43,  "sidereal": 271.43, "nakshatra": "U.Ashadha",    "pada": 4},
            "Ketu":    {"sign": "Cancer",   "degree": 1.43,  "sidereal": 91.43,  "nakshatra": "Punarvasu",    "pada": 4},
        }
    },
    "IKRAM": {
        "birth": {"year": 1998, "month": 9, "day": 8, "hour": 8, "minute": 0},
        "time_accuracy": "ACCURATE - Family records",
        "ascendant_sign": "Virgo",
        "ascendant_degree": 28.0,
        "planets": {
            "Sun":     {"sign": "Leo",      "degree": 21.37, "sidereal": 141.37, "nakshatra": "P.Phalguni",   "pada": 2},
            "Moon":    {"sign": "Virgo",    "degree": 15.67, "sidereal": 145.67, "nakshatra": "Hasta",        "pada": 2},
            "Mercury": {"sign": "Leo",      "degree": 6.07,  "sidereal": 126.07, "nakshatra": "Magha",        "pada": 2},
            "Venus":   {"sign": "Virgo",    "degree": 6.78,  "sidereal": 136.78, "nakshatra": "U.Phalguni",   "pada": 4},
            "Mars":    {"sign": "Cancer",   "degree": 22.52, "sidereal": 112.52, "nakshatra": "Ashlesha",     "pada": 4},
            "Jupiter": {"sign": "Virgo",    "degree": 18.47, "sidereal": 148.47, "nakshatra": "Hasta",        "pada": 3},
            "Saturn":  {"sign": "Pisces",   "degree": 6.65,  "sidereal": 336.65, "nakshatra": "U.Bhadra",     "pada": 2},
            "Rahu":    {"sign": "Aquarius", "degree": 18.88, "sidereal": 298.88, "nakshatra": "P.Bhadra",     "pada": 3},
            "Ketu":    {"sign": "Leo",      "degree": 18.88, "sidereal": 138.88, "nakshatra": "Magha",        "pada": 3},
        }
    },
    "GHOFRAN": {
        "birth": {"year": 2024, "month": 9, "day": 27, "hour": 5, "minute": 0},
        "time_accuracy": "APPROXIMATE - Dawn estimate, needs hospital records",
        "ascendant_sign": "Virgo",
        "ascendant_degree": 23.0,
        "planets": {
            "Sun":     {"sign": "Virgo",    "degree": 10.20, "sidereal": 140.20, "nakshatra": "Hasta",        "pada": 1},
            "Moon":    {"sign": "Libra",    "degree": 10.45, "sidereal": 190.45, "nakshatra": "Swati",        "pada": 1},
            "Mercury": {"sign": "Leo",      "degree": 7.03,  "sidereal": 127.03, "nakshatra": "Magha",        "pada": 2},
            "Venus":   {"sign": "Cancer",   "degree": 10.57, "sidereal": 100.57, "nakshatra": "Pushya",       "pada": 2},
            "Mars":    {"sign": "Gemini",   "degree": 18.55, "sidereal": 78.55,  "nakshatra": "Ardra",        "pada": 3},
            "Jupiter": {"sign": "Taurus",   "degree": 26.92, "sidereal": 56.92,  "nakshatra": "Mrigashira",   "pada": 4},
            "Saturn":  {"sign": "Aquarius", "degree": 20.45, "sidereal": 290.45, "nakshatra": "P.Bhadra",     "pada": 3},
            "Rahu":    {"sign": "Aquarius", "degree": 7.20,  "sidereal": 277.20, "nakshatra": "Dhanishta",    "pada": 1},
            "Ketu":    {"sign": "Leo",      "degree": 7.20,  "sidereal": 127.20, "nakshatra": "Magha",        "pada": 2},
        }
    },
    "ZOHRA": {
        "birth": {"year": 1972, "month": 12, "day": 1, "hour": 12, "minute": 0},
        "time_accuracy": "NOON DEFAULT - Needs rectification",
        "ascendant_sign": "Pisces",
        "ascendant_degree": 15.0,
        "planets": {
            "Sun":     {"sign": "Scorpio",  "degree": 14.82, "sidereal": 224.82, "nakshatra": "Anuradha",     "pada": 3},
            "Moon":    {"sign": "Scorpio",  "degree": 22.07, "sidereal": 232.07, "nakshatra": "Jyeshta",      "pada": 2},
            "Mercury": {"sign": "Libra",    "degree": 4.35,  "sidereal": 184.35, "nakshatra": "Swati",        "pada": 1},
            "Venus":   {"sign": "Sagittarius","degree": 13.87,"sidereal": 253.87,"nakshatra": "U.Ashadha",    "pada": 2},
            "Mars":    {"sign": "Sagittarius","degree": 15.90,"sidereal": 255.90,"nakshatra": "U.Ashadha",    "pada": 3},
            "Jupiter": {"sign": "Sagittarius","degree": 16.77,"sidereal": 256.77,"nakshatra": "U.Ashadha",    "pada": 3},
            "Saturn":  {"sign": "Taurus",   "degree": 23.68, "sidereal": 53.68,  "nakshatra": "Rohini",       "pada": 3},
            "Rahu":    {"sign": "Leo",      "degree": 5.93,  "sidereal": 125.93, "nakshatra": "Magha",        "pada": 1},
            "Ketu":    {"sign": "Aquarius", "degree": 5.93,  "sidereal": 275.93, "nakshatra": "Dhanishta",    "pada": 4},
        }
    },
    "FATHER": {
        "birth": {"year": 1961, "month": 3, "day": 31, "hour": 12, "minute": 0},
        "time_accuracy": "RECTIFIED DATE - Year confirmed, time estimated (noon)",
        "ascendant_sign": "Pisces",
        "ascendant_degree": 15.0,
        "planets": {
            "Sun":     {"sign": "Pisces",   "degree": 17.63, "sidereal": 337.63, "nakshatra": "P.Bhadra",     "pada": 4},
            "Moon":    {"sign": "Taurus",   "degree": 21.62, "sidereal": 51.62,  "nakshatra": "Rohini",       "pada": 1},
            "Mercury": {"sign": "Pisces",   "degree": 28.62, "sidereal": 348.62, "nakshatra": "Revati",       "pada": 3},
            "Venus":   {"sign": "Aries",    "degree": 21.62, "sidereal": 21.62,  "nakshatra": "Bharani",      "pada": 3},
            "Mars":    {"sign": "Taurus",   "degree": 28.62, "sidereal": 58.62,  "nakshatra": "Krittika",     "pada": 3},
            "Jupiter": {"sign": "Pisces",   "degree": 14.62, "sidereal": 334.62, "nakshatra": "P.Bhadra",     "pada": 1},
            "Saturn":  {"sign": "Gemini",   "degree": 1.62,  "sidereal": 61.62,  "nakshatra": "Mrigashira",   "pada": 1},
            "Rahu":    {"sign": "Leo",      "degree": 24.62, "sidereal": 144.62, "nakshatra": "P.Phalguni",   "pada": 2},
            "Ketu":    {"sign": "Aquarius", "degree": 24.62, "sidereal": 294.62, "nakshatra": "P.Bhadra",     "pada": 4},
        }
    },
    "OUMKELTOUM": {
        "birth": {"year": 1994, "month": 8, "day": 4, "hour": 12, "minute": 0},
        "time_accuracy": "NOON DEFAULT - Needs rectification",
        "ascendant_sign": "Libra",
        "ascendant_degree": 15.0,
        "planets": {
            "Sun":     {"sign": "Pisces",   "degree": 21.30, "sidereal": 331.30, "nakshatra": "Revati",       "pada": 3},
            "Moon":    {"sign": "Virgo",    "degree": 29.35, "sidereal": 149.35, "nakshatra": "Chitra",       "pada": 4},
            "Mercury": {"sign": "Leo",      "degree": 15.75, "sidereal": 135.75, "nakshatra": "P.Phalguni",   "pada": 2},
            "Venus":   {"sign": "Cancer",   "degree": 6.47,  "sidereal": 96.47,  "nakshatra": "Pushya",       "pada": 1},
            "Mars":    {"sign": "Cancer",   "degree": 0.23,  "sidereal": 90.23,  "nakshatra": "Punarvasu",    "pada": 4},
            "Jupiter": {"sign": "Cancer",   "degree": 12.78, "sidereal": 102.78, "nakshatra": "Ashlesha",     "pada": 4},
            "Saturn":  {"sign": "Capricorn","degree": 16.85, "sidereal": 276.85, "nakshatra": "Shravana",     "pada": 3},
            "Rahu":    {"sign": "Gemini",   "degree": 29.57, "sidereal": 79.57,  "nakshatra": "Punarvasu",    "pada": 4},
            "Ketu":    {"sign": "Sagittarius","degree": 29.57,"sidereal": 259.57,"nakshatra": "U.Ashadha",    "pada": 3},
        }
    },
    "SARA": {
        "birth": {"year": 2004, "month": 5, "day": 24, "hour": 6, "minute": 30},
        "time_accuracy": "ACCURATE - Exact time from family",
        "ascendant_sign": "Taurus",
        "ascendant_degree": 15.0,
        "planets": {
            "Sun":     {"sign": "Taurus",   "degree": 9.17,  "sidereal": 39.17,  "nakshatra": "Krittika",     "pada": 1},
            "Moon":    {"sign": "Aquarius", "degree": 16.53, "sidereal": 286.53, "nakshatra": "Shatabhisha",  "pada": 3},
            "Mercury": {"sign": "Aries",    "degree": 15.40, "sidereal": 15.40,  "nakshatra": "Bharani",      "pada": 2},
            "Venus":   {"sign": "Gemini",   "degree": 1.45,  "sidereal": 61.45,  "nakshatra": "Mrigashira",   "pada": 4},
            "Mars":    {"sign": "Virgo",    "degree": 16.53, "sidereal": 146.53, "nakshatra": "Hasta",        "pada": 2},
            "Jupiter": {"sign": "Gemini",   "degree": 15.45, "sidereal": 75.45,  "nakshatra": "Ardra",        "pada": 3},
            "Saturn":  {"sign": "Taurus",   "degree": 17.18, "sidereal": 47.18,  "nakshatra": "Rohini",       "pada": 3},
            "Rahu":    {"sign": "Gemini",   "degree": 12.68, "sidereal": 72.68,  "nakshatra": "Ardra",        "pada": 2},
            "Ketu":    {"sign": "Sagittarius","degree": 12.68,"sidereal": 252.68,"nakshatra": "Mula",         "pada": 5},
        }
    },
}


def sidereal_to_abs(sign, degree):
    """Convert sign + degree to absolute sidereal degree."""
    signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
             "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    idx = signs.index(sign)
    return idx * 30 + degree


def print_member_chart(name, data):
    """Print complete chart for one member."""
    birth = data["birth"]
    
    print(f"\n{'='*70}")
    print(f"  {name} — COMPLETE HOUSE & PLANET ANALYSIS")
    print(f"{'='*70}")
    print(f"  Birth: {birth['year']}-{birth['month']:02d}-{birth['day']:02d} {birth['hour']:02d}:{birth['minute']:02d}")
    print(f"  Time Accuracy: {data['time_accuracy']}")

    # Calculate house cusps
    houses = calculate_houses_placidus(
        birth["year"], birth["month"], birth["day"],
        birth["hour"], birth["minute"], LAT, LON
    )
    
    asc_sign, asc_deg = get_sign_from_degree(houses["asc"])
    mc_sign, mc_deg = get_sign_from_degree(houses["mc"])
    print(f"\n  ASC: {asc_sign} {format_degree(asc_deg)}")
    print(f"  MC:  {mc_sign} {format_degree(mc_deg)}")
    print(f"  Ayanamsa: {houses['ayanamsa']:.4f}deg")

    # House Cusps
    print(f"\n  {'House':<8} {'Sign':<14} {'Cusp':<12} {'Theme'}")
    print(f"  {'-'*65}")
    for house_num in range(1, 13):
        cusp_deg = houses["cusps"][house_num]
        sign, deg = get_sign_from_degree(cusp_deg)
        meaning = HOUSE_MEANINGS[house_num]
        marker = ""
        if house_num == 1:
            marker = " <-- ASC"
        elif house_num == 10:
            marker = " <-- MC"
        print(f"  {house_num:<8} {sign:<14} {format_degree(deg):<12} {meaning['name']}{marker}")

    # Planets in Houses
    print(f"\n  {'Planet':<10} {'Sign':<14} {'Degree':<10} {'Nakshatra':<18} {'Pada':<5}")
    print(f"  {'-'*65}")
    for planet_name in ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"]:
        if planet_name in data["planets"]:
            info = data["planets"][planet_name]
            print(f"  {planet_name:<10} {info['sign']:<14} {format_degree(info['degree']):<10} {info['nakshatra']:<18} {info['pada']:<5}")

    # Map planets to houses
    print(f"\n  PLANET -> HOUSE PLACEMENT:")
    print(f"  {'-'*65}")
    planet_houses = {}
    for planet_name, planet_info in data["planets"].items():
        abs_deg = sidereal_to_abs(planet_info["sign"], planet_info["degree"])
        house_num = get_house_for_planet(abs_deg, houses["cusps"])
        planet_houses[planet_name] = house_num
        print(f"  {planet_name:<10} -> House {house_num}")

    # Group by house
    print(f"\n  HOUSE CONTENTS:")
    print(f"  {'-'*65}")
    for house_num in range(1, 13):
        planets_in = [(p, h) for p, h in planet_houses.items() if h == house_num]
        meaning = HOUSE_MEANINGS[house_num]
        if planets_in:
            planet_list = ", ".join([p[0] for p in planets_in])
            print(f"  House {house_num:2d} ({meaning['name']:15}): {planet_list}")
        else:
            print(f"  House {house_num:2d} ({meaning['name']:15}): Empty")

    # Key Yogas
    print(f"\n  KEY HOUSE YOGAS:")
    print(f"  {'-'*65}")
    
    # Stelliums
    for house_num in range(1, 13):
        planets_in = [p for p, h in planet_houses.items() if h == house_num]
        if len(planets_in) >= 3:
            print(f"  STELLIUM in House {house_num}: {', '.join(planets_in)}")

    # Angular planets
    angular = [(p, h) for p, h in planet_houses.items() if h in [1, 4, 7, 10]]
    if angular:
        print(f"  Angular: {', '.join([f'{p} in H{h}' for p, h in angular])}")

    # Empty houses
    empty = [h for h in range(1, 13) if not any(p for p, ph in planet_houses.items() if ph == h)]
    if empty:
        print(f"  Empty: {', '.join([f'H{h}' for h in empty])}")

    return planet_houses


def main():
    print("="*70)
    print("  FAMILY ASTROLOGY — COMPLETE HOUSE & PLANET ANALYSIS")
    print("  Using VERIFIED positions from MASTER_FAMILY_CALCULATIONS.md")
    print("  Placidus House System | Lahiri Ayanamsa | El Bayadh, Algeria")
    print("="*70)

    all_charts = {}
    for name, data in FAMILY_CHARTS.items():
        planet_houses = print_member_chart(name, data)
        all_charts[name] = {"data": data, "houses": planet_houses}

    # Family Summary
    print(f"\n{'='*90}")
    print(f"  FAMILY SUMMARY TABLE")
    print(f"{'='*90}")
    
    print(f"\n  {'Member':<15} {'ASC':<12} {'Sun':<8} {'Moon':<8} {'Mercury':<10} {'Jupiter':<10} {'Saturn':<10}")
    print(f"  {'-'*75}")
    
    for name, chart in all_charts.items():
        houses = chart["houses"]
        print(f"  {name:<15} {chart['data']['ascendant_sign'][:3]:<12} "
              f"H{houses.get('Sun', '?'):<7} "
              f"H{houses.get('Moon', '?'):<7} "
              f"H{houses.get('Mercury', '?'):<9} "
              f"H{houses.get('Jupiter', '?'):<9} "
              f"H{houses.get('Saturn', '?'):<9}")

    print(f"\n  ACCURACY NOTES:")
    print(f"  {'-'*70}")
    for name, chart in all_charts.items():
        print(f"  {name}: {chart['data']['time_accuracy']}")

    print(f"\n  WHO NEEDS RECTIFICATION:")
    print(f"  {'-'*70}")
    for name, chart in all_charts.items():
        if "DEFAULT" in chart['data']['time_accuracy'] or "APPROXIMATE" in chart['data']['time_accuracy']:
            print(f"  {name}: {chart['data']['time_accuracy']}")

    print(f"\n  KRS ALIGNMENT GUIDE:")
    print(f"  {'-'*70}")
    print(f"  Watch KRS videos based on your ASC sign and planet houses:")
    for name, chart in all_charts.items():
        houses = chart["houses"]
        asc = chart["data"]["ascendant_sign"]
        print(f"\n  {name} (ASC {asc}):")
        print(f"    - Watch: KRS '{asc} Rising' playlist")
        if houses.get("Sun") in [9, 10]:
            print(f"    - Watch: KRS 'Sun in House {houses['Sun']}' (career/teaching identity)")
        if houses.get("Moon") in [4, 7, 10]:
            print(f"    - Watch: KRS 'Moon in House {houses['Moon']}' (emotional foundation)")
        if houses.get("Jupiter") in [1, 4, 7, 10]:
            print(f"    - Watch: KRS 'Jupiter in House {houses['Jupiter']}' (wisdom placement)")


if __name__ == "__main__":
    main()
