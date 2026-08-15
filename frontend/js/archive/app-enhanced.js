/* MAHI Spiritual System - Enhanced Main Application */

// App State
const AppState = {
    currentPage: 'dashboard',
    theme: localStorage.getItem('mahi_theme') || 'dark',
    practice: null,
    settings: null,
    chartData: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize state manager
    StateManager.init();
    
    // Load data
    await loadData();
    
    // Initialize modules
    initNavigation();
    initTheme();
    initDashboard();
    
    // Initialize engines
    PracticeEngine.init();
    RecitationEngine.init();
    
    // Update date
    updateDate();
    
    // Set up auto-save
    setInterval(autoSave, 30000);
    
    console.log('MAHI Spiritual System initialized');
});

// Load data from JSON files
async function loadData() {
    try {
        // Load chart data
        const chartResponse = await fetch('data/chart.json');
        AppState.chartData = await chartResponse.json();
        
        // Load verses data
        const versesResponse = await fetch('data/verses.json');
        AppState.versesData = await versesResponse.json();
        
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
    
    // Update pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(page)?.classList.add('active');
    
    AppState.currentPage = page;
    
    // Initialize page-specific content
    switch(page) {
        case 'dashboard':
            initDashboard();
            break;
        case 'chart':
            initChart();
            break;
        case 'practice':
            initPractice();
            break;
        case 'verses':
            initVerses();
            break;
        case 'surahs':
            initSurahs();
            break;
        case 'lunar':
            initLunar();
            break;
        case 'emergency':
            initEmergency();
            break;
        case 'destiny':
            initDestiny();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Theme
function initTheme() {
    document.documentElement.setAttribute('data-theme', AppState.theme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', AppState.theme);
    localStorage.setItem('mahi_theme', AppState.theme);
    
    const themeText = document.querySelector('.theme-text');
    if (themeText) {
        themeText.textContent = AppState.theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    }
}

// Dashboard
function initDashboard() {
    updateDate();
    updatePracticeList();
    updateStats();
    updateTransit();
    updateDailyQuote();
    updateLunarPhase();
}

function updateDate() {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        dateEl.textContent = Utils.formatDate(new Date(), 'long');
    }
}

function updatePracticeList() {
    const list = document.getElementById('practiceList');
    if (!list) return;
    
    const summary = PracticeEngine.getTodaySummary();
    
    const practiceItems = [
        { name: 'Fajr Dhikr', counter: 'yunusDhikr', target: 100, time: 'Fajr', icon: '🌅' },
        { name: 'ASR Writing', counter: 'alQalam', target: 1, time: 'ASR', icon: '✍️' },
        { name: 'Maghrib Recitation', counter: 'arRahman', target: 1, time: 'Maghrib', icon: '📖' },
        { name: 'Ya Hafiz', counter: 'yaHafiz', target: 33, time: 'Any', icon: '🛡️' },
        { name: 'Ya Rahman', counter: 'yaRahman', target: 33, time: 'Any', icon: '💙' },
        { name: 'Ya Alim', counter: 'yaAlim', target: 33, time: 'Any', icon: '🧠' }
    ];
    
    list.innerHTML = practiceItems.map(item => {
        const counter = summary.recitations[item.counter] || { count: 0 };
        const completed = counter.count >= item.target;
        const percent = Math.min((counter.count / item.target) * 100, 100);
        
        return `
            <div class="practice-item ${completed ? 'completed' : ''}">
                <div class="practice-icon">${item.icon}</div>
                <div class="practice-info">
                    <span class="practice-name">${item.name}</span>
                    <span class="practice-time">${item.time}</span>
                </div>
                <div class="practice-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                    <span class="practice-count">${counter.count}/${item.target}</span>
                </div>
                <button class="practice-btn ${completed ? 'completed' : ''}" data-counter="${item.counter}">
                    ${completed ? '✓' : '+'}
                </button>
            </div>
        `;
    }).join('');
    
    // Update completion badge
    const completedCount = practiceItems.filter(item => {
        const counter = summary.recitations[item.counter] || { count: 0 };
        return counter.count >= item.target;
    }).length;
    
    const badge = document.getElementById('completionBadge');
    if (badge) {
        const percent = Math.round((completedCount / practiceItems.length) * 100);
        badge.textContent = `${percent}%`;
        badge.className = `completion-badge ${percent === 100 ? 'complete' : ''}`;
    }
    
    // Bind counter buttons
    list.querySelectorAll('[data-counter]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const counter = e.target.dataset.counter;
            PracticeEngine.incrementCounter(counter);
            updatePracticeList();
            updateStats();
        });
    });
}

function updateStats() {
    const practice = StateManager.state.practice;
    
    const streakEl = document.getElementById('streakCount');
    if (streakEl) {
        streakEl.textContent = practice.streak || 0;
    }
    
    const totalEl = document.getElementById('totalRecitations');
    if (totalEl) {
        totalEl.textContent = practice.totalRecitations || 0;
    }
    
    const journalEl = document.getElementById('journalEntries');
    if (journalEl) {
        journalEl.textContent = practice.journal?.length || 0;
    }
}

function updateTransit() {
    const transitEl = document.getElementById('transitInfo');
    if (!transitEl || !AppState.chartData) return;
    
    const now = new Date();
    const dayOfWeek = Utils.getDayOfWeek(now);
    const period = Utils.getCurrentPeriod();
    const moonPhase = MoonEngine.calculatePhase(now);
    const mansion = MoonEngine.getMansion(now);
    
    transitEl.innerHTML = `
        <div class="transit-item">
            <span class="transit-label">Day:</span>
            <span class="transit-value">${dayOfWeek}</span>
        </div>
        <div class="transit-item">
            <span class="transit-label">Period:</span>
            <span class="transit-value">${period.charAt(0).toUpperCase() + period.slice(1)}</span>
        </div>
        <div class="transit-item">
            <span class="transit-label">Moon:</span>
            <span class="transit-value">${moonPhase.emoji} ${moonPhase.name}</span>
        </div>
        <div class="transit-item">
            <span class="transit-label">Mansion:</span>
            <span class="transit-value">${mansion.name}</span>
        </div>
    `;
}

function updateDailyQuote() {
    const quoteEl = document.getElementById('dailyQuote');
    if (!quoteEl) return;
    
    const quotes = [
        { text: "I am both the whale and the swimmer.", source: "Your Mantra" },
        { text: "And you are of a great moral character.", source: "Surah 68:4" },
        { text: "There is no god but You, Glory be to You.", source: "Surah 21:87" },
        { text: "The Compassionate taught the Quran.", source: "Surah 55:1-4" },
        { text: "By the pen and what they write.", source: "Surah 68:1" }
    ];
    
    const today = new Date().getDate();
    const quote = quotes[today % quotes.length];
    
    quoteEl.innerHTML = `
        <div class="quote-text">"${quote.text}"</div>
        <div class="quote-source">— ${quote.source}</div>
    `;
}

function updateLunarPhase() {
    const lunarEl = document.getElementById('lunarPhaseDashboard');
    if (!lunarEl) return;
    
    const phase = MoonEngine.calculatePhase();
    const mansion = MoonEngine.getMansion();
    
    lunarEl.innerHTML = `
        <div class="lunar-mini">
            <span class="lunar-emoji">${phase.emoji}</span>
            <div class="lunar-info">
                <span class="lunar-name">${phase.name}</span>
                <span class="lunar-mansion">${mansion.name}</span>
            </div>
        </div>
    `;
}

// Chart
function initChart() {
    if (!AppState.chartData) return;
    
    ChartEngine.init('chartWheel', AppState.chartData);
    
    // Render planet table
    renderPlanetTable();
    
    // Render yogas
    renderYogas();
    
    // Render houses
    renderHouses();
}

function renderPlanetTable() {
    const table = document.getElementById('planetTable');
    if (!table || !AppState.chartData) return;
    
    const planets = AppState.chartData.planets || [];
    
    table.innerHTML = `
        <table class="planet-data-table">
            <thead>
                <tr>
                    <th>Planet</th>
                    <th>Sign</th>
                    <th>Degree</th>
                    <th>House</th>
                    <th>Nakshatra</th>
                </tr>
            </thead>
            <tbody>
                ${planets.map(p => `
                    <tr>
                        <td><span class="planet-symbol" style="color: ${ChartEngine.config.signColors[p.sign]}">${ChartEngine.config.planetSymbols[p.name] || p.name[0]}</span> ${p.name}</td>
                        <td>${p.sign}</td>
                        <td>${p.degree.toFixed(1)}°</td>
                        <td>${p.house}</td>
                        <td>${p.nakshatra}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderYogas() {
    const list = document.getElementById('yogaList');
    if (!list || !AppState.chartData) return;
    
    const yogas = AppState.chartData.yogas || [];
    
    list.innerHTML = yogas.map(yoga => `
        <div class="yoga-item">
            <div class="yoga-name">${yoga.name}</div>
            <div class="yoga-desc">${yoga.description}</div>
        </div>
    `).join('');
}

function renderHouses() {
    const list = document.getElementById('houseList');
    if (!list || !AppState.chartData) return;
    
    const houses = AppState.chartData.houses || [];
    
    list.innerHTML = houses.map((house, i) => `
        <div class="house-item">
            <span class="house-num">${i + 1}</span>
            <span class="house-sign">${house.sign}</span>
            <span class="house-planet">${house.planet || ''}</span>
        </div>
    `).join('');
}

// Practice
function initPractice() {
    PracticeEngine.init();
    PracticeEngine.updateCalendar();
}

// Verses
function initVerses() {
    RecitationEngine.renderAllVerses('verseSelector');
}

// Surahs
function initSurahs() {
    const grid = document.getElementById('surahGrid');
    const search = document.getElementById('surahSearch');
    
    if (!grid || !AppState.versesData) return;
    
    const surahs = AppState.versesData.surahs || [];
    
    function renderSurahs(filter = '') {
        const filtered = surahs.filter(s => 
            s.name.toLowerCase().includes(filter.toLowerCase()) ||
            s.meaning.toLowerCase().includes(filter.toLowerCase())
        );
        
        grid.innerHTML = filtered.map(surah => `
            <div class="surah-card">
                <div class="surah-number">${surah.number}</div>
                <div class="surah-name">${surah.name}</div>
                <div class="surah-arabic">${surah.arabic}</div>
                <div class="surah-meaning">${surah.meaning}</div>
                <div class="surah-meta">
                    <span>${surah.verses} verses</span>
                    <span>${surah.type}</span>
                </div>
            </div>
        `).join('');
    }
    
    renderSurahs();
    
    if (search) {
        search.addEventListener('input', (e) => {
            renderSurahs(e.target.value);
        });
    }
}

// Lunar
function initLunar() {
    MoonEngine.renderMoon('lunarPhase');
    MoonEngine.renderCalendar('lunarCalendar', new Date().getFullYear(), new Date().getMonth());
    
    // Render recitation schedule
    const schedule = MoonEngine.getRecitationSchedule();
    const scheduleEl = document.getElementById('recitationSchedule');
    
    if (scheduleEl) {
        scheduleEl.innerHTML = `
            <div class="schedule-list">
                ${Object.entries(schedule.schedule).map(([time, item]) => `
                    <div class="schedule-item">
                        <span class="schedule-time">${time.charAt(0).toUpperCase() + time.slice(1)}</span>
                        <span class="schedule-verse">${item.verse}</span>
                        <span class="schedule-count">×${item.count}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Emergency
function initEmergency() {
    const grid = document.getElementById('emergencyGrid');
    if (!grid) return;
    
    const emergencies = [
        { feeling: 'Anxious', verse: '13:28', name: 'Ya Salam', count: 7, nameCount: 100, icon: '😰' },
        { feeling: 'Overwhelmed', verse: '21:87', name: 'Ya Hafiz', count: 7, nameCount: 100, icon: '😰' },
        { feeling: 'Misunderstood', verse: '68:1-4', name: 'Ya Alim', count: 7, nameCount: 100, icon: '😔' },
        { feeling: 'Lost', verse: '93', name: 'Ya Musawwir', count: 7, nameCount: 100, icon: '迷失' },
        { feeling: 'Angry', verse: '114', name: 'Ya Salam', count: 7, nameCount: 100, icon: '😠' },
        { feeling: 'Sad', verse: '94', name: 'Ya Rahman', count: 7, nameCount: 100, icon: '😢' }
    ];
    
    grid.innerHTML = emergencies.map(emo => `
        <div class="emergency-card">
            <div class="emergency-icon">${emo.icon}</div>
            <div class="emergency-feeling">${emo.feeling}</div>
            <div class="emergency-verse">Surah ${emo.verse} × ${emo.count}</div>
            <div class="emergency-name">${emo.name} × ${emo.nameCount}</div>
            <button class="btn-emergency" data-emergency="${emo.feeling.toLowerCase()}">
                Start Practice
            </button>
        </div>
    `).join('');
}

// Destiny
function initDestiny() {
    // Render dasha timeline
    renderDashaTimeline();
    
    // Render current dasha
    renderCurrentDasha();
    
    // Render timing windows
    renderTimingWindows();
}

function renderDashaTimeline() {
    const timeline = document.getElementById('dashaTimeline');
    if (!timeline) return;
    
    // Simplified dasha data
    const dashas = [
        { planet: 'Mercury', start: 2018, end: 2038, current: true },
        { planet: 'Ketu', start: 2038, end: 2045, current: false },
        { planet: 'Venus', start: 2045, end: 2065, current: false }
    ];
    
    timeline.innerHTML = dashas.map(dasha => `
        <div class="dasha-item ${dasha.current ? 'current' : ''}">
            <div class="dasha-planet">${dasha.planet}</div>
            <div class="dasha-period">${dasha.start} - ${dasha.end}</div>
            ${dasha.current ? '<div class="dasha-badge">Current</div>' : ''}
        </div>
    `).join('');
}

function renderCurrentDasha() {
    const dasha = document.getElementById('currentDasha');
    if (!dasha) return;
    
    dasha.innerHTML = `
        <div class="current-dasha-info">
            <div class="dasha-planet-large">Mercury</div>
            <div class="dasha-period-large">2018 - 2038</div>
            <div class="dasha-description">
                Mercury period activates communication, writing, teaching, and intellectual pursuits.
                Your Aquarius Mercury in Dhanishta gives you the gift of music and rhythm in language.
            </div>
        </div>
    `;
}

function renderTimingWindows() {
    const windows = document.getElementById('timingWindows');
    if (!windows) return;
    
    windows.innerHTML = `
        <div class="timing-list">
            <div class="timing-item">
                <span class="timing-label">Best for Writing:</span>
                <span class="timing-value">ASR (3-5 PM)</span>
            </div>
            <div class="timing-item">
                <span class="timing-label">Best for Teaching:</span>
                <span class="timing-value">Maghrib (Sunset)</span>
            </div>
            <div class="timing-item">
                <span class="timing-label">Best for Study:</span>
                <span class="timing-value">Fajr (Dawn)</span>
            </div>
        </div>
    `;
}

// Settings
function loadSettings() {
    const settings = StateManager.state.settings;
    
    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            AppState.theme = theme;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('mahi_theme', theme);
        });
    });
}

// Auto-save
function autoSave() {
    StateManager.save();
}

// Export/Import
function exportData() {
    const data = StateManager.export();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mahi-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    Utils.showNotification('Data exported successfully!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const success = StateManager.import(event.target.result);
            if (success) {
                Utils.showNotification('Data imported successfully!', 'success');
                location.reload();
            } else {
                Utils.showNotification('Failed to import data', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// Make functions available globally
window.exportData = exportData;
window.importData = importData;
window.navigateTo = navigateTo;
