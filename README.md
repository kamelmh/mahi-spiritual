# MAHI Spiritual System

Personal spiritual practice dashboard combining Vedic astrology, Quranic practice, and Islamic spirituality.

## Quick Start

**Live:** https://mahi-spiritual.netlify.app

**Local Development:**
```bash
cd C:\Users\Admin\Projects\active\mahi-spiritual

# Generate data files
python -m backend.generate

# Start local server
cd frontend
python -m http.server 8080

# Open in browser
http://localhost:8080
```

## Pages

| Page | Purpose |
|------|---------|
| Dashboard | Overview of all systems |
| Soul Blueprint | Core spiritual identity |
| Natal Chart | Vedic astrology chart |
| Quranic Verses | 34 core verses with Arabic |
| Surah Library | All 114 surahs |
| Destiny Map | Life purpose analysis |
| Daily Practice | MAHI Method schedule |
| Lunar Calendar | Moon phases, Hijri dates |
| Emergency | Quick reference for urgent situations |
| Ruqya Guide | Ben Halima methodology |
| Advanced Ruqya | Full Ruqya guide (ruqya.html) |

## Architecture

```
GitHub → Netlify (auto-deploy)
              ↓
Static HTML/JS/CSS + JSON data
              ↓
Python backend (generates JSON)
```

## Data Files

- `chart.json` — Natal chart (planets, houses, yogas)
- `family.json` — 8 family members' charts
- `dasha.json` — Vimshottari dasha periods
- `transits.json` — Current planetary transits
- `verses.json` — 114 surahs + 34 core verses
- `practice.json` — Daily practice schedule
- `spiritual-content.json` — 39 spiritual topics

## Offline Support

The app works offline after first visit (service worker caches all assets).

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS (no framework)
- **Backend:** Python + skyfield (astrology calculations)
- **Data:** Static JSON files
- **Deploy:** Netlify (free tier)
- **Audio:** Al Quran Cloud API

## Maintenance

**Update chart data:**
```bash
python -m backend.generate
git add -A && git commit -m "update chart data" && git push
```

**Add new verses:** Edit `frontend/data/verses.json`

**Add new pages:** Create HTML in `frontend/`, add nav item in `index.html`

---

**Owner:** MAHI Kamel Abdelghani
**Last Updated:** 2026-08-03
