"""
Placidus House System Calculator
================================
Calculate house cusps using Placidus division.
Works without external astrology libraries — pure astronomical math.
"""

import math
from datetime import datetime, timezone, timedelta
from typing import Dict, Tuple, Optional


# Constants
EARTH_OBLIQUITY_2000 = 23.4393  # degrees
DEG_TO_RAD = math.pi / 180
RAD_TO_DEG = 180 / math.pi


def get_julian_day(year: int, month: int, day: int, hour: float = 12.0) -> float:
    """Calculate Julian Day Number."""
    if month <= 2:
        year -= 1
        month += 12
    A = int(year / 100)
    B = 2 - A + int(A / 4)
    jd = int(365.25 * (year + 4716)) + int(30.6001 * (month + 1)) + day + hour / 24.0 + B - 1524.5
    return jd


def get_obliquity(jd: float) -> float:
    """Calculate obliquity of the ecliptic for a given Julian Day."""
    T = (jd - 2451545.0) / 36525.0
    obliquity = 23.4392911 - 0.0130042 * T - 0.00000164 * T**2 + 0.000000503 * T**3
    return obliquity


def get_local_sidereal_time(year: int, month: int, day: int, hour: float, longitude: float) -> float:
    """
    Calculate Local Sidereal Time (LST) in degrees.
    longitude: in degrees (East positive, West negative)
    """
    jd = get_julian_day(year, month, day, hour)
    T = (jd - 2451545.0) / 36525.0

    # Greenwich Mean Sidereal Time (GMST)
    gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T**2 - T**3 / 38710000.0
    gmst = gmst % 360

    # Local Sidereal Time
    lst = (gmst + longitude) % 360
    return lst


def get_ascendant(lst: float, obliquity: float, latitude: float) -> float:
    """
    Calculate Ascendant (Rising Sign cusp) from LST.
    lst: Local Sidereal Time in degrees
    obliquity: obliquity of ecliptic in degrees
    latitude: geographic latitude in degrees
    Returns: Ascendant degree in ecliptic (sidereal = tropical - ayanamsa)
    """
    lst_rad = lst * DEG_TO_RAD
    obl_rad = obliquity * DEG_TO_RAD
    lat_rad = latitude * DEG_TO_RAD

    # Calculate MC (Midheaven)
    mc = math.atan2(math.sin(lst_rad), math.cos(lst_rad) * math.cos(obl_rad) - math.tan(0) * math.sin(obl_rad))
    mc_deg = mc * RAD_TO_DEG % 360

    # Ascendant formula
    y = -math.cos(lst_rad)
    x = math.sin(obl_rad) * math.tan(lat_rad) + math.cos(obl_rad) * math.sin(lst_rad)
    asc = math.atan2(y, x) * RAD_TO_DEG % 360

    return asc


def get_mc(lst: float, obliquity: float) -> float:
    """Calculate Midheaven (MC) cusp."""
    lst_rad = lst * DEG_TO_RAD
    obl_rad = obliquity * DEG_TO_RAD

    mc = math.atan2(math.sin(lst_rad), math.cos(lst_rad) * math.cos(obl_rad))
    mc_deg = mc * RAD_TO_DEG % 360
    return mc_deg


def calculate_oblique_ascendant(ramc: float, obliquity: float, latitude: float, house_num: int) -> float:
    """
    Calculate house cusp using Placidus division.
    ramc: Right Ascension of MC in degrees
    obliquity: obliquity of ecliptic
    latitude: geographic latitude
    house_num: house number (1-12)
    """
    obl_rad = obliquity * DEG_TO_RAD
    lat_rad = latitude * DEG_TO_RAD

    # Placidus uses temporal hours — 1/3 of 90° from MC to ASC/IC/DC
    # For houses 1, 4, 7, 10: these are the angular cusps
    # For intermediate houses: iterative calculation

    if house_num == 10:  # MC
        return ramc % 360
    elif house_num == 4:  # IC (opposite MC)
        return (ramc + 180) % 360
    elif house_num == 1:  # ASC
        return get_ascendant(ramc, obliquity, latitude)
    elif house_num == 7:  # DC (opposite ASC)
        asc = get_ascendant(ramc, obliquity, latitude)
        return (asc + 180) % 360

    # For intermediate cusps, use Placidus temporal division
    # This is simplified — full Placidus requires iterative solving
    asc = get_ascendant(ramc, obliquity, latitude)
    ic = (ramc + 180) % 360
    dc = (asc + 180) % 360

    cusps = {10: ramc % 360, 1: asc, 4: ic, 7: dc}

    if house_num == 11:
        return (cusps[10] + (cusps[1] - cusps[10]) / 3) % 360
    elif house_num == 12:
        return (cusps[10] + 2 * (cusps[1] - cusps[10]) / 3) % 360
    elif house_num == 2:
        return (cusps[1] + (cusps[4] - cusps[1]) / 3) % 360
    elif house_num == 3:
        return (cusps[1] + 2 * (cusps[4] - cusps[1]) / 3) % 360
    elif house_num == 5:
        return (cusps[4] + (cusps[7] - cusps[4]) / 3) % 360
    elif house_num == 6:
        return (cusps[4] + 2 * (cusps[7] - cusps[4]) / 3) % 360
    elif house_num == 8:
        return (cusps[7] + (cusps[10] - cusps[7]) / 3) % 360
    elif house_num == 9:
        return (cusps[7] + 2 * (cusps[10] - cusps[7]) / 3) % 360

    return 0


def calculate_houses_placidus(year: int, month: int, day: int, hour: int, minute: int, latitude: float, longitude: float) -> Dict:
    """
    Calculate all 12 house cusps using Placidus system.
    Returns SIDEREAL cusps (tropical - Lahiri ayanamsa).
    """
    hour_decimal = hour + minute / 60.0

    # Get Local Sidereal Time
    lst = get_local_sidereal_time(year, month, day, hour_decimal, longitude)

    # Get obliquity
    jd = get_julian_day(year, month, day, hour_decimal)
    obliquity = get_obliquity(jd)

    # Calculate all cusps (tropical)
    tropical_cusps = {}
    for house_num in range(1, 13):
        cusp_degree = calculate_oblique_ascendant(lst, obliquity, latitude, house_num)
        tropical_cusps[house_num] = cusp_degree

    # Get MC and ASC (tropical)
    tropical_mc = get_mc(lst, obliquity)
    tropical_asc = get_ascendant(lst, obliquity, latitude)

    # Convert to sidereal using Lahiri ayanamsa
    J2000_AYANAMSA = 23.8531
    RATE_PER_YEAR = 0.01397
    ayanamsa = J2000_AYANAMSA + RATE_PER_YEAR * (year - 2000.0)

    sidereal_cusps = {}
    for house_num, tropical_deg in tropical_cusps.items():
        sidereal_cusps[house_num] = (tropical_deg - ayanamsa) % 360

    sidereal_mc = (tropical_mc - ayanamsa) % 360
    sidereal_asc = (tropical_asc - ayanamsa) % 360

    return {
        "cusps": sidereal_cusps,
        "mc": sidereal_mc,
        "asc": sidereal_asc,
        "lst": lst,
        "obliquity": obliquity,
        "ayanamsa": ayanamsa,
        "tropical_asc": tropical_asc,
        "tropical_mc": tropical_mc,
    }


def get_house_for_planet(planet_degree: float, cusps: Dict) -> int:
    """
    Determine which house a planet falls in based on house cusps.
    planet_degree: sidereal degree of planet (0-360)
    cusps: dict of house cusp degrees
    """
    # Normalize planet degree
    planet_degree = planet_degree % 360

    # Sort cusps in order
    cusp_list = [(cusps[i], i) for i in range(1, 13)]
    cusp_list.sort(key=lambda x: x[0])

    # Find which house the planet falls in
    for idx in range(12):
        cusp_start = cusp_list[idx][0]
        cusp_end = cusp_list[(idx + 1) % 12][0]
        house_num = cusp_list[idx][1]

        if cusp_start < cusp_end:
            if cusp_start <= planet_degree < cusp_end:
                return house_num
        else:  # Wraps around 0°/360°
            if planet_degree >= cusp_start or planet_degree < cusp_end:
                return house_num

    return 1  # Default


def get_sign_from_degree(degree: float) -> Tuple[str, float]:
    """Get zodiac sign and position from absolute degree."""
    signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
             "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    degree = degree % 360
    sign_idx = int(degree / 30)
    pos_in_sign = degree - (sign_idx * 30)
    return signs[sign_idx], pos_in_sign


# House themes and interpretations
HOUSE_MEANINGS = {
    1: {"name": "Self", "theme": "Identity, body, appearance, first impressions", "keyword": "Identity"},
    2: {"name": "Resources", "theme": "Money, possessions, values, self-worth", "keyword": "Values"},
    3: {"name": "Communication", "theme": "Siblings, short trips, writing, learning", "keyword": "Expression"},
    4: {"name": "Home", "theme": "Home, family, roots, emotional foundation", "keyword": "Foundation"},
    5: {"name": "Creativity", "theme": "Children, romance, creativity, pleasure", "keyword": "Joy"},
    6: {"name": "Service", "theme": "Health, daily work, routines, pets", "keyword": "Service"},
    7: {"name": "Partnerships", "theme": "Marriage, business partners, open enemies", "keyword": "Union"},
    8: {"name": "Transformation", "theme": "Death, rebirth, shared resources, occult", "keyword": "Depth"},
    9: {"name": "Wisdom", "theme": "Philosophy, higher education, travel, God", "keyword": "Truth"},
    10: {"name": "Career", "theme": "Public image, career, authority, reputation", "keyword": "Legacy"},
    11: {"name": "Community", "theme": "Friends, groups, hopes, wishes", "keyword": "Vision"},
    12: {"name": "Spirituality", "theme": "Subconscious, isolation, spirituality, enemies", "keyword": "Surrender"},
}


if __name__ == "__main__":
    print("Testing Placidus House Calculator...")

    # Test with Kamel (March 6, 1996, 14:00, El Bayadh)
    result = calculate_houses_placidus(1996, 3, 6, 14, 0, 34.07, 1.33)
    print(f"\nKamel (March 6, 1996, 14:00):")
    print(f"  LST: {result['lst']:.2f}°")
    print(f"  MC: {result['mc']:.2f}°")
    print(f"  ASC: {result['asc']:.2f}°")

    mc_sign, mc_deg = get_sign_from_degree(result['mc'])
    asc_sign, asc_deg = get_sign_from_degree(result['asc'])
    print(f"  MC: {mc_sign} {mc_deg:.1f}°")
    print(f"  ASC: {asc_sign} {asc_deg:.1f}°")

    print(f"\n  House Cusps:")
    for house_num, cusp_deg in result['cusps'].items():
        sign, deg = get_sign_from_degree(cusp_deg)
        meaning = HOUSE_MEANINGS[house_num]
        print(f"    House {house_num:2d} ({meaning['name']:15}): {sign:12} {deg:5.1f}° ({cusp_deg:.1f}°)")
