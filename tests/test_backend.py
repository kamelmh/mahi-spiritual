"""
Tests for the MAHI Spiritual System backend.
"""
import json
import math
import os
import sys
from datetime import datetime

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# ═══════════════════════════════════════════════════════════════════════════════
# ENGINE TESTS
# ═══════════════════════════════════════════════════════════════════════════════

def test_engine_imports():
    """All engine modules import cleanly."""
    from backend import engine
    from backend import dasha
    from backend import synastry
    from backend import transits
    from backend import houses
    assert engine is not None
    assert dasha is not None
    assert synastry is not None
    assert transits is not None
    assert houses is not None


def test_ayanamsa_approximation():
    """Ayanamsa grows at ~50.29 arcsec/year (0.014°/year)."""
    from backend.engine import get_ayanamsa
    a_2000 = get_ayanamsa(2000.0)
    a_2026 = get_ayanamsa(2026.0)
    a_1996 = get_ayanamsa(1996.0)
    assert abs(a_2000 - 23.8531) < 0.01, f"J2000 ayanamsa should be ~23.8531, got {a_2000}"
    assert a_2026 > a_2000, "Ayanamsa should increase with time"
    assert a_1996 < a_2000, "Ayanamsa should be less before J2000"
    # Rate check: ~0.014°/year
    diff = a_2026 - a_2000
    assert 0.3 < diff < 0.4, f"26-year diff should be ~0.36°, got {diff}"


def test_tropical_to_sidereal():
    """Tropical-to-sidereal conversion subtracts ayanamsa."""
    from backend.engine import tropical_to_sidereal
    # If ayanamsa is 24°, tropical 30° → sidereal 6°
    result = tropical_to_sidereal(30.0, 2026)
    assert 0 <= result < 360, "Result should be 0-360"
    # Wrapping: tropical 10° with ayanamsa 24° → should wrap to ~346°
    result2 = tropical_to_sidereal(10.0, 2026)
    assert result2 > 300, f"Should wrap around 360, got {result2}"


def test_get_sign():
    """Sign detection from absolute degree."""
    from backend.engine import get_sign
    assert get_sign(0) == ("Aries", 0.0)
    assert get_sign(30) == ("Taurus", 0.0)
    assert get_sign(360) == ("Aries", 0.0)
    assert get_sign(15) == ("Aries", 15.0)
    assert get_sign(359.5) == ("Pisces", 29.5)
    assert get_sign(90) == ("Cancer", 0.0)
    assert get_sign(180) == ("Libra", 0.0)
    assert get_sign(270) == ("Capricorn", 0.0)


def test_get_nakshatra():
    """Nakshatra detection from absolute degree."""
    from backend.engine import get_nakshatra
    # Ashwini starts at 0°
    nak = get_nakshatra(5)
    assert nak["name"] == "Ashwini"
    assert nak["lord"] == "Ketu"
    assert 1 <= nak["pada"] <= 4
    # Rohini starts at 40°
    nak2 = get_nakshatra(45)
    assert nak2["name"] == "Rohini"
    assert nak2["lord"] == "Moon"
    # Revati starts at 346.67°
    nak3 = get_nakshatra(355)
    assert nak3["name"] == "Revati"
    assert nak3["lord"] == "Mercury"


def test_get_dignity():
    """Planetary dignity detection."""
    from backend.engine import get_dignity
    # Sun exalted in Aries
    assert get_dignity("Sun", "Aries", 10) == "exalted"
    # Sun debilitated in Libra
    assert get_dignity("Sun", "Libra", 10) == "debilitated"
    # Sun in own sign Leo
    assert get_dignity("Sun", "Leo", 15) == "own_sign"
    # Jupiter exalted in Cancer
    assert get_dignity("Jupiter", "Cancer", 5) == "exalted"
    # Moon in Taurus is exalted (degree 3 is peak exaltation)
    assert get_dignity("Moon", "Taurus", 3) == "exalted"
    # Moon rules Cancer — own sign
    assert get_dignity("Moon", "Cancer", 15) == "own_sign"
    # Moon in Scorpio is debilitated
    assert get_dignity("Moon", "Scorpio", 3) == "debilitated"
    # Mars in Aries is own sign
    assert get_dignity("Mars", "Aries", 10) == "own_sign"
    # Venus in Libra is moolatrikona
    assert get_dignity("Venus", "Libra", 10) == "moolatrikona"


def test_navamsha_calculation():
    """Navamsha (D-9) sign calculation."""
    from backend.engine import calculate_d9_navamsha
    # Aries (movable) navamsha starts from Aries
    d9_sign, d9_deg = calculate_d9_navamsha("Aries", 10)
    assert d9_sign in ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    assert 0 <= d9_deg < 30
    # Taurus (fixed) navamsha starts from 9th sign (Capricorn)
    d9_sign2, _ = calculate_d9_navamsha("Taurus", 5)
    assert d9_sign2 in ["Capricorn", "Aquarius", "Pisces", "Aries", "Taurus",
                         "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius"]


def test_dashamsha_calculation():
    """Dashamsha (D-10) sign calculation."""
    from backend.engine import calculate_d10_dashamsha
    d10_sign, d10_deg = calculate_d10_dashamsha("Aries", 15)
    assert d10_sign in ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    assert 0 <= d10_deg < 30


def test_sign_lord():
    """Sign lord mapping."""
    from backend.engine import get_sign_lord
    assert get_sign_lord("Aries") == "Mars"
    assert get_sign_lord("Taurus") == "Venus"
    assert get_sign_lord("Gemini") == "Mercury"
    assert get_sign_lord("Cancer") == "Moon"
    assert get_sign_lord("Leo") == "Sun"
    assert get_sign_lord("Virgo") == "Mercury"
    assert get_sign_lord("Libra") == "Venus"
    assert get_sign_lord("Scorpio") == "Mars"
    assert get_sign_lord("Sagittarius") == "Jupiter"
    assert get_sign_lord("Capricorn") == "Saturn"
    assert get_sign_lord("Aquarius") == "Saturn"
    assert get_sign_lord("Pisces") == "Jupiter"


def test_planetary_positions_structure():
    """calculate_planetary_positions returns valid structure."""
    from backend.engine import calculate_planetary_positions
    positions = calculate_planetary_positions(1996, 3, 6, 14, 0)
    required_planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"]
    for planet in required_planets:
        assert planet in positions, f"{planet} missing from positions"
        assert "sign" in positions[planet], f"{planet} missing sign"
        assert "degree" in positions[planet], f"{planet} missing degree"
        assert "sidereal" in positions[planet], f"{planet} missing sidereal"
        assert "nakshatra" in positions[planet], f"{planet} missing nakshatra"
        assert "pada" in positions[planet], f"{planet} missing pada"
        assert "dignity" in positions[planet], f"{planet} missing dignity"
        assert "d9" in positions[planet], f"{planet} missing d9"
        assert "d10" in positions[planet], f"{planet} missing d10"


def test_kamel_moon_virgo():
    """Kamel's Moon should be in Virgo Uttara Phalguni (canonical Version B)."""
    from backend.engine import calculate_planetary_positions
    pos = calculate_planetary_positions(1996, 3, 6, 14, 0)
    assert pos["Moon"]["sign"] == "Virgo", f"Moon should be Virgo, got {pos['Moon']['sign']}"
    assert pos["Moon"]["nakshatra"] == "Uttara Phalguni", f"Moon nakshatra should be Uttara Phalguni, got {pos['Moon']['nakshatra']}"


def test_kamel_sun_aquarius():
    """Kamel's Sun should be in Aquarius."""
    from backend.engine import calculate_planetary_positions
    pos = calculate_planetary_positions(1996, 3, 6, 14, 0)
    assert pos["Sun"]["sign"] == "Aquarius", f"Sun should be Aquarius, got {pos['Sun']['sign']}"


def test_aspects_structure():
    """Aspects return valid list of aspect objects."""
    from backend.engine import calculate_planetary_positions, calculate_aspects
    pos = calculate_planetary_positions(1996, 3, 6, 14, 0)
    aspects = calculate_aspects(pos)
    assert isinstance(aspects, list)
    for asp in aspects:
        assert "planet1" in asp
        assert "planet2" in asp
        assert "type" in asp
        assert "nature" in asp


def test_yogas_detection():
    """Yoga detection returns a list."""
    from backend.engine import calculate_planetary_positions, detect_yogas
    pos = calculate_planetary_positions(1996, 3, 6, 14, 0)
    yogas = detect_yogas(pos)
    assert isinstance(yogas, list)
    for yoga in yogas:
        assert "type" in yoga
        assert "significance" in yoga


def test_whole_sign_ketu_10th_house():
    """Engine houses are Whole-Sign from the verified sidereal Ascendant.

    Kamel (1996-03-06 14:00, El Bayadh) has Lagna Gemini 21d31m; Whole-Sign
    house 10 from Gemini Lagna = Pisces, where natal Ketu (Pisces 25d17m Revati)
    falls -> Ketu in 10th house (matches repo docs).
    """
    from backend import engine

    houses = engine.calculate_houses(1996, 3, 6, 14, 0, 34.07, 1.33)
    assert houses["lagna"] == "Gemini", houses
    assert houses["ascendant"]["sign"] == "Gemini", houses
    assert houses["system"] == "Whole Sign", houses
    assert houses["house_10"]["sign"] == "Pisces", houses


def test_houses_all_12_present():
    """All 12 houses are returned."""
    from backend.engine import calculate_houses
    houses = calculate_houses(1996, 3, 6, 14, 0, 34.07, 1.33)
    for i in range(1, 13):
        assert f"house_{i}" in houses, f"house_{i} missing"
        assert "sign" in houses[f"house_{i}"]
        assert "cusp_degree" in houses[f"house_{i}"]


def test_full_chart_structure():
    """calculate_full_chart returns complete structure."""
    from backend.engine import calculate_full_chart
    chart = calculate_full_chart("Test", 1996, 3, 6, 14, 0)
    assert chart["name"] == "Test"
    assert "birth" in chart
    assert "planets" in chart
    assert "aspects" in chart
    assert "yogas" in chart
    assert "houses" in chart
    assert chart["birth"]["year"] == 1996
    assert chart["birth"]["month"] == 3
    assert chart["birth"]["day"] == 6


# ═══════════════════════════════════════════════════════════════════════════════
# HOUSES (PLACIDUS) TESTS
# ═══════════════════════════════════════════════════════════════════════════════

def test_julian_day():
    """Julian Day calculation for known date."""
    from backend.houses import get_julian_day
    # J2000.0 = Jan 1, 2000 12:00 TT = JD 2451545.0
    jd = get_julian_day(2000, 1, 1, 12.0)
    assert abs(jd - 2451545.0) < 1.0, f"JD for J2000.0 should be ~2451545, got {jd}"
    # Jan 1, 1996 noon
    jd96 = get_julian_day(1996, 1, 1, 12.0)
    assert jd96 < 2451545.0, "1996 should be before J2000"


def test_obliquity():
    """Obliquity of ecliptic is ~23.44° for current epoch."""
    from backend.houses import get_obliquity, get_julian_day
    jd = get_julian_day(2026, 8, 17, 12.0)
    obl = get_obliquity(jd)
    assert 23.0 < obl < 24.0, f"Obliquity should be ~23.44°, got {obl}"


def test_local_sidereal_time():
    """LST calculation produces valid degree value."""
    from backend.houses import get_local_sidereal_time
    lst = get_local_sidereal_time(1996, 3, 6, 14.0, 1.33)
    assert 0 <= lst < 360, f"LST should be 0-360, got {lst}"


def test_ascendant():
    """Ascendant calculation returns valid degree."""
    from backend.houses import get_ascendant, get_local_sidereal_time, get_obliquity, get_julian_day
    lst = get_local_sidereal_time(1996, 3, 6, 14.0, 1.33)
    jd = get_julian_day(1996, 3, 6, 14.0)
    obl = get_obliquity(jd)
    asc = get_ascendant(lst, obl, 34.07)
    assert 0 <= asc < 360, f"ASC should be 0-360, got {asc}"


def test_mc_calculation():
    """MC (Midheaven) calculation returns valid degree."""
    from backend.houses import get_mc, get_local_sidereal_time, get_obliquity, get_julian_day
    lst = get_local_sidereal_time(1996, 3, 6, 14.0, 1.33)
    jd = get_julian_day(1996, 3, 6, 14.0)
    obl = get_obliquity(jd)
    mc = get_mc(lst, obl)
    assert 0 <= mc < 360, f"MC should be 0-360, got {mc}"


def test_placidus_houses():
    """Placidus house calculation returns all 12 cusps."""
    from backend.houses import calculate_houses_placidus
    result = calculate_houses_placidus(1996, 3, 6, 14, 0, 34.07, 1.33)
    assert "cusps" in result
    assert "mc" in result
    assert "asc" in result
    assert "lst" in result
    assert "obliquity" in result
    assert "ayanamsa" in result
    assert len(result["cusps"]) == 12
    for i in range(1, 13):
        assert i in result["cusps"]
        assert 0 <= result["cusps"][i] < 360


def test_sign_from_degree():
    """Sign from absolute degree."""
    from backend.houses import get_sign_from_degree
    assert get_sign_from_degree(0) == ("Aries", 0.0)
    assert get_sign_from_degree(30) == ("Taurus", 0.0)
    assert get_sign_from_degree(360) == ("Aries", 0.0)
    assert get_sign_from_degree(15) == ("Aries", 15.0)
    assert get_sign_from_degree(359.5) == ("Pisces", 29.5)


def test_house_for_planet():
    """Planet house assignment from cusps."""
    from backend.houses import get_house_for_planet
    cusps = {i: (i - 1) * 30 for i in range(1, 13)}  # Equal 30° cusps starting at 0°
    assert get_house_for_planet(15, cusps) == 1
    assert get_house_for_planet(45, cusps) == 2
    assert get_house_for_planet(355, cusps) == 12


# ═══════════════════════════════════════════════════════════════════════════════
# DASHA TESTS
# ═══════════════════════════════════════════════════════════════════════════════

def test_dasha_balance():
    """Balance of first dasha at birth."""
    from backend.dasha import calculate_balance_of_dasha
    # Moon in Ashwini (Ketu's nakshatra) at beginning → ~7 years balance
    balance = calculate_balance_of_dasha("Ashwini", 0)
    assert abs(balance - 7.0) < 0.1, f"Ashwini at 0° should give ~7yr balance, got {balance}"
    # Moon at 6° in Ashwini → ~3.5 years
    balance2 = calculate_balance_of_dasha("Ashwini", 6.667)
    assert 3.0 < balance2 < 4.0, f"Ashwini at 6.67° should give ~3.5yr, got {balance2}"
    # Unknown nakshatra returns 0
    assert calculate_balance_of_dasha("Unknown", 0) == 0


def test_dasha_sequence():
    """Dasha sequence follows Vimshottari order."""
    from backend.dasha import calculate_dasha_sequence
    birth = datetime(1996, 3, 6)
    dashas = calculate_dasha_sequence("Uttara Phalguni", 6.0, birth)
    assert len(dashas) == 9, f"Should have 9 dashas, got {len(dashas)}"
    # First dasha lord should be Sun (Uttara Phalguni's lord)
    assert dashas[0]["lord"] == "Sun"
    # Sequence should follow Vimshottari order
    expected_order = ["Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", "Ketu", "Venus"]
    for i, dasha in enumerate(dashas):
        assert dasha["lord"] == expected_order[i], f"Dashas[{i}]: expected {expected_order[i]}, got {dasha['lord']}"
    # Each dasha has start/end dates
    for dasha in dashas:
        assert "start" in dasha
        assert "end" in dasha
        assert dasha["years"] > 0


def test_bhukti():
    """Sub-period (bhukti) calculation."""
    from backend.dasha import calculate_bhukti
    bhuktis = calculate_bhukti("Saturn", datetime(2014, 1, 1), 19)
    assert len(bhuktis) == 9
    # First bhukti lord should be Saturn itself
    assert bhuktis[0]["lord"] == "Saturn"
    # Total bhukti years should approximately equal maha dasha years
    total_years = sum(b["years"] for b in bhuktis)
    assert abs(total_years - 19) < 0.1, f"Total bhukti should be ~19yr, got {total_years}"


def test_current_dasha():
    """Current dasha for a known date."""
    from backend.dasha import get_current_dasha
    birth = datetime(1996, 3, 6)
    # Rahu Maha Dasha should be active ~2016-2034 for Uttara Phalguni Moon
    current = get_current_dasha(birth, "Uttara Phalguni", 6.0, datetime(2026, 8, 17))
    assert current["maha_dasha"] is not None
    assert current["maha_dasha"]["lord"] in ["Saturn", "Rahu", "Jupiter"]
    assert current["bhukti"] is not None


def test_dasha_themes():
    """Theme functions return non-empty strings."""
    from backend.dasha import get_sign_theme, get_nakshatra_theme, get_dignity_theme
    assert len(get_sign_theme("Aries")) > 10
    assert len(get_nakshatra_theme("Ashwini")) > 10
    assert len(get_dignity_theme("exalted")) > 10
    assert get_sign_theme("Unknown") == "Unknown"
    assert get_nakshatra_theme("Unknown") == "Unknown"


# ═══════════════════════════════════════════════════════════════════════════════
# SYNASTRY TESTS
# ═══════════════════════════════════════════════════════════════════════════════

def test_synastry_aspects():
    """Synastry aspect calculation between two charts."""
    from backend.engine import calculate_full_chart
    from backend.synastry import calculate_synastry
    chart1 = calculate_full_chart("Kamel", 1996, 3, 6, 14, 0)
    chart2 = calculate_full_chart("Kheireddine", 1992, 10, 4, 18, 0)
    syn = calculate_synastry(chart1, chart2)
    assert "aspects" in syn
    assert isinstance(syn["aspects"], list)
    for asp in syn["aspects"]:
        assert "planet1" in asp
        assert "planet2" in asp
        assert "type" in asp


# ═══════════════════════════════════════════════════════════════════════════════
# TRANSITS TESTS
# ═══════════════════════════════════════════════════════════════════════════════

def test_transit_positions():
    """Transit planetary positions for current date."""
    from backend.engine import calculate_planetary_positions
    # Test that positions can be calculated for any date
    pos = calculate_planetary_positions(2026, 8, 17, 12, 0)
    assert "Sun" in pos
    assert "Moon" in pos
    assert pos["Sun"]["sign"] in ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                                   "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]


# ═══════════════════════════════════════════════════════════════════════════════
# DATA FILE TESTS
# ═══════════════════════════════════════════════════════════════════════════════

def test_chart_generation():
    """generate.py produces valid JSON files."""
    chart_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'data', 'chart.json')
    if os.path.exists(chart_path):
        with open(chart_path) as f:
            data = json.load(f)
        assert 'planets' in data or 'chart' in data or 'natal' in data


def test_family_generation():
    """Family JSON is valid and has members."""
    family_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'data', 'family.json')
    if os.path.exists(family_path):
        with open(family_path) as f:
            data = json.load(f)
        assert isinstance(data, (dict, list))


def test_spiritual_content_exists():
    """Spiritual content files are present."""
    spiritual_dir = os.path.join(os.path.dirname(__file__), '..', 'spiritual')
    if os.path.exists(spiritual_dir):
        files = os.listdir(spiritual_dir)
        assert len(files) > 0, "Spiritual directory is empty"


def test_frontend_files_exist():
    """Core frontend files are present."""
    frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    assert os.path.exists(os.path.join(frontend_dir, 'index.html'))
    assert os.path.exists(os.path.join(frontend_dir, 'js', 'app.js'))
    assert os.path.exists(os.path.join(frontend_dir, 'css', 'style.css'))


def test_frontend_js_modules():
    """All JS modules exist."""
    js_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'js')
    required = ['app.js', 'hifdh-engine.js', 'quran-ai-study.js', 'quran-audio.js',
                 'chart-engine.js', 'chart.js', 'verses.js', 'lunar.js', 'practice.js']
    for module in required:
        path = os.path.join(js_dir, module)
        assert os.path.exists(path), f"Missing JS module: {module}"


if __name__ == '__main__':
    import pytest
    pytest.main([__file__, '-v'])
