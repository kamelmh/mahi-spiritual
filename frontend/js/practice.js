/* MAHI Spiritual System - Practice Tracker */

let practiceData = {
    streak: 0,
    totalRecitations: 0,
    journalEntries: 0,
    lastPractice: null,
    history: []
};

let recitations = {
    '21-87': 0,
    '55-1-4': 0,
    '68-1-4': 0,
    'ya-hafiz': 0,
    'ya-rahman': 0,
    'ya-alim': 0
};

// Initialize Practice
async function initPractice() {
    await loadPracticeData();
    setupRecitationCounter();
    setupJournal();
    updatePracticeStreak();
    updateMonthlyCalendar();
}

// Load practice data
async function loadPracticeData() {
    try {
        const saved = localStorage.getItem('practice');
        if (saved) {
            practiceData = JSON.parse(saved);
        }
        
        const savedRecitations = localStorage.getItem('recitations');
        if (savedRecitations) {
            recitations = JSON.parse(savedRecitations);
        }
    } catch (error) {
        console.error('Error loading practice data:', error);
    }
}

// Setup recitation counter
function setupRecitationCounter() {
    const counterContainer = document.getElementById('recitationCounter');
    
    const recitationItems = [
        { id: '21-87', name: 'Surah Al-Anbiya 21:87 (Yunus)', description: 'La ilaha illa Anta...' },
        { id: '55-1-4', name: 'Surah Ar-Rahman 55:1-4', description: 'Ar-Rahman. Allama al-Quran...' },
        { id: '68-1-4', name: 'Surah Al-Qalam 68:1-4', description: 'Nun. Wal-qalami...' },
        { id: 'ya-hafiz', name: 'Ya Hafiz (O Guardian)', description: 'Daily protection' },
        { id: 'ya-rahman', name: 'Ya Rahman (O Compassionate)', description: 'Daily expansion' },
        { id: 'ya-alim', name: 'Ya Alim (O Knower)', description: 'Daily wisdom' }
    ];
    
    counterContainer.innerHTML = recitationItems.map(item => `
        <div class="recitation-item" data-id="${item.id}">
            <div class="recitation-info">
                <div class="recitation-name">${item.name}</div>
                <div class="recitation-description">${item.description}</div>
            </div>
            <div class="recitation-controls">
                <button class="recitation-btn minus" data-id="${item.id}">-</button>
                <span class="recitation-count" id="count-${item.id}">${recitations[item.id] || 0}</span>
                <button class="recitation-btn plus" data-id="${item.id}">+</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.recitation-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const isPlus = btn.classList.contains('plus');
            updateRecitation(id, isPlus ? 1 : -1);
        });
    });
}

// Update recitation count
function updateRecitation(id, change) {
    recitations[id] = Math.max(0, (recitations[id] || 0) + change);
    
    // Update total recitations
    practiceData.totalRecitations = Object.values(recitations).reduce((sum, count) => sum + count, 0);
    
    // Update display
    document.getElementById(`count-${id}`).textContent = recitations[id];
    
    // Save data
    savePracticeData();
}

// Setup journal
function setupJournal() {
    const saveBtn = document.getElementById('saveJournal');
    const journalTextarea = document.getElementById('journalPrompt');
    
    // Load today's journal entry if exists
    const today = new Date().toDateString();
    const todayPractice = practiceData.history.find(p => p.date === today);
    if (todayPractice && todayPractice.journal) {
        journalTextarea.value = todayPractice.journal;
    }
    
    saveBtn.addEventListener('click', () => {
        const journalText = journalTextarea.value.trim();
        if (!journalText) return;
        
        // Update or create today's entry
        let todayPractice = practiceData.history.find(p => p.date === today);
        if (!todayPractice) {
            todayPractice = { date: today };
            practiceData.history.push(todayPractice);
        }
        
        todayPractice.journal = journalText;
        practiceData.journalEntries = practiceData.history.filter(p => p.journal).length;
        
        // Save data
        savePracticeData();
        
        // Show feedback
        saveBtn.textContent = 'Saved!';
        saveBtn.disabled = true;
        setTimeout(() => {
            saveBtn.textContent = 'Save Entry';
            saveBtn.disabled = false;
        }, 2000);
    });
}

// Update practice streak
function updatePracticeStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const todayPractice = practiceData.history.find(p => p.date === today);
    
    if (todayPractice) {
        const practices = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        const completed = practices.filter(p => todayPractice[p]).length;
        
        if (completed === practices.length) {
            if (practiceData.lastPractice === yesterday) {
                practiceData.streak++;
            } else if (practiceData.lastPractice !== today) {
                practiceData.streak = 1;
            }
            practiceData.lastPractice = today;
        }
    }
    
    document.getElementById('practiceStreak').textContent = practiceData.streak;
}

// Update monthly calendar
function updateMonthlyCalendar() {
    const calendarContainer = document.getElementById('monthlyCalendar');
    
    // Get current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Create calendar header
    const monthName = now.toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    let calendarHTML = `
        <div class="calendar-header">
            <h4>${monthName} ${year}</h4>
        </div>
        <div class="calendar-grid">
            <div class="calendar-day-header">Sun</div>
            <div class="calendar-day-header">Mon</div>
            <div class="calendar-day-header">Tue</div>
            <div class="calendar-day-header">Wed</div>
            <div class="calendar-day-header">Thu</div>
            <div class="calendar-day-header">Fri</div>
            <div class="calendar-day-header">Sat</div>
    `;
    
    // Add empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day).toDateString();
        const dayPractice = practiceData.history.find(p => p.date === date);
        
        let statusClass = '';
        if (dayPractice) {
            const practices = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
            const completed = practices.filter(p => dayPractice[p]).length;
            
            if (completed === practices.length) {
                statusClass = 'completed';
            } else if (completed > 0) {
                statusClass = 'partial';
            } else {
                statusClass = 'missed';
            }
        }
        
        const isToday = day === now.getDate() ? 'today' : '';
        
        calendarHTML += `<div class="calendar-day ${statusClass} ${isToday}">${day}</div>`;
    }
    
    calendarHTML += '</div>';
    
    calendarContainer.innerHTML = calendarHTML;
}

// Save practice data
function savePracticeData() {
    localStorage.setItem('practice', JSON.stringify(practiceData));
    localStorage.setItem('recitations', JSON.stringify(recitations));
    if (typeof StateManager !== 'undefined' && StateManager.set) {
        StateManager.set('practice', practiceData);
        StateManager.set('recitations', recitations);
    }
    if (typeof AppState !== 'undefined') {
        AppState.practice = practiceData;
    }
    if (typeof updateStats === 'function') {
        updateStats();
    }
}

// Add styles for practice page
const practiceStyles = `
    .practice-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    
    .recitation-counter {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .recitation-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        background-color: var(--bg-tertiary);
        border-radius: 8px;
    }
    
    .recitation-info {
        flex: 1;
    }
    
    .recitation-name {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
    }
    
    .recitation-description {
        font-size: 12px;
        color: var(--text-secondary);
    }
    
    .recitation-controls {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .recitation-btn {
        width: 32px;
        height: 32px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: all 0.2s ease;
    }
    
    .recitation-btn:hover {
        background-color: var(--accent-blue);
        border-color: var(--accent-blue);
        color: white;
    }
    
    .recitation-btn.minus:hover {
        background-color: var(--accent-red);
        border-color: var(--accent-red);
    }
    
    .recitation-count {
        min-width: 40px;
        text-align: center;
        font-weight: 700;
        font-size: 18px;
        color: var(--accent-gold);
    }
    
    .journal-entry {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .journal-entry label {
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .journal-entry textarea {
        width: 100%;
        padding: 16px;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-primary);
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
        min-height: 150px;
    }
    
    .journal-entry textarea:focus {
        outline: none;
        border-color: var(--accent-blue);
    }
    
    .monthly-calendar {
        padding: 16px;
    }
    
    .calendar-header {
        text-align: center;
        margin-bottom: 16px;
    }
    
    .calendar-header h4 {
        color: var(--text-primary);
        font-size: 18px;
    }
    
    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
    }
    
    .calendar-day-header {
        text-align: center;
        font-weight: 600;
        color: var(--text-secondary);
        font-size: 12px;
        padding: 8px;
    }
    
    .calendar-day {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        font-size: 14px;
        color: var(--text-primary);
        background-color: var(--bg-tertiary);
    }
    
    .calendar-day.empty {
        background-color: transparent;
    }
    
    .calendar-day.today {
        border: 2px solid var(--accent-gold);
        font-weight: 700;
    }
    
    .calendar-day.completed {
        background-color: var(--accent-green);
        color: white;
    }
    
    .calendar-day.partial {
        background-color: var(--accent-gold);
        color: white;
    }
    
    .calendar-day.missed {
        background-color: var(--accent-red);
        color: white;
    }
    
    @media (max-width: 768px) {
        .practice-container {
            grid-template-columns: 1fr;
        }
    }
`;

// Inject styles
const practiceStyleSheet = document.createElement('style');
practiceStyleSheet.textContent = practiceStyles;
document.head.appendChild(practiceStyleSheet);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initPractice();
});
