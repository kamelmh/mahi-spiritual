/* MAHI Spiritual System - Lunar Calendar */

// Ruqya data cache
let ruqyaData = null;

// Load ruqya.json (surah-nakshatra-verse mappings)
async function loadRuqyaData() {
    if (ruqyaData) return ruqyaData;
    try {
        const resp = await fetch('data/ruqya.json');
        ruqyaData = await resp.json();
        return ruqyaData;
    } catch (e) {
        console.warn('Could not load ruqya.json:', e);
        return null;
    }
}

// Get surah name from number using ruqya data
function getSurahInfo(surahNum) {
    if (!ruqyaData) return { name: `Surah ${surahNum}`, arabic: '', meaning: '', nakshatra: '', ruqya_use: '' };
    const found = ruqyaData.surah_nakshatra_map.find(s => s.surah === surahNum);
    return found || { name: `Surah ${surahNum}`, arabic: '', meaning: '', nakshatra: '', ruqya_use: '' };
}

// Get personal chart verse for current placement
function getPersonalChartVerse() {
    if (!ruqyaData) return null;
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Map weekday to chart connection
    const chartMap = {
        0: ruqyaData.chart_connections.sun_aquarius,
        1: ruqyaData.chart_connections.moon_virgo,
        2: null,
        3: ruqyaData.chart_connections.ascendant_gemini,
        4: ruqyaData.chart_connections.jupiter_sagittarius,
        5: ruqyaData.chart_connections.ascendant_gemini,
        6: null
    };
    return chartMap[dayOfWeek] || null;
}

// Lunar mansions data (28 Arabic Manzil - correct system)
const lunarMansions = [
    { num: 1, name: "Al-Sharatain", arabic: "الشراطين", meaning: "The Two Horns", sign: "Aries", degree: 0, surah: 1, divineName: "Al-Awwal" },
    { num: 2, name: "Al-Butain", arabic: "البطين", meaning: "The Belly", sign: "Aries", degree: 12.86, surah: 57, divineName: "Al-Batin" },
    { num: 3, name: "Al-Thurayya", arabic: "الثريا", meaning: "The Pleiades", sign: "Taurus", degree: 25.71, surah: 55, divineName: "Ar-Rahman" },
    { num: 4, name: "Al-Dabaran", arabic: "الدبران", meaning: "The Follower", sign: "Taurus", degree: 38.57, surah: 59, divineName: "Al-Jabbar" },
    { num: 5, name: "Al-Haqqah", arabic: "الهقعة", meaning: "The White Spot", sign: "Gemini", degree: 51.43, surah: 55, divineName: "Al-Khaliq" },
    { num: 6, name: "Al-Hanan", arabic: "الحنان", meaning: "The Dove", sign: "Gemini", degree: 64.29, surah: 78, divineName: "Al-Muhsi" },
    { num: 7, name: "Al-Dhira", arabic: "الذراع", meaning: "The Arm", sign: "Cancer", degree: 77.14, surah: 87, divineName: "Al-Jalal" },
    { num: 8, name: "Al-Nathrah", arabic: "النثرة", meaning: "The Nose", sign: "Cancer", degree: 90, surah: 31, divineName: "Al-Hakim" },
    { num: 9, name: "Al-Tarf", arabic: "الطرف", meaning: "The Glance", sign: "Leo", degree: 102.86, surah: 113, divineName: "Ar-Razzaq" },
    { num: 10, name: "Al-Ghafr", arabic: "الغفر", meaning: "The Covering", sign: "Leo", degree: 115.71, surah: 85, divineName: "Ash-Shahid" },
    { num: 11, name: "Al-Zubrah", arabic: "الميزان", meaning: "The Scales", sign: "Libra", degree: 128.57, surah: 40, divineName: "Al-Qawi" },
    { num: 12, name: "Al-Sarfah", arabic: "السُّرف", meaning: "The Removal", sign: "Virgo", degree: 141.43, surah: 12, divineName: "Al-Latif" },
    { num: 13, name: "Al-Awwa", arabic: "العوى", meaning: "The Howler", sign: "Virgo", degree: 154.29, surah: 36, divineName: "Al-Wadud" },
    { num: 14, name: "Al-Simak", arabic: "السماك", meaning: "The High", sign: "Libra", degree: 167.14, surah: 13, divineName: "Al-Wali" },
    { num: 15, name: "Al-Ghafr", arabic: "الغفر", meaning: "The Forgiver", sign: "Libra", degree: 180, surah: 110, divineName: "Al-Ghaffar" },
    { num: 16, name: "Al-Zubana", arabic: "الزبانى", meaning: "The Horns", sign: "Scorpio", degree: 192.86, surah: 31, divineName: "Al-Hakim" },
    { num: 17, name: "Al-Iklil", arabic: "الإكليل", meaning: "The Crown", sign: "Scorpio", degree: 205.71, surah: 55, divineName: "Al-Jalal" },
    { num: 18, name: "Al-Qalb", arabic: "القلب", meaning: "The Heart", sign: "Scorpio", degree: 218.57, surah: 13, divineName: "As-Salam" },
    { num: 19, name: "Al-Shaulah", arabic: "الshawلا", meaning: "The Raised Tail", sign: "Sagittarius", degree: 231.43, surah: 23, divineName: "Al-Mumin" },
    { num: 20, name: "Al-Na'aem", arabic: "النعيم", meaning: "The Ostriches", sign: "Sagittarius", degree: 244.29, surah: 108, divineName: "Al-Hadi" },
    { num: 21, name: "Al-Baldah", arabic: "البلدة", meaning: "The City", sign: "Capricorn", degree: 257.14, surah: 55, divineName: "Al-Baqi" },
    { num: 22, name: "Sa'd al-Dhabih", arabic: "سعد الذابح", meaning: "The Slaughterer", sign: "Capricorn", degree: 270, surah: 73, divineName: "At-Tawwab" },
    { num: 23, name: "Sa'd Bula", arabic: "سعد بلع", meaning: "The Swallower", sign: "Aquarius", degree: 282.86, surah: 93, divineName: "Al-Qarib" },
    { num: 24, name: "Sa'd al-Su'ud", arabic: "سعد السعود", meaning: "The Fortunate", sign: "Aquarius", degree: 295.71, surah: 103, divineName: "Al-Fattah" },
    { num: 25, name: "Sa'd al-Akhbiyah", arabic: "سعد الأخبية", meaning: "The Tents", sign: "Pisces", degree: 308.57, surah: 30, divineName: "Al-Muhyi" },
    { num: 26, name: "Al-Fargh al-Mukdim", arabic: "الفرج المقدم", meaning: "The Fore Spout", sign: "Pisces", degree: 321.43, surah: 75, divineName: "Al-Ba'ith" },
    { num: 27, name: "Al-Fargh al-Thani", arabic: "الفرج الثاني", meaning: "The Rear Spout", sign: "Pisces", degree: 334.29, surah: 94, divineName: "As-Sabur" },
    { num: 28, name: "Batn al-Hut", arabic: "بطن الحوت", meaning: "The Belly of the Fish", sign: "Pisces", degree: 347.14, surah: 21, divineName: "Al-Hafiz" }
];

// 30-day Quran recitation plan (Imran Hosein method - NEVER chop a Surah)
// Each day = one complete Surah or logical grouping
const quranRecitationPlan = [
    // Week 1: Days 1-7 (Six Days of Creation + Sabbath)
    { day: 1, surah: "Al-Baqarah (2)", verses: 286, theme: "Foundation, law, covenant" },
    { day: 2, surah: "Al-Imran (3)", verses: 200, theme: "Family, dialogue, unity" },
    { day: 3, surah: "An-Nisa (4)", verses: 177, theme: "Women, justice, social order" },
    { day: 4, surah: "Al-Ma'idah (5)", verses: 120, theme: "Food, fulfillment, completion" },
    { day: 5, surah: "Al-An'am (6)", verses: 166, theme: "Cattle, unity, divine signs" },
    { day: 6, surah: "Al-A'raf (7)", verses: 206, theme: "Heights, Noah, Moses, Jesus" },
    { day: 7, surah: "Al-Anfal (8) + At-Tawbah (9)", verses: 204, theme: "Battle, repentance (no Bismillah link)" },
    // Week 2: Days 8-14
    { day: 8, surah: "Yunus (10) + Hud (11)", verses: 232, theme: "Prophets, patience, signs" },
    { day: 9, surah: "Yusuf (12) + Ar-Ra'd (13)", verses: 154, theme: "Joseph's story, thunder" },
    { day: 10, surah: "Ibrahim (14) + Al-Hijr (15)", verses: 151, theme: "Abraham, exile, protection" },
    { day: 11, surah: "An-Nahl (16)", verses: 128, theme: "Bees, gifts, balance (1/3 Quran complete)" },
    { day: 12, surah: "Al-Isra (17) + Al-Kahf (18)", verses: 221, theme: "Night journey, cave sleepers" },
    { day: 13, surah: "Maryam (19) + Taha (20)", verses: 233, theme: "Mary, Moses, revelation" },
    { day: 14, surah: "Al-Anbiya (21) + Al-Hajj (22)", verses: 190, theme: "Prophets, pilgrimage, accountability" },
    // Week 3: Days 15-21 (Full Moon to Last Third)
    { day: 15, surah: "Al-Mu'minun (23) + An-Nur (24)", verses: 182, theme: "Believers, Light (Full Moon night)" },
    { day: 16, surah: "Al-Furqan (25) + Ash-Shu'ara (26)", verses: 304, theme: "Criterion, poets, prophets' trials" },
    { day: 17, surah: "An-Naml (27) + Al-Qasas (28) + Al-Ankabut (29)", verses: 250, theme: "Ant, stories, spider (today)" },
    { day: 18, surah: "Ar-Rum (30) + Luqman (31) + As-Sajdah (32) + Al-Ahzab (33)", verses: 197, theme: "Romans, wisdom, prostration, confederates" },
    { day: 19, surah: "Saba' (34) + Fatir (35) + Ya-Sin (36) + As-Saffat (37)", verses: 364, theme: "Sheba, Originator, Y-Sin, Ranks" },
    { day: 20, surah: "Sad (38) + Az-Zumar (39) + Ghafir (40)", verses: 248, theme: "David, troops, Forgiver" },
    { day: 21, surah: "Fussilat (41) + Ash-Shura (42) + Az-Zukhruf (43) + Ad-Dukhan (44)", verses: 255, theme: "Detail, consultation, ornament, smoke" },
    // Week 4: Days 22-29 (Last Third - odd nights = Lailatul Qadr)
    { day: 22, surah: "Al-Jathiyah (45) + Al-Ahqaf (46) + Muhammad (47) + Al-Fath (48) + Al-Hujurat (49)", verses: 157, theme: "Crouching, wind, Muhammad, victory, rooms" },
    { day: 23, surah: "Qaf (50) + Adh-Dhariyat (51) + At-Tur (52) + An-Najm (53) + Al-Qamar (54)", verses: 271, theme: "Qaf, winds, mount, star, moon" },
    { day: 24, surah: "Ar-Rahman (55) + Al-Waqi'ah (56) + Al-Hadid (57) + Al-Mujadilah (58)", verses: 225, theme: "Mercy, event, iron, pleading" },
    { day: 25, surah: "Al-Hashr (59) + Al-Mumtahanah (60) + As-Saff (61) + Al-Jumu'ah (62) + Al-Munafiqun (63) + At-Taghabun (64) + Al-Halq (65) + At-Tahrim (66) + Al-Mulk (67) + Al-Qalam (68)", verses: 187, theme: "Gathering, testing, row, Friday, hypocrites, loss, divorce, prohibition, sovereignty, pen" },
    { day: 26, surah: "Al-Haqqah (69) + Al-Ma'arij (70) + Nuh (71) + Al-Jinn (72) + Al-Muzzammil (73) + Al-Muddaththir (74)", verses: 228, theme: "Reality, ascents, Noah, jinn, wrapped, cloaked" },
    { day: 27, surah: "Al-Qiyamah (75) + Al-Insan (76) + Al-Mursalat (77) + An-Naba (78) + An-Nazi'at (79)", verses: 207, theme: "Resurrection, human, sent, news, draggers" },
    { day: 28, surah: "Abasa (80) + At-Takwir (81) + Al-Infitar (82) + Al-Mutaffifin (83) + Al-Inshiqaq (84) + Al-Buruj (85) + At-Tariq (86) + Al-Ala (87) + Al-Ghashiyah (88)", verses: 235, theme: "Frowned, shatter, split, defrauders, cleave, mansions, nightcomer, Most High, overwhelming" },
    { day: 29, surah: "Al-Fajr (89) + Al-Balad (90) + Ash-Shams (91) + Al-Layl (92) + Ad-Duha (93) + Ash-Sharh (94) + At-Tin (95) + Al-Alaq (96) + Al-Qadr (97)", verses: 137, theme: "Dawn, city, sun, night, morning, relief, fig, clot, power (Lailatul Qadr)" },
    // Day 30: Final Surahs
    { day: 30, surah: "Al-Bayyinah (98) through An-Nas (114)", verses: 106, theme: "Clear proof to mankind - 17 final surahs" }
];

// MAHI's personal surah-planet correspondences (from chart)
const personalSurahMap = {
    sun: { surah: 91, name: "Ash-Shams", theme: "Divine light, sovereignty" },
    moon: { surah: 54, name: "Al-Qamar", theme: "Cycles, mercy, reflection" },
    mars: { surah: 111, name: "Al-Masad", theme: "Strength, protection, discipline" },
    mercury: { surah: 68, name: "Al-Qalam", theme: "Knowledge, writing, wisdom" },
    jupiter: { surah: 35, name: "Fatir", theme: "Abundance, guidance, mercy" },
    venus: { surah: 55, name: "Ar-Rahman", theme: "Beauty, compassion, union" },
    saturn: { surah: 50, name: "Qaf", theme: "Time, accountability, depth" }
};

// MAHI's core verses (always recited daily)
const coreVerses = [
    { surah: 21, verse: 87, arabic: "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ", transliteration: "La ilaha illa Anta, Subhanaka, inni kuntu min ad-dhalimin", meaning: "There is no god but You, Glory be to You, I have been among the wrongdoers", purpose: "Yunus dhikr - Protection through surrender", count: 100 },
    { surah: 55, verse: "1-4", arabic: "الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ", transliteration: "Ar-Rahman. Allama al-Quran. Khalaqa al-insan. Allamahu al-bayan", meaning: "The Compassionate. Taught the Quran. Created humanity. Taught them eloquence", purpose: "Teaching gift activation", count: 1 },
    { surah: 68, verse: "1-4", arabic: "نُونٌ وَالْقَلَمِ وَمَا يَسْطُرُونَ", transliteration: "Nun. Wal-qalami wa ma yasturun", meaning: "Nun. By the pen and what they write", purpose: "Writing legacy creation", count: 1 }
];

// Initialize Lunar
async function initLunar() {
    await loadRuqyaData();
    updateLunarPhase();
    updateRecitationSchedule();
    updateLunarCalendar();
}

// Update lunar phase
function updateLunarPhase() {
    const lunarPhase = document.getElementById('lunarPhase');
    if (!lunarPhase) return;
    
    const now = new Date();
    const phase = getMoonPhase(now);
    
    // Get current moon position
    const moonPosition = getMoonPosition(now);
    
    // Get correct manzil from MoonEngine
    const manzil = window.MoonEngine ? MoonEngine.getManzil(moonPosition) : lunarMansions[0];
    
    // Get Islamic date
    const hijri = window.MoonEngine ? MoonEngine.getHijriDate(now) : { day: '?', month: '?', year: '?' };
    
    // Get lunar day
    const lunarDay = window.MoonEngine ? Math.floor(MoonEngine.getLunarDay(now)) : '?';
    
    // Is today Friday (Venus day)?
    const dayOfWeek = now.getDay();
    const dayNames = ['Sunday (Sun)', 'Monday (Moon)', 'Tuesday (Mars)', 'Wednesday (Mercury)', 'Thursday (Jupiter)', 'Friday (Venus)', 'Saturday (Saturn)'];
    
    // Get surah details from ruqya data
    const surahInfo = getSurahInfo(manzil.surah);
    
    // Get personal chart verse
    const chartVerse = getPersonalChartVerse();
    
    lunarPhase.innerHTML = `
        <div class="lunar-phase-icon">${phase.icon}</div>
        <div class="lunar-phase-name">${phase.name}</div>
        <div class="lunar-day-info">Lunar Day ${lunarDay} of 29.5</div>
        <div class="hijri-date-display">${hijri.day} ${hijri.month} ${hijri.year} AH</div>
        <div class="planetary-day">${dayNames[dayOfWeek]}</div>
        <div class="lunar-mansion ${manzil.num === 28 ? 'personal-mansion' : ''}">
            <strong>${manzil.name}</strong> (${manzil.arabic})
            <br><span class="mansion-meaning">${manzil.meaning}</span>
            <br><span class="mansion-divine">Divine Name: ${manzil.divineName}</span>
            <br><span class="mansion-surah"><span class="surah-number">${manzil.surah}</span> ${surahInfo.name || ''} ${surahInfo.arabic || ''}</span>
            ${surahInfo.nakshatra ? `<br><span class="mansion-nakshatra">Nakshatra: ${surahInfo.nakshatra}</span>` : ''}
        </div>
        <div class="lunar-info">
            <p>Position: ${moonPosition.toFixed(2)}° ecliptic</p>
            ${manzil.num === 28 ? '<p class="personal-note">YOUR MANZIL — Batn al-Hut — Double your practice!</p>' : ''}
        </div>
        ${chartVerse ? `
        <div class="chart-verse-card">
            <div class="chart-verse-label">TODAY'S CHART VERSE (${chartVerse.ruling_planet || chartVerse.nakshatra || ''})</div>
            <div class="chart-verse-surahs">${(chartVerse.key_surahs || []).map(s => {
                const info = getSurahInfo(s);
                return `${info.name} (${s})`;
            }).join(' · ')}</div>
            <div class="chart-verse-connection">${chartVerse.connection || ''}</div>
        </div>
        ` : ''}
    `;
}

// Get moon phase
function getMoonPhase(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const c = Math.floor(365.25 * year);
    const e = Math.floor(30.6 * month);
    const jd = c + e + day - 694039.09;
    const phase = jd / 29.5305882;
    const cycle = phase - Math.floor(phase);
    
    let name, icon;
    if (cycle < 0.0625) {
        name = 'New Moon';
        icon = '🌑';
    } else if (cycle < 0.1875) {
        name = 'Waxing Crescent';
        icon = '🌒';
    } else if (cycle < 0.3125) {
        name = 'First Quarter';
        icon = '🌓';
    } else if (cycle < 0.4375) {
        name = 'Waxing Gibbous';
        icon = '🌔';
    } else if (cycle < 0.5625) {
        name = 'Full Moon';
        icon = '🌕';
    } else if (cycle < 0.6875) {
        name = 'Waning Gibbous';
        icon = '🌖';
    } else if (cycle < 0.8125) {
        name = 'Last Quarter';
        icon = '🌗';
    } else if (cycle < 0.9375) {
        name = 'Waning Crescent';
        icon = '🌘';
    } else {
        name = 'New Moon';
        icon = '🌑';
    }
    
    return { name, icon, cycle };
}

// Get moon position (simplified)
function getMoonPosition(date) {
    // Simplified calculation for moon position in degrees
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Moon's approximate position
    const daysSinceEpoch = (year - 1900) * 365.25 + (month - 1) * 30.4375 + day;
    const moonPosition = (daysSinceEpoch * 13.176396) % 360;
    
    return moonPosition;
}

// Get Islamic (Hijri) date
function getHijriDate(date) {
    // Simplified calculation based on known new moon: July 15, 2026 = 1 Muharram 1448
    // Actually: July 16, 2026 = 1 Safar 1448 (from research)
    const safarStart = new Date(2026, 6, 16); // July 16, 2026 = 1 Safar 1448
    const diffDays = Math.floor((date - safarStart) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        // Before Safar - still Muharram
        const muharramStart = new Date(2026, 5, 17); // Approx June 17 = 1 Muharram
        const mDay = Math.floor((date - muharramStart) / (1000 * 60 * 60 * 24)) + 1;
        return { day: mDay, month: "Muharram", year: 1448 };
    }
    
    return { day: diffDays + 1, month: "Safar", year: 1448 };
}

// Get lunar day in cycle (1-29/30)
function getLunarDay(date) {
    // Known new moon: July 15, 2026 at ~09:43 UTC
    const newMoon = new Date(Date.UTC(2026, 6, 15, 9, 43));
    const diffMs = date - newMoon;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return ((diffDays % 29.5305882) + 29.5305882) % 29.5305882 + 1;
}

// Get today's recitation based on lunar day (Imran Hosein method)
function updateRecitationSchedule() {
    const scheduleContainer = document.getElementById('recitationSchedule');
    const now = new Date();
    
    // Calculate lunar day
    const lunarDay = Math.floor(getLunarDay(now));
    const hijri = getHijriDate(now);
    
    // Get today's recitation from the plan
    const todayRecitation = quranRecitationPlan[Math.min(lunarDay - 1, 29)] || quranRecitationPlan[0];
    
    // Day of week
    const dayOfWeek = now.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const planetDays = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    
    // Friday = Venus day
    let specialNote = '';
    if (dayOfWeek === 5) {
        specialNote = `<div class="special-day">FRIDAY — Venus Day (Ar-Rahman). Add Surah Ar-Rahman 55 × 1 after Maghrib</div>`;
    } else if (dayOfWeek === 4) {
        specialNote = `<div class="special-day">THURSDAY — Jupiter Day (Power Day). Add Surah Fatir 35 × 3</div>`;
    } else if (dayOfWeek === 6) {
        specialNote = `<div class="special-day">SATURDAY — Saturn Day (Shadow Work). Add Surah Qaf 50 × 11</div>`;
    }
    
    // Personal verse based on lunar day (if it matches a core surah)
    let personalNote = '';
    if (lunarDay === 21 || todayRecitation.surah.includes('21')) {
        personalNote = '<div class="special-verse">YOUR VERSE: Surah Al-Anbiya 21:87 (Yunus) × 100 — Protection</div>';
    } else if (todayRecitation.surah.includes('55')) {
        personalNote = '<div class="special-verse">YOUR VERSE: Surah Ar-Rahman 55:1-4 (Ar-Rahman) — Teaching gift</div>';
    } else if (todayRecitation.surah.includes('68')) {
        personalNote = '<div class="special-verse">YOUR VERSE: Surah Al-Qalam 68:1-4 (Al-Qalam) — Writing legacy</div>';
    }
    
    // Today's ruqya focus based on lunar mansion
    const moonPos = getMoonPosition(now);
    const currentMansion = lunarMansions.find(m => {
        const next = lunarMansions[lunarMansions.indexOf(m) + 1];
        if (!next) return moonPos >= m.degree;
        return moonPos >= m.degree && moonPos < next.degree;
    }) || lunarMansions[0];
    
    let ruqyaFocusHTML = '';
    if (ruqyaData) {
        const mansionSurah = getSurahInfo(currentMansion.surah);
        // Find surah-for-needs matches
        const needsMatches = [];
        if (ruqyaData.surah_for_needs) {
            for (const [need, surahs] of Object.entries(ruqyaData.surah_for_needs)) {
                const match = surahs.find(s => s.surah === currentMansion.surah);
                if (match) {
                    needsMatches.push({ need: need.replace(/_/g, ' '), use: match.use });
                }
            }
        }
        if (needsMatches.length > 0 || mansionSurah.ruqya_use) {
            ruqyaFocusHTML = `<div class="ruqya-focus">
                <div class="ruqya-focus-title">RUQYA FOCUS: ${currentMansion.name}</div>
                ${mansionSurah.ruqya_use ? `<div class="ruqya-use">${mansionSurah.ruqya_use}</div>` : ''}
                ${needsMatches.map(m => `<div class="ruqya-need"><span class="need-label">${m.need}:</span> ${m.use}</div>`).join('')}
            </div>`;
        }
    }
    
    // Core verses (daily)
    const coreHTML = coreVerses.map(v => 
        `<div class="core-verse-item">
            <span class="core-verse-arabic">${v.arabic.substring(0, 30)}...</span>
            <span class="core-verse-purpose">${v.purpose}</span>
            <span class="core-verse-count">× ${v.count}</span>
        </div>`
    ).join('');
    
    scheduleContainer.innerHTML = `
        <div class="schedule-header">
            <h4>Lunar Day ${lunarDay} of 30</h4>
            <p class="hijri-date">${hijri.day} ${hijri.month} ${hijri.year} AH</p>
        </div>
        <div class="schedule-content">
            <div class="recitation-surah">${todayRecitation.surah}</div>
            <div class="recitation-verses">${todayRecitation.verses} verses — ${todayRecitation.theme}</div>
            ${specialNote}
            ${personalNote}
        </div>
        ${ruqyaFocusHTML}
        <div class="core-verses-section">
            <h5>Daily Core Verses (Every Day)</h5>
            ${coreHTML}
        </div>
        <div class="schedule-note">
            <p><strong>Method:</strong> Imran Hosein's lunar recitation</p>
            <p><strong>Rule:</strong> NEVER chop a Surah — read complete chapters</p>
            <p><strong>Today's planet:</strong> ${planetDays[dayOfWeek]}</p>
        </div>
    `;
}

// Update lunar calendar
function updateLunarCalendar() {
    const lunarCalendar = document.getElementById('lunarCalendar');
    if (!lunarCalendar) return;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Get lunar phases for the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let calendarHTML = `
        <div class="lunar-calendar-header">
            <h4>Lunar Phases — ${now.toLocaleString('default', { month: 'long' })} ${year}</h4>
        </div>
        <div class="lunar-calendar-grid">
    `;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const phase = getMoonPhase(date);
        const hijri = window.MoonEngine ? MoonEngine.getHijriDate(date) : { day: '' };
        
        // Get lunar mansion for this day
        const dayMoonPos = getMoonPosition(date);
        const dayMansion = lunarMansions.find(m => {
            const next = lunarMansions[lunarMansions.indexOf(m) + 1];
            if (!next) return dayMoonPos >= m.degree;
            return dayMoonPos >= m.degree && dayMoonPos < next.degree;
        }) || lunarMansions[0];
        
        // Get surah info for calendar
        const daySurahInfo = getSurahInfo(dayMansion.surah);
        
        const isToday = day === now.getDate() ? 'today' : '';
        const isFriday = date.getDay() === 5 ? 'friday' : '';
        
        calendarHTML += `
            <div class="lunar-day ${isToday} ${isFriday}">
                <div class="lunar-day-number">${day}</div>
                <div class="lunar-day-phase">${phase.icon}</div>
                <div class="lunar-day-hijri">${hijri.day}</div>
                <div class="lunar-day-surah">${dayMansion.surah}·${daySurahInfo.name ? daySurahInfo.name.substring(0, 6) : ''}</div>
            </div>
        `;
    }
    
    calendarHTML += '</div>';
    
    // Add upcoming lunar return
    const nextLunarReturn = getNextLunarReturn(now);
    calendarHTML += `
        <div class="lunar-return">
            <h4>Next Lunar Return (Moon at 25° Pisces / Revati)</h4>
            <p>${nextLunarReturn.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Moon will be at ${nextLunarReturn.degree.toFixed(2)}° Pisces — Revati Nakshatra / Batn al-Hut</p>
            <p><strong>YOUR most powerful day! Full Surah Al-Anbiya recitation + Ya Hafiz × 1000</strong></p>
        </div>
    `;
    
    lunarCalendar.innerHTML = calendarHTML;
}

// Get next lunar return
function getNextLunarReturn(fromDate) {
    // Calculate when moon returns to ~25° Pisces (Revati)
    const moonCycle = 27.32; // days
    const targetDegree = 25.15; // Ketu's degree in Pisces
    
    // Find next occurrence
    let date = new Date(fromDate);
    for (let i = 0; i < 30; i++) {
        date.setDate(date.getDate() + 1);
        const moonPos = getMoonPosition(date);
        
        // Check if moon is near target degree in Pisces (270-300°)
        if (moonPos >= 270 && moonPos <= 300) {
            if (Math.abs(moonPos - (270 + targetDegree)) < 5) {
                return { date: date, degree: moonPos - 270 };
            }
        }
    }
    
    // Fallback: return 27 days from now
    date = new Date(fromDate);
    date.setDate(date.getDate() + 27);
    return { date: date, degree: targetDegree };
}

// Add styles for lunar page
const lunarStyles = `
    .lunar-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
    }
    
    .lunar-phase {
        text-align: center;
        padding: 30px;
    }
    
    .lunar-phase-icon {
        font-size: 80px;
        margin-bottom: 20px;
    }
    
    .lunar-phase-name {
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 12px;
    }
    
    .lunar-mansion {
        margin-bottom: 16px;
    }
    
    .lunar-mansion strong {
        color: var(--accent-gold);
        font-size: 18px;
    }
    
    .mansion-surah .surah-number {
        color: var(--accent-blue);
        font-weight: 700;
    }
    
    .mansion-nakshatra {
        font-size: 12px;
        color: var(--text-secondary);
        font-style: italic;
    }
    
    .chart-verse-card {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 8px;
        padding: 12px;
        margin-top: 12px;
    }
    
    .chart-verse-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--accent-blue);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 6px;
    }
    
    .chart-verse-surahs {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
    }
    
    .chart-verse-connection {
        font-size: 12px;
        color: var(--text-secondary);
        line-height: 1.4;
    }
    
    .lunar-info {
        font-size: 14px;
        color: var(--text-secondary);
    }
    
    .lunar-info p {
        margin-bottom: 4px;
    }
    
    .schedule-header {
        margin-bottom: 16px;
    }
    
    .schedule-header h4 {
        color: var(--accent-gold);
        font-size: 18px;
    }
    
    .schedule-content {
        margin-bottom: 16px;
    }
    
    .recitation-surah {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 8px;
    }
    
    .recitation-sections {
        color: var(--text-secondary);
        margin-bottom: 12px;
    }
    
    .special-day {
        background-color: var(--accent-gold);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-weight: 600;
        margin-bottom: 8px;
    }
    
    .special-verse {
        background-color: var(--accent-blue);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-weight: 600;
    }
    
    .schedule-note {
        font-size: 12px;
        color: var(--text-secondary);
        padding-top: 12px;
        border-top: 1px solid var(--border-color);
    }
    
    .schedule-note strong {
        color: var(--accent-gold);
    }
    
    .ruqya-focus {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1));
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 8px;
        padding: 12px;
        margin-top: 16px;
    }
    
    .ruqya-focus-title {
        font-size: 11px;
        font-weight: 700;
        color: var(--accent-gold);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
    }
    
    .ruqya-use {
        font-size: 13px;
        color: var(--text-primary);
        font-style: italic;
        margin-bottom: 8px;
    }
    
    .ruqya-need {
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: 4px;
    }
    
    .need-label {
        color: var(--accent-blue);
        font-weight: 600;
        text-transform: capitalize;
    }
    
    .schedule-note p {
        margin-bottom: 4px;
    }
    
    .lunar-calendar-header {
        margin-bottom: 16px;
    }
    
    .lunar-calendar-header h4 {
        color: var(--text-primary);
        font-size: 18px;
    }
    
    .lunar-calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
        margin-bottom: 20px;
    }
    
    .lunar-day {
        text-align: center;
        padding: 8px 4px;
        background-color: var(--bg-tertiary);
        border-radius: 6px;
    }
    
    .lunar-day.today {
        border: 2px solid var(--accent-gold);
    }
    
    .lunar-day-number {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
    }
    
    .lunar-day-phase {
        font-size: 20px;
        margin-bottom: 4px;
    }
    
    .lunar-day-hijri {
        font-size: 10px;
        color: var(--text-secondary);
    }
    
    .lunar-day-surah {
        font-size: 8px;
        color: var(--accent-gold);
        margin-top: 2px;
        opacity: 0.8;
    }
    
    .lunar-return {
        background-color: var(--bg-tertiary);
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid var(--accent-gold);
    }
    
    .lunar-return h4 {
        color: var(--accent-gold);
        margin-bottom: 12px;
    }
    
    .lunar-return p {
        margin-bottom: 8px;
        color: var(--text-primary);
    }
    
    .lunar-return strong {
        color: var(--accent-gold);
    }
    
    @media (max-width: 768px) {
        .lunar-calendar-grid {
            gap: 4px;
        }
        
        .lunar-day {
            padding: 4px 2px;
        }
        
        .lunar-day-phase {
            font-size: 16px;
        }
        
        .lunar-day-name {
            display: none;
        }
    }
`;

// Inject styles
const lunarStyleSheet = document.createElement('style');
lunarStyleSheet.textContent = lunarStyles;
document.head.appendChild(lunarStyleSheet);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initLunar();
});
