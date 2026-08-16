"""
Core Astrology Calculation Engine
=================================
Uses skyfield for accurate planetary positions.
Converts tropical to sidereal using Lahiri ayanamsa.
Calculates nakshatras, yogas, aspects, and dignities.
"""

from skyfield import api
from skyfield import almanac
from skyfield.api import load
from skyfield.framelib import ecliptic_frame
from skyfield import almanac
import math
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import json

# Load ephemeris
ts = load.timescale()
eph = load('de421.bsp')

# Constants
AYANAMSA_LAHIRI_2026 = 24.25  # Approximate Lahiri ayanamsa for 2026
AYANAMSA_LAHIRI_1994 = 23.77  # Approximate for 1994
AYANAMSA_LAHIRI_1961 = 23.26  # Approximate for 1961
AYANAMSA_LAHIRI_1972 = 23.43  # Approximate for 1972
AYANAMSA_LAHIRI_2004 = 23.94  # Approximate for 2004
AYANAMSA_LAHIRI_2024 = 24.19  # Approximate for 2024

# Zodiac signs
SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

# Nakshatras (27 lunar mansions)
NAKSHATRAS = [
    {"name": "Ashwini", "lord": "Ketu", "start": 0, "end": 13.333, "symbol": "Horse Head", "deity": "Ashwini Kumaras"},
    {"name": "Bharani", "lord": "Venus", "start": 13.333, "end": 26.667, "symbol": "Yoni", "deity": "Yama"},
    {"name": "Krittika", "lord": "Sun", "start": 26.667, "end": 40.0, "symbol": "Razor", "deity": "Agni"},
    {"name": "Rohini", "lord": "Moon", "start": 40.0, "end": 53.333, "symbol": "Chariot", "deity": "Brahma"},
    {"name": "Mrigashira", "lord": "Mars", "start": 53.333, "end": 66.667, "symbol": "Deer Head", "deity": "Soma"},
    {"name": "Ardra", "lord": "Rahu", "start": 66.667, "end": 80.0, "symbol": "Teardrop", "deity": "Rudra"},
    {"name": "Punarvasu", "lord": "Jupiter", "start": 80.0, "end": 93.333, "symbol": "Bow and Quiver", "deity": "Aditi"},
    {"name": "Pushya", "lord": "Saturn", "start": 93.333, "end": 106.667, "symbol": "Lotus", "deity": "Brihaspati"},
    {"name": "Ashlesha", "lord": "Mercury", "start": 106.667, "end": 120.0, "symbol": "Serpent", "deity": "Naga"},
    {"name": "Magha", "lord": "Ketu", "start": 120.0, "end": 133.333, "symbol": "Throne", "deity": "Pitrs"},
    {"name": "Purva Phalguni", "lord": "Venus", "start": 133.333, "end": 146.667, "symbol": "Hammock", "deity": "Bhaga"},
    {"name": "Uttara Phalguni", "lord": "Sun", "start": 146.667, "end": 160.0, "symbol": "Bed", "deity": "Aryaman"},
    {"name": "Hasta", "lord": "Moon", "start": 160.0, "end": 173.333, "symbol": "Hand", "deity": "Savitar"},
    {"name": "Chitra", "lord": "Mars", "start": 173.333, "end": 186.667, "symbol": "Pearl", "deity": "Vishvakarma"},
    {"name": "Swati", "lord": "Rahu", "start": 186.667, "end": 200.0, "symbol": "Coral", "deity": "Vayu"},
    {"name": "Vishakha", "lord": "Jupiter", "start": 200.0, "end": 213.333, "symbol": "Archway", "deity": "Indra-Agni"},
    {"name": "Anuradha", "lord": "Saturn", "start": 213.333, "end": 226.667, "symbol": "Lotus", "deity": "Mitra"},
    {"name": "Jyeshtha", "lord": "Mercury", "start": 226.667, "end": 240.0, "symbol": "Circular Talisman", "deity": "Indra"},
    {"name": "Mula", "lord": "Ketu", "start": 240.0, "end": 253.333, "symbol": "Bunch of Roots", "deity": "Nirrti"},
    {"name": "Purva Ashadha", "lord": "Venus", "start": 253.333, "end": 266.667, "symbol": "Fan", "deity": "Apas"},
    {"name": "Uttara Ashadha", "lord": "Sun", "start": 266.667, "end": 280.0, "symbol": "Tusk", "deity": "Vishvadevas"},
    {"name": "Shravana", "lord": "Moon", "start": 280.0, "end": 293.333, "symbol": "Ear", "deity": "Vishnu"},
    {"name": "Dhanishta", "lord": "Mars", "start": 293.333, "end": 306.667, "symbol": "Drum", "deity": "Vasus"},
    {"name": "Shatabhisha", "lord": "Rahu", "start": 306.667, "end": 320.0, "symbol": "Circle", "deity": "Varuna"},
    {"name": "Purva Bhadra", "lord": "Jupiter", "start": 320.0, "end": 333.333, "symbol": "Sword", "deity": "Aja Ekapada"},
    {"name": "Uttara Bhadra", "lord": "Saturn", "start": 333.333, "end": 346.667, "symbol": "Twin", "deity": "Ahir Budhnya"},
    {"name": "Revati", "lord": "Mercury", "start": 346.667, "end": 360.0, "symbol": "Fish", "deity": "Pushan"},
]

# Planetary dignities
DIGNITIES = {
    "exalted": {"Aries": {"planet": "Sun", "degree": 10}, "Taurus": {"planet": "Moon", "degree": 3}, "Cancer": {"planet": "Jupiter", "degree": 5}, "Pisces": {"planet": "Venus", "degree": 27}, "Libra": {"planet": "Saturn", "degree": 20}},
    "debilitated": {"Libra": {"planet": "Sun", "degree": 10}, "Scorpio": {"planet": "Moon", "degree": 3}, "Capricorn": {"planet": "Jupiter", "degree": 5}, "Virgo": {"planet": "Venus", "degree": 27}, "Aries": {"planet": "Saturn", "degree": 20}},
    "own_sign": {"Leo": "Sun", "Cancer": "Moon", "Gemini": "Mercury", "Virgo": "Mercury", "Sagittarius": "Jupiter", "Pisces": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Aries": "Mars", "Scorpio": "Mars"},
    "exaltation_sign": {"Aries": "Sun", "Taurus": "Moon", "Cancer": "Jupiter", "Pisces": "Venus", "Libra": "Saturn"},
}


def get_ayanamsa(year: float) -> float:
    """
    Get approximate Lahiri ayanamsa for a given year.
    Reference: J2000.0 = 23°51'11" = 23.8531°
    Rate: ~50.29 arcseconds/year (0.014°/year)
    """
    J2000_AYANAMSA = 23.8531  # 23°51'11" at J2000.0
    RATE_PER_YEAR = 0.01397  # 50.29"/year in degrees
    return J2000_AYANAMSA + RATE_PER_YEAR * (year - 2000.0)


def tropical_to_sidereal(tropical_degree: float, year: int) -> float:
    """Convert tropical zodiac position to sidereal (Lahiri)."""
    ayanamsa = get_ayanamsa(year)
    sidereal = tropical_degree - ayanamsa
    if sidereal < 0:
        sidereal += 360
    return sidereal


def get_sign(degree: float) -> Tuple[str, float]:
    """Get zodiac sign and position within sign from absolute degree."""
    degree = degree % 360
    sign_index = int(degree / 30)
    position_in_sign = degree - (sign_index * 30)
    return SIGNS[sign_index], position_in_sign


def get_nakshatra(degree: float) -> Dict:
    """Get nakshatra, pada, and details from absolute degree."""
    degree = degree % 360
    for nak in NAKSHATRAS:
        if nak["start"] <= degree < nak["end"]:
            segment = degree - nak["start"]
            pada_size = (nak["end"] - nak["start"]) / 4
            pada = int(segment / pada_size) + 1
            return {
                "name": nak["name"],
                "lord": nak["lord"],
                "pada": pada,
                "symbol": nak["symbol"],
                "deity": nak["deity"],
                "degree_in_nakshatra": segment,
            }
    return {"name": "Unknown", "lord": "Unknown", "pada": 0}


def get_dignity(planet: str, sign: str, degree: float) -> str:
    """Get planetary dignity based on sign placement."""
    # Check exaltation
    if sign in DIGNITIES["exalted"]:
        info = DIGNITIES["exalted"][sign]
        if info["planet"] == planet:
            if abs(degree - info["degree"]) < 5:
                return "exalted"
            return "exalted"  # Still exalted, just not at peak

    # Check debilitation
    if sign in DIGNITIES["debilitated"]:
        info = DIGNITIES["debilitated"][sign]
        if info["planet"] == planet:
            if abs(degree - info["degree"]) < 5:
                return "debilitated"
            return "debilitated"

    # Check own sign
    if sign in DIGNITIES["own_sign"]:
        if DIGNITIES["own_sign"][sign] == planet:
            return "own_sign"

    # Check moolatrikona (simplified)
    moolatrikona = {"Sun": "Leo", "Moon": "Taurus", "Mercury": "Virgo", "Venus": "Libra", "Mars": "Aries", "Jupiter": "Sagittarius", "Saturn": "Aquarius"}
    if planet in moolatrikona and sign == moolatrikona[planet]:
        return "moolatrikona"

    # Friendly signs
    friends = {
        "Sun": ["Aries", "Leo", "Sagittarius", "Pisces", "Scorpio"],
        "Moon": ["Taurus", "Cancer", "Pisces", "Scorpio"],
        "Mercury": ["Gemini", "Virgo", "Libra", "Aquarius"],
        "Venus": ["Taurus", "Libra", "Pisces", "Cancer"],
        "Mars": ["Aries", "Scorpio", "Capricorn", "Aquarius"],
        "Jupiter": ["Sagittarius", "Pisces", "Cancer", "Leo"],
        "Saturn": ["Capricorn", "Aquarius", "Libra", "Taurus"],
    }
    if planet in friends and sign in friends[planet]:
        return "friendly"

    # Enemy signs
    enemies = {
        "Sun": ["Libra", "Aquarius", "Capricorn"],
        "Moon": ["Scorpio", "Virgo"],
        "Mercury": ["Sagittarius", "Pisces"],
        "Venus": ["Virgo", "Scorpio"],
        "Mars": ["Cancer", "Libra"],
        "Jupiter": ["Gemini", "Virgo", "Capricorn"],
        "Saturn": ["Cancer", "Leo", "Aries"],
    }
    if planet in enemies and sign in enemies[planet]:
        return "enemy"

    return "neutral"


def calculate_d9_navamsha(sign_name: str, degree_in_sign: float) -> Tuple[str, float]:
    """Calculate Navamsha (D-9) sign and degree in sign."""
    sign_idx = SIGNS.index(sign_name)
    nav_idx = int(degree_in_sign / (30.0 / 9))
    if nav_idx >= 9:
        nav_idx = 8
    modality = sign_idx % 3
    if modality == 0:      # Movable (Chara) -> starts from sign itself
        start_idx = sign_idx
    elif modality == 1:    # Fixed (Sthira) -> starts from 9th sign
        start_idx = (sign_idx + 8) % 12
    else:                  # Dual (Dvisvabhava) -> starts from 5th sign
        start_idx = (sign_idx + 4) % 12
    d9_sign_idx = (start_idx + nav_idx) % 12
    d9_degree = (degree_in_sign % (30.0 / 9)) * 9
    return SIGNS[d9_sign_idx], d9_degree


def calculate_d10_dashamsha(sign_name: str, degree_in_sign: float) -> Tuple[str, float]:
    """Calculate Dashamsha (D-10) sign and degree in sign."""
    sign_idx = SIGNS.index(sign_name)
    dash_idx = int(degree_in_sign / 3.0)
    if dash_idx >= 10:
        dash_idx = 9
    parity = sign_idx % 2
    if parity == 0:  # Odd sign -> starts from sign itself
        start_idx = sign_idx
    else:            # Even sign -> starts from 9th sign
        start_idx = (sign_idx + 8) % 12
    d10_sign_idx = (start_idx + dash_idx) % 12
    d10_degree = (degree_in_sign % 3.0) * 10
    return SIGNS[d10_sign_idx], d10_degree


def calculate_planetary_positions(year: int, month: int, day: int, hour: int = 12, minute: int = 0) -> Dict:
    """
    Calculate sidereal planetary positions for a given date/time.
    Uses skyfield for accurate ephemeris calculations.
    """
    t = ts.utc(year, month, day, hour, minute)

    # Planet mappings (skyfield names)
    planets = {
        "Sun": eph['sun'],
        "Moon": eph['moon'],
        "Mercury": eph['mercury barycenter'],
        "Venus": eph['venus barycenter'],
        "Mars": eph['mars barycenter'],
        "Jupiter": eph['jupiter barycenter'],
        "Saturn": eph['saturn barycenter'],
        "Uranus": eph['uranus barycenter'],
        "Neptune": eph['neptune barycenter'],
    }

    positions = {}
    earth = eph['earth']

    for name, planet in planets.items():
        try:
            astrometric = earth.at(t).observe(planet)
            apparent = astrometric.apparent()
            lat, lon, distance = apparent.frame_latlon(ecliptic_frame)

            # Convert to degrees
            tropical_degree = lon.degrees % 360
            sidereal_degree = tropical_to_sidereal(tropical_degree, year)

            sign_name, degree_in_sign = get_sign(sidereal_degree)
            nakshatra = get_nakshatra(sidereal_degree)
            dignity = get_dignity(name, sign_name, degree_in_sign)
            d9_sign, d9_deg = calculate_d9_navamsha(sign_name, degree_in_sign)
            d10_sign, d10_deg = calculate_d10_dashamsha(sign_name, degree_in_sign)

            positions[name] = {
                "tropical": round(tropical_degree, 2),
                "sidereal": round(sidereal_degree, 2),
                "sign": sign_name,
                "degree": round(degree_in_sign, 2),
                "minute": int((degree_in_sign % 1) * 60),
                "nakshatra": nakshatra["name"],
                "nakshatra_lord": nakshatra["lord"],
                "pada": nakshatra["pada"],
                "dignity": dignity,
                "d9": {"sign": d9_sign, "degree": round(d9_deg, 2)},
                "d10": {"sign": d10_sign, "degree": round(d10_deg, 2)},
            }
        except Exception as e:
            positions[name] = {"error": str(e)}

    # Calculate Rahu and Ketu (Mean Lunar Nodes)
    try:
        # Mean ascending node calculation
        # Using simplified formula for mean node
        t_jd = t.tt  # Julian date
        # Mean longitude of ascending node (Meeus formula)
        T = (t_jd - 2451545.0) / 36525.0
        rahu_tropical = (125.0445 - 1934.1362 * T) % 360
        ketu_tropical = (rahu_tropical + 180) % 360

        rahu_sidereal = tropical_to_sidereal(rahu_tropical, year)
        ketu_sidereal = tropical_to_sidereal(ketu_tropical, year)

        rahu_sign, rahu_deg = get_sign(rahu_sidereal)
        rahu_nak = get_nakshatra(rahu_sidereal)

        ketu_sign, ketu_deg = get_sign(ketu_sidereal)
        ketu_nak = get_nakshatra(ketu_sidereal)

        r_d9_sign, r_d9_deg = calculate_d9_navamsha(rahu_sign, rahu_deg)
        r_d10_sign, r_d10_deg = calculate_d10_dashamsha(rahu_sign, rahu_deg)
        k_d9_sign, k_d9_deg = calculate_d9_navamsha(ketu_sign, ketu_deg)
        k_d10_sign, k_d10_deg = calculate_d10_dashamsha(ketu_sign, ketu_deg)

        positions["Rahu"] = {
            "tropical": round(rahu_tropical, 2),
            "sidereal": round(rahu_sidereal, 2),
            "sign": rahu_sign,
            "degree": round(rahu_deg, 2),
            "minute": int((rahu_deg % 1) * 60),
            "nakshatra": rahu_nak["name"],
            "nakshatra_lord": rahu_nak["lord"],
            "pada": rahu_nak["pada"],
            "dignity": "neutral",
            "d9": {"sign": r_d9_sign, "degree": round(r_d9_deg, 2)},
            "d10": {"sign": r_d10_sign, "degree": round(r_d10_deg, 2)},
        }
        positions["Ketu"] = {
            "tropical": round(ketu_tropical, 2),
            "sidereal": round(ketu_sidereal, 2),
            "sign": ketu_sign,
            "degree": round(ketu_deg, 2),
            "minute": int((ketu_deg % 1) * 60),
            "nakshatra": ketu_nak["name"],
            "nakshatra_lord": ketu_nak["lord"],
            "pada": ketu_nak["pada"],
            "dignity": "neutral",
            "d9": {"sign": k_d9_sign, "degree": round(k_d9_deg, 2)},
            "d10": {"sign": k_d10_sign, "degree": round(k_d10_deg, 2)},
        }
    except Exception as e:
        positions["Rahu"] = {"error": str(e)}
        positions["Ketu"] = {"error": str(e)}

    return positions


def calculate_aspects(positions: Dict) -> List[Dict]:
    """Calculate aspects between planets (Vedic full aspects + special aspects)."""
    aspects = []
    planet_list = list(positions.keys())

    # Standard aspects (0° = conjunction, 180° = opposition, 120° = trine, 90° = square, 60° = sextile)
    aspect_types = [
        {"name": "conjunction", "angle": 0, "orb": 8, "nature": "strong"},
        {"name": "opposition", "angle": 180, "orb": 8, "nature": "challenging"},
        {"name": "trine", "angle": 120, "orb": 8, "nature": "harmonious"},
        {"name": "square", "angle": 90, "orb": 8, "nature": "challenging"},
        {"name": "sextile", "angle": 60, "orb": 6, "nature": "harmonious"},
    ]

    # Vedic special aspects
    special_aspects = {
        "Mars": [4, 8],  # Mars aspects 4th, 7th (full), 8th from itself
        "Jupiter": [5, 9],  # Jupiter aspects 5th, 7th (full), 9th from itself
        "Saturn": [3, 10],  # Saturn aspects 3rd, 7th (full), 10th from itself
        "Rahu": [5, 9],  # Rahu aspects like Jupiter
        "Ketu": [5, 9],  # Ketu aspects like Jupiter
    }

    for i, p1 in enumerate(planet_list):
        if "error" in positions[p1]:
            continue
        for p2 in planet_list[i+1:]:
            if "error" in positions[p2]:
                continue

            # Calculate angular distance
            diff = abs(positions[p1]["sidereal"] - positions[p2]["sidereal"])
            if diff > 180:
                diff = 360 - diff

            # Check standard aspects
            for aspect in aspect_types:
                if abs(diff - aspect["angle"]) <= aspect["orb"]:
                    aspects.append({
                        "planet1": p1,
                        "planet2": p2,
                        "type": aspect["name"],
                        "angle": round(diff, 1),
                        "exactness": round(abs(aspect["angle"] - diff), 1),
                        "nature": aspect["nature"],
                    })

            # Check Vedic special aspects
            for planet, special_list in special_aspects.items():
                if p1 == planet or p2 == planet:
                    for houses_away in special_list:
                        # Calculate house distance
                        p1_pos = positions[p1]["sidereal"]
                        p2_pos = positions[p2]["sidereal"]
                        if p1 == planet:
                            house_dist = ((p2_pos - p1_pos) % 360) / 30
                        else:
                            house_dist = ((p1_pos - p2_pos) % 360) / 30

                        if abs(house_dist - houses_away) < 0.5:
                            aspects.append({
                                "planet1": p1,
                                "planet2": p2,
                                "type": f"vedic_{planet.lower()}_aspect",
                                "houses_away": houses_away,
                                "nature": "special",
                            })

    return aspects


def detect_yogas(positions: Dict) -> List[Dict]:
    """Detect Vedic yogas from planetary positions."""
    yogas = []

    # Check for Raja Yogas (lord of Kendra + lord of Trikona in conjunction/aspects)
    kendra_lords = []
    trikona_lords = []

    # Simplified: detect conjunctions
    for i, p1 in enumerate(positions.keys()):
        if "error" in positions[p1]:
            continue
        for p2 in list(positions.keys())[i+1:]:
            if "error" in positions[p2]:
                continue

            diff = abs(positions[p1]["sidereal"] - positions[p2]["sidereal"])
            if diff > 180:
                diff = 360 - diff

            if diff < 8:  # Conjunction
                yogas.append({
                    "type": "conjunction",
                    "planets": [p1, p2],
                    "sign": positions[p1]["sign"],
                    "significance": f"{p1} and {p2} conjoined in {positions[p1]['sign']}"
                })

            # Check exchange (parivartana)
            p1_sign = positions[p1]["sign"]
            p2_sign = positions[p2]["sign"]
            p1_sign_lord = get_sign_lord(p1_sign)
            p2_sign_lord = get_sign_lord(p2_sign)

            if p1_sign_lord == p2 and p2_sign_lord == p1:
                yogas.append({
                    "type": "exchange",
                    "planets": [p1, p2],
                    "signs": [p1_sign, p2_sign],
                    "significance": f"{p1} in {p1_sign} exchanges with {p2} in {p2_sign}"
                })

    # Neecha Bhanga Raja Yoga (debilitation cancelled)
    for planet, data in positions.items():
        if "error" in data:
            continue
        if data.get("dignity") == "debilitated":
            # Check if dispositor is exalted or conjunct exalted planet
            sign_lord = get_sign_lord(data["sign"])
            if sign_lord in positions:
                dispositor = positions[sign_lord]
                if dispositor.get("dignity") == "exalted":
                    yogas.append({
                        "type": "neecha_bhanga_raja_yoga",
                        "planet": planet,
                        "dispositor": sign_lord,
                        "significance": f"{planet} debilitation cancelled by {sign_lord} exalted in {dispositor['sign']}"
                    })

    return yogas


def get_sign_lord(sign: str) -> str:
    """Get the ruling planet of a zodiac sign."""
    lords = {
        "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury",
        "Cancer": "Moon", "Leo": "Sun", "Virgo": "Mercury",
        "Libra": "Venus", "Scorpio": "Mars", "Sagittarius": "Jupiter",
        "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
    }
    return lords.get(sign, "Unknown")


def calculate_houses(year: int, month: int, day: int, hour: int = 12, minute: int = 0, latitude: float = 33.06, longitude: float = 1.00) -> Dict:
    """
    Calculate house cusps using Equal House system from Ascendant.
    Falls back to Placidus if swisseph is available.
    latitude/longitude: El Bayadh, Algeria (33.06°N, 1.00°E)
    """
    t = ts.utc(year, month, day, hour, minute)

    ayanamsa = get_ayanamsa(year + (month - 1) / 12.0 + (day - 1) / 365.25)

    # Sidereal Ascendant (Lahiri) via the verified pure-Python Placidus
    # calculator in backend.houses (no pyswisseph dependency required).
    from .houses import calculate_houses_placidus, get_sign_from_degree

    placidus = calculate_houses_placidus(
        year, month, day, hour, minute, latitude, longitude
    )
    sidereal_asc = placidus["asc"]  # 0-360 sidereal

    signs = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
    ]
    asc_sign, asc_deg = get_sign_from_degree(sidereal_asc)

    # Whole Sign houses: each sign = one house, 1st house = ASC sign.
    asc_idx = signs.index(asc_sign)
    asc_sign_start = (asc_idx * 30) % 360
    houses: Dict = {}
    for i in range(12):
        cusp = (asc_sign_start + i * 30) % 360
        csign, cdeg = get_sign_from_degree(cusp)
        houses[f"house_{i + 1}"] = {
            "cusp_degree": round(cusp, 2),
            "sign": csign,
            "degree": round(cdeg, 2),
        }

    houses["ascendant"] = {
        "lagna": asc_sign,
        "sign": asc_sign,
        "degree": round(asc_deg, 2),
        "cusp_degree": round(sidereal_asc, 2),
        "house": 1,
    }
    houses["mc"] = {
        "sign": get_sign_from_degree(placidus["mc"])[0],
        "cusp_degree": round(placidus["mc"], 2),
    }
    houses["system"] = "Whole Sign"
    houses["lagna"] = asc_sign
    houses["ayanamsa"] = round(ayanamsa, 4)
    return houses


def calculate_full_chart(name: str, year: int, month: int, day: int, hour: int = 12, minute: int = 0, latitude: float = 33.06, longitude: float = 1.00) -> Dict:
    """Calculate complete natal chart with all components."""
    # Get planetary positions
    positions = calculate_planetary_positions(year, month, day, hour, minute)

    # Calculate aspects
    aspects = calculate_aspects(positions)

    # Detect yogas
    yogas = detect_yogas(positions)

    # Calculate houses (always, since we have birth times)
    houses = calculate_houses(year, month, day, hour, minute, latitude, longitude)

    # Build chart summary
    chart = {
        "name": name,
        "birth": {
            "year": year,
            "month": month,
            "day": day,
            "hour": hour,
            "minute": minute,
            "location": {"latitude": latitude, "longitude": longitude},
        },
        "planets": positions,
        "aspects": aspects,
        "yogas": yogas,
        "houses": houses,
    }

    return chart


# ============== FAMILY MEMBER DATA ==============

FAMILY_MEMBERS = {
    "Kamel": {
        "birth": {"year": 1996, "month": 3, "day": 6, "hour": 14, "minute": 0},
        "location": {"latitude": 33.06, "longitude": 1.00},
        "role": "Son (Subject)",
    },
    "Kheireddine": {
        "birth": {"year": 1992, "month": 10, "day": 4, "hour": 18, "minute": 0},
        "location": {"latitude": 33.06, "longitude": 1.00},
        "role": "Son (Brother)",
    },
    "Ikram": {
        "birth": {"year": 1998, "month": 9, "day": 8, "hour": 8, "minute": 0},
        "location": {"latitude": 33.06, "longitude": 1.00},
        "role": "Daughter (Sister)",
    },
    "Ghofran": {
        "birth": {"year": 2024, "month": 9, "day": 27, "hour": 5, "minute": 0},
        "location": {"latitude": 33.06, "longitude": 1.00},
        "role": "Daughter (Father + Oumkeltoum)",
    },
    "Zohra": {
        "birth": {"year": 1972, "month": 12, "day": 1, "hour": 12, "minute": 0},
        "location": {"latitude": 33.06, "longitude": 1.00},
        "role": "Mother",
    },
    "Father": {
        "birth": {"year": 1961, "month": 3, "day": 31, "hour": 12, "minute": 0},
        "location": {"latitude": 33.06, "longitude": 1.00},
        "role": "Father",
    },
    "Oumkeltoum": {
        "birth": {"year": 1994, "month": 8, "day": 4, "hour": 12, "minute": 0},
        "location": {"latitude": 33.06, "longitude": 1.00},
        "role": "Step-mother",
    },
    "Sara": {
        "birth": {"year": 2004, "month": 5, "day": 24, "hour": 6, "minute": 30},
        "location": {"latitude": 33.06, "longitude": 1.00},
        "role": "Oumkeltoum's sister",
    },
}


def calculate_family_charts() -> Dict:
    """Calculate charts for all family members."""
    charts = {}
    for name, data in FAMILY_MEMBERS.items():
        charts[name] = calculate_full_chart(
            name=name,
            year=data["birth"]["year"],
            month=data["birth"]["month"],
            day=data["birth"]["day"],
            hour=data["birth"]["hour"],
            minute=data["birth"]["minute"],
            latitude=data["location"]["latitude"],
            longitude=data["location"]["longitude"],
        )
        charts[name]["role"] = data["role"]
    return charts


if __name__ == "__main__":
    print("Testing Family Astrology Engine...")
    print("=" * 50)

    # Test Kamel's chart
    kamel = calculate_full_chart("Kamel", 1996, 3, 6, 14, 0)
    print(f"\nKamel's Chart:")
    for planet, data in kamel["planets"].items():
        if "error" not in data:
            print(f"  {planet:10} {data['sign']:12} {data['degree']:5.1f}° {data['nakshatra']:20} Pada {data['pada']} ({data['dignity']})")

    print(f"\nAspects: {len(kamel['aspects'])}")
    for asp in kamel["aspects"][:5]:
        print(f"  {asp['planet1']}-{asp['planet2']}: {asp['type']} ({asp.get('angle', '?')}°)")

    print(f"\nYogas: {len(kamel['yogas'])}")
    for yoga in kamel["yogas"][:5]:
        print(f"  {yoga['type']}: {yoga.get('significance', '')}")