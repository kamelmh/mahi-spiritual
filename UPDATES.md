# Project: MAHI Spiritual System
> Astro-Quranic integration, Vedic astrology, spiritual practice

## How to Use
When starting a session in this project, read this file first.
When finishing work, append an entry below.

## Recent Changes

### 2026-08-14 — Canonical Chart + Dasha Alignment Patch
- **What:** Made the astrology engine and the generated `dasha.json` self-consistent and auditable. Birth time for Kamel corrected 12:47 → 14:00 (matches documented/rectified time in `FAMILY_RECALCULATION_2026` and `engine.py` test block).
- **Files:** `backend/engine.py`, `backend/generate.py`
- **Root bug:** `generate.py` hardcoded `moon_nakshatra="Hasta"` / `moon_degree=15.67`, which (a) disagreed with the engine-computed Moon (Uttara Phalguni), and (b) produced a **negative -1.75-year balance** and an impossible timeline ending in 1994 (pre-birth).
- **Fix:** Dashas are now derived **live** from `calculate_planetary_positions` → `get_nakshatra`, so `chart.json` and `dasha.json` can never drift.
- **Canonical chart (skyfield + de421 + Lahiri):** Moon = Virgo 6.4° Uttara Phalguni (lord Sun). **Current Mahadasha = Rahu (2014–2032); Bhukti = Venus (2026-05 → 2029-05).** Next Mahadasha = Jupiter (~2033).
- **IMPACT / BREAKING:** This **changes the timing narrative**. The previously-documented "Mercury Mahadasha → Ketu 2028" story (from `10_Personal_Timing_System.md`, Moon-in-Anuradha) is **not reproduced** by the live engine. The Moon is in Uttara Phalguni, not Anuradha. See "Discrepancy note" below — the owner must choose which Moon is authoritative before treating timing docs as ground truth.
- **Alerts for other projects:** Astro-Quranic integration files `LUNAR_RECITATION_SCHEDULE.md` and `spiritual-content.json` reference "prepare for Ketu Mahadasha 2028". The live engine says Ketu Mahadasha does not occur until ~2084; the nearest real transition is the Venus→Jupiter bhukti/Maha boundary ~2029–2033. Update the schedule's framing. Family-astrology docs (`FAMILY_KARMIC_PATTERNS`, `FAMILY_SYNESTRY`) also use the Anuradha/Scorpio Moon and Pluto (engine computes no Pluto) — reconcile before syncing to LifeWorkspace. None of these are breaking the build; they are analytical-narrative only.

#### Discrepancy note (chart versions)
Two Moon positions appear across the docs:
- **Version B (canonical, engine-verified):** Virgo 6.4° Uttara Phalguni (lord Sun) → dasha = Moon→Sun start, Rahu current. Matches `KAMEL_WHOLE_SIGN_CORRECTED.md`, `FAMILY_RECALCULATION_2026.md`, and `backend/` engine output. Reproducible by anyone with `python -m backend.generate`.
- **Version A (Anuradha narrative):** Moon Scorpio 5°49' Anuradha (lord Saturn) → dasha = Saturn→Mercury current → Ketu 2028. Found in `10_Personal_Timing_System.md`, `08_Key_Findings_Summary.md`, and `LUNAR_RECITATION_SCHEDULE.md`. NOT reproducible by the current engine; likely sourced from an earlier Astro.com sidereal run or a rectified time that differs from 14:00.
A 60° gap separates the two positions. Decision required from the owner before regenerating timing docs.

### 2026-08-14 - Timing Narrative Pass 3: Re-author Ketu->Jupiter + Discrepancy Found
- **What:** (a) Re-authored the remaining Ketu-*Mahadasha-2028 transition advice* into Jupiter-expansion guidance; (b) added precision notes preventing conflation of natal/transiting Ketu with Ketu Mahadasha; (c) surfaced a chart-level discrepancy in the Drive transit calendar.
- **Files:** `astrologyworkspace/AstrologyWorkspace/{10,16,18,21}_*.md`; `UPDATES.md` (this entry).
- **Advice re-author (Version B):** File `10` prep-bullet + Window-5 "Best For" and File `16` relationship-next-phase bullets were reframed from Ketu-dissolution language ("detachment/transcendence/spiritual awakening/Pisces themes") to Jupiter language ("expansion through teaching," "wisdom teaching and global reach," "growth through teaching," "expansive partnerships"). These now correctly sit under the Jupiter-Mahadasha (2032-10-22) headers already applied in Pass 2.
- **Precision notes (engine-verified):** Ran the engine with the real birth record (`backend/engine.py FAMILY_MEMBERS["Kamel"]` = 1996-03-06 14:00, Algiers 33.06/1.00). **Natal Ketu = Pisces 25°17' Revati** (sidereal 355.17°). Therefore the repo docs' "Ketu in Pisces" natal/transiting-planet readings (files 18, 21) were ALREADY correct — NOT Version-A errors — and were retained with clarifying tags: file 18 ("Ketu transiting D9 12th (Pisces) ... separate from Ketu Mahadasha 2084-2091") and file 21 (banner: natal/transiting Ketu-in-Pisces ≠ Ketu Mahadasha). This corrects an earlier mis-interpretation that flagged those sections for change.
- **DISCREPANCY FOUND (engine vs Drive transit calendar):** `C:\Users\Admin\My Drive\LifeWorkspace\13_Spiritual\06_TRANSIT_TIMING_CALENDAR.md` was built on a **different chart** than `backend/engine.py`/`frontend/data/chart.json`:
  - Natal Ketu: Drive says "Aquarius 6°16' (8th house, Dhanishta)"; engine says **Pisces 25°17' Revati**.
  - Natal Moon: Drive says "Virgo 15°50' Hasta"; engine says **Virgo 6.38 Uttara Phalguni**.
  - ASC: Drive says Gemini 3°21'; chart.json `houses` are an equal-house placeholder (all cusps 3°05', ~Cancer Lagna) — not a trustworthy Lagna, so Ketu's *house* could not be confirmed.
  - Sun matches (~Aquarius 22°), but Moon + Rahu/Ketu disagree, so the two charts are not reconcilable by a single time shift.
- **Decision (NOT made — needs owner):** Do NOT piecoil-edit the Drive calendar's natal-Ketu line while Moon/ASC/Rahu also mismatch (would inject misinformation). Pending owner choice: (1) regenerate `06_...` from `backend/transits.py` + engine positions; (2) apply only the engine-verified single-field corrections and mark house TBD; or (3) leave the Drive calendar as-is (its transit-event dates may still be approximately right on other grounds) and treat it as a separate manual artifact.
- **Left for per-file review (untouched):** `astrologyworkspace/.../FAMILY/*.md`, `docs/family/KHEIREDDINE_CHART.md` — multi-native synastry ("Kamel AND Kheireddine enter Ketu 2028"); safe to blanket-replace only with owner sign-off on Kheireddine's own chart.
- **Verification:** `npm run build` -> BUILD SUCCEEDED; `npm test` -> All tests passed; engine re-run reproduces `dasha.json` (Moon UP, Rahu Maha 2014-32, Venus bhukti current, Jupiter 2032, Ketu 2084).
- **Impact / breaking:** Documentation-only. No engine or code change since the last patch.
- **Alerts for other projects:** Spiritual-teaching platform: if the `06_...` calendar is regenerated from the engine, the 2028 "Expansion Year / Jupiter in 5th + Ketu-Jupiter conjunction" transit items should be re-derived from engine transits rather than hand-assumed; flag to `lifeworkspace-teaching-platform/pilot/UPDATES.md` if adopted.

### 2026-08-14 - Timing Narrative Pass 2: Kamel-only Dasha Docs (Version B)
- **What:** Reframed the objective dasha fact spine across all 8 Kamel-only timing docs so the on-disk narrative matches `frontend/data/dasha.json` (Version B).
- **Files:** `astrologyworkspace/AstrologyWorkspace/{10,11,15,16,17,18,21}_*.md` + `README.md`.
- **What changed (facts):** "Mercury Mahadasha (2011-2028)" -> "Current Mahadasha: Rahu (2014-2032), Venus bhukti (2026-05->2029-05)"; "Ketu Mahadasha (2028-2035)" -> "Jupiter Mahadasha (2032-10-22 -> 2048-10-22)"; "Mercury->Ketu transition (2028)" -> "Rahu->Jupiter threshold (2032-10-22)".
- **What was deliberately preserved:** all calendar/transit months (Saturn in Aries Feb 2026-Apr 2028; North Node in Aquarius Jul 2026-Mar 2028; Phase 4 Jan-Jun 2028; Age 31/32 profection years) and all natal-placement bullet advice — these are transit/profection facts, not dasha-derived, and remain correct.
- **What was deliberately NOT re-authored:** Ketu-specific spiritual-dissolution / past-life-relationship *prediction advice* is **annotated** (e.g. "Ketu Mahadasha is 2084") rather than rewritten, to avoid fabricating Jupiter-appropriate guidance. Owner re-authoring that advice under Jupiter's expansion theme is still open.
- **Left for per-file review (untouched):** `astrologyworkspace/.../FAMILY/*.md` and `docs/family/KHEIREDDINE_CHART.md` — they blend Kamel + Kheireddine synastry ("both enter Ketu 2028") and must not be blanket-replaced (see Kheireddine caveat).
- **Verification:** `npm run build` -> BUILD SUCCEEDED; `npm test` -> All tests passed; grep confirms no standalone Version-A dasha fact labels remain in the 8 files; Kheireddine/family synastry Ketu-2028 claims retained unchanged.
- **Impact / breaking:** Documentation-only; no code or engine change.
- **Alerts for other projects:** None.

### 2026-08-14 - Dasha-Timing Narrative Reframed (Version B)
- **What:** Reframed the two requested narrative refs to engine-verified `frontend/data/dasha.json` timing: Rahu Maha (2014-10-23 -> 2032-10-22), **Venus bhukti (2026-05-12 -> 2029-05-12, current)**, Jupiter Maha begins **2032-10-22**; Ketu Maha is 2084, not 2028.
- **Files:** `spiritual/spiritual-content.json`, `spiritual/LUNAR_RECITATION_SCHEDULE.md` (build.py also copies both to `frontend/data/` and `frontend/docs/spiritual/`).
- **Changes:** "prepare for Ketu Mahadasha (2028)" -> "deepen practice within the Venus bhukti (current, through May 2029) of the Rahu Mahadasha; Jupiter Mahadasha begins 2032-10-22".
- **Verification:** `npm run build` -> BUILD SUCCEEDED; regenerated `frontend/data/spiritual-content.json` is valid JSON; no Version-A Ketu-2028 ref remaining in either output; backend `npm test` green.
- **Impact / breaking:** Narrative-only; no engine or code behavior change. The Aug 13 - Sep 11, 2026 recitation campaign now correctly sits inside the Venus bhukti of Rahu Maha.
- **Out of scope (per-file review needed):** ~20 other docs still use Version A (`astrologyworkspace/AstrologyWorkspace/{10,11,15,16,17,18,20,21}_*.md`, `docs/family/KHEIREDDINE_CHART.md`, family synastry docs). A blanket find/replace is **unsafe**: several assert a cross-native synastry pattern ("Kamel AND Kheireddine enter Ketu 2028"), which is a multi-native observation, not a single-native timing bug. Flagged. See below.
- **Alerts for other projects:** None (narrative-only; backend unaffected).

### 2026-08-14 — Dashboard Dormant-Engine Revival (frontend)
- **What:** Salvaged and wired the dormant `recitation-engine.js` (MAHI dhikr counters), which was loaded by `index.html` but had **zero live callers** — the Daily Practice page showed method text only (no counters) and the dashboard `#totalRecitations` badge never updated.
- **Files:** `frontend/js/app.js`, `frontend/index.html`
- **Changes:**
  - `initDashboard()` (app.js:64) now calls `RecitationEngine.init()` and syncs the StateManager-sourced recitation total into `AppState.practice.totalRecitations`, so the dashboard badge (index.html:168) reflects real counts after navigation. This bridges the pre-existing dual-state split (AppState `practice` ↔ StateManager `mahi_state`).
  - `initDailyPractice()` (app.js:501) now calls `RecitationEngine.renderAllVerses('mahiVersesGrid')`, injecting the 6 interactive verse cards (Yunus ×100, Ar-Rahman, Al-Qalam, Ya Hafiz, Ya Rahman, Ya Alim) with live counters + progress bars + target-reach notifications. CSS already present in `enhanced.css`.
  - Added card with `<div id="mahiVersesGrid">` on the Daily Practice page (index.html:843-852).
- **Pruning:** Removed dormant `chart-engine.js` from the script load block (superseded by `chart.js`'s `createEnhancedChartWheel` — Natal Chart page already live with D1/D9/D10 views). Archived orphaned `frontend/js/{app-enhanced.js, astro-connector.js, vedx-compat.js}` → `frontend/js/archive/` (never loaded by index.html).
- **Impact / breaking:** Drops one dead HTTP request; no API or Natal Chart behavior change. Recitation counts now persist via `mahi_state` localStorage and increment the live badge on recite. No breaking changes for sibling projects.
- **Alerts for other projects:** None. Backend/astro engine unchanged (Version A/B timing discrepancy above remains a narrative-only item pending owner decision).

### 2026-08-08 — Vedic Astrology Transits Analysis
- **What:** Father's chart analysis, synastry with Zohra, father wound healing recommendations
- **Files:** Analysis output
- **Impact:** Personal spiritual guidance
- **Alerts for other projects:** None

### 2026-08-15 — Family + Drive-Calendar Version-B Completion (engine-verified, both brothers)
- **Engine ground truth:** Kamel b. 1996-03-06 14:00 Algiers: **Lagna Gemini 21°31' (Whole Sign, canonical per KAMEL_WHOLE_SIGN_CORRECTED.md)**; Moon Virgo 6°23' Uttara Phalguni, **Ketu Pisces 25°17' Revati -> 10th house (Gemini Lagna)**; Dasha = Rahu Maha 2014-2032 (Venus bhukti current), Jupiter Maha 2032-10-22, **Ketu Maha 2084-2091**. NOTE: engine `calculate_houses` only emits a degenerate equal-house fallback (all 12 cusps at 3°05') because `pyswisseph` is not installed - its "Cancer Lagna" is a non-authoritative fallback, NOT the Lagna. Kheireddine b. 1992-10-04 18:00: Moon Capricorn Uttara Ashadha -> **Rahu Maha 2013-11->2031-11** (Ketu Maha ~2083-11). -> His "Ketu 2028" claim is false (he is in Rahu). This *confirms* the repo's "Ketu in Pisces" natal readings are valid (kept + annotated) and *invalidates* every "both enter Ketu 2028" family-doc claim.
- **Files:** reframed all "Ketu Mahadasha 2028/2028-2035/Oct 2028/Mercury-Ketu 2028" claims in `docs/family/KHEIREDDINE_CHART.md` + 5 `FAMILY/*.md` -> Jupiter transition (2031-2032) / Ketu 2084 / ~2083. Corrected Drive `13_Spiritual/06_..._TIMING_CALENDAR.md` natal block (Moon Hasta->UP, Ketu Aquarius-Dhanishta-8th -> Pisces 25d17m Revati, ASC Gemini 21d31m Whole Sign) + banner. Transit-house numbers were already Gemini-Lagna-based (correct), left intact.
- **House-number resolution:** Lagna = Gemini 21d31m (Whole Sign); Ketu (Pisces) = 10th house - repo's original value confirmed. Engine `calculate_houses` degenerate-cusp bug (pyswisseph missing) filed as a separate engine issue.
- **Verification:** `python tests/test_backend.py` -> All tests passed; `npm run build` -> BUILD SUCCEEDED; final grep CLEAN.
- **Impact / breaking:** Narrative + Drive-calendar only; no engine/dashboard code change.
- **Alerts for other projects:** Spiritual-teaching platform - Drive `06_...` transit houses are correct under Whole-Sign Gemini Lagna (no action); surface the engine `calculate_houses` degenerate-cusp bug separately.

## Pending Work
- [x] Reconcile family synastry Ketu-2028 language — DONE (both brothers; version-B reframed)
- [x] Resolve Drive `13_Spiritual/06_...` transit-calendar natal block — DONE (ASC Gemini restored, Moon->UP, Ketu->Pisces Revati 10th + banner)
- [x] Kamel natal positions + dasha timing reconciled to Version B — DONE
- [X] Ketu house number resolved — Ketu = 10th house (Whole-Sign Gemini Lagna, per KAMEL_WHOLE_SIGN_CORRECTED.md); engine calculate_houses degenerate-cusp bug filed
- [ ] Fix engine `calculate_houses` to use a real house system (install pyswisseph or skyfield-based ASC/cusps) — engine issue
- [ ] Family astrology data collection
- [ ] Web dashboard live deployment

---
*Last updated: 2026-08-15*
