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
cd C:\Users\Admin\Projects\active\mahi-spiritual

# Calculate a chart
python -m backend.cli chart Kamel

# Family overview
python -m backend.cli family

# Synastry between two members
python -m backend.cli synastry Kamel Father

# Current transits
python -m backend.cli transits

# Dasha timing
python -m backend.cli dasha Kamel

# Research patterns
python -m backend.cli research

# Generate report
python -m backend.cli report Kamel
python -m backend.cli report family
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

## Generate JSON for Frontend

```bash
cd C:\Users\Admin\Projects\active\mahi-spiritual\backend
python generate.py
```

This creates JSON files in `../frontend/data/`:
- `chart.json` — Kamel's complete natal chart
- `family.json` — All family member charts
- `dasha.json` — Kamel's dasha timeline
- `transits.json` — Current transits for all members

---

## Requirements

- Python 3.9+
- skyfield
- numpy

---

*System built with skyfield for accurate astronomical calculations.*
*Lahiri ayanamsa for sidereal conversions.*
*All 8 family members supported.*

#family-astrology #system #v2 #infrastructure