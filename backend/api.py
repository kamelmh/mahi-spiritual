"""
MAHI Spiritual System — FastAPI Backend
========================================
REST API connecting all engines:
- Chart calculation (natal, family, transits)
- Dasha timing
- Daily Pulse generation
- Quran-Astro sync
- Hifdh tracking
- AI Spiritual Advisor

Run: uvicorn backend.api:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime, timedelta
from typing import Optional, Dict, List
import json
import os

app = FastAPI(
    title="MAHI Spiritual System API",
    description="Vedic astrology, Quran study, and spiritual guidance API",
    version="1.0.0",
)

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Start up: load/calculate core data
# ============================================================

_natal_cache = {}
_pulse_cache = {}


def _get_natal():
    """Get or compute Kamel's natal positions (cached)."""
    global _natal_cache
    if not _natal_cache:
        import sys
        sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
        from backend.engine import calculate_planetary_positions
        _natal_cache = calculate_planetary_positions(1996, 3, 6, 14, 0)
    return _natal_cache


def _get_pulse(target_date: str = None):
    """Get or compute daily pulse (cached per date)."""
    global _pulse_cache
    if target_date is None:
        target_date = datetime.now().strftime("%Y-%m-%d")

    cache_key = target_date
    if cache_key not in _pulse_cache:
        import sys
        sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
        from backend.daily_pulse import generate_daily_pulse
        y, m, d = map(int, target_date.split("-"))
        pulse = generate_daily_pulse(y, m, d, _get_natal())
        _pulse_cache[cache_key] = pulse

    return _pulse_cache[cache_key]


# ============================================================
# 1. CHART ENDPOINTS
# ============================================================

@app.get("/api/chart")
async def get_chart():
    """Get Kamel's natal chart."""
    from backend.engine import calculate_full_chart
    chart = calculate_full_chart("Kamel", 1996, 3, 6, 14, 0, 33.06, 1.00)
    return chart


@app.get("/api/chart/planets")
async def get_planets():
    """Get planetary positions only."""
    natal = _get_natal()
    return {k: v for k, v in natal.items() if "error" not in v}


@app.get("/api/chart/aspects")
async def get_aspects():
    """Get natal aspects."""
    from backend.engine import calculate_aspects
    natal = _get_natal()
    return calculate_aspects(natal)


@app.get("/api/chart/houses")
async def get_houses():
    """Get house cusps."""
    from backend.engine import calculate_houses
    return calculate_houses(1996, 3, 6, 14, 0, 33.06, 1.00)


@app.get("/api/chart/family")
async def get_family_charts():
    """Get all family member charts."""
    from backend.engine import calculate_family_charts
    return calculate_family_charts()


@app.get("/api/chart/synastry")
async def get_synastry(member1: str = "Kamel", member2: str = "Kheireddine"):
    """Calculate synastry aspects between two family members."""
    from backend.engine import calculate_family_charts, calculate_aspects
    charts = calculate_family_charts()

    if member1 not in charts or member2 not in charts:
        raise HTTPException(404, f"Member not found: {member1} or {member2}")

    c1 = charts[member1]
    c2 = charts[member2]

    # Cross-chart aspects
    aspects = []
    aspect_defs = [
        {"name": "conjunction", "angle": 0, "orb": 8},
        {"name": "opposition", "angle": 180, "orb": 8},
        {"name": "trine", "angle": 120, "orb": 8},
        {"name": "square", "angle": 90, "orb": 7},
        {"name": "sextile", "angle": 60, "orb": 6},
    ]

    for p1_name, p1_data in c1.get("planets", {}).items():
        if "error" in p1_data:
            continue
        for p2_name, p2_data in c2.get("planets", {}).items():
            if "error" in p2_data:
                continue
            diff = abs(p1_data["sidereal"] - p2_data["sidereal"])
            if diff > 180:
                diff = 360 - diff

            for asp in aspect_defs:
                if abs(diff - asp["angle"]) <= asp["orb"]:
                    aspects.append({
                        "member1": member1,
                        "planet1": p1_name,
                        "member2": member2,
                        "planet2": p2_name,
                        "aspect": asp["name"],
                        "angle": round(diff, 2),
                        "orb": round(abs(asp["angle"] - diff), 2),
                    })

    aspects.sort(key=lambda x: x["orb"])
    return {"member1": member1, "member2": member2, "aspects": aspects}


# ============================================================
# 2. DASHA ENDPOINTS
# ============================================================

@app.get("/api/dasha/current")
async def get_current_dasha():
    """Get current dasha and bhukti."""
    from backend.dasha import get_current_dasha, NAKSHATRA_DASHA
    from backend.engine import get_nakshatra

    natal = _get_natal()
    moon_nak = natal.get("Moon", {}).get("nakshatra", "Uttara Phalguni")
    moon_deg = natal.get("Moon", {}).get("degree", 6.0)
    birth_date = datetime(1996, 3, 6, 14, 0)

    current = get_current_dasha(birth_date, moon_nak, moon_deg)

    # Get dasha lord's natal position
    maha_lord = current.get("maha_dasha", {}).get("lord", "")
    maha_pos = natal.get(maha_lord, {})

    return {
        "current": current,
        "maha_lord_position": maha_pos,
        "moon_nakshatra": moon_nak,
        "total_years_120": 120,
    }


@app.get("/api/dasha/sequence")
async def get_dasha_sequence():
    """Get full dasha sequence from birth."""
    from backend.dasha import calculate_dasha_sequence

    birth_date = datetime(1996, 3, 6, 14, 0)
    # Kamel: Moon in Uttara Phalguni (Sun's nakshatra)
    dashas = calculate_dasha_sequence("Uttara Phalguni", 6.0, birth_date)

    # Serialize dates
    for d in dashas:
        d["start"] = d["start"]
        d["end"] = d["end"]
        d.pop("start_date", None)
        d.pop("end_date", None)

    return {"dashas": dashas, "birth": "1996-03-06"}


@app.get("/api/dasha/themes")
async def get_dasha_themes():
    """Get thematic interpretation for each dasha lord."""
    from backend.dasha import get_sign_theme, get_nakshatra_theme, get_dignity_theme
    from backend.daily_pulse import DASHA_LORD_THEMES

    return {
        "themes": DASHA_LORD_THEMES,
        "sign_themes": {s: get_sign_theme(s) for s in [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]},
    }


# ============================================================
# 3. TRANSIT ENDPOINTS
# ============================================================

@app.get("/api/transits/today")
async def get_today_transits():
    """Get today's transits against natal chart."""
    from backend.engine import calculate_transits
    natal = _get_natal()
    today = datetime.now()

    return calculate_transits(
        natal, today.year, today.month, today.day,
        natal_asc=81.18, natal_asc_sign="Gemini"
    )


@app.get("/api/transits/date/{date}")
async def get_transits_for_date(date: str):
    """Get transits for a specific date (YYYY-MM-DD)."""
    from backend.engine import calculate_transits
    natal = _get_natal()

    try:
        y, m, d = map(int, date.split("-"))
    except ValueError:
        raise HTTPException(400, "Date must be YYYY-MM-DD")

    return calculate_transits(
        natal, y, m, d,
        natal_asc=81.18, natal_asc_sign="Gemini"
    )


@app.get("/api/transits/forecast")
async def get_transit_forecast(
    start: str = None,
    end: str = None,
):
    """Get transit forecast for a date range."""
    from backend.engine import generate_transit_forecast
    natal = _get_natal()

    if start is None:
        start = datetime.now().strftime("%Y-%m-%d")
    if end is None:
        end = (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")

    sy, sm, sd = map(int, start.split("-"))
    ey, em, ed = map(int, end.split("-"))

    return generate_transit_forecast(
        natal,
        natal_asc=81.18, natal_asc_sign="Gemini",
        start_year=sy, start_month=sm,
        end_year=ey, end_month=em,
    )


# ============================================================
# 4. DAILY PULSE ENDPOINTS
# ============================================================

@app.get("/api/pulse/today")
async def get_today_pulse():
    """Get today's complete Daily Pulse."""
    today = datetime.now().strftime("%Y-%m-%d")
    return _get_pulse(today)


@app.get("/api/pulse/date/{date}")
async def get_pulse_for_date(date: str):
    """Get pulse for a specific date."""
    return _get_pulse(date)


@app.get("/api/pulse/week")
async def get_weekly_pulse():
    """Get 7-day pulse forecast."""
    from backend.daily_pulse import generate_weekly_pulse
    natal = _get_natal()
    today = datetime.now()

    return generate_weekly_pulse(
        today.year, today.month, today.day,
        natal, "Gemini", 81.18
    )


@app.get("/api/pulse/quran")
async def get_quran_sync():
    """Get today's Quran-Astro sync."""
    pulse = _get_pulse()
    return {
        "quran": pulse.get("quran", {}),
        "moon_nakshatra": pulse.get("cosmic_weather", {}).get("moon_nakshatra", {}),
        "dasha": pulse.get("dasha", {}),
    }


# ============================================================
# 5. HIFDH ENDPOINTS
# ============================================================

@app.get("/api/hifdh/status")
async def get_hifdh_status():
    """Get hifdh memorization status (read from frontend localStorage fallback)."""
    # The hifdh data lives in the frontend localStorage
    # This endpoint provides the default state for new sessions
    return {
        "surahs": list(range(1, 115)),
        "total_ayahs": 6236,
        "memorized": 0,
        "in_progress": 0,
        "not_started": 6236,
        "strength_boxes": 7,
        "note": "Hifdh data is stored in browser localStorage. Use the Hifdh Tracker page to manage."
    }


# ============================================================
# 6. AI SPIRITUAL ADVISOR
# ============================================================

@app.post("/api/ai/ask")
async def ai_spiritual_advisor(request: Dict):
    """
    AI Spiritual Advisor — asks a question about life, chart, or practice.
    Returns contextual guidance based on chart, dasha, transits, and Quran.
    """
    question = request.get("question", "").strip()
    if not question:
        raise HTTPException(400, "Question is required")

    question_lower = question.lower()

    # Gather context
    natal = _get_natal()
    pulse = _get_pulse()
    dasha = pulse.get("dasha", {})
    quran = pulse.get("quran", {})
    cosmic = pulse.get("cosmic_weather", {})
    transits = pulse.get("transits", {})

    # Determine question category
    category = _classify_question(question_lower)

    # Generate response based on category
    response = _generate_ai_response(
        category, question, natal, dasha, quran, cosmic, transits
    )

    return {
        "question": question,
        "category": category,
        "response": response["text"],
        "sources": response.get("sources", []),
        "action_items": response.get("actions", []),
        "related_surah": response.get("surah"),
        "dua": response.get("dua"),
        "chart_context": {
            "dasha": f"{dasha.get('maha', '')} / {dasha.get('bhukti', '')}",
            "moon_nakshatra": cosmic.get("moon_nakshatra", {}).get("name", ""),
            "moon_phase": cosmic.get("moon_phase", {}).get("name", ""),
            "transit_count": transits.get("total_aspects", 0),
        }
    }


def _classify_question(text: str) -> str:
    """Classify the question into a category."""
    categories = {
        "chart": ["chart", "natal", "planets", "position", "house", "ascendant", "lagna", "sun sign", "moon sign"],
        "dasha": ["dasha", "period", "timing", "when", "phase", "mercury bhukti", "rahu", "jupiter"],
        "transit": ["transit", "transiting", "aspect", "saturn", "jupiter transit", "current"],
        "quran": ["quran", "verse", "surah", "ayah", "recite", "memorize", "hifdh", "tafsir"],
        "practice": ["practice", "daily", "routine", "dhikr", "meditation", "spiritual", "pray"],
        "family": ["family", "brother", "sister", "mother", "father", "relationship", "synastry"],
        "purpose": ["purpose", "life", "meaning", "destiny", "path", "mission", "karma"],
        "career": ["career", "work", "job", "business", "finance", "money", "study"],
        "health": ["health", "body", "energy", "sleep", "stress", "anxiety", "heal"],
        "love": ["love", "partner", "marriage", "relationship", "venus", "romance"],
    }

    for cat, keywords in categories.items():
        if any(kw in text for kw in keywords):
            return cat

    return "general"


def _generate_ai_response(
    category: str, question: str,
    natal: Dict, dasha: Dict, quran: Dict, cosmic: Dict, transits: Dict
) -> Dict:
    """Generate AI response based on question category and current context."""

    maha = dasha.get("maha", "Rahu")
    bhukti = dasha.get("bhukti", "Mercury")
    moon_nak = cosmic.get("moon_nakshatra", {}).get("name", "")
    moon_phase = cosmic.get("moon_phase", {}).get("name", "")
    surah_name = quran.get("surah", "")
    surah_num = quran.get("surah_num", 0)
    dhikr = quran.get("dhikr", "")
    urgent = transits.get("major_active", [])

    responses = {
        "chart": {
            "text": f"Your natal chart shows Moon in Virgo (Uttara Phalguni), giving you an analytical, service-oriented emotional nature. Your Sun in Aquarius with Mars conjunct makes you a revolutionary builder — you don't just want change, you ARE the change. Jupiter in Sagittarius (own sign) is your chart's greatest blessing: wisdom expressed through teaching and one-on-one guidance. Currently in {maha} Mahadasha / {bhukti} Bhukti — this period emphasizes {dasha.get('focus', 'growth')}.",
            "sources": ["natal_chart", "engine"],
            "surah": {"name": surah_name, "number": surah_num},
            "dua": dhikr,
            "actions": ["Study your chart in depth on the Natal Chart page", "Journal about how these placements show up in your daily life"],
        },
        "dasha": {
            "text": f"You are in {maha} Mahadasha / {bhukti} Bhukti. {maha} period runs {dasha.get('maha_dates', '')}. Theme: {dasha.get('focus', '')}. Warning: {dasha.get('warning', '')}. The bhukti lord {bhukti} adds: {dasha.get('modifier', '')}. This is the time for {maha.lower()}-related growth. Use today's Moon in {moon_nak} (phase: {moon_phase}) to amplify this energy.",
            "sources": ["dasha_engine", "daily_pulse"],
            "actions": [f"Focus on {dasha.get('focus', 'growth')} today"],
        },
        "transit": {
            "text": f"Today has {transits.get('total_aspects', 0)} transit aspects active. {f'URGENT: {len(urgent)} major transits within 5 degrees.' if urgent else 'No urgent transits.'} " + " ".join([
                f"• {t['transit']} — {t['theme']}"
                for t in urgent[:3]
            ]) + f" The {moon_phase} in {moon_nak} creates a backdrop of {quran.get('theme', '')}.",
            "sources": ["transit_engine", "daily_pulse"],
        },
        "quran": {
            "text": f"Today's Quran-Astro sync connects Moon in {moon_nak} to Surah {surah_num} ({surah_name}). Theme: {quran.get('theme', '')}. Dhikr: {dhikr}. Practice: {quran.get('practice', '')}. This resonance between the lunar mansions and Quranic wisdom is the ancient science of Quran-Moon connection — each nakshatra carries a specific surah energy.",
            "sources": ["quran_astro_sync", "daily_pulse"],
            "surah": {"name": surah_name, "number": surah_num},
            "dua": dhikr,
        },
        "practice": {
            "text": f"Based on today's {moon_phase} and {maha}/{bhukti} dasha, here is your recommended practice:\n\n1. {quran.get('dhikr', 'Astaghfirullah')}\n2. {quran.get('practice', 'Recite Al-Fatiha')}\n3. Moon phase practice: {cosmic.get('moon_phase', {}).get('practice', '')}\n\nTotal time: ~{transits.get('total_aspects', 0) * 2} minutes. The {moon_nak} nakshatra energy supports: {quran.get('theme', 'spiritual practice')}.",
            "sources": ["daily_pulse", "moon_engine"],
            "actions": [
                quran.get("dhikr", "Astaghfirullah"),
                quran.get("practice", "Recite Al-Fatiha"),
            ],
        },
        "family": {
            "text": "Your family synastry reveals deep karmic patterns. Kheireddine's Jupiter conjunct your Moon (orb 1.4°) makes him your emotional teacher. Ikram's Ketu conjunct your Mercury (orb 1.9°) creates a past-life communication bond. Sara's Mars opposition your Jupiter tests your faith through challenge. Together, they form a triangle around your Moon, Mercury, and Jupiter — developing your emotions, mind, and wisdom.",
            "sources": ["synastry_engine", "family_charts"],
            "actions": ["Explore Family Charts page for detailed synastry"],
        },
        "purpose": {
            "text": f"Your chart says you're not here to follow. You're here to build what others will follow. Sun-Mars conjunction in Aquarius (0.4°) fuses identity with action — you don't just want change, you ARE change. Jupiter in domicile means your wisdom expresses through teaching. In {maha} Mahadasha, your karmic growth edge is {dasha.get('focus', 'expansion')}. Right now, {moon_phase} in {moon_nak} asks you to: {quran.get('practice', 'align with divine purpose')}.",
            "sources": ["natal_chart", "dasha", "daily_pulse"],
            "surah": {"name": surah_name, "number": surah_num},
            "dua": dhikr,
        },
        "career": {
            "text": f"Saturn in your 10th house (Pisces MC) means your career is built through patience, discipline, and spiritual depth — not quick wins. Currently in {maha}/{bhukti}, your focus is on {dasha.get('focus', 'discipline')}. {('Urgent transit: ' + urgent[0]['theme']) if urgent else 'No urgent career transits.'} Jupiter in the 7th from Gemini ASC means your career expresses through partnerships and one-on-one guidance.",
            "sources": ["natal_chart", "transits", "dasha"],
        },
        "health": {
            "text": f"Moon in Virgo (Uttara Phalguni) means you process emotions through your body and through service. When stressed, you internalize and analyze. {maha} dasha energy: {'discipline your routine' if maha == 'Saturn' else 'expand through activity' if maha == 'Jupiter' else 'embrace change' if maha == 'Rahu' else 'follow your instincts'}. Today's {moon_phase} supports: {cosmic.get('moon_phase', {}).get('energy', 'balance')}. Dhikr for healing: {dhikr}.",
            "sources": ["natal_chart", "daily_pulse"],
            "dua": dhikr,
        },
        "love": {
            "text": f"Venus in Aries 6° (Ashwini) in your 11th house: love arrives suddenly through social networks and friendships. You fall fast, create fast, heal fast. In {maha}/{bhukti} dasha, love themes are shaped by {dasha.get('focus', 'growth')}. Moon in {moon_nak} (phase: {moon_phase}) creates today's romantic atmosphere. Venus native to Aries means you need a partner who matches your pioneering energy — not someone who holds you back.",
            "sources": ["natal_chart", "dasha", "daily_pulse"],
        },
    }

    # Default general response
    default = {
        "text": f"Based on your chart and current cosmic weather: You are in {maha} Mahadasha / {bhukti} Bhukti. Today is {moon_phase} in {moon_nak}. {('URGENT: ' + urgent[0]['theme']) if urgent else 'No urgent transits.'} Quran guidance: Surah {surah_num} ({surah_name}) — {quran.get('theme', '')}. Dhikr: {dhikr}. Ask me about your chart, dasha, transits, Quran, practice, family, purpose, career, health, or love.",
        "sources": ["daily_pulse"],
        "surah": {"name": surah_name, "number": surah_num},
        "dua": dhikr,
        "actions": [quran.get("practice", "Recite Al-Fatiha")],
    }

    return responses.get(category, default)


# ============================================================
# 7. STATIC FILE SERVING
# ============================================================

# Serve frontend data files
frontend_data = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "data")
if os.path.exists(frontend_data):
    app.mount("/data", StaticFiles(directory=frontend_data), name="data")


# ============================================================
# Health check
# ============================================================

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "version": "1.0.0",
        "engines": ["chart", "dasha", "transits", "pulse", "quran", "hifdh", "ai"],
        "natal_loaded": bool(_natal_cache),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
