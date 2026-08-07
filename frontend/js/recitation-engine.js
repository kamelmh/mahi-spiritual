/* MAHI Spiritual System - Recitation Engine */

const RecitationEngine = {
    // Verses data
    verses: {
        yunus: {
            name: 'Yunus Dhikr',
            arabic: 'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
            transliteration: 'La ilaha illa Anta, Subhanaka, inni kuntu min ad-dhalimin',
            translation: 'There is no god but You, Glory be to You, I have been among the wrongdoers.',
            surah: 21,
            verse: 87,
            purpose: 'Protection, anxiety relief',
            bestTime: 'Fajr'
        },
        arRahman: {
            name: 'Ar-Rahman',
            arabic: 'الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ',
            transliteration: 'Ar-Rahman. Allama al-Quran. Khalaqa al-insan. Allamahu al-bayan',
            translation: 'The Compassionate. Taught the Quran. Created humanity. Taught them eloquence.',
            surah: 55,
            verse: '1-4',
            purpose: 'Teaching gift activation',
            bestTime: 'Maghrib'
        },
        alQalam: {
            name: 'Al-Qalam',
            arabic: 'نُونٌ وَالْقَلَمِ وَمَا يَسْطُرُونَ مَا أَنتَ بِنِعْمَةِ رَبِّكَ بِمَجْنُونَ إِنَّ لَكَ لَأَجْرًا غَيْرَ مَمْنُونَ',
            transliteration: 'Nun. Wal-qalami wa ma yasturun. Ma anta bi-ni\'mati rabbika bi majnun. Inna laka la ajran ghaira mamnun',
            translation: 'Nun. By the pen and what they write. By the grace of your Lord you are not mad. Indeed, for you is an unfailing reward.',
            surah: 68,
            verse: '1-4',
            purpose: 'Writing legacy, creativity',
            bestTime: 'ASR'
        },
        yaHafiz: {
            name: 'Ya Hafiz',
            arabic: 'يَا حَفِيظُ',
            transliteration: 'Ya Hafiz',
            translation: 'O Guardian',
            purpose: 'Protection, guardian angel',
            bestTime: 'Any'
        },
        yaRahman: {
            name: 'Ya Rahman',
            arabic: 'يَا رَحْمَٰنُ',
            transliteration: 'Ya Rahman',
            translation: 'O Compassionate',
            purpose: 'Mercy, expansion, teaching',
            bestTime: 'Any'
        },
        yaAlim: {
            name: 'Ya Alim',
            arabic: 'يَا عَلِيمُ',
            transliteration: 'Ya Alim',
            translation: 'O Knower',
            purpose: 'Wisdom, knowledge, decisions',
            bestTime: 'Any'
        }
    },

    // Counter state
    counters: {},

    // Initialize
    init() {
        this.counters = StateManager.state.recitations || {};
        this.bindEvents();
        this.updateUI();
    },

    // Bind events
    bindEvents() {
        // Recitation buttons
        document.querySelectorAll('[data-recite]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const verse = e.target.dataset.recite;
                this.recite(verse);
            });
        });
        
        // Reset buttons
        document.querySelectorAll('[data-reset]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const verse = e.target.dataset.reset;
                this.resetCounter(verse);
            });
        });
    },

    // Recite verse
    recite(verseName) {
        if (!this.counters[verseName]) {
            this.counters[verseName] = { count: 0, target: 100, lastRecited: null };
        }
        
        this.counters[verseName].count++;
        this.counters[verseName].lastRecited = new Date().toISOString();
        
        // Update total
        const totalRecitations = Object.values(this.counters)
            .reduce((sum, c) => sum + c.count, 0);
        
        StateManager.set('recitations', this.counters);
        StateManager.set('practice.totalRecitations', totalRecitations);
        
        // Update UI
        this.updateCounterUI(verseName);
        this.updateTotalUI(totalRecitations);
        
        // Check target
        if (this.counters[verseName].count >= this.counters[verseName].target) {
            this.onTargetReached(verseName);
        }
        
        // Animate
        this.animateRecitation(verseName);
    },

    // Reset counter
    resetCounter(verseName) {
        if (!this.counters[verseName]) return;
        
        this.counters[verseName].count = 0;
        StateManager.set('recitations', this.counters);
        this.updateCounterUI(verseName);
    },

    // On target reached
    onTargetReached(verseName) {
        const verse = this.verses[verseName];
        Utils.showNotification(
            `Masha'Allah! ${verse?.name || verseName} target reached!`,
            'success',
            5000
        );
    },

    // Update counter UI
    updateCounterUI(verseName) {
        const counter = this.counters[verseName] || { count: 0, target: 100 };
        
        const countEl = document.querySelector(`[data-count="${verseName}"]`);
        if (countEl) {
            countEl.textContent = counter.count;
        }
        
        const targetEl = document.querySelector(`[data-target="${verseName}"]`);
        if (targetEl) {
            targetEl.textContent = counter.target;
        }
        
        const progressEl = document.querySelector(`[data-progress="${verseName}"]`);
        if (progressEl) {
            const percent = Math.min((counter.count / counter.target) * 100, 100);
            progressEl.style.width = `${percent}%`;
        }
    },

    // Update total UI
    updateTotalUI(total) {
        const totalEl = document.getElementById('totalRecitations');
        if (totalEl) {
            totalEl.textContent = total;
        }
    },

    // Update all UI
    updateUI() {
        Object.keys(this.counters).forEach(verse => {
            this.updateCounterUI(verse);
        });
        
        const total = Object.values(this.counters)
            .reduce((sum, c) => sum + c.count, 0);
        this.updateTotalUI(total);
    },

    // Animate recitation
    animateRecitation(verseName) {
        const btn = document.querySelector(`[data-recite="${verseName}"]`);
        if (btn) {
            btn.classList.add('reciting');
            setTimeout(() => btn.classList.remove('reciting'), 300);
        }
    },

    // Get verse details
    getVerse(verseName) {
        return this.verses[verseName] || null;
    },

    // Get all verses
    getAllVerses() {
        return this.verses;
    },

    // Get today's recommended verses
    getTodayRecommended() {
        const period = Utils.getCurrentPeriod();
        const dayOfWeek = Utils.getDayOfWeek();
        
        const recommended = [];
        
        // Always recommend core verses
        recommended.push(this.verses.yunus);
        recommended.push(this.verses.arRahman);
        recommended.push(this.verses.alQalam);
        
        // Add day-specific
        if (dayOfWeek === 'Thursday') {
            // Jupiter day - power day
            recommended.push({
                name: 'Surah Fatir 35',
                arabic: 'فَاطِرُ',
                transliteration: 'Fatir',
                translation: 'Originator',
                purpose: 'Power day practice',
                count: 3
            });
        }
        
        if (dayOfWeek === 'Saturday') {
            // Saturn day - shadow work
            recommended.push({
                name: 'Surah Qaf 50',
                arabic: 'ق',
                transliteration: 'Qaf',
                translation: 'Qaf',
                purpose: 'Shadow work',
                count: 11
            });
        }
        
        return recommended;
    },

    // Render verse display
    renderVerse(containerId, verseName) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const verse = this.verses[verseName];
        if (!verse) return;
        
        const html = `
            <div class="verse-card active">
                <div class="verse-header">
                    <h3>${verse.name}</h3>
                    <span class="verse-reference">Surah ${verse.surah}:${verse.verse}</span>
                </div>
                <div class="verse-arabic">${verse.arabic}</div>
                <div class="verse-transliteration">${verse.transliteration}</div>
                <div class="verse-translation">${verse.translation}</div>
                <div class="verse-purpose">
                    <span class="purpose-label">Purpose:</span>
                    <span class="purpose-text">${verse.purpose}</span>
                </div>
                <div class="verse-actions">
                    <button class="btn-recite" data-recite="${verseName}">
                        <span class="recite-icon">📿</span>
                        Recite
                    </button>
                    <div class="counter-display">
                        <span data-count="${verseName}">0</span> / <span data-target="${verseName}">100</span>
                    </div>
                </div>
                <div class="verse-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" data-progress="${verseName}" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Bind recite button
        const reciteBtn = container.querySelector('[data-recite]');
        if (reciteBtn) {
            reciteBtn.addEventListener('click', () => this.recite(verseName));
        }
    },

    // Render all verses
    renderAllVerses(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let html = '<div class="verses-grid">';
        
        Object.entries(this.verses).forEach(([key, verse]) => {
            const counter = this.counters[key] || { count: 0, target: 100 };
            const percent = Math.min((counter.count / counter.target) * 100, 100);
            
            html += `
                <div class="verse-mini-card" data-verse="${key}">
                    <div class="verse-mini-header">
                        <span class="verse-mini-name">${verse.name}</span>
                        <span class="verse-mini-count">${counter.count}/${counter.target}</span>
                    </div>
                    <div class="verse-mini-arabic">${verse.arabic.substring(0, 30)}...</div>
                    <div class="verse-mini-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percent}%"></div>
                        </div>
                    </div>
                    <button class="btn-recite-mini" data-recite="${key}">+</button>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Bind events
        container.querySelectorAll('[data-recite]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const verse = e.target.dataset.recite;
                this.recite(verse);
            });
        });
        
        container.querySelectorAll('[data-verse]').forEach(card => {
            card.addEventListener('click', () => {
                const verse = card.dataset.verse;
                this.renderVerse('verseDisplay', verse);
            });
        });
    }
};

// Export
window.RecitationEngine = RecitationEngine;
