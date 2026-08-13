#!/usr/bin/env python3
"""
Complete Family Chart Calculator — Houses + Planets
Calculates Placidus house cusps and maps all planets to houses for all family members.
"""

import sys
import os
sys.path.insert(0, r"C:\Users\Admin\AstrologyWorkspace")

from family_astrology.engine import (
    calculate_planetary_positions, calculate_houses, FAMILY_MEMBERS, SIGNS, get_sign, get_nakshatra
)
from family_astrology.houses import (
    calculate_houses_placidus, get_house_for_planet, get_sign_from_degree, HOUSE_MEANINGS
)

# El Bayadh coordinates
LAT = 34.07
LON = 1.33


def format_degree(deg):
    """Format decimal degrees to D°M'"""
    d = int(deg)
    m = int((deg - d) * 60)
    return f"{d}°{m:02d}'"


def get_all_members():
    """Get all family members with birth data."""
    return {
        "KAMEL": {"year": 1996, "month": 3, "day": 6, "hour": 14, "minute": 0, "role": "Son (Subject)"},
        "KHEIREDDINE": {"year": 1992, "month": 10, "day": 4, "hour": 18, "minute": 0, "role": "Son (Brother)"},
        "IKRAM": {"year": 1998, "month": 9, "day": 8, "hour": 8, "minute": 0, "role": "Daughter (Sister)"},
        "GHOFRAN": {"year": 2024, "month": 9, "day": 27, "hour": 5, "minute": 0, "role": "Daughter (Father+Oumkeltoum)"},
        "ZOHRA": {"year": 1972, "month": 12, "day": 1, "hour": 12, "minute": 0, "role": "Mother"},
        "FATHER": {"year": 1961, "month": 3, "day": 31, "hour": 12, "minute": 0, "role": "Father"},
        "OUMKELTOUM": {"year": 1994, "month": 8, "day": 4, "hour": 12, "minute": 0, "role": "Step-mother"},
        "SARA": {"year": 2004, "month": 5, "day": 24, "hour": 6, "minute": 30, "role": "Oumkeltoum's sister"},
    }


def calculate_member_chart(name, data):
    """Calculate complete chart with houses for one member."""
    year = data["year"]
    month = data["month"]
    day = data["day"]
    hour = data["hour"]
    minute = data["minute"]

    # Calculate planetary positions
    planets = calculate_planetary_positions(year, month, day, hour, minute)

    # Calculate house cusps
    houses = calculate_houses_placidus(year, month, day, hour, minute, LAT, LON)

    # Map planets to houses
    planet_houses = {}
    for planet_name, planet_data in planets.items():
        if "error" in planet_data:
            continue
        sidereal_deg = planet_data["sidereal"]
        house_num = get_house_for_planet(sidereal_deg, houses["cusps"])
        planet_houses[planet_name] = {
            "house": house_num,
            "sign": planet_data["sign"],
            "degree": planet_data["degree"],
            "sidereal": sidereal_deg,
            "nakshatra": planet_data.get("nakshatra", "?"),
            "pada": planet_data.get("pada", "?"),
            "dignity": planet_data.get("dignity", "?"),
            "d9": planet_data.get("d9", {}),
        }

    # Group planets by house
    houses_grouped = {}
    for i in range(1, 13):
        houses_grouped[i] = []
    for planet_name, info in planet_houses.items():
        houses_grouped[info["house"]].append((planet_name, info))

    return {
        "name": name,
        "birth": data,
        "asc": houses["asc"],
        "mc": houses["mc"],
        "cusps": houses["cusps"],
        "planets": planet_houses,
        "houses_grouped": houses_grouped,
    }


def print_member_chart(chart):
    """Print complete chart for one member."""
    name = chart["name"]
    birth = chart["birth"]

    print(f"\n{'='*70}")
    print(f"  {name} — COMPLETE HOUSE & PLANET ANALYSIS")
    print(f"{'='*70}")
    print(f"  Birth: {birth['year']}-{birth['month']:02d}-{birth['day']:02d} {birth['hour']:02d}:{birth['minute']:02d}")
    print(f"  Role: {birth['role']}")

    # Ascendant and MC
    asc_sign, asc_deg = get_sign_from_degree(chart["asc"])
    mc_sign, mc_deg = get_sign_from_degree(chart["mc"])
    print(f"\n  ASC: {asc_sign} {format_degree(asc_deg)}")
    print(f"  MC:  {mc_sign} {format_degree(mc_deg)}")

    # House Cusps
    print(f"\n  {'House':<8} {'Sign':<12} {'Cusp':<10} {'Theme'}")
    print(f"  {'-'*65}")
    for house_num in range(1, 13):
        cusp_deg = chart["cusps"][house_num]
        sign, deg = get_sign_from_degree(cusp_deg)
        meaning = HOUSE_MEANINGS[house_num]
        marker = ""
        if house_num == 1:
            marker = " <-- ASC"
        elif house_num == 10:
            marker = " <-- MC"
        print(f"  {house_num:<8} {sign:<12} {format_degree(deg):<10} {meaning['name']}{marker}")

    # Planets in Houses
    print(f"\n  {'Planet':<10} {'House':<7} {'Sign':<12} {'Degree':<10} {'Nakshatra':<20} {'Pada':<5} {'Dignity'}")
    print(f"  {'-'*80}")
    for planet_name in ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"]:
        if planet_name in chart["planets"]:
            info = chart["planets"][planet_name]
            print(f"  {planet_name:<10} {info['house']:<7} {info['sign']:<12} {format_degree(info['degree']):<10} {info['nakshatra']:<20} {info['pada']:<5} {info['dignity']}")

    # House Summary
    print(f"\n  HOUSE CONTENTS:")
    print(f"  {'-'*60}")
    for house_num in range(1, 13):
        planets_in_house = chart["houses_grouped"][house_num]
        meaning = HOUSE_MEANINGS[house_num]
        if planets_in_house:
            planet_list = ", ".join([f"{p[0]} ({p[1]['sign'][:3]})" for p in planets_in_house])
            print(f"  House {house_num:2d} ({meaning['name']:15}): {planet_list}")
        else:
            print(f"  House {house_num:2d} ({meaning['name']:15}): Empty")

    # Key Yogas from House Placement
    print(f"\n  KEY HOUSE YOGAS:")
    print(f"  {'-'*60}")
    
    # Check for stelliums
    for house_num in range(1, 13):
        if len(chart["houses_grouped"][house_num]) >= 3:
            planets = [p[0] for p in chart["houses_grouped"][house_num]]
            print(f"  Stellium in House {house_num}: {', '.join(planets)}")

    # Check for empty houses
    empty_houses = [i for i in range(1, 13) if not chart["houses_grouped"][i]]
    if empty_houses:
        print(f"  Empty Houses: {', '.join([str(h) for h in empty_houses])}")

    # Check for Angular houses (1, 4, 7, 10)
    angular_planets = []
    for h in [1, 4, 7, 10]:
        for p in chart["houses_grouped"][h]:
            angular_planets.append(f"{p[0]} in {h}")
    if angular_planets:
        print(f"  Angular Planets: {', '.join(angular_planets)}")

    # Check for Cadent houses (3, 6, 9, 12)
    cadent_planets = []
    for h in [3, 6, 9, 12]:
        for p in chart["houses_grouped"][h]:
            cadent_planets.append(f"{p[0]} in {h}")
    if cadent_planets:
        print(f"  Cadent Planets: {', '.join(cadent_planets)}")

    # Check for Succedent houses (2, 5, 8, 11)
    succedent_planets = []
    for h in [2, 5, 8, 11]:
        for p in chart["houses_grouped"][h]:
            succedent_planets.append(f"{p[0]} in {h}")
    if succedent_planets:
        print(f"  Succedent Planets: {', '.join(succedent_planets)}")


def print_family_summary(charts):
    """Print summary table for all family members."""
    print(f"\n{'='*90}")
    print(f"  FAMILY SUMMARY — ALL HOUSES & PLANETS")
    print(f"{'='*90}")

    print(f"\n  {'Member':<15} {'ASC':<15} {'Sun House':<10} {'Moon House':<11} {'Mercury':<10} {'Jupiter':<10} {'Saturn':<10}")
    print(f"  {'-'*80}")

    for chart in charts.values():
        asc_sign, asc_deg = get_sign_from_degree(chart["asc"])
        sun_house = chart["planets"].get("Sun", {}).get("house", "?")
        moon_house = chart["planets"].get("Moon", {}).get("house", "?")
        mercury_house = chart["planets"].get("Mercury", {}).get("house", "?")
        jupiter_house = chart["planets"].get("Jupiter", {}).get("house", "?")
        saturn_house = chart["planets"].get("Saturn", {}).get("house", "?")

        print(f"  {chart['name']:<15} {asc_sign[:3]} {format_degree(asc_deg):<11} {sun_house:<10} {moon_house:<11} {mercury_house:<10} {jupiter_house:<10} {saturn_house:<10}")

    # Dasha Summary
    print(f"\n  DASHA SUMMARY:")
    print(f"  {'-'*70}")
    print(f"  {'Member':<15} {'Moon Nakshatra':<20} {'Current Dasha':<20} {'Bhukti'}")
    print(f"  {'-'*70}")

    from family_astrology.dasha import get_current_dasha
    from datetime import datetime

    for chart in charts.values():
        moon = chart["planets"].get("Moon", {})
        moon_nak = moon.get("nakshatra", "?")
        birth = chart["birth"]
        birth_date = datetime(birth["year"], birth["month"], birth["day"], birth["hour"], birth["minute"])
        current = get_current_dasha(birth_date, moon_nak, moon.get("degree", 0))
        maha = current.get("maha_dasha", {}).get("lord", "?")
        bhukti = current.get("bhukti", {}).get("lord", "?")
        print(f"  {chart['name']:<15} {moon_nak:<20} {maha:<20} {bhukti}")


def main():
    members = get_all_members()
    charts = {}

    for name, data in members.items():
        charts[name] = calculate_member_chart(name, data)
        print_member_chart(charts[name])

    print_family_summary(charts)

    # Save to file
    output_path = r"C:\Users\Admin\AstrologyWorkspace\FAMILY_Houses_Complete.md"
    print(f"\n\n  Analysis complete. {len(charts)} members calculated.")
    print(f"  Output: {output_path}")


if __name__ == "__main__":
    main()
