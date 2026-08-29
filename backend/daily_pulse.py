"""
Daily Pulse — Spiritual Operating System
=========================================
Connects transits, dasha, Moon nakshatra, Quran verses,
and practice recommendations into a unified morning briefing.

This is the brain that turns 22 separate pages into one daily ritual.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
import math


# ============================================================
# 1. QURAN-ASTRO SYNC: Moon Nakshatra → Sacred Verses
# ============================================================

NAKSHATRA_QURAN = {
    "Ashwini": {
        "theme": "Healing & New Beginnings",
        "surah": "Al-Fatiha",
        "surah_num": 1,
        "ayahs": [1, 2, 3, 4, 5, 6, 7],
        "dhikr": "Bismillah ir-Rahman ir-Rahim (7x)",
        "practice": "Recite Al-Fatiha for healing. Begin new projects today.",
        "color": "green",
    },
    "Bharani": {
        "theme": "Transformation & Purification",
        "surah": "Ash-Sharh",
        "surah_num": 94,
        "ayahs": [1, 2, 3, 4, 5, 6, 7, 8],
        "dhikr": "Alhamdulillah (100x)",
        "practice": "Let go of what burdens you. The expansion comes after the squeeze.",
        "color": "red",
    },
    "Krittika": {
        "theme": "Cutting & Purification Through Fire",
        "surah": "Al-Ikhlas",
        "surah_num": 112,
        "ayahs": [1, 2, 3, 4],
        "dhikr": "La ilaha illAllah (100x)",
        "practice": "Purify intentions. Cut what is false. Seek the one truth.",
        "color": "orange",
    },
    "Rohini": {
        "theme": "Growth, Beauty & Abundance",
        "surah": "Ar-Rahman",
        "surah_num": 55,
        "ayahs": [1, 13, 14, 15, 16, 17, 18, 19, 20],
        "dhikr": "Ya Fattah (57x) — opener of hearts and provision",
        "practice": "Appreciate beauty around you. Create something today.",
        "color": "gold",
    },
    "Mrigashira": {
        "theme": "Seeking & Gentle Search",
        "surah": "Ad-Duha",
        "surah_num": 93,
        "ayahs": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        "dhikr": "Ya Lateef (129x) — the Subtle One who guides seekers",
        "practice": "Ask questions. Seek knowledge. Be gentle with the search.",
        "color": "silver",
    },
    "Ardra": {
        "theme": "Suffering → Transformation → Rain",
        "surah": "Ash-Sharh",
        "surah_num": 94,
        "ayahs": [5, 6],
        "dhikr": "HasbunAllahu wa ni'mal Wakeel (100x)",
        "practice": "The storm is the rain. Trust the process. Relief is coming.",
        "color": "blue",
    },
    "Punarvasu": {
        "theme": "Return, Renewal & The Return of Light",
        "surah": "An-Nas",
        "surah_num": 114,
        "ayahs": [1, 2, 3, 4, 5, 6],
        "dhikr": "Astaghfirullah (100x) — the purification before return",
        "practice": "Forgive yourself. The return starts with letting go.",
        "color": "white",
    },
    "Pushya": {
        "theme": "Spiritual Nourishment & Teaching",
        "surah": "Al-Mulk",
        "surah_num": 67,
        "ayahs": [1, 2, 3, 30],
        "dhikr": "Ya Musawwir (34x) — the Fashioner",
        "practice": "Feed others spiritually. Share what you know.",
        "color": "gold",
    },
    "Ashlesha": {
        "theme": "Kundalini, Hidden Knowledge & Binding",
        "surah": "Ya-Seen",
        "surah_num": 36,
        "ayahs": [1, 2, 3, 4, 5, 6, 7, 8],
        "dhikr": "Ya Khabir (131x) — the All-Aware",
        "practice": "Trust your intuition. What's hidden will surface.",
        "color": "purple",
    },
    "Magha": {
        "theme": "Ancestral Power & Authority",
        "surah": "Al-Fatihah",
        "surah_num": 1,
        "ayahs": [1, 2, 6],
        "dhikr": "Ya Malik (117x) — the Sovereign",
        "practice": "Honor your ancestors. Stand in your authority.",
        "color": "crimson",
    },
    "Purva Phalguni": {
        "theme": "Pleasure, Rest & Creative Joy",
        "surah": "Al-Inshirah",
        "surah_num": 94,
        "ayahs": [1, 2, 3, 4, 5, 6, 7, 8],
        "dhikr": "Ya Wahhab (148x) — the Bestower",
        "practice": "Rest is worship. Enjoy what Allah has given.",
        "color": "pink",
    },
    "Uttara Phalguni": {
        "theme": "Generosity, Patronage & Union",
        "surah": "Al-Ma'un",
        "surah_num": 107,
        "ayahs": [1, 2, 3, 4, 5, 6, 7],
        "dhikr": "Ya Latif (129x) — the Gentle Provider",
        "practice": "Give generously today. Patronize someone's work.",
        "color": "gold",
    },
    "Hasta": {
        "theme": "Craftsmanship, Skill & Healing Hands",
        "surah": "Al-Mu'minun",
        "surah_num": 23,
        "ayahs": [12, 13, 14, 78],
        "dhikr": "Ya Musawwir (34x) — the Fashioner of hands",
        "practice": "Work with your hands. Craft, build, heal.",
        "color": "silver",
    },
    "Chitra": {
        "theme": "Creation, Beauty & The Pearl",
        "surah": "An-Nur",
        "surah_num": 24,
        "ayahs": [35, 36],
        "dhikr": "Ya Nur (130x) — the Light",
        "practice": "Create beauty. Every pearl was once an irritation.",
        "color": "white",
    },
    "Swati": {
        "theme": "Independence, Freedom & Wind",
        "surah": "Al-Adiyat",
        "surah_num": 100,
        "ayahs": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        "dhikr": "Ya Qahhar (107x) — the Subduer",
        "practice": "Break free. Let the wind carry what no longer serves.",
        "color": "green",
    },
    "Vishakha": {
        "theme": "Goal, Determination & The Archway",
        "surah": "Al-Isra",
        "surah_num": 17,
        "ayahs": [1, 79, 80, 81],
        "dhikr": "Ya Hadi (88x) — the Guide to the goal",
        "practice": "Focus on one goal. The archway opens when you commit.",
        "color": "red",
    },
    "Anuradha": {
        "theme": "Devotion, Friendship & Lotus",
        "surah": "Al-Mujadila",
        "surah_num": 58,
        "ayahs": [11, 12],
        "dhikr": "Ya Wadud (148x) — the Loving One",
        "practice": "Deepen a friendship. Devotion is the path.",
        "color": "pink",
    },
    "Jyeshtha": {
        "theme": "Seniority, Power & The Circular Talisman",
        "surah": "Al-Jumu'ah",
        "surah_num": 62,
        "ayahs": [9, 10, 11],
        "dhikr": "Ya Dhu'l-Jalal (113x) — the Lord of Majesty",
        "practice": "Stand in your seniority. Lead from experience.",
        "color": "purple",
    },
    "Mula": {
        "theme": "Roots, Foundation & Destruction for Rebuilding",
        "surah": "Ikhlas",
        "surah_num": 112,
        "ayahs": [1, 2, 3, 4],
        "dhikr": "La hawla wa la quwwata illa billah (100x)",
        "practice": "Find your root. What you can destroy, you can rebuild.",
        "color": "black",
    },
    "Purva Ashadha": {
        "theme": "Invincibility & Water's Power",
        "surah": "Al-Qamar",
        "surah_num": 54,
        "ayahs": [1, 17, 18, 19, 20],
        "dhikr": "Ya Qawiy (144x) — the Strong",
        "practice": "You are invincible when aligned with water (truth). Flow.",
        "color": "blue",
    },
    "Uttara Ashadha": {
        "theme": "Universal Victory & The Tusk",
        "surah": "Al-Fath",
        "surah_num": 48,
        "ayahs": [1, 2, 3, 4, 5],
        "dhikr": "Al-Mu'min (130x) — the Believer / Guarantor",
        "practice": "Victory is universal. Your struggle serves all beings.",
        "color": "gold",
    },
    "Shravana": {
        "theme": "Listening, Learning & The Ear of God",
        "surah": "Al-Fatihah",
        "surah_num": 1,
        "ayahs": [1, 2, 3, 4, 5, 6, 7],
        "dhikr": "Ya Sami' (118x) — the All-Hearing",
        "practice": "Listen more than you speak today. The ear of God is yours.",
        "color": "white",
    },
    "Dhanishta": {
        "theme": "Wealth, Music & The Drum",
        "surah": "Al-Ma'idah",
        "surah_num": 5,
        "ayahs": [114, 115, 116],
        "dhikr": "Ya Ghani (134x) — the Self-Sufficient",
        "practice": "Make music. Wealth flows through rhythm.",
        "color": "gold",
    },
    "Shatabhisha": {
        "theme": "Healing, The Hundred & The Circle",
        "surah": "Yunus",
        "surah_num": 10,
        "ayahs": [57, 58],
        "dhikr": "Ya Shafi (146x) — the Healer",
        "practice": "Heal yourself first. The hundred physicians are within.",
        "color": "green",
    },
    "Purva Bhadra": {
        "theme": "Fire, Transformation & The Sword",
        "surah": "Al-Qalam",
        "surah_num": 68,
        "ayahs": [1, 48, 49, 50, 51, 52],
        "dhikr": "Ya Jabbar (105x) — the Compeller",
        "practice": "Walk through fire. The sword cuts what binds you.",
        "color": "orange",
    },
    "Uttara Bhadra": {
        "theme": "Deep Wisdom & The Twin Stars",
        "surah": "Al-Kahf",
        "surah_num": 18,
        "ayahs": [1, 10, 60, 65, 66, 109],
        "dhikr": "Ya Alim (148x) — the All-Knowing",
        "practice": "Seek deep wisdom. The twin stars guide the night traveler.",
        "color": "indigo",
    },
    "Revati": {
        "theme": "Journey, Completion & The Fish",
        "surah": "An-Naba",
        "surah_num": 78,
        "ayahs": [1, 2, 3, 40, 41],
        "dhikr": "Ya Musawwir (34x) — the Fashioner of journeys",
        "practice": "Complete a cycle. The fish knows when to leap.",
        "color": "teal",
    },
}


# ============================================================
# 2. ACTION RULES: Transit Aspects → What To Do / Avoid
# ============================================================

TRANSIT_ACTIONS = {
    # Saturn transits
    ("Saturn", "square"): {
        "avoid": ["signing contracts", "starting new ventures", "taking financial risks"],
        "do": ["review old commitments", "discipline your routine", "build lasting structures"],
        "theme": "Saturn is testing you. Stay disciplined. Don't start — finish.",
        "urgency": "high",
        "dua": "Hasbiyallahu la ilaha illa Huwa, alayhi tawakkaltu",
    },
    ("Saturn", "opposition"): {
        "avoid": ["confronting authority", "isolation", "neglecting health"],
        "do": ["accept responsibility", "serve others", "simplify your life"],
        "theme": "Saturn confronts you with reality. Accept it.",
        "urgency": "high",
        "dua": "Allahumma inni a'udhu bika min al-hammi wal-hazan",
    },
    ("Saturn", "trine"): {
        "avoid": ["laziness despite ease", "taking stability for granted"],
        "do": ["consolidate gains", "teach what you know", "build legacy"],
        "theme": "Saturn rewards effort. Harvest what you've built.",
        "urgency": "medium",
    },
    ("Saturn", "conjunction"): {
        "avoid": ["self-pity", "heavy burdens", "overwork"],
        "do": ["face reality", "accept lessons", "mature through challenge"],
        "theme": "Saturn sits on you. This is the squeeze. It becomes the pearl.",
        "urgency": "high",
        "dua": "Rabbi zidni ilma",
    },

    # Jupiter transits
    ("Jupiter", "opposition"): {
        "avoid": ["overexpansion", "overconfidence", "excess"],
        "do": ["teach publicly", "share wisdom", "expand through others"],
        "theme": "Jupiter shines through you. Teach what you know.",
        "urgency": "medium",
    },
    ("Jupiter", "trine"): {
        "avoid": ["complacency", "spiritual laziness"],
        "do": ["start a study circle", "give charity", "plan long-term"],
        "theme": "Grace flows. Use it wisely.",
        "urgency": "low",
    },
    ("Jupiter", "conjunction"): {
        "avoid": ["overindulgence", "overpromising"],
        "do": ["begin a new study", "make a pilgrimage (even spiritual)", "seek a teacher"],
        "theme": "Jupiter expands whatever it touches. Touch something worthy.",
        "urgency": "medium",
    },

    # Rahu transits (karmic growth)
    ("Rahu", "conjunction"): {
        "avoid": ["obsession", "illusion", "attachment to material"],
        "do": ["step into the unfamiliar", "embrace growth edge", "question old beliefs"],
        "theme": "Rahu pulls you toward what you fear. That's where growth is.",
        "urgency": "high",
        "dua": "Ya Rabb, guide me through the unfamiliar",
    },
    ("Rahu", "opposition"): {
        "avoid": ["running from the past", "denying karmic patterns"],
        "do": ["face what you've been avoiding", "integrate past-life gifts"],
        "theme": "What you ran from is now in front of you. Face it.",
        "urgency": "high",
    },

    # Ketu transits (release)
    ("Ketu", "conjunction"): {
        "avoid": ["attachment to ego", "clinging to identity"],
        "do": ["release what's ending", "meditate", "let go with grace"],
        "theme": "Ketu dissolves. What falls away was never truly yours.",
        "urgency": "medium",
    },
    ("Ketu", "opposition"): {
        "avoid": ["attachment to material", "ignoring spiritual gifts"],
        "do": ["use your innate gifts", "trust intuition", "serve without attachment"],
        "theme": "Your past-life mastery is available. Use it.",
        "urgency": "medium",
    },

    # Mars transits
    ("Mars", "square"): {
        "avoid": ["impulsive action", "anger", "physical confrontation"],
        "do": ["channel energy into exercise", "assert boundaries", "start a project with care"],
        "theme": "Mars pushes hard. Channel it or it channels you.",
        "urgency": "medium",
    },
    ("Mars", "opposition"): {
        "avoid": ["direct confrontation", "power struggles"],
        "do": ["stand your ground diplomatically", "use assertive energy for creation"],
        "theme": "Direct opposition. Stand firm but don't fight.",
        "urgency": "medium",
    },
    ("Mars", "trine"): {
        "avoid": ["wasted energy"],
        "do": ["physical activity", "bold action", "compete"],
        "theme": "Mars energy flows. Move your body.",
        "urgency": "low",
    },

    # Venus transits
    ("Venus", "conjunction"): {
        "avoid": ["excess in pleasure", "superficiality"],
        "do": ["create beauty", "nurture relationships", "appreciate art"],
        "theme": "Venus beautifies. Make something beautiful today.",
        "urgency": "low",
    },
    ("Venus", "square"): {
        "avoid": ["financial excess", "relationship drama"],
        "do": ["re-evaluate values", "find beauty in simplicity"],
        "theme": "Venus is challenged. Find beauty in what's real.",
        "urgency": "medium",
    },

    # Moon transits (daily weather)
    ("Moon", "conjunction"): {
        "avoid": ["emotional reactivity", "being triggered"],
        "do": ["check in with feelings", "nurture yourself", "connect with mother/roots"],
        "theme": "Moon amplifies. Feel deeply but don't drown.",
        "urgency": "low",
    },
    ("Moon", "opposition"): {
        "avoid": ["projection", "emotional manipulation"],
        "do": ["balance giving and receiving", "see the other side"],
        "theme": "Emotional polarity. Balance is the practice.",
        "urgency": "low",
    },

    # Neptune transits
    ("Neptune", "opposition"): {
        "avoid": ["illusion", "escapism", "confusion"],
        "do": ["meditate deeply", "pray for clarity", "trust intuition but verify"],
        "theme": "Neptune dissolves boundaries. Pray for clear seeing.",
        "urgency": "medium",
        "dua": "Allahumma ariniyal-haqqa haqqan warziqnil-ibdatahu",
    },
    ("Neptune", "trine"): {
        "do": ["deep meditation", "creative visualization", "spiritual study"],
        "theme": "Neptune opens spiritual channels. Use them.",
        "urgency": "low",
    },
}

# ============================================================
# 3. DASHA THEMES: Current Period Guidance
# ============================================================

DASHA_LORD_THEMES = {
    "Sun": {
        "focus": "identity, leadership, father, authority",
        "practice": "Connect with your core identity. Lead from authenticity.",
        "surah": "Al-Falaq (113)",
        "dhikr": "Ya Noor (130x)",
        "warning": "Don't let ego override wisdom.",
    },
    "Moon": {
        "focus": "emotions, mother, home, intuition",
        "practice": "Nurture your emotional body. Honor your mother.",
        "surah": "Ar-Rahman (55)",
        "dhikr": "Ya Rahman (136x)",
        "warning": "Don't let moods dictate decisions.",
    },
    "Mars": {
        "focus": "action, courage, siblings, conflict",
        "practice": "Channel energy into physical discipline. Defend the weak.",
        "surah": "Al-Fath (48)",
        "dhikr": "Ya Jabbar (105x)",
        "warning": "Anger is fire — it can cook or burn.",
    },
    "Mercury": {
        "focus": "communication, learning, trade, analysis",
        "practice": "Study deeply. Write clearly. Trade honestly.",
        "surah": "Ya-Seen (36)",
        "dhikr": "Ya Hakim (149x)",
        "warning": "Analysis without action is paralysis.",
    },
    "Jupiter": {
        "focus": "wisdom, teaching, faith, expansion",
        "practice": "Teach what you know. Expand through generosity.",
        "surah": "Al-Kahf (18)",
        "dhikr": "Ya Alim (148x)",
        "warning": "Expansion without grounding is inflation.",
    },
    "Venus": {
        "focus": "love, beauty, relationships, creativity",
        "practice": "Create beauty. Nurture love. Appreciate art.",
        "surah": "Ar-Rum (30) ayah 21",
        "dhikr": "Ya Wadud (148x)",
        "warning": "Pleasure without purpose is indulgence.",
    },
    "Saturn": {
        "focus": "discipline, structure, career, karma",
        "practice": "Build lasting structures. Accept responsibilities.",
        "surah": "Al-Asr (103)",
        "dhikr": "Ya Sabur (145x)",
        "warning": "Discipline without mercy is cruelty.",
    },
    "Rahu": {
        "focus": "karmic growth, obsession, new direction, technology",
        "practice": "Step into the unfamiliar. Embrace growth.",
        "surah": "Al-Kahf (18) verse 60-82 (Musa & Khidr)",
        "dhikr": "Ya Hadi (88x)",
        "warning": "Growth without wisdom becomes obsession.",
    },
    "Ketu": {
        "focus": "detachment, past-life gifts, spiritual liberation",
        "practice": "Release what's ending. Use innate gifts.",
        "surah": "An-Naba (78)",
        "dhikr": "Ya Khaliq (154x)",
        "warning": "Detachment without grounding becomes dissociation.",
    },
}

# Bhukti modifiers — what the sub-period adds to the Maha theme
BHUKTI_MODIFIERS = {
    "Sun": "with focus on identity and authority",
    "Moon": "with emotional intelligence and nurturing",
    "Mars": "with courage and physical energy",
    "Mercury": "with communication and analytical study",
    "Jupiter": "with wisdom and philosophical depth",
    "Venus": "with creativity and relationship harmony",
    "Saturn": "with discipline and long-term planning",
    "Rahu": "through unconventional growth and technology",
    "Ketu": "through spiritual detachment and inner knowing",
}


# ============================================================
# 4. MOON PHASE GUIDANCE
# ============================================================

def get_moon_phase_name(phase_angle: float) -> Dict:
    """Convert moon phase angle (0-360) to name and guidance."""
    if phase_angle < 22.5 or phase_angle >= 337.5:
        return {"name": "New Moon", "emoji": "🌑", "theme": "Intention & New Beginnings",
                "practice": "Set intentions. Plant seeds. Be still.",
                "energy": "low — rest, plan, begin quietly"}
    elif phase_angle < 67.5:
        return {"name": "Waxing Crescent", "emoji": "🌒", "theme": "Growth & Commitment",
                "practice": "Nurture your intention. Take first steps.",
                "energy": "building — act with growing confidence"}
    elif phase_angle < 112.5:
        return {"name": "First Quarter", "emoji": "🌓", "theme": "Action & Decision",
                "practice": "Make decisions. Take bold action.",
                "energy": "high — push through obstacles"}
    elif phase_angle < 157.5:
        return {"name": "Waxing Gibbous", "emoji": "🌔", "theme": "Refinement & Adjustment",
                "practice": "Refine your approach. Adjust plans.",
                "energy": "very high — fine-tune and prepare"}
    elif phase_angle < 202.5:
        return {"name": "Full Moon", "emoji": "🌕", "theme": "Culmination & Illumination",
                "practice": "Celebrate completion. Release what's done.",
                "energy": "peak — harvest, celebrate, release"}
    elif phase_angle < 247.5:
        return {"name": "Waning Gibbous", "emoji": "🌖", "theme": "Gratitude & Sharing",
                "practice": "Share wisdom. Teach. Give thanks.",
                "energy": "declining — share, teach, be grateful"}
    elif phase_angle < 292.5:
        return {"name": "Last Quarter", "emoji": "🌗", "theme": "Release & Forgiveness",
                "practice": "Let go. Forgive. Clear space.",
                "energy": "low — release, forgive, make peace"}
    else:
        return {"name": "Waning Crescent", "emoji": "🌘", "theme": "Surrender & Rest",
                "practice": "Rest deeply. Surrender. Prepare for rebirth.",
                "energy": "lowest — deep rest, surrender, dream"}


def compute_moon_phase_angle(year: int, month: int, day: int) -> float:
    """
    Approximate Moon phase angle using the synodic month.
    Returns 0-360 where 0=New Moon, 180=Full Moon.
    """
    # Known New Moon: Jan 29, 2025 (UT)
    ref_new_moon = datetime(2025, 1, 29, 12, 0)
    target = datetime(year, month, day, 12, 0)
    synodic_month = 29.53058770576  # days

    days_since = (target - ref_new_moon).total_seconds() / 86400.0
    phase = (days_since % synodic_month) / synodic_month * 360.0
    return phase % 360


# ============================================================
# 5. THE DAILY PULSE — Main Generator
# ============================================================

def generate_daily_pulse(
    year: int, month: int, day: int,
    natal_positions: Dict,
    natal_asc_sign: str = "Gemini",
    natal_asc_degree: float = 81.18,
) -> Dict:
    """
    Generate the Daily Pulse — a complete spiritual briefing for one day.
    
    Connects:
    - Transit aspects (from engine.calculate_transits)
    - Current dasha (Maha + Bhukti)
    - Moon nakshatra + phase
    - Quran verse sync
    - Action recommendations
    - Practice guidance
    
    Returns a single dict with everything needed for the morning briefing.
    """
    from .engine import calculate_transits, get_sign, get_nakshatra
    from .dasha import get_current_dasha
    from datetime import datetime as dt

    # 1. Compute today's transits
    transit_data = calculate_transits(
        natal_positions, year, month, day,
        natal_asc=natal_asc_degree,
        natal_asc_sign=natal_asc_sign,
    )

    # 2. Get current dasha
    birth_date = dt(1996, 3, 6, 14, 0)  # Kamel's birth
    moon_nakshatra = natal_positions.get("Moon", {}).get("nakshatra", "Uttara Phalguni")
    moon_deg_in_nak = natal_positions.get("Moon", {}).get("degree", 6.0)
    target_date = dt(year, month, day, 12, 0)

    dasha_info = get_current_dasha(birth_date, moon_nakshatra, moon_deg_in_nak, target_date)

    maha_lord = dasha_info.get("maha_dasha", {}).get("lord", "Rahu")
    bhukti_lord = dasha_info.get("bhukti", {}).get("lord", "Mercury")

    # 3. Get today's Moon nakshatra and phase
    today_moon = transit_data.get("transit_positions", {}).get("Moon", {})
    today_moon_nak = get_nakshatra(today_moon.get("sidereal", 0))
    moon_phase_angle = compute_moon_phase_angle(year, month, day)
    moon_phase = get_moon_phase_name(moon_phase_angle)

    # 4. Quran-Astro sync
    quran_sync = NAKSHATRA_QURAN.get(
        today_moon_nak.get("name", "Revati"),
        NAKSHATRA_QURAN["Revati"]
    )

    # 5. Action recommendations from transits
    action_items = []
    actions_do = set()
    actions_avoid = set()
    active_urgent = []

    for aspect in transit_data.get("transit_aspects", []):
        if aspect.get("exactness", 99) > 5:
            continue  # Skip wide aspects

        t_planet = aspect.get("transit_planet", "")
        a_type = aspect.get("aspect_type", "")
        key = (t_planet, a_type)

        if key in TRANSIT_ACTIONS:
            rule = TRANSIT_ACTIONS[key]
            if rule.get("urgency") == "high":
                active_urgent.append({
                    "transit": f"{t_planet} {a_type} natal {aspect.get('natal_planet', '')}",
                    "orb": aspect.get("exactness", 0),
                    "theme": rule.get("theme", ""),
                    "dua": rule.get("dua", ""),
                })
            actions_do.update(rule.get("do", []))
            actions_avoid.update(rule.get("avoid", []))

    # 6. Dasha guidance
    dasha_theme = DASHA_LORD_THEMES.get(maha_lord, {})
    bhukti_modifier = BHUKTI_MODIFIERS.get(bhukti_lord, "")

    # 7. Build the pulse
    pulse = {
        "date": f"{year}-{month:02d}-{day:02d}",
        "greeting": _generate_greeting(moon_phase["name"], today_moon_nak.get("name", "")),

        # Cosmic weather
        "cosmic_weather": {
            "moon_phase": moon_phase,
            "moon_nakshatra": {
                "name": today_moon_nak.get("name", ""),
                "lord": today_moon_nak.get("lord", ""),
                "pada": today_moon_nak.get("pada", 0),
            },
            "moon_sign": today_moon.get("sign", ""),
            "moon_degree": today_moon.get("degree", 0),
        },

        # Dasha
        "dasha": {
            "maha": maha_lord,
            "bhukti": bhukti_lord,
            "maha_dates": f"{dasha_info.get('maha_dasha', {}).get('start', '')} to {dasha_info.get('maha_dasha', {}).get('end', '')}",
            "theme": dasha_theme,
            "modifier": bhukti_modifier,
            "focus": dasha_theme.get("focus", ""),
            "warning": dasha_theme.get("warning", ""),
        },

        # Transits
        "transits": {
            "major_active": active_urgent,
            "total_aspects": len(transit_data.get("transit_aspects", [])),
            "closest": transit_data.get("transit_aspects", [])[:5],
        },

        # Actions
        "actions": {
            "do_today": list(actions_do)[:6],
            "avoid_today": list(actions_avoid)[:6],
        },

        # Quran sync
        "quran": quran_sync,

        # Practice recommendation
        "practice": _generate_practice(
            moon_phase, today_moon_nak.get("name", ""),
            maha_lord, bhukti_lord, active_urgent
        ),

        # Full transit data (for detail views)
        "transit_data": {
            "positions": transit_data.get("transit_positions", {}),
            "aspects": transit_data.get("transit_aspects", []),
        },
    }

    return pulse


def _generate_greeting(phase_name: str, nakshatra: str) -> str:
    """Generate a contextual greeting for the morning."""
    greetings = {
        "New Moon": f"Bismillah. New Moon in {nakshatra}. A fresh cycle begins.",
        "Full Moon": f"Alhamdulillah. Full Moon illuminates {nakshatra}. What you planted is ready.",
        "Waxing Crescent": f"SubhanAllah. The light grows through {nakshatra}. Your intention is taking root.",
        "First Quarter": f"Allahu Akbar. The Moon challenges through {nakshatra}. Act with courage.",
        "Waxing Gibbous": f"MashaAllah. {nakshatra} refines your path. Adjust and prepare.",
        "Waning Gibbous": f"JazakAllahu Khayran. Share the wisdom {nakshatra} has taught you.",
        "Last Quarter": f"La ilaha illAllah. Release through {nakshatra}. Forgive and let go.",
        "Waning Crescent": f"Astaghfirullah. Surrender through {nakshatra}. Rest before rebirth.",
    }
    return greetings.get(phase_name, f"Assalamu Alaikum. Today moves through {nakshatra}.")


def _generate_practice(
    moon_phase: Dict,
    nakshatra_name: str,
    maha_lord: str,
    bhukti_lord: str,
    urgent_transits: List,
) -> Dict:
    """Generate specific practice recommendations."""
    practices = []

    # Base practice from Moon phase
    base = {
        "New Moon": "Surah Al-Fatiha (7x) + set intentions for the lunar cycle",
        "Full Moon": "Surah Ar-Rahman (1x) + gratitude journal + release ceremony",
        "Waxing Crescent": "Surah Al-Inshirah (7x) + take first steps toward intention",
        "First Quarter": "Surah Al-Fath (1x) + bold action practice",
        "Waxing Gibbous": "Surah Ya-Seen (1x) + refine and adjust",
        "Waning Gibbous": "Surah Al-Ma'un (7x) + give charity or share knowledge",
        "Last Quarter": "Surah Al-Inshirah (1x) + forgiveness practice",
        "Waning Crescent": "Surah An-Nas (3x) + deep rest and surrender",
    }
    practices.append(base.get(moon_phase.get("name", ""), "Surah Al-Fatiha (7x)"))

    # Dasha-specific practice
    if maha_lord == "Rahu":
        practices.append("Rahu period: Surah Al-Kahf (Friday) or verses 60-82 (Musa & Khidr)")
    elif maha_lord == "Mercury":
        practices.append("Mercury Bhukti: Study a new text. Write your reflections.")
    elif maha_lord == "Saturn":
        practices.append("Saturn period: Simplify. Serve. Accept what is.")
    elif maha_lord == "Jupiter":
        practices.append("Jupiter period: Teach. Share wisdom. Expand generosity.")

    # Urgent transit adjustments
    for ut in urgent_transits[:2]:
        if "Saturn" in ut.get("transit", ""):
            practices.append("SATURN ALERT: Avoid contracts. Double down on discipline.")
        if "Rahu" in ut.get("transit", ""):
            practices.append("RAHU ALERT: Step into the unfamiliar. Question old patterns.")
        if "Ketu" in ut.get("transit", ""):
            practices.append("KETU ALERT: Release. Detach. Trust what falls away.")

    # Nakshatra-specific dhikr
    nak_data = NAKSHATRA_QURAN.get(nakshatra_name, {})
    if nak_data:
        practices.append(f"Today's dhikr: {nak_data.get('dhikr', 'Astaghfirullah')}")

    return {
        "items": practices,
        "primary": practices[0] if practices else "Surah Al-Fatiha (7x)",
        "total_time_minutes": len(practices) * 10,
    }


# ============================================================
# 6. WEEKLY PULSE — 7-Day Outlook
# ============================================================

def generate_weekly_pulse(
    start_year: int, start_month: int, start_day: int,
    natal_positions: Dict,
    natal_asc_sign: str = "Gemini",
    natal_asc_degree: float = 81.18,
) -> List[Dict]:
    """Generate a 7-day pulse forecast."""
    weekly = []
    start = datetime(start_year, start_month, start_day)

    for i in range(7):
        d = start + timedelta(days=i)
        pulse = generate_daily_pulse(
            d.year, d.month, d.day,
            natal_positions, natal_asc_sign, natal_asc_degree,
        )
        weekly.append({
            "date": pulse["date"],
            "day_name": d.strftime("%A"),
            "moon_phase": pulse["cosmic_weather"]["moon_phase"]["name"],
            "moon_emoji": pulse["cosmic_weather"]["moon_phase"]["emoji"],
            "moon_nakshatra": pulse["cosmic_weather"]["moon_nakshatra"]["name"],
            "dasha_theme": pulse["dasha"]["maha"] + " / " + pulse["dasha"]["bhukti"],
            "top_practice": pulse["practice"]["primary"],
            "urgent_count": len(pulse["transits"]["major_active"]),
        })

    return weekly


# ============================================================
# CLI / STANDALONE
# ============================================================

if __name__ == "__main__":
    import sys
    sys.path.insert(0, '.')
    from backend.engine import calculate_planetary_positions

    print("MAHI Daily Pulse Generator")
    print("=" * 60)

    natal = calculate_planetary_positions(1996, 3, 6, 14, 0)
    pulse = generate_daily_pulse(2026, 8, 29, natal)

    print(f"\n{pulse['greeting']}")
    print(f"\nCosmic Weather:")
    cw = pulse['cosmic_weather']
    print(f"  Moon Phase: {cw['moon_phase']['emoji']} {cw['moon_phase']['name']}")
    print(f"  Moon Nakshatra: {cw['moon_nakshatra']['name']} (lord: {cw['moon_nakshatra']['lord']})")
    print(f"  Moon Sign: {cw['moon_sign']} {cw['moon_degree']:.1f}°")

    print(f"\nDasha:")
    d = pulse['dasha']
    print(f"  {d['maha']} Mahadasha / {d['bhukti']} Bhukti")
    print(f"  Theme: {d['focus']}")
    print(f"  Warning: {d['warning']}")

    print(f"\nQuran Sync:")
    q = pulse['quran']
    print(f"  Surah {q['surah_num']}: {q['surah']}")
    print(f"  Theme: {q['theme']}")
    print(f"  Dhikr: {q['dhikr']}")

    print(f"\nDo Today:")
    for item in pulse['actions']['do_today']:
        print(f"  + {item}")
    print(f"\nAvoid Today:")
    for item in pulse['actions']['avoid_today']:
        print(f"  - {item}")

    print(f"\nPractice:")
    for item in pulse['practice']['items']:
        print(f"  > {item}")
    print(f"  Total time: ~{pulse['practice']['total_time_minutes']} minutes")

    if pulse['transits']['major_active']:
        print(f"\nURGENT TRANSITS:")
        for t in pulse['transits']['major_active']:
            print(f"  ! {t['transit']} (orb {t['orb']:.1f}°)")
            print(f"    {t['theme']}")
            if t.get('dua'):
                print(f"    Dua: {t['dua']}")
