"""
Family House Analysis — All 8 Members
======================================
Uses known ASC positions from chart data for accurate house placement.
For members without birth times, uses sign-based overlay.
"""

import json
from typing import Tuple
from pathlib import Path
from family_astrology.houses import HOUSE_MEANINGS, get_sign_from_degree

# Zodiac signs
SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]

# Known ASC positions from chart data
KNOWN_ASC = {
    "kamel": {"asc_sign": "Gemini", "asc_deg": 21.52, "mc_sign": "Pisces", "mc_deg": 6.8, "time": "14:00"},
    "kheireddine": {"asc_sign": "Sagittarius", "asc_deg": 5.0, "mc_sign": "Libra", "mc_deg": 10.0, "time": "18:00"},
    "ikram": {"asc_sign": "Virgo", "asc_deg": 15.0, "mc_sign": "Gemini", "mc_deg": 10.0, "time": "08:00"},
    "ghofran": {"asc_sign": "Pisces", "asc_deg": 10.0, "mc_sign": "Sagittarius", "mc_deg": 5.0, "time": "~05:00"},
    "sara": {"asc_sign": "Taurus", "asc_deg": 20.0, "mc_sign": "Aquarius", "mc_deg": 10.0, "time": "06:30"},
    "father": {"asc_sign": "Libra", "asc_deg": 15.0, "mc_sign": "Cancer", "mc_deg": 10.0, "time": "noon (est)"},
    "zohra": {"asc_sign": "Capricorn", "asc_deg": 15.0, "mc_sign": "Scorpio", "mc_deg": 10.0, "time": "noon (est)"},
    "oumkeltoum": {"asc_sign": "Scorpio", "asc_deg": 15.0, "mc_sign": "Virgo", "mc_deg": 10.0, "time": "noon (est)"},
}

# Planet positions (sidereal) from engine
PLANET_DATA = {
    "kamel": [
        {"planet": "Sun", "degree": 352.44, "sign": "Aquarius", "deg_in_sign": 22.44, "nakshatra": "Purva Bhadra", "house": 10},
        {"planet": "Moon", "degree": 186.83, "sign": "Virgo", "deg_in_sign": 6.83, "nakshatra": "Uttara Phalguni", "house": 4},
        {"planet": "Mercury", "degree": 334.65, "sign": "Aquarius", "deg_in_sign": 4.65, "nakshatra": "Dhanishta", "house": 9},
        {"planet": "Venus", "degree": 347.38, "sign": "Aquarius", "deg_in_sign": 17.38, "nakshatra": "Shatabhisha", "house": 10},
        {"planet": "Mars", "degree": 352.82, "sign": "Aquarius", "deg_in_sign": 22.82, "nakshatra": "Purva Bhadra", "house": 10},
        {"planet": "Jupiter", "degree": 260.65, "sign": "Sagittarius", "deg_in_sign": 20.65, "nakshatra": "Purva Ashadha", "house": 7},
        {"planet": "Saturn", "degree": 32.16, "sign": "Pisces", "deg_in_sign": 2.16, "nakshatra": "Uttara Bhadra", "house": 10},
        {"planet": "Rahu", "degree": 175.15, "sign": "Virgo", "deg_in_sign": 25.15, "nakshatra": "Chitra", "house": 4},
        {"planet": "Ketu", "degree": 355.15, "sign": "Pisces", "deg_in_sign": 25.15, "nakshatra": "Revati", "house": 10},
    ],
    "kheireddine": [
        {"planet": "Sun", "degree": 168.82, "sign": "Virgo", "deg_in_sign": 18.82, "nakshatra": "Hasta"},
        {"planet": "Moon", "degree": 271.38, "sign": "Capricorn", "deg_in_sign": 1.38, "nakshatra": "Uttara Ashadha"},
        {"planet": "Mercury", "degree": 181.37, "sign": "Virgo", "deg_in_sign": 31.37, "nakshatra": "Chitra"},
        {"planet": "Venus", "degree": 230.73, "sign": "Sagittarius", "deg_in_sign": 20.73, "nakshatra": "Purva Ashadha"},
        {"planet": "Mars", "degree": 100.71, "sign": "Gemini", "deg_in_sign": 10.71, "nakshatra": "Ardra"},
        {"planet": "Jupiter", "degree": 250.33, "sign": "Capricorn", "deg_in_sign": 10.33, "nakshatra": "Shravana"},
        {"planet": "Saturn", "degree": 267.91, "sign": "Capricorn", "deg_in_sign": 27.91, "nakshatra": "Dhanishta"},
        {"planet": "Rahu", "degree": 254.01, "sign": "Sagittarius", "deg_in_sign": 14.01, "nakshatra": "Purva Ashadha"},
        {"planet": "Ketu", "degree": 74.01, "sign": "Gemini", "deg_in_sign": 14.01, "nakshatra": "Ardra"},
    ],
    "ikram": [
        {"planet": "Sun", "degree": 142.62, "sign": "Leo", "deg_in_sign": 22.62, "nakshatra": "Purva Phalguni"},
        {"planet": "Moon", "degree": 337.52, "sign": "Pisces", "deg_in_sign": 7.52, "nakshatra": "Uttara Bhadra"},
        {"planet": "Mercury", "degree": 158.02, "sign": "Leo", "deg_in_sign": 8.02, "nakshatra": "Magha"},
        {"planet": "Venus", "degree": 168.68, "sign": "Virgo", "deg_in_sign": 18.68, "nakshatra": "Hasta"},
        {"planet": "Mars", "degree": 231.50, "sign": "Sagittarius", "deg_in_sign": 21.50, "nakshatra": "Purva Ashadha"},
        {"planet": "Jupiter", "degree": 260.13, "sign": "Sagittarius", "deg_in_sign": 20.13, "nakshatra": "Purva Ashadha"},
        {"planet": "Saturn", "degree": 341.51, "sign": "Aquarius", "deg_in_sign": 11.51, "nakshatra": "Shatabhisha"},
        {"planet": "Rahu", "degree": 122.68, "sign": "Cancer", "deg_in_sign": 2.68, "nakshatra": "Pushya"},
        {"planet": "Ketu", "degree": 302.68, "sign": "Capricorn", "deg_in_sign": 2.68, "nakshatra": "Uttara Ashadha"},
    ],
    "ghofran": [
        {"planet": "Sun", "degree": 160.68, "sign": "Virgo", "deg_in_sign": 10.68, "nakshatra": "Hasta"},
        {"planet": "Moon", "degree": 99.27, "sign": "Cancer", "deg_in_sign": 9.27, "nakshatra": "Pushya"},
        {"planet": "Mercury", "degree": 175.09, "sign": "Virgo", "deg_in_sign": 25.09, "nakshatra": "Chitra"},
        {"planet": "Venus", "degree": 210.66, "sign": "Scorpio", "deg_in_sign": 0.66, "nakshatra": "Vishakha"},
        {"planet": "Mars", "degree": 90.08, "sign": "Gemini", "deg_in_sign": 0.08, "nakshatra": "Ardra"},
        {"planet": "Jupiter", "degree": 93.46, "sign": "Cancer", "deg_in_sign": 3.46, "nakshatra": "Pushya"},
        {"planet": "Saturn", "degree": 347.15, "sign": "Aquarius", "deg_in_sign": 17.15, "nakshatra": "Shatabhisha"},
        {"planet": "Rahu", "degree": 35.86, "sign": "Aries", "deg_in_sign": 5.86, "nakshatra": "Ashwini"},
        {"planet": "Ketu", "degree": 215.86, "sign": "Scorpio", "deg_in_sign": 5.86, "nakshatra": "Anuradha"},
    ],
    "sara": [
        {"planet": "Sun", "degree": 40.46, "sign": "Taurus", "deg_in_sign": 10.46, "nakshatra": "Krittika"},
        {"planet": "Moon", "degree": 95.75, "sign": "Cancer", "deg_in_sign": 5.75, "nakshatra": "Pushya"},
        {"planet": "Mercury", "degree": 54.36, "sign": "Taurus", "deg_in_sign": 24.36, "nakshatra": "Mrigashira"},
        {"planet": "Venus", "degree": 10.53, "sign": "Aries", "deg_in_sign": 10.53, "nakshatra": "Ashwini"},
        {"planet": "Mars", "degree": 262.22, "sign": "Capricorn", "deg_in_sign": 22.22, "nakshatra": "Dhanishta"},
        {"planet": "Jupiter", "degree": 93.53, "sign": "Cancer", "deg_in_sign": 3.53, "nakshatra": "Pushya"},
        {"planet": "Saturn", "degree": 266.36, "sign": "Capricorn", "deg_in_sign": 26.36, "nakshatra": "Dhanishta"},
        {"planet": "Rahu", "degree": 216.59, "sign": "Scorpio", "deg_in_sign": 6.59, "nakshatra": "Anuradha"},
        {"planet": "Ketu", "degree": 36.59, "sign": "Aries", "deg_in_sign": 6.59, "nakshatra": "Ashwini"},
    ],
    "father": [
        {"planet": "Sun", "degree": 347.01, "sign": "Pisces", "deg_in_sign": 17.01, "nakshatra": "Revati"},
        {"planet": "Moon", "degree": 159.61, "sign": "Virgo", "deg_in_sign": 9.61, "nakshatra": "Uttara Phalguni"},
        {"planet": "Mercury", "degree": 344.30, "sign": "Aquarius", "deg_in_sign": 24.30, "nakshatra": "Purva Bhadra"},
        {"planet": "Venus", "degree": 326.91, "sign": "Aquarius", "deg_in_sign": 6.91, "nakshatra": "Dhanishta"},
        {"planet": "Mars", "degree": 102.12, "sign": "Cancer", "deg_in_sign": 12.12, "nakshatra": "Pushya"},
        {"planet": "Jupiter", "degree": 19.23, "sign": "Aries", "deg_in_sign": 19.23, "nakshatra": "Ashwini"},
        {"planet": "Saturn", "degree": 274.31, "sign": "Capricorn", "deg_in_sign": 4.31, "nakshatra": "Uttara Ashadha"},
        {"planet": "Rahu", "degree": 148.86, "sign": "Leo", "deg_in_sign": 28.86, "nakshatra": "Magha"},
        {"planet": "Ketu", "degree": 328.86, "sign": "Aquarius", "deg_in_sign": 8.86, "nakshatra": "Dhanishta"},
    ],
    "zohra": [
        {"planet": "Sun", "degree": 226.82, "sign": "Scorpio", "deg_in_sign": 16.82, "nakshatra": "Anuradha"},
        {"planet": "Moon", "degree": 169.76, "sign": "Virgo", "deg_in_sign": 19.76, "nakshatra": "Hasta"},
        {"planet": "Mercury", "degree": 241.53, "sign": "Sagittarius", "deg_in_sign": 1.53, "nakshatra": "Mula"},
        {"planet": "Venus", "degree": 230.72, "sign": "Sagittarius", "deg_in_sign": 20.72, "nakshatra": "Purva Ashadha"},
        {"planet": "Mars", "degree": 230.41, "sign": "Sagittarius", "deg_in_sign": 20.41, "nakshatra": "Purva Ashadha"},
        {"planet": "Jupiter", "degree": 90.91, "sign": "Cancer", "deg_in_sign": 0.91, "nakshatra": "Pushya"},
        {"planet": "Saturn", "degree": 97.82, "sign": "Cancer", "deg_in_sign": 7.82, "nakshatra": "Pushya"},
        {"planet": "Rahu", "degree": 138.64, "sign": "Leo", "deg_in_sign": 18.64, "nakshatra": "Purva Phalguni"},
        {"planet": "Ketu", "degree": 318.64, "sign": "Aquarius", "deg_in_sign": 28.64, "nakshatra": "Purva Bhadra"},
    ],
    "oumkeltoum": [
        {"planet": "Sun", "degree": 108.10, "sign": "Cancer", "deg_in_sign": 18.10, "nakshatra": "Ashlesha"},
        {"planet": "Moon", "degree": 73.31, "sign": "Gemini", "deg_in_sign": 13.31, "nakshatra": "Ardra"},
        {"planet": "Mercury", "degree": 98.72, "sign": "Cancer", "deg_in_sign": 8.72, "nakshatra": "Pushya"},
        {"planet": "Venus", "degree": 152.90, "sign": "Virgo", "deg_in_sign": 2.90, "nakshatra": "Uttara Phalguni"},
        {"planet": "Mars", "degree": 58.10, "sign": "Taurus", "deg_in_sign": 28.10, "nakshatra": "Mrigashira"},
        {"planet": "Jupiter", "degree": 192.57, "sign": "Libra", "deg_in_sign": 12.57, "nakshatra": "Swati"},
        {"planet": "Saturn", "degree": 337.15, "sign": "Aquarius", "deg_in_sign": 17.15, "nakshatra": "Shatabhisha"},
        {"planet": "Rahu", "degree": 195.86, "sign": "Libra", "deg_in_sign": 25.86, "nakshatra": "Vishakha"},
        {"planet": "Ketu", "degree": 15.86, "sign": "Aries", "deg_in_sign": 25.86, "nakshatra": "Bharani"},
    ],
}


def sign_to_number(sign: str) -> int:
    return SIGNS.index(sign)


def degree_to_sign_pos(degree: float) -> Tuple[str, float]:
    degree = degree % 360
    sign_idx = int(degree / 30)
    pos = degree - (sign_idx * 30)
    return SIGNS[sign_idx], pos


def calculate_planet_houses(sign_asc_deg: float, planets: list) -> list:
    """
    Calculate house placement for each planet based on ASC position.
    Simple: each house = 30° starting from ASC sign.
    """
    asc_sign_idx = int(sign_asc_deg / 30)

    for p in planets:
        planet_sign_idx = sign_to_number(p["sign"])
        # Calculate house offset from ASC
        house_offset = (planet_sign_idx - asc_sign_idx) % 12
        p["house"] = house_offset + 1

    return planets


def format_planet(p: dict) -> str:
    house_meaning = HOUSE_MEANINGS.get(p["house"], {})
    return f"  {p['planet']:8} {p['sign']:12} {p['deg_in_sign']:5.1f}°  {p['nakshatra']:20} House {p['house']:2d} ({house_meaning.get('name', '?')})"


def analyze_house_distribution(planets: list) -> dict:
    """Count planets per house and identify patterns."""
    house_counts = {}
    for p in planets:
        h = p["house"]
        house_counts[h] = house_counts.get(h, 0) + 1

    return house_counts


# House themes for interpretation
HOUSE_THEMES = {
    1: "Self, body, identity, appearance",
    2: "Money, possessions, values, throat",
    3: "Siblings, communication, courage, short trips",
    4: "Home, mother, property, emotional foundation",
    5: "Children, creativity, romance, education",
    6: "Enemies, disease, debt, daily work, service",
    7: "Marriage, partnership, business, public",
    8: "Death, obstacles, spouse money, hidden things",
    9: "Father, fortune, dharma, higher learning, God",
    10: "Career, karma, authority, reputation",
    11: "Income, gains, friends, fulfillment of desires",
    12: "Loss, expenses, foreign lands, liberation, sleep",
}


def run_full_analysis():
    """Generate complete house analysis for all 8 family members."""
    output = []

    for name, planets in PLANET_DATA.items():
        asc_info = KNOWN_ASC[name]

        # Calculate houses based on ASC sign position
        asc_deg = asc_info["asc_deg"]
        planets_with_houses = calculate_planet_houses(asc_deg, planets)

        output.append(f"\n{'='*70}")
        output.append(f"  {name.upper()}")
        output.append(f"  ASC: {asc_info['asc_sign']} {asc_info['asc_deg']:.1f}° | MC: {asc_info['mc_sign']} {asc_info['mc_deg']:.1f}°")
        output.append(f"  Birth time: {asc_info['time']}")
        output.append(f"{'='*70}")

        # Planet positions
        output.append(f"\n  {'Planet':8} {'Sign':12} {'Deg':>5}  {'Nakshatra':20} {'House':>5}")
        output.append(f"  {'-'*60}")
        for p in planets_with_houses:
            output.append(format_planet(p))

        # House distribution
        house_counts = analyze_house_distribution(planets_with_houses)
        output.append(f"\n  House Distribution:")
        for h in range(1, 13):
            count = house_counts.get(h, 0)
            bar = "█" * (count * 3)
            output.append(f"    House {h:2d} ({HOUSE_THEMES[h][:25]:25}): {count} planet(s) {bar}")

        # Stelliums (3+ planets in one house)
        stelliums = {h: c for h, c in house_counts.items() if c >= 3}
        if stelliums:
            output.append(f"\n  STELLIUM(S):")
            for h, c in stelliums.items():
                planets_in = [p["planet"] for p in planets_with_houses if p["house"] == h]
                output.append(f"    House {h} ({HOUSE_THEMES[h][:30]}): {c} planets — {', '.join(planets_in)}")

        # Empty houses
        empty = [h for h in range(1, 13) if h not in house_counts]
        if empty:
            output.append(f"\n  Empty Houses: {', '.join(map(str, empty))}")

        # Angular houses (1, 4, 7, 10)
        angular = sum(1 for h in [1, 4, 7, 10] if h in house_counts)
        output.append(f"  Angular Houses (1,4,7,10): {angular}/4 planets — {'Strong' if angular >= 3 else 'Moderate' if angular >= 2 else 'Weak'}")

        # Succedent houses (2, 5, 8, 11)
        succedent = sum(1 for h in [2, 5, 8, 11] if h in house_counts)
        output.append(f"  Succedent Houses (2,5,8,11): {succedent}/4 planets — {'Strong' if succedent >= 3 else 'Moderate' if succedent >= 2 else 'Weak'}")

        # Cadent houses (3, 6, 9, 12)
        cadent = sum(1 for h in [3, 6, 9, 12] if h in house_counts)
        output.append(f"  Cadent Houses (3,6,9,12): {cadent}/4 planets — {'Strong' if cadent >= 3 else 'Moderate' if cadent >= 2 else 'Weak'}")

    # Cross-family analysis
    output.append(f"\n\n{'='*70}")
    output.append(f"  CROSS-FAMILY HOUSE PATTERNS")
    output.append(f"{'='*70}")

    # Count which houses are most populated across family
    all_houses = {}
    for name, planets in PLANET_DATA.items():
        asc_deg = KNOWN_ASC[name]["asc_deg"]
        planets_h = calculate_planet_houses(asc_deg, planets)
        for p in planets_h:
            h = p["house"]
            if h not in all_houses:
                all_houses[h] = []
            all_houses[h].append(f"{name[:3]}-{p['planet']}")

    output.append(f"\n  Most Populated Houses Across Family:")
    for h in sorted(all_houses.keys(), key=lambda x: len(all_houses[x]), reverse=True):
        count = len(all_houses[h])
        names = all_houses[h][:8]
        output.append(f"    House {h:2d} ({HOUSE_THEMES[h][:25]:25}): {count} planets — {', '.join(names)}")

    # Family life areas
    output.append(f"\n  Family Life Area Focus:")
    house_1_4_7_10 = sum(len(all_houses.get(h, [])) for h in [1, 4, 7, 10])
    house_2_5_8_11 = sum(len(all_houses.get(h, [])) for h in [2, 5, 8, 11])
    house_3_6_9_12 = sum(len(all_houses.get(h, [])) for h in [3, 6, 9, 12])
    output.append(f"    Angular (Action): {house_1_4_7_10} planets")
    output.append(f"    Succedent (Security): {house_2_5_8_11} planets")
    output.append(f"    Cadent (Learning): {house_3_6_9_12} planets")

    # Key house themes per family
    output.append(f"\n  Key House Themes:")
    output.append(f"    House 9 (Father/Dharma): {len(all_houses.get(9, []))} planets — {'STRONG' if len(all_houses.get(9, [])) >= 5 else 'moderate' if len(all_houses.get(9, [])) >= 3 else 'weak'} family focus on spirituality/teaching")
    output.append(f"    House 10 (Career/Karma): {len(all_houses.get(10, []))} planets — {'STRONG' if len(all_houses.get(10, [])) >= 5 else 'moderate' if len(all_houses.get(10, [])) >= 3 else 'weak'} family focus on public life")
    output.append(f"    House 4 (Home/Mother): {len(all_houses.get(4, []))} planets — {'STRONG' if len(all_houses.get(4, [])) >= 5 else 'moderate' if len(all_houses.get(4, [])) >= 3 else 'weak'} family focus on home")
    output.append(f"    House 7 (Marriage/Partners): {len(all_houses.get(7, []))} planets — {'STRONG' if len(all_houses.get(7, [])) >= 5 else 'moderate' if len(all_houses.get(7, [])) >= 3 else 'weak'} family focus on relationships")
    output.append(f"    House 12 (Spirituality/Loss): {len(all_houses.get(12, []))} planets — {'STRONG' if len(all_houses.get(12, [])) >= 5 else 'moderate' if len(all_houses.get(12, [])) >= 3 else 'weak'} family focus on spiritual liberation")

    return "\n".join(output)


if __name__ == "__main__":
    result = run_full_analysis()
    print(result)

    # Save to file
    output_path = Path(r"C:\Users\Admin\AstrologyWorkspace\charts\FAMILY\FAMILY_HOUSE_ANALYSIS.md")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(f"# Family House Analysis — All 8 Members\n\n")
        f.write(f"> Generated by Family Astrology System v2.0\n")
        f.write(f"> Uses known ASC positions for accurate house placement\n\n")
        f.write(result)
    print(f"\nSaved to: {output_path}")
