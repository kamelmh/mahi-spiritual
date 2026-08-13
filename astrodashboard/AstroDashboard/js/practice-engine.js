/* MAHI Spiritual System - Practice Engine */

const PracticeEngine = {
    // Initialize
    init() {
        this.state = StateManager.state.practice;
        this.recitations = StateManager.state.recitations;
        this.bindEvents();
        this.updateUI();
    },

    // Bind events
    bindEvents() {
        // Counter buttons
        document.querySelectorAll('[data-counter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const counter = e.target.dataset.counter;
                this.incrementCounter(counter);
            });
        });
        
        // Journal save
        const saveBtn = document.getElementById('saveJournal');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveJournalEntry());
        }
    },

    // Increment counter
    incrementCounter(name) {
        if (!this.recitations[name]) {
            this.recitations[name] = { count: 0, target: 100, lastRecited: null };
        }
        
        this.recitations[name].count++;
        this.recitations[name].lastRecited = new Date().toISOString();
        
        // Update total recitations
        this.state.totalRecitations++;
        
        // Check if target reached
        if (this.recitations[name].count >= this.recitations[name].target) {
            this.onTargetReached(name);
        }
        
        // Save state
        StateManager.set('recitations', this.recitations);
        StateManager.set('practice.totalRecitations', this.state.totalRecitations);
        try {
            localStorage.setItem('recitations', JSON.stringify(this.recitations));
            localStorage.setItem('practice', JSON.stringify(this.state));
        } catch(e){}
        
        // Update UI
        this.updateCounterUI(name);
        this.updateStatsUI();
        
        // Animate
        Utils.showNotification(`${name} count: ${this.recitations[name].count}`, 'success');
    },

    // Decrement counter
    decrementCounter(name) {
        if (!this.recitations[name] || this.recitations[name].count <= 0) return;
        
        this.recitations[name].count--;
        this.state.totalRecitations--;
        
        StateManager.set('recitations', this.recitations);
        StateManager.set('practice.totalRecitations', this.state.totalRecitations);
        try {
            localStorage.setItem('recitations', JSON.stringify(this.recitations));
            localStorage.setItem('practice', JSON.stringify(this.state));
        } catch(e){}
        
        this.updateCounterUI(name);
        this.updateStatsUI();
    },

    // Reset counter
    resetCounter(name) {
        if (!this.recitations[name]) return;
        
        this.recitations[name].count = 0;
        StateManager.set('recitations', this.recitations);
        try {
            localStorage.setItem('recitations', JSON.stringify(this.recitations));
        } catch(e){}
        this.updateCounterUI(name);
    },

    // On target reached
    onTargetReached(name) {
        Utils.showNotification(`Masha'Allah! ${name} target reached!`, 'success', 5000);
        
        // Add to history
        this.state.history.push({
            date: new Date().toISOString(),
            counter: name,
            count: this.recitations[name].count
        });
        
        StateManager.set('practice.history', this.state.history);
    },

    // Update counter UI
    updateCounterUI(name) {
        const counter = this.recitations[name];
        const element = document.querySelector(`[data-counter-display="${name}"]`);
        if (element) {
            element.textContent = counter.count;
        }
        
        // Update progress bar
        const progress = document.querySelector(`[data-counter-progress="${name}"]`);
        if (progress) {
            const percent = Math.min((counter.count / counter.target) * 100, 100);
            progress.style.width = `${percent}%`;
        }
    },

    // Update stats UI
    updateStatsUI() {
        // Streak
        const streakEl = document.getElementById('streakCount');
        if (streakEl) {
            streakEl.textContent = this.state.streak;
        }
        
        // Total recitations
        const totalEl = document.getElementById('totalRecitations');
        if (totalEl) {
            totalEl.textContent = this.state.totalRecitations;
        }
        
        // Journal entries
        const journalEl = document.getElementById('journalEntries');
        if (journalEl) {
            journalEl.textContent = this.state.journal?.length || 0;
        }
    },

    // Update all UI
    updateUI() {
        Object.keys(this.recitations).forEach(name => {
            this.updateCounterUI(name);
        });
        this.updateStatsUI();
        this.updatePracticeList();
        this.updateCalendar();
    },

    // Update practice list
    updatePracticeList() {
        const list = document.getElementById('practiceList');
        if (!list) return;
        
        const today = new Date().toDateString();
        const todayHistory = this.state.history.filter(h => 
            new Date(h.date).toDateString() === today
        );
        
        const practiceItems = [
            { name: 'Yunus Dhikr', counter: 'yunusDhikr', target: 100, time: 'Fajr' },
            { name: 'Ar-Rahman', counter: 'arRahman', target: 1, time: 'Maghrib' },
            { name: 'Al-Qalam Writing', counter: 'alQalam', target: 1, time: 'ASR' },
            { name: 'Ya Hafiz', counter: 'yaHafiz', target: 33, time: 'Any' },
            { name: 'Ya Rahman', counter: 'yaRahman', target: 33, time: 'Any' },
            { name: 'Ya Alim', counter: 'yaAlim', target: 33, time: 'Any' }
        ];
        
        list.innerHTML = practiceItems.map(item => {
            const counter = this.recitations[item.counter] || { count: 0 };
            const completed = counter.count >= item.target;
            const percent = Math.min((counter.count / item.target) * 100, 100);
            
            return `
                <div class="practice-item ${completed ? 'completed' : ''}">
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
                    <button class="practice-btn" data-counter="${item.counter}">
                        ${completed ? '✓' : '+'}
                    </button>
                </div>
            `;
        }).join('');
        
        // Rebind events
        list.querySelectorAll('[data-counter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const counter = e.target.dataset.counter;
                this.incrementCounter(counter);
            });
        });
    },

    // Save journal entry
    saveJournalEntry() {
        const textarea = document.getElementById('journalPrompt');
        if (!textarea || !textarea.value.trim()) return;
        
        const entry = {
            id: Utils.generateId(),
            date: new Date().toISOString(),
            content: textarea.value.trim(),
            period: Utils.getCurrentPeriod()
        };
        
        if (!this.state.journal) {
            this.state.journal = [];
        }
        
        this.state.journal.push(entry);
        this.state.totalJournalEntries++;
        
        StateManager.set('practice.journal', this.state.journal);
        StateManager.set('practice.totalJournalEntries', this.state.totalJournalEntries);
        
        textarea.value = '';
        Utils.showNotification('Journal entry saved!', 'success');
        
        this.updateStatsUI();
    },

    // Update calendar
    updateCalendar() {
        const calendar = document.getElementById('monthlyCalendar');
        if (!calendar) return;
        
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        let html = `
            <div class="calendar-header">
                <button class="cal-nav" id="prevMonth">‹</button>
                <span class="cal-month">${now.toLocaleString('default', { month: 'long' })} ${year}</span>
                <button class="cal-nav" id="nextMonth">›</button>
            </div>
            <div class="calendar-grid">
                <div class="cal-day-name">Sun</div>
                <div class="cal-day-name">Mon</div>
                <div class="cal-day-name">Tue</div>
                <div class="cal-day-name">Wed</div>
                <div class="cal-day-name">Thu</div>
                <div class="cal-day-name">Fri</div>
                <div class="cal-day-name">Sat</div>
        `;
        
        // Empty cells before first day
        for (let i = 0; i < startDay; i++) {
            html += '<div class="cal-day empty"></div>';
        }
        
        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === now.toDateString();
            const hasPractice = this.state.history.some(h => 
                new Date(h.date).toDateString() === date.toDateString()
            );
            
            html += `
                <div class="cal-day ${isToday ? 'today' : ''} ${hasPractice ? 'has-practice' : ''}">
                    ${day}
                </div>
            `;
        }
        
        html += '</div>';
        calendar.innerHTML = html;
    },

    // Get today's practice summary
    getTodaySummary() {
        const today = new Date().toDateString();
        const todayHistory = this.state.history.filter(h => 
            new Date(h.date).toDateString() === today
        );
        
        return {
            date: today,
            completed: todayHistory.length,
            total: 6,
            recitations: this.recitations,
            journalEntries: this.state.journal?.filter(j => 
                new Date(j.date).toDateString() === today
            ) || []
        };
    },

    // Export practice data
    export() {
        return JSON.stringify({
            practice: this.state,
            recitations: this.recitations,
            exportDate: new Date().toISOString()
        }, null, 2);
    },

    // Import practice data
    import(json) {
        try {
            const data = JSON.parse(json);
            if (data.practice) {
                StateManager.set('practice', data.practice);
            }
            if (data.recitations) {
                StateManager.set('recitations', data.recitations);
            }
            this.init();
            return true;
        } catch (e) {
            console.error('Failed to import practice data:', e);
            return false;
        }
    }
};

// Export
window.PracticeEngine = PracticeEngine;
