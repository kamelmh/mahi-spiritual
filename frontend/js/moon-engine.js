/* MAHI Spiritual System - Moon Phase Engine */

const SURAH_NAMES = {
    1:'Al-Fatihah',2:'Al-Baqarah',3:'Ali Imran',4:'An-Nisa',5:'Al-Maidah',6:'Al-Anam',7:'Al-Araf',8:'Al-Anfal',9:'At-Tawbah',10:'Yunus',
    11:'Hud',12:'Yusuf',13:'Ar-Rad',14:'Ibrahim',15:'Al-Hijr',16:'An-Nahl',17:'Al-Isra',18:'Al-Kahf',19:'Maryam',20:'Taha',
    21:'Al-Anbiya',22:'Al-Hajj',23:'Al-Muminun',24:'An-Nur',25:'Al-Furqan',26:'Ash-Shuara',27:'An-Naml',28:'Al-Qasas',29:'Al-Ankabut',30:'Ar-Rum',
    31:'Luqman',32:'As-Sajdah',33:'Al-Ahzab',34:'Saba',35:'Fatir',36:'Ya-Sin',37:'As-Saffat',38:'Sad',39:'Az-Zumar',40:'Ghafir',
    41:'Fussilat',42:'Ash-Shura',43:'Az-Zukhruf',44:'Ad-Dukhan',45:'Al-Jathiyah',46:'Al-Ahqaf',47:'Muhammad',48:'Al-Fath',49:'Al-Hujurat',50:'Qaf',
    51:'Adh-Dhariyat',52:'At-Tur',53:'An-Najm',54:'Al-Qamar',55:'Ar-Rahman',56:'Al-Waqiah',57:'Al-Hadid',58:'Al-Mujadila',59:'Al-Hashr',60:'Al-Mumtahanah',
    61:'As-Saff',62:'Al-Jumuah',63:'Al-Munafiqun',64:'At-Taghabun',65:'At-Talaq',66:'At-Tahrim',67:'Al-Mulk',68:'Al-Qalam',69:'Al-Haqqah',70:'Al-Maarij',
    71:'Nuh',72:'Al-Jinn',73:'Al-Muzzammil',74:'Al-Muddaththir',75:'Al-Qiyamah',76:'Al-Insan',77:'Al-Mursalat',78:'An-Naba',79:'An-Naziat',80:'Abasa',
    81:'At-Takwir',82:'Al-Infitar',83:'Al-Mutaffifin',84:'Al-Inshiqaq',85:'Al-Buruj',86:'At-Tariq',87:'Al-Ala',88:'Al-Ghashiyah',89:'Al-Fajr',90:'Al-Balad',
    91:'Ash-Shams',92:'Al-Layl',93:'Ad-Duhaa',94:'Ash-Sharh',95:'At-Tin',96:'Al-Alaq',97:'Al-Qadr',98:'Al-Bayyinah',99:'Az-Zalzalah',100:'Al-Adiyat',
    101:'Al-Qariah',102:'At-Takathur',103:'Al-Asr',104:'Al-Humazah',105:'Al-Fil',106:'Quraysh',107:'Al-Maun',108:'Al-Kawthar',109:'Al-Kafirun',110:'An-Nasr',
    111:'Al-Masad',112:'Al-Ikhlas',113:'Al-Falaq',114:'An-Nas'
};

const MoonEngine = {
    // Moon phase names and emojis
    phases: [
        { min: 0, max: 0.0625, name: 'New Moon', emoji: '🌑', phase: 0 },
        { min: 0.0625, max: 0.1875, name: 'Waxing Crescent', emoji: '🌒', phase: 0.125 },
        { min: 0.1875, max: 0.3125, name: 'First Quarter', emoji: '🌓', phase: 0.25 },
        { min: 0.3125, max: 0.4375, name: 'Waxing Gibbous', emoji: '🌔', phase: 0.375 },
        { min: 0.4375, max: 0.5625, name: 'Full Moon', emoji: '🌕', phase: 0.5 },
        { min: 0.5625, max: 0.6875, name: 'Waning Gibbous', emoji: '🌖', phase: 0.625 },
        { min: 0.6875, max: 0.8125, name: 'Last Quarter', emoji: '🌗', phase: 0.75 },
        { min: 0.8125, max: 0.9375, name: 'Waning Crescent', emoji: '🌘', phase: 0.875 },
        { min: 0.9375, max: 1, name: 'New Moon', emoji: '🌑', phase: 0 }
    ],

    // Lunar mansions (28 day cycle)
    mansions: [
        { day: 1, name: 'Al-Thuraya', nakshatra: 'Krittika', meaning: 'Leadership', ruler: 'Sun' },
        { day: 2, name: 'Al-Dabaran', nakshatra: 'Rohini', meaning: 'Growth', ruler: 'Moon' },
        { day: 3, name: 'Al-Haqqa', nakshatra: 'Mrigashira', meaning: 'Exploration', ruler: 'Mars' },
        { day: 4, name: 'Al-Thuayya', nakshatra: 'Ardra', meaning: 'Transformation', ruler: 'Rahu' },
        { day: 5, name: 'Al-Qalb', nakshatra: 'Punarvasu', meaning: 'Renewal', ruler: 'Jupiter' },
        { day: 6, name: 'Al-Shaula', nakshatra: 'Pushya', meaning: 'Nourishment', ruler: 'Saturn' },
        { day: 7, name: "Al-Na'aith", nakshatra: 'Ashlesha', meaning: 'Healing', ruler: 'Mercury' },
        { day: 8, name: 'Al-Bakrah', nakshatra: 'Magha', meaning: 'Ancestral Power', ruler: 'Ketu' },
        { day: 9, name: 'Al-Tarafah', nakshatra: 'P.Phalguni', meaning: 'Creativity', ruler: 'Venus' },
        { day: 10, name: 'Al-Athrah', nakshatra: 'U.Phalguni', meaning: 'Partnership', ruler: 'Sun' },
        { day: 11, name: 'Al-Qalb', nakshatra: 'Hasta', meaning: 'Skill', ruler: 'Moon' },
        { day: 12, name: 'Al-Shaula', nakshatra: 'Chitra', meaning: 'Beauty', ruler: 'Mars' },
        { day: 13, name: "Al-Na'aith", nakshatra: 'Swati', meaning: 'Freedom', ruler: 'Rahu' },
        { day: 14, name: 'Al-Bakrah', nakshatra: 'Vishakha', meaning: 'Goal-setting', ruler: 'Jupiter' },
        { day: 15, name: 'Al-Tarafah', nakshatra: 'Anuradha', meaning: 'Devotion', ruler: 'Saturn' },
        { day: 16, name: 'Al-Athrah', nakshatra: 'Jyeshtha', meaning: 'Power', ruler: 'Mercury' },
        { day: 17, name: 'Al-Qalb', nakshatra: 'Mula', meaning: 'Investigation', ruler: 'Ketu' },
        { day: 18, name: 'Al-Shaula', nakshatra: 'P.Ashadha', meaning: 'Victory', ruler: 'Venus' },
        { day: 19, name: "Al-Na'aith", nakshatra: 'U.Ashadha', meaning: 'Rise', ruler: 'Sun' },
        { day: 20, name: 'Al-Bakrah', nakshatra: 'Shravana', meaning: 'Listening', ruler: 'Moon' },
        { day: 21, name: 'Al-Tarafah', nakshatra: 'Dhanishta', meaning: 'Music', ruler: 'Mars' },
        { day: 22, name: 'Al-Athrah', nakshatra: 'Shatabhisha', meaning: 'Healing', ruler: 'Rahu' },
        { day: 23, name: 'Al-Qalb', nakshatra: 'P.Bhadra', meaning: 'Spiritual Fire', ruler: 'Jupiter' },
        { day: 24, name: 'Al-Shaula', nakshatra: 'U.Bhadra', meaning: 'Determination', ruler: 'Saturn' },
        { day: 25, name: "Al-Na'aith", nakshatra: 'Revati', meaning: 'Journey', ruler: 'Mercury' },
        { day: 26, name: 'Al-Bakrah', nakshatra: 'Ashwini', meaning: 'Quick Action', ruler: 'Ketu' },
        { day: 27, name: 'Al-Tarafah', nakshatra: 'Bharani', meaning: 'Transformation', ruler: 'Venus' },
        { day: 28, name: 'Al-Athrah', nakshatra: 'Krittika', meaning: 'Purification', ruler: 'Sun' }
    ],

    // Calculate moon phase for a given date
    calculatePhase(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // Julian day calculation (using Math.floor for correctness)
        let c, e, jd;
        
        if (month < 3) {
            c = year - 1;
            e = month + 12;
        } else {
            c = year;
            e = month;
        }
        
        jd = Math.floor(365.25 * (c + 4716)) + Math.floor(30.6001 * (e + 1)) + day - 1524.5;
        
        // Moon phase calculation
        // Reference: July 15, 2026 new moon (JD 2461249.5) — recent to avoid synodic month drift
        // Synodic month: 29.530588853 days
        const refNewMoonJd = 2461249.5;
        const synodicMonth = 29.530588853;
        const daysSinceRef = jd - refNewMoonJd;
        const lunations = daysSinceRef / synodicMonth;
        // Get position in current cycle (0 = new moon, 0.5 = full moon)
        const phase = ((lunations % 1) + 1) % 1;
        
        // Find phase name
        const phaseInfo = this.phases.find(p => phase >= p.min && phase < p.max) || this.phases[0];
        
        return {
            phase: phase,
            name: phaseInfo.name,
            emoji: phaseInfo.emoji,
            phaseValue: phaseInfo.phase,
            illumination: Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100)
        };
    },

    // Get lunar mansion for a given date
    getMansion(date = new Date()) {
        const dayOfMonth = date.getDate();
        const mansionIndex = (dayOfMonth - 1) % 28;
        
        return this.mansions[mansionIndex];
    },

    // Get next full moon date
    getNextFullMoon(fromDate = new Date()) {
        const currentPhase = this.calculatePhase(fromDate);
        const daysToFull = ((0.5 - currentPhase.phase + 1) % 1) * 29.53;
        
        const nextFull = new Date(fromDate);
        nextFull.setDate(nextFull.getDate() + Math.ceil(daysToFull));
        
        return nextFull;
    },

    // Get next new moon date
    getNextNewMoon(fromDate = new Date()) {
        const currentPhase = this.calculatePhase(fromDate);
        const daysToNew = ((0 - currentPhase.phase + 1) % 1) * 29.53;
        
        const nextNew = new Date(fromDate);
        nextNew.setDate(nextNew.getDate() + Math.ceil(daysToNew));
        
        return nextNew;
    },

    // Render moon visualization
    renderMoon(containerId, date = new Date()) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const phase = this.calculatePhase(date);
        const lunarDay = Math.floor(this.getLunarDay(date));
        const hijri = this.getHijriDate(date);
        const moonPos = this.getMoonEclipticLong(date);
        const manzil = this.getManzil(moonPos);
        const transits = this.getTransits(date);
        
        // Determine if it's MAHI's personal manzil
        const isPersonalManzil = manzil.num === 28;
        
        const html = `
            <div class="moon-visualization">
                <div class="moon-display">
                    <div class="moon-phase-visual" style="--phase: ${phase.phase}">
                        <div class="moon-surface"></div>
                        <div class="moon-shadow"></div>
                    </div>
                    <div class="moon-emoji">${phase.emoji}</div>
                </div>
                <div class="moon-info">
                    <h3 class="moon-name">${phase.name}</h3>
                    <p class="moon-illumination">${phase.illumination}% illuminated</p>
                    <p class="lunar-day">Lunar Day ${lunarDay} of 29.5</p>
                    <div class="hijri-date">
                        <strong>${hijri.day} ${hijri.month} ${hijri.year} AH</strong>
                    </div>
                    <div class="mansion-info ${isPersonalManzil ? 'personal-mansion' : ''}">
                        <span class="mansion-label">Arabic Manzil:</span>
                        <span class="mansion-name">${manzil.name}</span>
                        <span class="mansion-arabic">${manzil.arabic}</span>
                        <span class="mansion-num">(Manzil ${manzil.num}/28)</span>
                    </div>
                    <p class="mansion-meaning">${manzil.meaning}</p>
                    <p class="mansion-divine">Divine Name: <strong>${manzil.divineName}</strong></p>
                    <p class="mansion-surah">Surah Focus: <strong>${manzil.surah}</strong></p>
                    ${isPersonalManzil ? '<div class="personal-badge">YOUR PERSONAL MANZIL — Batn al-Hut</div>' : ''}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    },

    // Render lunar calendar with Islamic dates
    renderCalendar(containerId, year, month) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        let html = `
            <div class="lunar-calendar-header">
                <h3>${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}</h3>
            </div>
            <div class="lunar-calendar-grid">
                <div class="lcal-day-name">Sun</div>
                <div class="lcal-day-name">Mon</div>
                <div class="lcal-day-name">Tue</div>
                <div class="lcal-day-name">Wed</div>
                <div class="lcal-day-name">Thu</div>
                <div class="lcal-day-name">Fri</div>
                <div class="lcal-day-name">Sat</div>
        `;
        
        // Empty cells
        for (let i = 0; i < startDay; i++) {
            html += '<div class="lcal-day empty"></div>';
        }
        
        // Days with moon phases and Islamic dates
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const phase = this.calculatePhase(date);
            const hijri = this.getHijriDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const dayOfWeek = date.getDay();
            const isFriday = dayOfWeek === 5;
            
            html += `
                <div class="lcal-day ${isToday ? 'today' : ''} ${isFriday ? 'friday' : ''}">
                    <span class="lcal-date">${day}</span>
                    <span class="lcal-moon">${phase.emoji}</span>
                    <span class="lcal-hijri">${hijri.day}</span>
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
    },

    // Arabic Manzil (28 mansions) with Quranic correspondences
    arabicMansions: [
        { num: 1, name: 'Al-Sharatain', arabic: 'الشراطين', sign: 'Aries', stars: 'β/γ Ari', divineName: 'Al-Awwal', surah: 1, surahName: 'Al-Fatihah', meaning: 'Opening, beginning' },
        { num: 2, name: 'Al-Butain', arabic: 'البطين', sign: 'Aries', stars: 'δ/ε Ari', divineName: 'Al-Batin', surah: 57, surahName: 'Al-Hadid', meaning: 'Hidden depths' },
        { num: 3, name: 'Al-Thurayya', arabic: 'الثريا', sign: 'Taurus', stars: 'Pleiades', divineName: 'Ar-Rahman', surah: 55, surahName: 'Ar-Rahman', meaning: 'Mercy upon mercy' },
        { num: 4, name: 'Al-Dabaran', arabic: 'الدبران', sign: 'Taurus', stars: 'Aldebaran', divineName: 'Al-Jabbar', surah: 59, surahName: 'Al-Hashr', meaning: 'Power, gathering' },
        { num: 5, name: 'Al-Haqa', arabic: 'الهقعة', sign: 'Gemini', stars: 'ζ Tau', divineName: 'Al-Khaliq', surah: 55, surahName: 'Ar-Rahman', meaning: 'Creation' },
        { num: 6, name: 'Al-Hana', arabic: 'الحنان', sign: 'Gemini', stars: 'ε Gem', divineName: 'Al-Muhsi', surah: 78, surahName: 'An-Naba', meaning: 'Counting, reckoning' },
        { num: 7, name: 'Al-Dhira', arabic: 'الذراع', sign: 'Cancer', stars: 'α/β Gem', divineName: 'Al-Jalal', surah: 87, surahName: 'Al-Ala', meaning: 'Majesty, glory' },
        { num: 8, name: 'Al-Nathrah', arabic: 'النثرة', sign: 'Cancer', stars: 'δ Can', divineName: 'Al-Hakim', surah: 31, surahName: 'Luqman', meaning: 'Wisdom' },
        { num: 9, name: 'Al-Tarf', arabic: 'الطرف', sign: 'Leo', stars: 'ζ Leo', divineName: 'Ar-Razzaq', surah: 113, surahName: 'Al-Falaq', meaning: 'Protection, provision' },
        { num: 10, name: 'Al-Ghafr', arabic: 'الغفر', sign: 'Leo', stars: 'ε Leo', divineName: 'Ash-Shahid', surah: 85, surahName: 'Al-Buruj', meaning: 'Witnessing' },
        { num: 11, name: 'Al-Zubrah', arabic: 'الميزان', sign: 'Leo', stars: 'δ Leo', divineName: 'Al-Qawi', surah: 40, surahName: 'Ghafir', meaning: 'Strength' },
        { num: 12, name: 'Al-Sarfah', arabic: 'السُّرف', sign: 'Virgo', stars: 'α Vir', divineName: 'Al-Latif', surah: 12, surahName: 'Yusuf', meaning: 'Subtlety, beauty' },
        { num: 13, name: 'Al-Awwa', arabic: 'العوى', sign: 'Virgo', stars: 'δ Vir', divineName: 'Al-Wadud', surah: 36, surahName: 'Ya-Sin', meaning: 'Love, connection' },
        { num: 14, name: 'Al-Simak', arabic: 'السماك', sign: 'Libra', stars: 'Spica', divineName: 'Al-Wali', surah: 13, surahName: 'Ar-Rad', meaning: 'Protection' },
        { num: 15, name: 'Al-Ghafr', arabic: 'الغفر', sign: 'Libra', stars: 'α Lib', divineName: 'Al-Ghaffar', surah: 110, surahName: 'An-Nasr', meaning: 'Forgiveness, victory' },
        { num: 16, name: 'Al-Zubana', arabic: 'الزبانى', sign: 'Libra', stars: 'β Lib', divineName: 'Al-Hakim', surah: 31, surahName: 'Luqman', meaning: 'Wisdom, balance' },
        { num: 17, name: 'Al-Iklil', arabic: 'الإكليل', sign: 'Scorpio', stars: 'α Sco', divineName: 'Al-Jalal', surah: 55, surahName: 'Ar-Rahman', meaning: 'Majesty, transformation' },
        { num: 18, name: 'Al-Qalb', arabic: 'القلب', sign: 'Scorpio', stars: 'Antares', divineName: 'As-Salam', surah: 13, surahName: 'Ar-Rad', meaning: 'Peace of heart' },
        { num: 19, name: 'Al-Shaulah', arabic: 'الshawلا', sign: 'Scorpio', stars: 'τ Sco', divineName: 'Al-Mumin', surah: 23, surahName: 'Al-Muminun', meaning: 'Faith, trust' },
        { num: 20, name: 'Al-Naaim', arabic: 'النعيم', sign: 'Sagittarius', stars: 'ε Sgr', divineName: 'Al-Hadi', surah: 108, surahName: 'Al-Kawthar', meaning: 'Guidance, abundance' },
        { num: 21, name: 'Al-Baldah', arabic: 'البلدة', sign: 'Sagittarius', stars: 'δ Sgr', divineName: 'Al-Baqi', surah: 55, surahName: 'Ar-Rahman', meaning: 'Eternal nature' },
        { num: 22, name: 'Sa\'d al-Dhabih', arabic: 'سعد الذابح', sign: 'Capricorn', stars: 'α Sgr', divineName: 'At-Tawwab', surah: 73, surahName: 'Al-Muzzammil', meaning: 'Repentance, devotion' },
        { num: 23, name: 'Sa\'d Bula', arabic: 'سعد بلع', sign: 'Capricorn', stars: 'β Sgr', divineName: 'Al-Qarib', surah: 93, surahName: 'Ad-Duhaa', meaning: 'Divine nearness' },
        { num: 24, name: 'Sa\'d al-Su\'ud', arabic: 'سعد السعود', sign: 'Aquarius', stars: 'ε Aqr', divineName: 'Al-Fattah', surah: 103, surahName: 'Al-Asr', meaning: 'Opening, time' },
        { num: 25, name: 'Sa\'d al-Akhbiyah', arabic: 'سعد الأخبية', sign: 'Aquarius', stars: 'α Aqr', divineName: 'Al-Muhyi', surah: 30, surahName: 'Ar-Rum', meaning: 'Revival, renewal' },
        { num: 26, name: 'Al-Fargh al-Mukdim', arabic: 'الفرج المقدم', sign: 'Pisces', stars: 'α Peg', divineName: 'Al-Ba\'ith', surah: 75, surahName: 'Al-Qiyamah', meaning: 'Resurrection' },
        { num: 27, name: 'Al-Fargh al-Thani', arabic: 'الفرج الثاني', sign: 'Pisces', stars: 'β Peg', divineName: 'As-Sabur', surah: 94, surahName: 'Ash-Sharh', meaning: 'Patience, relief' },
        { num: 28, name: 'Batn al-Hut', arabic: 'بطن الحوت', sign: 'Pisces', stars: 'ω Psc', divineName: 'Al-Hafiz', surah: 21, surahName: 'Al-Anbiya', meaning: 'Guardianship, depth (YOUR mansion)' }
    ],

    // Get Arabic Manzil from ecliptic longitude
    getManzil(longitude) {
        const manzilSize = 360 / 28;
        const index = Math.floor(longitude / manzilSize) % 28;
        return this.arabicMansions[index];
    },

    // Get Islamic (Hijri) date
    getHijriDate(date) {
        // Known reference: July 17, 2026 = 1 Safar 1448 AH
        const safarStart = new Date(Date.UTC(2026, 6, 17));
        const diffDays = Math.floor((date - safarStart) / (1000 * 60 * 60 * 24));
        
        const months = [
            { name: 'Muharram', days: 30 },
            { name: 'Safar', days: 29 },
            { name: 'Rabi al-Awwal', days: 30 },
            { name: 'Rabi al-Thani', days: 29 },
            { name: 'Jumada al-Ula', days: 30 },
            { name: 'Jumada al-Thani', days: 29 },
            { name: 'Rajab', days: 30 },
            { name: 'Sha\'ban', days: 29 },
            { name: 'Ramadan', days: 30 },
            { name: 'Shawwal', days: 29 },
            { name: 'Dhul Qi\'dah', days: 30 },
            { name: 'Dhul Hijjah', days: 29 }
        ];
        
        let remaining = diffDays;
        let monthIndex = 1; // Start from Safar (index 1)
        let dayInMonth = remaining + 1;
        
        while (dayInMonth > months[monthIndex].days) {
            dayInMonth -= months[monthIndex].days;
            monthIndex = (monthIndex + 1) % 12;
        }
        
        return {
            day: dayInMonth,
            month: months[monthIndex].name,
            year: 1448,
            monthNum: monthIndex + 1
        };
    },

    // Get lunar day in synodic cycle (1-29.5)
    getLunarDay(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        let c, e, jd;
        if (month < 3) { c = year - 1; e = month + 12; } else { c = year; e = month; }
        jd = Math.floor(365.25 * (c + 4716)) + Math.floor(30.6001 * (e + 1)) + day - 1524.5;
        const newMoonJd = 2461249.5; // Known new moon: July 15, 2026
        const diffDays = jd - newMoonJd;
        return ((diffDays % 29.5305882) + 29.5305882) % 29.5305882 + 1;
    },

    // Get today's transits relative to natal chart
    getTransits(date) {
        // Simplified sidereal positions for July 2026
        const transitData = {
            sun: { sign: 'Cancer', degree: 25, nakshatra: 'Pushya', house: null },
            moon: { sign: 'Leo', degree: 2 + (date.getDate() * 0.5), nakshatra: 'Magha', house: null },
            mercury: { sign: 'Cancer', degree: 18, retrograde: true, nakshatra: 'Punarvasu', house: null },
            venus: { sign: 'Virgo', degree: 9, nakshatra: 'U.Phalguni', house: null },
            mars: { sign: 'Gemini', degree: 10, nakshatra: 'Punarvasu', house: null },
            jupiter: { sign: 'Cancer', degree: 8, retrograde: false, nakshatra: 'Pushya', house: null },
            saturn: { sign: 'Pisces', degree: 20, retrograde: false, nakshatra: 'Revati', house: null }
        };
        
        // Map transit signs to natal houses (Gemini ASC = whole sign)
        const houseMap = { 'Gemini': 1, 'Cancer': 2, 'Leo': 3, 'Virgo': 4, 'Libra': 5, 'Scorpio': 6, 'Sagittarius': 7, 'Capricorn': 8, 'Aquarius': 9, 'Pisces': 10, 'Aries': 11, 'Taurus': 12 };
        
        for (const [planet, data] of Object.entries(transitData)) {
            data.house = houseMap[data.sign] || null;
        }
        
        return transitData;
    },

    // Get recitation schedule based on moon
    getRecitationSchedule(date = new Date()) {
        const phase = this.calculatePhase(date);
        const lunarDay = Math.floor(this.getLunarDay(date));
        const hijri = this.getHijriDate(date);
        const moonPos = this.getMoonEclipticLong(date);
        const manzil = this.getManzil(moonPos);
        const transits = this.getTransits(date);
        
        const schedule = {
            fajr: {
                verse: 'Surah Al-Anbiya 21:87 (Yunus)',
                count: phase.phase < 0.5 ? 100 : 50,
                reason: phase.phase < 0.5 ? 'Waxing moon — increase protection' : 'Waning moon — maintain protection'
            },
            asr: {
                verse: 'Surah Al-Qalam 68:1-4',
                count: 1,
                reason: 'Daily writing practice'
            },
            maghrib: {
                verse: 'Surah Ar-Rahman 55:1-4',
                count: 1,
                reason: 'Daily teaching gift activation'
            },
            isha: {
                verse: 'Journal Entry',
                count: 1,
                reason: 'Daily reflection'
            }
        };
        
        // Add mansion-specific practice
        if (manzil.num === 28) {
            // Batn al-Hut = MAHI's personal manzil
            schedule.fajr.count = 200;
            schedule.fajr.reason = 'YOUR MANZIL — Batn al-Hut — Double protection';
        }
        
        return {
            date: date,
            phase: phase,
            lunarDay: lunarDay,
            hijri: hijri,
            manzil: manzil,
            transits: transits,
            schedule: schedule
        };
    },

    // Get moon ecliptic longitude (simplified)
    getMoonEclipticLong(date) {
        // Simplified moon longitude calculation
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const daysSinceJ2000 = (Date.UTC(year, month-1, day) - Date.UTC(2000, 0, 1, 12)) / 86400000;
        
        // Moon's mean longitude
        const L = (218.3165 + 13.1763965268 * daysSinceJ2000) % 360;
        return L < 0 ? L + 360 : L;
    }
};

// Export
window.MoonEngine = MoonEngine;
