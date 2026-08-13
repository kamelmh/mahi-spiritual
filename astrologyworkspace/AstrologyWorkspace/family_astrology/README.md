# Family Astrology System v2.0

> **Smart Investigation System & Research Copilot**
> **Last Updated:** 2026-07-28
> **Status:** COMPLETE — All 8 members, accurate calculations

---

## System Overview

| Component | Module | Purpose |
|-----------|--------|---------|
| **Engine** | `engine.py` | Core sidereal calculations via skyfield |
| **Dasha** | `dasha.py` | Vimshottari timing system |
| **Synastry** | `synastry.py` | Relationship analysis |
| **Transits** | `transits.py` | Current planetary movements |
| **Research** | `research_copilot.py` | Pattern detection & insights |
| **Report** | `report.py` | Comprehensive report generation |
| **CLI** | `cli.py` | Command-line interface |

---

## Quick Start

```powershell
# Navigate to workspace
cd C:\Users\Admin\AstrologyWorkspace

# Calculate a chart
python -m family_astrology.cli chart Kamel

# Family overview
python -m family_astrology.cli family

# Synastry between two members
python -m family_astrology.cli synastry Kamel Father

# Current transits
python -m family_astrology.cli transits

# Dasha timing
python -m family_astrology.cli dasha Kamel

# Research patterns
python -m family_astrology.cli research

# Generate report
python -m family_astrology.cli report Kamel
python -m family_astrology.cli report family
```

---

## Family Members

| Member | Birth | Sun | Moon | Key Feature |
|--------|-------|-----|------|-------------|
| **Kamel** | Mar 6, 1996, 14:00 | Aquarius 22° | Virgo 6° | Subject, Gemini Rising |
| **Kheireddine** | Oct 4, 1992, 18:00 | Virgo 18° | Capricorn 1° | Brother, Virgo Rising |
| **Ikram** | Sep 8, 1998, 08:00 | Leo 22° | Pisces 17° | Sister, Virgo Rising |
| **Ghofran** | Sep 27, 2024, ~05:00 | Virgo 10° | Cancer 9° | Half-sister |
| **Zohra** | Dec 1, 1972, noon | Scorpio 16° | Virgo 29° | Mother |
| **Father** | Mar 31, 1961, noon | Pisces 17° | Virgo 9° | Father (rectified) |
| **Oumkeltoum** | Aug 4, 1994, noon | Cancer 18° | Gemini 13° | Step-mother (corrected) |
| **Sara** | May 24, 2004, 06:30 | Taurus 10° | Cancer 5° | Oumkeltoum's sister |

---

## Key Corrections Made

### Oumkeltoum (August 4, 1994)
**Previous (WRONG) Positions:**
- Sun: Pisces 21°18' ❌
- Mars: Cancer 0°14' (debilitated) ❌
- Jupiter: Cancer 12°47' (exalted) ❌

**Corrected Positions (via skyfield):**
- Sun: Cancer 18°06' Ashlesha ✓
- Mars: Taurus 28°06' Mrigashira ✓ (NOT debilitated)
- Jupiter: Libra 12°36' Swati ✓ (NOT exalted)
- Venus: Virgo 2°54' Uttara Phalguni (debilitated)
- Saturn: Aquarius 17°12' Shatabhisha (own sign!)

**Key Yoga:** Moon-Mercury Exchange (Moon in Gemini, Mercury in Cancer)

### Father (March 31, 1961)
- Confirmed via ephemeris: Sun Pisces 17°38' Purva Bhadra
- Same nakshatra as Kamel's Sun — teaching fire inheritance

---

## System Capabilities

### 1. Core Engine (`engine.py`)
- Accurate sidereal positions via skyfield ephemeris
- Lahiri ayanamsa conversion
- Nakshatra calculations (27 mansions, 4 padas)
- Planetary dignity detection
- Aspect calculations (Vedic + special)
- Yoga detection (conjunctions, exchanges, neecha bhanga)

### 2. Dasha Timing (`dasha.py`)
- Vimshottari dasha sequence calculation
- Balance of dasha at birth
- Bhukti (sub-period) calculations
- Current dasha identification
- Transit predictions per dasha lord

### 3. Synastry Engine (`synastry.py`)
- Inter-chart aspect calculations
- Compatibility scoring (0-100)
- Composite chart (midpoint)
- Karmic connection detection
- Family synastry matrix

### 4. Transit Tracker (`transits.py`)
- Current planetary positions
- Transit-natal aspect analysis
- Weekly family transit forecasts
- Family-wide transit themes
- Member-specific transit predictions

### 5. Research Copilot (`research_copilot.py`)
- Elemental balance analysis
- Nakshatra cluster detection
- Rahu-Ketu axis mapping
- Saturn/Jupiter/Mars pattern detection
- Generational theme analysis
- Smart investigation question generation

### 6. Report Generator (`report.py`)
- Individual member reports
- Family summary reports
- Synastry reports
- Transit reports

---

## Current Transits (July 28, 2026)

| Planet | Sign | Degree | Nakshatra |
|--------|------|--------|-----------|
| Sun | Cancer | 11.3° | Pushya |
| Moon | Sagittarius | 29.7° | Uttara Ashadha |
| Mercury | Gemini | 23.1° | Punarvasu |
| Venus | Leo | 26.3° | Purva Phalguni |
| Mars | Taurus | 26.5° | Mrigashira |
| Jupiter | Cancer | 12.0° | Pushya |
| Saturn | Pisces | 20.5° | Purva Bhadra |
| Rahu | Aquarius | 6.9° | Dhanishta |
| Ketu | Leo | 6.9° | Magha |

**Family Themes:**
- Saturn transiting Pisces — responsibility and spiritual structure
- Jupiter transiting Cancer — expansion through nurturing
- Rahu transiting Aquarius — karmic lessons in innovation

---

## Files Structure

```
C:\Users\Admin\AstrologyWorkspace\
├── family_astrology/
│   ├── __init__.py          # Package init
│   ├── engine.py            # Core calculation engine
│   ├── dasha.py             # Vimshottari dasha system
│   ├── synastry.py          # Relationship analysis
│   ├── transits.py          # Transit tracking
│   ├── research_copilot.py  # Pattern detection
│   ├── report.py            # Report generation
│   └── cli.py               # CLI interface
├── charts/
│   └── FAMILY/
│       ├── chart_kamel.json
│       ├── chart_kheireddine.json
│       ├── chart_ikram.json
│       ├── chart_ghofran.json
│       ├── chart_zohra.json
│       ├── chart_father.json
│       ├── chart_oumkeltoum.json (CORRECTED)
│       ├── chart_sara.json
│       ├── MASTER_FAMILY_CALCULATIONS.md
│       ├── DEEPER_FAMILY_INSIGHTS.md
│       └── ... (other analysis files)
└── *.md                     # Analysis documents
```

---

## Next Steps

1. **Verify Moon positions** — Current positions differ from previous estimates (ephemeris vs manual)
2. **Collect missing birth times** — Father, Zohra, Oumkeltoum (house placements unknown)
3. **Build AstroDashboard integration** — Connect this engine to the web dashboard
4. **Add hora chart** — Electional astrology for family decisions
5. **Add prashna** — Question charts for specific inquiries

---

*System built with skyfield for accurate astronomical calculations.*
*Lahiri ayanamsa for sidereal conversions.*
*All 8 family members supported.*

#family-astrology #system #v2 #infrastructure
