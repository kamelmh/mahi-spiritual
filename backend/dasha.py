"""
Vimshottari Dasha Timing System
================================
Calculates planetary periods (dashas) based on Moon's nakshatra at birth.
Provides sub-period (bhukti) and transits for timing predictions.
"""

from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta

# Vimshottari Dasha periods (in years)
DASHA_YEARS = {
    "Ketu": 7,
    "Venus": 20,
    "Sun": 6,
    "Moon": 10,
    "Mars": 7,
    "Rahu": 18,
    "Jupiter": 16,
    "Saturn": 19,
    "Mercury": 17,
}

# Nakshatra to Dasha lord mapping
NAKSHATRA_DASHA = {
    "Ashwini": "Ketu",
    "Bharani": "Venus",
    "Krittika": "Sun",
    "Rohini": "Moon",
    "Mrigashira": "Mars",
    "Ardra": "Rahu",
    "Punarvasu": "Jupiter",
    "Pushya": "Saturn",
    "Ashlesha": "Mercury",
    "Magha": "Ketu",
    "Purva Phalguni": "Venus",
    "Uttara Phalguni": "Sun",
    "Hasta": "Moon",
    "Chitra": "Mars",
    "Swati": "Rahu",
    "Vishakha": "Jupiter",
    "Anuradha": "Saturn",
    "Jyeshtha": "Mercury",
    "Mula": "Ketu",
    "Purva Ashadha": "Venus",
    "Uttara Ashadha": "Sun",
    "Shravana": "Moon",
    "Dhanishta": "Mars",
    "Shatabhisha": "Rahu",
    "Purva Bhadra": "Jupiter",
    "Uttara Bhadra": "Saturn",
    "Revati": "Mercury",
}

# Dasha sequence
DASHA_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]


def calculate_balance_of_dasha(moon_nakshatra: str, moon_degree_in_nakshatra: float) -> float:
    """
    Calculate balance of first dasha at birth.
    Returns years remaining in the first dasha period.
    """
    first_lord = NAKSHATRA_DASHA.get(moon_nakshatra)
    if not first_lord:
        return 0

    total_years = DASHA_YEARS[first_lord]
    # Each nakshatra has 13°20' = 13.333°
    # Balance = total_years * (1 - fraction_elapsed)
    fraction_elapsed = moon_degree_in_nakshatra / 13.333
    balance_years = total_years * (1 - fraction_elapsed)
    return balance_years


def calculate_dasha_sequence(moon_nakshatra: str, moon_degree_in_nakshatra: float, birth_date: datetime) -> List[Dict]:
    """
    Calculate complete Vimshottari dasha sequence from birth.
    Returns list of dasha periods with start/end dates.
    """
    first_lord = NAKSHATRA_DASHA.get(moon_nakshatra)
    if not first_lord:
        return []

    # Calculate balance of first dasha
    balance_years = calculate_balance_of_dasha(moon_nakshatra, moon_degree_in_nakshatra)

    dashas = []
    current_date = birth_date

    # Find starting index in sequence
    start_idx = DASHA_SEQUENCE.index(first_lord)

    for i in range(9):  # 9 dashas in full cycle
        lord_idx = (start_idx + i) % 9
        lord = DASHA_SEQUENCE[lord_idx]

        if i == 0:
            years = balance_years
        else:
            years = DASHA_YEARS[lord]

        end_date = current_date + timedelta(days=years * 365.25)

        dashas.append({
            "lord": lord,
            "years": round(years, 2),
            "start": current_date.strftime("%Y-%m-%d"),
            "end": end_date.strftime("%Y-%m-%d"),
            "start_date": current_date,
            "end_date": end_date,
        })

        current_date = end_date

    return dashas


def calculate_bhukti(maha_dasha_lord: str, maha_dasha_start: datetime, maha_dasha_years: float) -> List[Dict]:
    """
    Calculate sub-periods (bhukti) within a maha dasha.
    """
    bhukti_years = []
    start_idx = DASHA_SEQUENCE.index(maha_dasha_lord)

    for i in range(9):
        bhukti_lord_idx = (start_idx + i) % 9
        bhukti_lord = DASHA_SEQUENCE[bhukti_lord_idx]

        # Bhukti duration = (maha_dasha_years × bhukti_lord_years) / 120
        bhukti_duration = (maha_dasha_years * DASHA_YEARS[bhukti_lord]) / 120
        bhukti_years.append({
            "lord": bhukti_lord,
            "years": round(bhukti_duration, 2),
            "days": round(bhukti_duration * 365.25),
        })

    # Calculate dates
    bhukti_list = []
    current_date = maha_dasha_start
    for bhukti in bhukti_years:
        end_date = current_date + timedelta(days=bhukti["days"])
        bhukti_list.append({
            **bhukti,
            "start": current_date.strftime("%Y-%m-%d"),
            "end": end_date.strftime("%Y-%m-%d"),
            "start_date": current_date,
            "end_date": end_date,
        })
        current_date = end_date

    return bhukti_list


def get_current_dasha(birth_date: datetime, moon_nakshatra: str, moon_degree_in_nakshatra: float, target_date: datetime = None) -> Dict:
    """
    Get the current dasha and bhukti for a given date.
    """
    if target_date is None:
        target_date = datetime.now()

    dashas = calculate_dasha_sequence(moon_nakshatra, moon_degree_in_nakshatra, birth_date)

    current_maha = None
    current_bhukti = None

    for dasha in dashas:
        if dasha["start_date"] <= target_date <= dasha["end_date"]:
            current_maha = dasha

            # Calculate bhukti within this dasha
            bhukti_list = calculate_bhukti(
                dasha["lord"],
                dasha["start_date"],
                dasha["years"]
            )

            for bhukti in bhukti_list:
                if bhukti["start_date"] <= target_date <= bhukti["end_date"]:
                    current_bhukti = bhukti
                    break
            break

    return {
        "maha_dasha": current_maha,
        "bhukti": current_bhukti,
        "target_date": target_date.strftime("%Y-%m-%d"),
    }


def get_dasha_transits(dasha_lord: str, positions: Dict) -> Dict:
    """
    Get transit-based predictions for a dasha period.
    Analyzes where the dasha lord is in the natal chart.
    """
    if dasha_lord not in positions:
        return {"error": f"Planet {dasha_lord} not found in chart"}

    planet_pos = positions[dasha_lord]
    sign = planet_pos["sign"]
    degree = planet_pos["degree"]
    nakshatra = planet_pos.get("nakshatra", "Unknown")
    dignity = planet_pos.get("dignity", "neutral")

    predictions = {
        "sign_theme": get_sign_theme(sign),
        "nakshatra_theme": get_nakshatra_theme(nakshatra),
        "dignity_theme": get_dignity_theme(dignity),
    }

    return predictions


def get_sign_theme(sign: str) -> str:
    """Get thematic interpretation for a sign placement."""
    themes = {
        "Aries": "Action, independence, leadership, new beginnings",
        "Taurus": "Stability, resources, values, patience",
        "Gemini": "Communication, learning, adaptability, dual nature",
        "Cancer": "Nurturing, home, emotions, protection",
        "Leo": "Creativity, authority, self-expression, leadership",
        "Virgo": "Service, health, perfection, analysis",
        "Libra": "Balance, relationships, harmony, justice",
        "Scorpio": "Transformation, depth, intensity, regeneration",
        "Sagittarius": "Wisdom, expansion, philosophy, adventure",
        "Capricorn": "Discipline, structure, ambition, responsibility",
        "Aquarius": "Innovation, freedom, community, future vision",
        "Pisces": "Spirituality, compassion, intuition, dissolution",
    }
    return themes.get(sign, "Unknown")


def get_nakshatra_theme(nakshatra: str) -> str:
    """Get thematic interpretation for a nakshatra placement."""
    themes = {
        "Ashwini": "Healing, speed, new beginnings, horses",
        "Bharani": "Transformation, birth/death, suffering, yoni",
        "Krittika": "Cutting, purification, fire, sharpness",
        "Rohini": "Growth, beauty, abundance, chariot",
        "Mrigashira": "Seeking, deer, gentle, searching",
        "Ardra": "Suffering, tears, transformation, Rudra",
        "Punarvasu": "Return, renewal, bow and arrow, Aditi",
        "Pushya": "Nourishment, spiritual food, lotus, teaching",
        "Ashlesha": "Serpent, kundalini, hidden knowledge, binding",
        "Magha": "Authority, ancestors, throne, power",
        "Purva Phalguni": "Pleasure, relaxation, hammock, bhaga",
        "Uttara Phalguni": "Patronage, generosity, bed, aryaman",
        "Hasta": "Craftsmanship, hands, skill, healing",
        "Chitra": "Creation, pearl, beauty, vishvakarma",
        "Swati": "Independence, coral, wind, freedom",
        "Vishakha": "Goal-oriented, archway, determination",
        "Anuradha": "Devotion, lotus, friendship, mitra",
        "Jyeshtha": "Seniority, circular talisman, power, indra",
        "Mula": "Roots, foundation, destruction, nirrti",
        "Purva Ashadha": "Invincibility, fan, water, apas",
        "Uttara Ashadha": "Victory, tusk, universal, vishvadevas",
        "Shravana": "Listening, ear, learning, vishnu",
        "Dhanishta": "Wealth, drum, music, vasus",
        "Shatabhisha": "Healing, circle, hundred physicians, varuna",
        "Purva Bhadra": "Fire, sword, transformation, aja ekapada",
        "Uttara Bhadra": "Twin, deep wisdom, ahir budhnya",
        "Revati": "Journey, fish, completion, pushan",
    }
    return themes.get(nakshatra, "Unknown")


def get_dignity_theme(dignity: str) -> str:
    """Get thematic interpretation for a planetary dignity."""
    themes = {
        "exalted": "Peak expression, highest potential, exceptional ability",
        "own_sign": "Strong, comfortable, natural expression",
        "moolatrikona": "Very strong, foundational, structural",
        "friendly": "Supported, cooperative, positive expression",
        "neutral": "Neither strong nor weak, depends on aspects",
        "enemy": "Challenged, opposition, growth through struggle",
        "debilitated": "Weakened, challenged, growth through difficulty",
    }
    return themes.get(dignity, "Unknown")


if __name__ == "__main__":
    # Test with Kamel's chart
    from datetime import datetime

    birth_date = datetime(1996, 3, 6, 14, 0)
    moon_nakshatra = "Hasta"  # Moon in Hasta from previous records
    moon_degree = 15.67  # Moon at 15°40' in Hasta

    print("KAMEL - Vimshottari Dasha Analysis")
    print("=" * 60)

    # Calculate dasha sequence
    dashas = calculate_dasha_sequence(moon_nakshatra, moon_degree, birth_date)

    print(f"\nMoon Nakshatra: {moon_nakshatra}")
    print(f"Moon Degree in Nakshatra: {moon_degree:.2f}°")
    print(f"Balance of First Dasha: {calculate_balance_of_dasha(moon_nakshatra, moon_degree):.2f} years")

    print(f"\n{'Lord':<10} {'Years':<8} {'Start':<12} {'End':<12}")
    print("-" * 42)
    for dasha in dashas:
        print(f"{dasha['lord']:<10} {dasha['years']:<8} {dasha['start']:<12} {dasha['end']:<12}")

    # Current dasha (2026)
    current = get_current_dasha(birth_date, moon_nakshatra, moon_degree, datetime(2026, 7, 28))
    print(f"\nCurrent Dasha (July 2026):")
    if current["maha_dasha"]:
        print(f"  Maha Dasha: {current['maha_dasha']['lord']} ({current['maha_dasha']['start']} to {current['maha_dasha']['end']})")
    if current["bhukti"]:
        print(f"  Bhukti: {current['bhukti']['lord']} ({current['bhukti']['start']} to {current['bhukti']['end']})")