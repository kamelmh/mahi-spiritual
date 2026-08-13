# MAHI Spiritual System — Personal PRD

**Owner:** MAHI Kamel Abdelghani
**Purpose:** Personal spiritual practice dashboard
**Audience:** Me only (not public)
**Last Updated:** 2026-08-03

## What This App Does

A single-page web app that combines:
1. **Vedic Astrology** — Natal chart, planetary positions, houses, yogas, dashas
2. **Family Astrology** — 8 family members' charts with synastry and patterns
3. **Quranic Practice** — 34 core verses with Arabic, transliteration, translation
4. **Surah Library** — All 114 surahs with meanings
5. **Ruqya Guide** — Ben Halima methodology (3 stages, emergency protocols)
6. **Lunar Calendar** — Moon phases, Hijri dates, Islamic months
7. **Daily Practice** — MAHI Method (Fajr, ASR, Maghrib, Isha schedules)
8. **Spiritual Content** — 39 topic files on Islamic spirituality

## My Daily Use

| Time | Page | Action |
|------|------|--------|
| Fajr | Daily Practice | Yunus dhikr × 100 |
| After Fajr | Quranic Verses | Read morning verses |
| ASR | Daily Practice | Al-Qalam writing |
| Maghrib | Quranic Verses | Ar-Rahman recitation |
| Isha | Daily Practice | Evening adhkar |
| Anytime | Ruqya Guide | Emergency reference |
| Weekly | Natal Chart | Check transits |

## What Matters (Personal Priority)

1. **Fast** — loads in <2 seconds on my phone
2. **Works offline** — I use it in areas with poor signal
3. **Arabic text correct** — proper rendering, no tofu boxes
4. **Audio works** — Quran recitation plays reliably
5. **Mobile-first** — I mostly use it on my phone
6. **Dark mode** — always (eye comfort)
7. **No bloat** — nothing I don't use

## What Doesn't Matter (Personal)

- SEO (not public)
- Analytics (I know what I use)
- Accessibility (I'm the only user)
- Social sharing
- Multiple languages (I know Arabic/English/French)
- User authentication (single user)
- Database (static JSON files)

## Architecture

```
GitHub (kamelmh/mahi-spiritual)
    ↓ push
Netlify (auto-deploy)
    ↓ serves
Static HTML/JS/CSS + JSON data
    ↓ reads
Python backend (generates JSON at build time)
```

## Tech Stack (Keep Simple)

- **Frontend:** Vanilla HTML/CSS/JS (no framework needed)
- **Backend:** Python (skyfield for astrology calculations)
- **Data:** JSON files (generated, not queried)
- **Deploy:** Netlify (free tier, auto-deploy from GitHub)
- **Audio:** Al Quran Cloud API (free, no auth)

## Success Criteria

- [ ] I use it daily without frustration
- [ ] All 15+ pages render correctly
- [ ] Arabic text displays properly
- [ ] Audio plays on first tap
- [ ] Works offline after first load
- [ ] Loads in <2 seconds
- [ ] No JavaScript errors in console

## Future Enhancements (If Needed)

1. **PWA install** — add to home screen on phone
2. **Offline caching** — service worker for full offline
3. **Custom themes** — beyond dark mode
4. **Export** — print charts/verses as PDF
5. **Family sharing** — share specific charts with family members
6. **Reminders** — notification for prayer times
7. **Journal** — daily spiritual journal entry
8. **Progress tracker** — track dhikr counts, reading progress
