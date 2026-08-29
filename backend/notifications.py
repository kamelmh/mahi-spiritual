"""
Smart Notifications Engine
===========================
Proactive alerts for:
- Transit aspects going exact (orb < 1°)
- Dasha transitions (upcoming bhukti changes)
- Moon nakshatra changes (daily)
- Practice reminders based on cosmic weather
- Weekly cosmic forecast alerts

Each notification has:
- priority: urgent / high / medium / low
- category: transit / dasha / moon / practice / forecast
- title: short alert text
- body: detailed explanation
- action: suggested action item
- icon: emoji for UI
- timestamp: when the event occurs
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
import math


# ============================================================
# 1. TRANSIT ALERTS — Aspects going exact
# ============================================================

def find_transit_alerts(natal_positions: Dict, window_days: int = 3) -> List[Dict]:
    """
    Find transit aspects that will go exact within the next N days.
    These are the "goes exact on [date]" alerts.
    """
    from .engine import calculate_transits

    today = datetime.now()
    alerts = []

    # Track which transit-natal pairs we've already alerted
    seen = set()

    for day_offset in range(0, window_days + 1):
        target = today + timedelta(days=day_offset)
        transit_data = calculate_transits(
            natal_positions,
            target.year, target.month, target.day,
            natal_asc=81.18, natal_asc_sign="Gemini"
        )

        for aspect in transit_data.get("transit_aspects", []):
            orb = aspect.get("exactness", 99)
            t_planet = aspect.get("transit_planet", "")
            n_planet = aspect.get("natal_planet", "")
            a_type = aspect.get("aspect_type", "")
            is_major = aspect.get("is_major", False)

            # Only alert for close aspects
            if orb > 1.5:
                continue

            key = f"{t_planet}-{n_planet}-{a_type}"
            if key in seen:
                continue
            seen.add(key)

            # Determine priority
            if orb < 0.3:
                priority = "urgent"
                title = f"EXACT: {t_planet} {a_type} natal {n_planet}"
                icon = "🔴"
            elif orb < 0.8:
                priority = "high"
                title = f"Near-exact: {t_planet} {a_type} natal {n_planet}"
                icon = "🟠"
            else:
                priority = "medium" if is_major else "low"
                title = f"{t_planet} {a_type} natal {n_planet} (orb {orb:.1f}°)"
                icon = "🟡" if is_major else "⚪"

            # Get nature color
            nature = aspect.get("nature", "")
            if nature == "challenging":
                body_prefix = "This is a challenging aspect — expect tension and tests."
            elif nature == "harmonious":
                body_prefix = "This is a supportive aspect — energy flows easily."
            else:
                body_prefix = "This is a strong activating aspect — energy is concentrated."

            # Generate action recommendation
            action = _transit_action(t_planet, a_type, n_planet)

            alerts.append({
                "id": f"transit-{key}-{target.strftime('%Y%m%d')}",
                "category": "transit",
                "priority": priority,
                "icon": icon,
                "title": title,
                "body": f"{body_prefix} Transit {t_planet} is {a_type} natal {n_planet} at {aspect.get('angle', 0):.1f}° (orb {orb:.1f}°). {aspect.get('interpretation', '')}",
                "action": action,
                "date": target.strftime("%Y-%m-%d"),
                "orb": round(orb, 2),
                "nature": nature,
                "is_major": is_major,
                "transit_planet": t_planet,
                "natal_planet": n_planet,
                "aspect_type": a_type,
            })

    # Sort by priority then orb
    priority_order = {"urgent": 0, "high": 1, "medium": 2, "low": 3}
    alerts.sort(key=lambda x: (priority_order.get(x["priority"], 9), x["orb"]))

    return alerts


def _transit_action(t_planet: str, a_type: str, n_planet: str) -> str:
    """Generate action recommendation for a transit aspect."""
    actions = {
        ("Saturn", "square"): "Avoid contracts. Double down on discipline. Don't start new projects.",
        ("Saturn", "opposition"): "Accept responsibility. Don't fight authority. Simplify.",
        ("Saturn", "trine"): "Consolidate gains. Teach what you know. Build legacy.",
        ("Saturn", "conjunction"): "Face reality. Accept lessons. Mature through challenge.",
        ("Jupiter", "opposition"): "Teach publicly. Share wisdom. Expand through others.",
        ("Jupiter", "trine"): "Start a study circle. Give charity. Plan long-term.",
        ("Jupiter", "conjunction"): "Begin a new study. Seek a teacher. Expand generosity.",
        ("Rahu", "conjunction"): "Step into the unfamiliar. Embrace growth edge. Question old beliefs.",
        ("Rahu", "opposition"): "Face what you've been avoiding. Integrate past-life gifts.",
        ("Ketu", "conjunction"): "Release what's ending. Meditate. Let go with grace.",
        ("Ketu", "opposition"): "Use innate gifts. Trust intuition. Serve without attachment.",
        ("Mars", "square"): "Channel energy into exercise. Assert boundaries carefully.",
        ("Mars", "opposition"): "Stand your ground diplomatically. Don't escalate.",
        ("Mars", "trine"): "Move your body. Take bold action. Compete.",
        ("Venus", "conjunction"): "Create beauty. Nurture relationships. Appreciate art.",
        ("Venus", "square"): "Re-evaluate values. Find beauty in simplicity.",
        ("Moon", "conjunction"): "Check in with feelings. Nurture yourself. Connect with roots.",
        ("Moon", "opposition"): "Balance giving and receiving. See the other side.",
        ("Neptune", "opposition"): "Pray for clarity. Meditate deeply. Trust but verify.",
        ("Neptune", "trine"): "Deep meditation. Creative visualization. Spiritual study.",
        ("Uranus", "conjunction"): "Break free. Embrace sudden change. Innovate.",
        ("Uranus", "opposition"): "Balance innovation with stability. Don't rebel blindly.",
    }
    return actions.get((t_planet, a_type), "Stay aware. Let the energy guide you.")


# ============================================================
# 2. DASHA TRANSITION ALERTS
# ============================================================

def find_dasha_alerts(natal_positions: Dict, months_ahead: int = 6) -> List[Dict]:
    """
    Find upcoming dasha transitions within N months.
    These are "dasha shift approaching" alerts.
    """
    from .dasha import calculate_dasha_sequence, calculate_bhukti
    from datetime import datetime as dt

    birth_date = dt(1996, 3, 6, 14, 0)
    moon_nak = natal_positions.get("Moon", {}).get("nakshatra", "Uttara Phalguni")
    moon_deg = natal_positions.get("Moon", {}).get("degree", 6.0)

    dashas = calculate_dasha_sequence(moon_nak, moon_deg, birth_date)
    today = dt.now()
    cutoff = today + timedelta(days=months_ahead * 30)

    alerts = []

    for dasha in dashas:
        end_date = dasha.get("end_date")
        if not end_date:
            continue

        days_until = (end_date - today).days

        # Maha dasha ending
        if today < end_date <= cutoff:
            next_dasha_idx = dashas.index(dasha) + 1
            if next_dasha_idx < len(dashas):
                next_lord = dashas[next_dasha_idx]["lord"]
            else:
                next_lord = "Cycle repeats"

            if days_until <= 7:
                priority = "urgent"
                icon = "🔴"
            elif days_until <= 30:
                priority = "high"
                icon = "🟠"
            else:
                priority = "medium"
                icon = "🟡"

            alerts.append({
                "id": f"dasha-maha-{dasha['lord']}-{end_date.strftime('%Y%m%d')}",
                "category": "dasha",
                "priority": priority,
                "icon": icon,
                "title": f"{dasha['lord']} Mahadasha ending in {days_until} days",
                "body": f"{dasha['lord']} Mahadasha ends {end_date.strftime('%B %d, %Y')}. {next_lord} Mahadasha begins. This is a major life transition — prepare for a shift in energy, focus, and opportunities.",
                "action": f"Reflect on what {dasha['lord']} has taught you. Prepare for {next_lord} themes.",
                "date": end_date.strftime("%Y-%m-%d"),
                "days_until": days_until,
                "from_lord": dasha["lord"],
                "to_lord": next_lord,
                "transition_type": "maha",
            })

        # Check bhukti transitions within current maha dasha
        if dasha["start_date"] <= today <= dasha.get("end_date", today):
            bhukti_list = calculate_bhukti(
                dasha["lord"], dasha["start_date"], dasha["years"]
            )
            for bhukti in bhukti_list:
                bhukti_end = bhukti.get("end_date")
                if not bhukti_end:
                    continue
                bhukti_days = (bhukti_end - today).days

                if today < bhukti_end <= cutoff:
                    next_bhukti_idx = bhukti_list.index(bhukti) + 1
                    next_bhukti_lord = bhukti_list[next_bhukti_idx]["lord"] if next_bhukti_idx < len(bhukti_list) else "?"

                    if bhukti_days <= 3:
                        priority = "high"
                        icon = "🟠"
                    elif bhukti_days <= 14:
                        priority = "medium"
                        icon = "🟡"
                    else:
                        priority = "low"
                        icon = "⚪"

                    alerts.append({
                        "id": f"dasha-bhukti-{bhukti['lord']}-{bhukti_end.strftime('%Y%m%d')}",
                        "category": "dasha",
                        "priority": priority,
                        "icon": icon,
                        "title": f"{bhukti['lord']} Bhukti ending in {bhukti_days} days",
                        "body": f"Within {dasha['lord']} Mahadasha, the {bhukti['lord']} Bhukti ends {bhukti_end.strftime('%B %d')}. {next_bhukti_lord} Bhukti begins. Sub-period energy shifts.",
                        "action": f"Transition from {bhukti['lord']} sub-influence to {next_bhukti_lord}.",
                        "date": bhukti_end.strftime("%Y-%m-%d"),
                        "days_until": bhukti_days,
                        "from_lord": bhukti["lord"],
                        "to_lord": next_bhukti_lord,
                        "transition_type": "bhukti",
                    })

    return alerts


# ============================================================
# 3. MOON NAKSHATRA CHANGE ALERTS
# ============================================================

def find_moon_alerts(natal_positions: Dict) -> List[Dict]:
    """
    Find today's and tomorrow's Moon nakshatra position.
    Alerts when Moon moves to a new nakshatra (changes practice).
    """
    from .engine import calculate_planetary_positions, get_nakshatra

    today = datetime.now()
    tomorrow = today + timedelta(days=1)

    today_moon = calculate_planetary_positions(today.year, today.month, today.day, 12, 0)
    tomorrow_moon = calculate_planetary_positions(tomorrow.year, tomorrow.month, tomorrow.day, 12, 0)

    today_nak = get_nakshatra(today_moon.get("Moon", {}).get("sidereal", 0))
    tomorrow_nak = get_nakshatra(tomorrow_moon.get("Moon", {}).get("sidereal", 0))

    alerts = []

    # Today's Moon position
    alerts.append({
        "id": f"moon-today-{today.strftime('%Y%m%d')}",
        "category": "moon",
        "priority": "low",
        "icon": "🌙",
        "title": f"Moon in {today_nak.get('name', '')} ({today_nak.get('lord', '')} ruled)",
        "body": f"Today's Moon moves through {today_nak.get('name', '')}, ruled by {today_nak.get('lord', '')}. Pada {today_nak.get('pada', 0)}. This nakshatra brings {today_nak.get('symbol', '')} energy.",
        "action": f"Align practice with {today_nak.get('name', '')} themes.",
        "date": today.strftime("%Y-%m-%d"),
        "nakshatra": today_nak.get("name", ""),
        "lord": today_nak.get("lord", ""),
    })

    # If Moon changes nakshatra tomorrow, alert
    if today_nak.get("name") != tomorrow_nak.get("name"):
        alerts.append({
            "id": f"moon-change-{tomorrow.strftime('%Y%m%d')}",
            "category": "moon",
            "priority": "medium",
            "icon": "🌓",
            "title": f"Moon enters {tomorrow_nak.get('name', '')} tomorrow",
            "body": f"Tomorrow the Moon shifts from {today_nak.get('name', '')} to {tomorrow_nak.get('name', '')} ({tomorrow_nak.get('lord', '')} ruled). Practice and energy will change.",
            "action": f"Prepare for {tomorrow_nak.get('name', '')} energy. Review associated Quran surah.",
            "date": tomorrow.strftime("%Y-%m-%d"),
            "nakshatra": tomorrow_nak.get("name", ""),
            "lord": tomorrow_nak.get("lord", ""),
        })

    return alerts


# ============================================================
# 4. PRACTICE REMINDERS
# ============================================================

def find_practice_reminders(natal_positions: Dict) -> List[Dict]:
    """
    Generate practice reminders based on current cosmic weather.
    """
    from .daily_pulse import generate_daily_pulse

    today = datetime.now()
    pulse = generate_daily_pulse(today.year, today.month, today.day, natal_positions)

    alerts = []
    dasha = pulse.get("dasha", {})
    quran = pulse.get("quran", {})
    cosmic = pulse.get("cosmic_weather", {})
    urgent = pulse.get("transits", {}).get("major_active", [])

    # Morning practice reminder
    alerts.append({
        "id": f"practice-morning-{today.strftime('%Y%m%d')}",
        "category": "practice",
        "priority": "medium",
        "icon": "📿",
        "title": f"Morning Practice: {quran.get('dhikr', 'Astaghfirullah')}",
        "body": f"Today's recommended dhikr: {quran.get('dhikr', 'Astaghfirullah')}. Moon in {cosmic.get('moon_nakshatra', {}).get('name', '')} ({cosmic.get('moon_phase', {}).get('name', '')}). Practice: {quran.get('practice', '')}.",
        "action": quran.get("dhikr", "Astaghfirullah"),
        "date": today.strftime("%Y-%m-%d"),
        "practice_type": "morning",
    })

    # Dasha-specific reminder
    maha = dasha.get("maha", "")
    if maha:
        alerts.append({
            "id": f"practice-dasha-{today.strftime('%Y%m%d')}",
            "category": "practice",
            "priority": "low",
            "icon": "🪐",
            "title": f"Dasha Theme: {maha} Mahadasha",
            "body": f"Current period emphasizes {dasha.get('focus', '')}. {dasha.get('warning', '')}. Use this energy intentionally.",
            "action": f"Focus on {dasha.get('focus', 'growth')} today.",
            "date": today.strftime("%Y-%m-%d"),
            "practice_type": "dasha",
        })

    # Urgent transit adjustments
    for ut in urgent[:2]:
        alerts.append({
            "id": f"practice-urgent-{ut.get('transit', '').replace(' ', '-')}-{today.strftime('%Y%m%d')}",
            "category": "practice",
            "priority": "high",
            "icon": "⚡",
            "title": f"Transit Alert: {ut.get('transit', '')}",
            "body": f"{ut.get('theme', '')}. Orb: {ut.get('orb', 0):.1f}°. {ut.get('dua', '')}",
            "action": ut.get("dua", "Stay aware and act wisely."),
            "date": today.strftime("%Y-%m-%d"),
            "practice_type": "urgent",
        })

    return alerts


# ============================================================
# 5. WEEKLY FORECAST ALERT
# ============================================================

def find_weekly_forecast(natal_positions: Dict) -> List[Dict]:
    """
    Generate a weekly cosmic forecast alert.
    """
    from .daily_pulse import generate_weekly_pulse

    today = datetime.now()
    weekly = generate_weekly_pulse(today.year, today.month, today.day, natal_positions)

    # Count urgent days
    urgent_days = [d for d in weekly if d.get("urgent_count", 0) > 0]

    if not urgent_days:
        return []

    alerts = []
    alerts.append({
        "id": f"forecast-weekly-{today.strftime('%Y%m%d')}",
        "category": "forecast",
        "priority": "medium",
        "icon": "🔮",
        "title": f"Weekly Forecast: {len(urgent_days)} active days ahead",
        "body": f"This week has {len(urgent_days)} days with urgent transits. Key days: {', '.join([f'{d['day_name']} ({d['moon_nakshatra']})' for d in urgent_days[:3]])}. Theme: stay disciplined, embrace growth.",
        "action": "Review the weekly outlook and plan accordingly.",
        "date": today.strftime("%Y-%m-%d"),
        "urgent_days": [d["day_name"] for d in urgent_days],
    })

    return alerts


# ============================================================
# 6. MASTER NOTIFICATION GENERATOR
# ============================================================

def generate_all_notifications(natal_positions: Dict) -> Dict:
    """
    Generate all notifications — the master function.
    Returns a complete notification set for the frontend.
    """
    transit_alerts = find_transit_alerts(natal_positions, window_days=3)
    dasha_alerts = find_dasha_alerts(natal_positions, months_ahead=6)
    moon_alerts = find_moon_alerts(natal_positions)
    practice_alerts = find_practice_reminders(natal_positions)
    forecast_alerts = find_weekly_forecast(natal_positions)

    all_alerts = transit_alerts + dasha_alerts + moon_alerts + practice_alerts + forecast_alerts

    # Summary counts
    by_priority = {"urgent": 0, "high": 0, "medium": 0, "low": 0}
    by_category = {"transit": 0, "dasha": 0, "moon": 0, "practice": 0, "forecast": 0}

    for alert in all_alerts:
        by_priority[alert["priority"]] = by_priority.get(alert["priority"], 0) + 1
        by_category[alert["category"]] = by_category.get(alert["category"], 0) + 1

    return {
        "generated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "notifications": all_alerts,
        "summary": {
            "total": len(all_alerts),
            "by_priority": by_priority,
            "by_category": by_category,
            "urgent_count": by_priority["urgent"],
            "high_count": by_priority["high"],
        },
    }


# ============================================================
# CLI
# ============================================================

if __name__ == "__main__":
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    from backend.engine import calculate_planetary_positions

    print("MAHI Smart Notifications")
    print("=" * 50)

    natal = calculate_planetary_positions(1996, 3, 6, 14, 0)
    notifications = generate_all_notifications(natal)

    print(f"\nGenerated: {notifications['generated']}")
    s = notifications["summary"]
    print(f"Total: {s['total']} | Urgent: {s['urgent_count']} | High: {s['high_count']}")
    print(f"By category: {s['by_category']}")

    for n in notifications["notifications"][:10]:
        print(f"\n{n['icon']} [{n['priority'].upper()}] {n['title']}")
        print(f"   {n['body'][:120]}...")
        print(f"   Action: {n['action'][:80]}")
