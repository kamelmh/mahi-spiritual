# CLEANUP_PLAN.md — Workspace Consolidation Plan

**Created:** 2026-08-03  
**Status:** PLAN ONLY — No deletions have been performed  
**Monorepo:** `C:\Users\Admin\Projects\active\mahi-spiritual\`

## 1. Current State Summary

### Old Workspaces Audited
| Workspace | Location | Size | Status |
|-----------|----------|------|--------|
| AstroDashboard | `C:\Users\Admin\AstroDashboard\` | ~16 MB | Not serving (port 8000 free) |
| AstrologyWorkspace | `C:\Users\Admin\AstrologyWorkspace\` | ~17 MB | Contains analysis MDs + Python scripts |
| LifeWorkspace/13_Spiritual | `C:\Users\Admin\My Drive\LifeWorkspace\13_Spiritual\` | ~8.7 MB | Obsidian vault folder |
| LifeWorkspace/12_Astrology | `C:\Users\Admin\My Drive\LifeWorkspace\12_Astrology\` | ~328 KB | Obsidian vault folder + charts |

### Monorepo Coverage
| Component | In Monorepo? | Notes |
|-----------|--------------|-------|
| AstroDashboard frontend | ✅ | `frontend/` (index.html, css, js, manifest, sw) |
| AstroDashboard backend | ✅ | `backend/` (Python API) |
| Family chart MDs | ✅ | `docs/family/` (10 chart MDs) |
| Spiritual MDs | ✅ | `spiritual/` (39 files including PDF) |
| de421.bsp | ✅ | Root directory (16 MB) |
| Analysis MDs (01-25) | ❌ | NOT in monorepo |
| Standalone Python scripts | ❌ | NOT in monorepo |
| AstroDashboard unique pages | ❌ | quran-moon.html, dhikr/ app, etc. |
| Chart images | ❌ | NOT in monorepo |
| Duplicate PDFs | ❌ | NOT in monorepo |

---

## 2. Detailed Audit Results

### 2.1 AstroDashboard (`C:\Users\Admin\AstroDashboard\`)
**Unique files NOT in monorepo:**
- `quran-moon.html` — Detailed Quran-Moon design
- `quran-moon-poster.html` — Simple poster version
- `dhikr/` — Complete dhikr app (index.html, app.js, style.css, manifest, sw)
- `ANALYSIS.md`, `ENHANCEMENT_SUMMARY.md` — Documentation
- `create-shortcut.ps1`, `deploy.ps1`, `launch-server.vbs`, `launch.bat`, `start-hidden.bat`, `start-server.ps1` — Launcher scripts
- `test-astrodashboard.mjs` — Test file
- `data/` — Data directory (need to check contents)
- `css/` — May have unique styles
- `js/` — May have unique scripts

**No unique assets found** — `assets/fonts/` and `assets/images/` are empty.

### 2.2 AstrologyWorkspace (`C:\Users\Admin\AstrologyWorkspace\`)
**Analysis MDs NOT in monorepo docs/:**
- `01_Birth_Chart_Analysis.md` through `25_Daily_Practice_Timing.md` (25 files)
- `FAMILY_Houses_Complete.md`, `FAMILY_Houses_Verified.md`, `FAMILY_RECALCULATION_2026.md`, `FAMILY_WholeSign_Corrected.md`, `KAMEL_WHOLE_SIGN_CORRECTED.md`
- `README.md`

**Python scripts NOT in monorepo backend/:**
- `calculate_all_houses.py` — Standalone house calculation script
- `calculate_verified_houses.py` — Verified house calculations
- `kamel_whole_sign.py` — Whole sign house system script
- `family_astrology/` — Full Python package (likely source for backend/)

**de421.bsp:** Present (16 MB) — duplicate of monorepo copy.

### 2.3 LifeWorkspace/13_Spiritual (`C:\Users\Admin\My Drive\LifeWorkspace\13_Spiritual\`)
**All MDs appear to be in monorepo spiritual/:** 39 files including `Mushabihat_Quran_Complete.pdf`.

**Missing from monorepo:** None detected — full migration appears complete.

### 2.4 LifeWorkspace/12_Astrology (`C:\Users\Admin\My Drive\LifeWorkspace\12_Astrology\`)
**Files NOT in monorepo docs/family/:**
- `00-MOC-Astrology.md` — Map of Content
- `12_Astrology.md` — Section overview
- `AstroDashboard.md` — Dashboard documentation
- `COMPREHENSIVE_INTEGRATION.md` — Integration guide
- `ELABORATION.md` — Deep dive analysis
- `FAMILY_ASTROLOGY_FRAMEWORK.md` — Framework document
- `FAMILY_ASTROLOGY_REPORT.md` — Complete family report
- `JOURNEY_MAP_2026.md` — Timeline map
- `LIFE_PURPOSE_DARMA_AXIS.md` — Purpose analysis
- `Logistics_Dashboard.md` — Dashboard for logistics
- `PLUTO_NAKSHATRA_ANURADHA.md` — Transit analysis
- `SATURN_RETROGRADE_PISCES.md` — Saturn analysis
- `VEDIC_CHART_ACCURATE.md` — Accurate chart data

**Chart images NOT in monorepo:** 20 PNG/PDF chart files in `charts/` and `Downloads/` (total ~5 MB)

**Duplicate content:** `Downloads/` contains copies of chart images already in `charts/`.

---

## 3. Cleanup Plan

### 3.1 SAFE TO DELETE (After verification)
These are duplicates or superseded by monorepo:

| Source | Target | Reason |
|--------|--------|--------|
| `C:\Users\Admin\AstroDashboard\de421.bsp` | Monorepo root | Duplicate (16 MB) |
| `C:\Users\Admin\AstrologyWorkspace\de421.bsp` | Monorepo root | Duplicate (16 MB) |
| `C:\Users\Admin\My Drive\LifeWorkspace\13_Spiritual\*.md` | `spiritual/` | All migrated |
| `C:\Users\Admin\My Drive\LifeWorkspace\13_Spiritual\Mushabihat_Quran_Complete.pdf` | `spiritual/` | Migrated |
| `C:\Users\Admin\My Drive\LifeWorkspace\12_Astrology\charts\` | Keep originals | Duplicates in Downloads/ |

### 3.2 ARCHIVE (Keep but don't sync to Google Drive)
These contain unique content not yet in monorepo:

| Location | Contents | Action |
|----------|----------|--------|
| `C:\Users\Admin\AstroDashboard\` | quran-moon pages, dhikr app, launcher scripts | Archive to `C:\Users\Admin\Projects\archive\astrodashboard\` |
| `C:\Users\Admin\AstrologyWorkspace\` | Analysis MDs (01-25), Python scripts, family_astrology package | Archive to `C:\Users\Admin\Projects\archive\astrologyworkspace\` |
| `C:\Users\Admin\My Drive\LifeWorkspace\12_Astrology\charts\` | 20 chart images | Keep in LifeWorkspace (Obsidian reference) |
| `C:\Users\Admin\My Drive\LifeWorkspace\12_Astrology\Downloads\` | Duplicate charts + PDFs | Delete after archiving unique PDFs |

### 3.3 KEEP in LifeWorkspace (Obsidian vault)
These should remain in the synced vault for Obsidian access:

| File | Reason |
|------|--------|
| `12_Astrology/00-MOC-Astrology.md` | Navigation hub |
| `12_Astrology/12_Astrology.md` | Section overview |
| `12_Astrology/FAMILY_ASTROLOGY_REPORT.md` | Complete report |
| `12_Astrology/ELABORATION.md` | Deep analysis |
| `12_Astrology/charts/` | Chart images for reference |
| `13_Spiritual/` (empty after migration) | Keep folder structure |

### 3.4 FULLY MIGRATED (No longer needed)
These have been completely transferred to monorepo:

| Old Location | Monorepo Location | Status |
|--------------|-------------------|--------|
| `AstroDashboard/frontend/` | `frontend/` | ✅ Complete |
| `AstroDashboard/server.py` | `backend/` | ✅ Complete |
| `AstrologyWorkspace/family_astrology/` | `backend/` | ✅ Complete |
| `LifeWorkspace/13_Spiritual/*.md` | `spiritual/` | ✅ Complete |
| `LifeWorkspace/13_Spiritual/*.pdf` | `spiritual/` | ✅ Complete |
| `LifeWorkspace/12_Astrology/FAMILY_*_CHART.md` | `docs/family/` | ✅ Complete |

---

## 4. Recommended Execution Order

### Phase 1: Archive unique content (DO THIS FIRST)
```bash
# Create archive directories
mkdir -p C:/Users/Admin/Projects/archive/astrodashboard
mkdir -p C:/Users/Admin/Projects/archive/astrologyworkspace

# Archive AstroDashboard unique files
cp -r C:/Users/Admin/AstroDashboard/quran-moon*.html C:/Users/Admin/Projects/archive/astrodashboard/
cp -r C:/Users/Admin/AstroDashboard/dhikr C:/Users/Admin/Projects/archive/astrodashboard/
cp C:/Users/Admin/AstroDashboard/*.md C:/Users/Admin/Projects/archive/astrodashboard/
cp C:/Users/Admin/AstroDashboard/*.ps1 C:/Users/Admin/Projects/archive/astrodashboard/
cp C:/Users/Admin/AstroDashboard/*.vbs C:/Users/Admin/Projects/archive/astrodashboard/
cp C:/Users/Admin/AstroDashboard/*.bat C:/Users/Admin/Projects/archive/astrodashboard/
cp C:/Users/Admin/AstroDashboard/*.mjs C:/Users/Admin/Projects/archive/astrodashboard/
cp -r C:/Users/Admin/AstroDashboard/data C:/Users/Admin/Projects/archive/astrodashboard/
cp -r C:/Users/Admin/AstroDashboard/css C:/Users/Admin/Projects/archive/astrodashboard/
cp -r C:/Users/Admin/AstroDashboard/js C:/Users/Admin/Projects/archive/astrodashboard/

# Archive AstrologyWorkspace unique content
cp C:/Users/Admin/AstrologyWorkspace/*.md C:/Users/Admin/Projects/archive/astrologyworkspace/
cp C:/Users/Admin/AstrologyWorkspace/*.py C:/Users/Admin/Projects/archive/astrologyworkspace/
cp -r C:/Users/Admin/AstrologyWorkspace/family_astrology C:/Users/Admin/Projects/archive/astrologyworkspace/
cp -r C:/Users/Admin/AstrologyWorkspace/charts C:/Users/Admin/Projects/archive/astrologyworkspace/
```

### Phase 2: Migrate remaining unique content to monorepo
```bash
# Copy analysis MDs to monorepo docs/
cp C:/Users/Admin/AstrologyWorkspace/*.md C:/Users/Admin/Projects/active/mahi-spiritual/docs/

# Copy standalone Python scripts to monorepo backend/scripts/
mkdir -p C:/Users/Admin/Projects/active/mahi-spiritual/backend/scripts
cp C:/Users/Admin/AstrologyWorkspace/*.py C:/Users/Admin/Projects/active/mahi-spiritual/backend/scripts/

# Copy AstroDashboard unique pages to monorepo frontend/pages/
mkdir -p C:/Users/Admin/Projects/active/mahi-spiritual/frontend/pages
cp C:/Users/Admin/AstroDashboard/quran-moon*.html C:/Users/Admin/Projects/active/mahi-spiritual/frontend/pages/
cp -r C:/Users/Admin/AstroDashboard/dhikr C:/Users/Admin/Projects/active/mahi-spiritual/frontend/pages/

# Copy chart images to monorepo assets/charts/
mkdir -p C:/Users/Admin/Projects/active/mahi-spiritual/assets/charts
cp C:/Users/Admin/My\ Drive/LifeWorkspace/12_Astrology/charts/*.png C:/Users/Admin/Projects/active/mahi-spiritual/assets/charts/
cp C:/Users/Admin/My\ Drive/LifeWorkspace/12_Astrology/charts/*.pdf C:/Users/Admin/Projects/active/mahi-spiritual/assets/charts/
```

### Phase 3: Clean up old workspaces
```bash
# Remove duplicate de421.bsp files
rm C:/Users/Admin/AstroDashboard/de421.bsp
rm C:/Users/Admin/AstrologyWorkspace/de421.bsp

# Clear LifeWorkspace/13_Spiritual (already migrated)
rm C:/Users/Admin/My\ Drive/LifeWorkspace/13_Spiritual/*.md
rm C:/Users/Admin/My\ Drive/LifeWorkspace/13_Spiritual/*.pdf

# Clear duplicate Downloads
rm -r C:/Users/Admin/My\ Drive/LifeWorkspace/12_Astrology/Downloads/
```

### Phase 4: Final verification
- [ ] Verify all unique content is in monorepo
- [ ] Verify Obsidian vault still works with remaining files
- [ ] Test monorepo build/deployment
- [ ] Update .gitignore if needed

---

## 5. Risk Assessment

| Risk | Mitigation |
|------|------------|
| Losing unique analysis MDs | Archive first, then migrate |
| Breaking Obsidian wiki-links | Keep MOC and key files in vault |
| Duplicate content across locations | Centralize in monorepo |
| Large file storage (de421.bsp) | Keep only one copy in monorepo |
| Chart images not in version control | Add to monorepo assets/ |

---

## 6. Next Steps

1. **Review this plan** with user before execution
2. **Phase 1: Archive** unique content (safe, non-destructive)
3. **Phase 2: Migrate** remaining unique content to monorepo
4. **Phase 3: Clean up** old workspaces (after verification)
5. **Phase 4: Update** documentation and .gitignore

---

**Note:** This plan assumes the monorepo is the single source of truth going forward. LifeWorkspace/12_Astrology and 13_Spiritual will be kept for Obsidian access but content should be synced to monorepo.