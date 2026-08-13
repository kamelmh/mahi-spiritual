"""
FAMILY ASTROLOGY — WHOLE SIGN HOUSE RECALCULATION
Based on Astro.com sidereal charts (Lahiri ayanamsa)
Corrected ASC for Kamel: Gemini 21°37' (was wrongly Capricorn)
"""

from datetime import datetime, timedelta
from skyfield import api
from skyfield import almanac
import numpy as np

ts = api.load.timescale()
eph = api.load('de421.bsp')

AYANAMSA_OFFSET = 23.66  # Lahiri ayanamsa approximately

SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra',
         'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']

SIGN_RANGES = {
    'Aries': (0, 30), 'Taurus': (30, 60), 'Gemini': (60, 90),
    'Cancer': (90, 120), 'Leo': (120, 150), 'Virgo': (150, 180),
    'Libra': (180, 210), 'Scorpio': (210, 240), 'Sagittarius': (240, 270),
    'Capricorn': (270, 300), 'Aquarius': (300, 330), 'Pisces': (330, 360)
}

WHOLE_SIGN_HOUSES = {
    'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
    'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
    'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
}

def tropical_to_sidereal(tropical_deg):
    sid = tropical_deg - AYANAMSA_OFFSET
    if sid < 0:
        sid += 360
    return sid

def deg_to_sign(deg):
    deg = deg % 360
    signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra',
             'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    idx = int(deg / 30)
    return signs[idx]

def deg_to_dms(deg):
    d = int(deg)
    m_float = (deg - d) * 60
    m = int(m_float)
    s = int((m_float - m) * 60)
    return f"{d}deg {m:02d}'"

def get_ascendant(tropical_deg):
    sid = tropical_to_sidereal(tropical_deg)
    return deg_to_sign(sid), sid

def get_whole_sign_house(asc_sign, planet_sign):
    """Whole Sign: each sign = one house, starting from ASC sign"""
    signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra',
             'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    asc_idx = signs.index(asc_sign)
    planet_idx = signs.index(planet_sign)
    house = (planet_idx - asc_idx) % 12 + 1
    return house

# KAMEL — CORRECTED ASC: Gemini 21°37'
# From Astro.com: Tropical positions
kamel_tropical = {
    'Sun': 16.26,      # Aquarius 22°26' sidereal → 16°26' Aries tropical
    'Moon': 289.15,    # Scorpio 5°49' sidereal → 13°15' Scorpio tropical
    'Mercury': 344.65, # Aquarius 4°39' sidereal → 28°25' Pisces tropical
    'Venus': 296.67,   # Capricorn 6°40' sidereal → 30°27' Capricorn tropical
    'Mars': 1.20,      # Aries 1°12' sidereal → 24°48' Pisces tropical
    'Jupiter': 258.82, # Sagittarius 18°49' sidereal → 12°29' Sagittarius tropical
    'Saturn': 332.27,  # Pisces 2°16' sidereal → 25°54' Aquarius tropical
    'Rahu': 175.15,    # Virgo 25°09' sidereal → 18°49' Virgo tropical
}

# Actually, let me use the KNOWN sidereal positions directly
# These are from Astro.com (Lahiri ayanamsa applied)
kamel_sidereal = {
    'Sun': (22 + 26/60, 'Aquarius'),
    'Moon': (5 + 49/60, 'Scorpio'),
    'Mercury': (4 + 39/60, 'Aquarius'),
    'Venus': (6 + 40/60, 'Capricorn'),
    'Mars': (1 + 12/60, 'Aries'),
    'Jupiter': (18 + 49/60, 'Sagittarius'),
    'Saturn': (2 + 16/60, 'Pisces'),
    'Rahu': (25 + 9/60, 'Virgo'),
    'Ketu': (25 + 9/60, 'Pisces'),
}

# ASC: Gemini 21°37'
kamel_asc_sign = 'Gemini'

print("=" * 70)
print("  KAMEL — CORRECTED WHOLE SIGN CHART")
print("  ASC: Gemini 21°37' | Sidereal (Lahiri) | Whole Sign")
print("=" * 70)
print()

for planet, (deg, sign) in kamel_sidereal.items():
    house = get_whole_sign_house(kamel_asc_sign, sign)
    print(f"  {planet:10s} -> {sign:12s} {deg_to_dms(deg):>12s}  House {house}")

print()
print("  HOUSE CONTENTS:")
print("  " + "-" * 50)

house_planets = {}
for planet, (deg, sign) in kamel_sidereal.items():
    house = get_whole_sign_house(kamel_asc_sign, sign)
    if house not in house_planets:
        house_planets[house] = []
    house_planets[house].append(f"{planet} ({sign} {deg_to_dms(deg)})")

for h in range(1, 13):
    if h in house_planets:
        print(f"  House {h:2d}: {', '.join(house_planets[h])}")
    else:
        print(f"  House {h:2d}: EMPTY")
