/* MAHI Spiritual System - Mystic Features */

// chartData and versesData are defined in chart.js and verses.js
// loadChartData() and loadVersesData() are defined in chart.js and verses.js

// Initialize Mystic Features
async function initMystic() {
    // Wait a bit for chart.js and verses.js to load their data
    if (!chartData) await new Promise(r => setTimeout(r, 500));
    initSoulBlueprint();
    initDestinyMap();
    initSurahLibrary();
    initEmergencyDhikr();
    initDailyQuote();
}

// Soul Blueprint
function initSoulBlueprint() {
    if (!chartData || !chartData.soulBlueprint) return;
    
    const blueprint = chartData.soulBlueprint;
    
    // Soul Purpose
    document.getElementById('soulPurpose').innerHTML = `
        <p>${blueprint.soulPurpose}</p>
        <div class="highlight">You are here to bridge innovation with spirituality, teaching complex truths through writing and communication.</div>
    `;
    
    // Past Life Gifts
    document.getElementById('pastLife').innerHTML = `
        <ul>
            <li>${blueprint.pastLifeGifts}</li>
        </ul>
    `;
    
    // Current Life Challenges
    document.getElementById('challenges').innerHTML = `
        <ul>
            <li>${blueprint.currentLifeChallenges}</li>
            <li>${blueprint.karmicDebts}</li>
        </ul>
    `;
    
    // Spiritual Gifts
    document.getElementById('gifts').innerHTML = `
        <ul>
            ${blueprint.spiritualGifts.split(', ').map(gift => `<li>${gift}</li>`).join('')}
        </ul>
    `;
}

// Destiny Map
function initDestinyMap() {
    if (!chartData || !chartData.dashas) return;
    
    const dashas = chartData.dashas;
    
    // Dasha Timeline
    const timelineHTML = dashas.timeline.map(d => {
        const isCurrent = d.period.includes('2018');
        const isPast = d.period.includes('2011');
        const markerClass = isCurrent ? 'current' : (isPast ? 'past' : 'future');
        const markerText = isCurrent ? '●' : (isPast ? '○' : '○');
        
        return `
            <div class="dasha-item">
                <div class="dasha-marker ${markerClass}">${markerText}</div>
                <div class="dasha-content">
                    <div class="dasha-period">${d.period}</div>
                    <div class="dasha-name">${d.dasha} Dasha</div>
                    <div class="dasha-theme">${d.theme}</div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('dashaTimeline').innerHTML = timelineHTML;
    
    // Current Dasha
    const current = dashas.current;
    document.getElementById('currentDasha').innerHTML = `
        <div class="dasha-detail">
            <div class="dasha-label">Current Period</div>
            <div class="dasha-value highlight">${current.dasha} Dasha</div>
        </div>
        <div class="dasha-detail">
            <div class="dasha-label">Period</div>
            <div class="dasha-value">${current.start} to ${current.end}</div>
        </div>
        <div class="dasha-detail">
            <div class="dasha-label">Theme</div>
            <div class="dasha-value">${current.theme}</div>
        </div>
        <div class="dasha-detail">
            <div class="dasha-label">Quranic Connection</div>
            <div class="dasha-value highlight">${current.quranicConnection}</div>
        </div>
        <div class="dasha-detail">
            <div class="dasha-label">Advice</div>
            <div class="dasha-value">${current.advice}</div>
        </div>
    `;
    
    // Timing Windows
    const timingHTML = `
        <div class="timing-card">
            <div class="timing-year">2024-2026</div>
            <div class="timing-event">Foundation Building</div>
        </div>
        <div class="timing-card">
            <div class="timing-year">2026-2028</div>
            <div class="timing-event">Major Breakthroughs</div>
        </div>
        <div class="timing-card">
            <div class="timing-year">2028-2030</div>
            <div class="timing-event">Spiritual Authority</div>
        </div>
        <div class="timing-card">
            <div class="timing-year">2030-2035</div>
            <div class="timing-event">Global Recognition</div>
        </div>
    `;
    
    document.getElementById('timingWindows').innerHTML = timingHTML;
}

// Surah Library
function initSurahLibrary() {
    if (!versesData || !versesData.surahs) return;
    
    const surahGrid = document.getElementById('surahGrid');
    const surahSearch = document.getElementById('surahSearch');
    
    // Render all Surahs
    renderSurahs(versesData.surahs);
    
    // Search functionality
    surahSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = versesData.surahs.filter(s => 
            s.name.toLowerCase().includes(query) ||
            s.meaning.toLowerCase().includes(query) ||
            s.number.toString().includes(query)
        );
        renderSurahs(filtered);
    });
}

function renderSurahs(surahs) {
    const surahGrid = document.getElementById('surahGrid');
    
    surahGrid.innerHTML = surahs.map(surah => `
        <div class="surah-card" data-surah="${surah.number}">
            <div class="surah-header">
                <span class="surah-number">${surah.number}</span>
                <span class="surah-type ${surah.type.toLowerCase()}">${surah.type}</span>
            </div>
            <div class="surah-name">${surah.name}</div>
            <div class="surah-arabic">${surah.arabic}</div>
            <div class="surah-meaning">${surah.meaning}</div>
            <div class="surah-verses">${surah.verses} verses</div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.surah-card').forEach(card => {
        card.addEventListener('click', () => {
            const surahNum = parseInt(card.dataset.surah);
            showSurahDetails(surahNum);
        });
    });
}

function showSurahDetails(surahNumber) {
    const surah = versesData.surahs.find(s => s.number === surahNumber);
    if (!surah) return;
    
    // Find related verse if exists
    const relatedVerse = versesData.verses.find(v => v.surah === surahNumber);
    
    // Create modal or expand card
    alert(`Surah ${surah.name} (${surah.arabic})\n\nMeaning: ${surah.meaning}\nVerses: ${surah.verses}\nType: ${surah.type}\n\n${relatedVerse ? 'This Surah contains one of your core verses!' : ''}`);
}

// Emergency Dhikr
function initEmergencyDhikr() {
    const emergencyPractices = [
        {
            emotion: 'anxious',
            icon: '😰',
            title: 'When Anxious',
            verse: 'Surah Ar-Rad 13:28',
            arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
            transliteration: 'Ala bi-dhikri Allahi tatma\'innu al-qulub',
            translation: 'Verily, in the remembrance of Allah do hearts find tranquility.',
            dhikr: 'Ya Salam × 100',
            action: 'Take 10 deep breaths while reciting'
        },
        {
            emotion: 'overwhelmed',
            icon: '😫',
            title: 'When Overwhelmed',
            verse: 'Surah Al-Anbiya 21:87',
            arabic: 'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
            transliteration: 'La ilaha illa Anta, Subhanaka, inni kuntu min ad-dhalimin',
            translation: 'There is no god but You, Glory be to You, I have been among the wrongdoers.',
            dhikr: 'Ya Hafiz × 100',
            action: 'Visualize yourself in the whale\'s belly (safe, protected)'
        },
        {
            emotion: 'lost',
            icon: '😵',
            title: 'When Lost',
            verse: 'Surah Ad-Duhaa 93:1-5',
            arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
            transliteration: 'Wa la sawfa yu\'tika rabbuka fatarda',
            translation: 'And your Lord will give you, and you will be satisfied.',
            dhikr: 'Ya Musawwir × 100',
            action: 'Remember: Allah has a plan for you'
        },
        {
            emotion: 'misunderstood',
            icon: '😶',
            title: 'When Misunderstood',
            verse: 'Surah Al-Qalam 68:4',
            arabic: 'إِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ',
            transliteration: 'Innaka la\'ala khuluqin azeem',
            translation: 'And you are of a great moral character.',
            dhikr: 'Ya Alim × 100',
            action: 'Read the full verse 68:1-4 and remember your worth'
        },
        {
            emotion: 'fear',
            icon: '😨',
            title: 'When Afraid',
            verse: 'Surah Al-Falaq 113:1-5',
            arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
            transliteration: 'Qul a\'udhu bi rabbi al-falaq',
            translation: 'Say, I seek refuge in the Lord of daybreak.',
            dhikr: 'Al-Falaq × 3 + An-Nas × 3',
            action: 'Recite both Surahs for complete protection'
        },
        {
            emotion: 'anger',
            icon: '😠',
            title: 'When Angry',
            verse: 'Surah Ali Imran 3:134',
            arabic: 'وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ',
            transliteration: 'Wal-kazimina al-ghayza wal-afina an-nas',
            translation: 'And those who restrain anger and pardon people.',
            dhikr: 'A\'udhu billahi min ash-shaytan ir-rajim × 7',
            action: 'Seek refuge from Satan, then drink water'
        },
        {
            emotion: 'grief',
            icon: '😢',
            title: 'When Grieving',
            verse: 'Surah Al-Baqarah 2:155-157',
            arabic: 'وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ',
            transliteration: 'Wa lanabluwannakum bi-shay\'in min al-khawfi wal-joo\'',
            translation: 'And We will surely test you with something of fear and hunger.',
            dhikr: 'Inna lillahi wa inna ilayhi raji\'un × 100',
            action: 'Remember: This is a test, and Allah rewards the patient'
        },
        {
            emotion: 'confusion',
            icon: '😕',
            title: 'When Confused',
            verse: 'Surah Ash-Sharh 94:5-6',
            arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
            transliteration: 'Fa-inna ma\'al-usri yusra',
            translation: 'For indeed, with hardship will be ease.',
            dhikr: 'Ya Hadi × 100',
            action: 'Trust that clarity will come'
        }
    ];
    
    const emergencyGrid = document.getElementById('emergencyGrid');
    
    emergencyGrid.innerHTML = emergencyPractices.map(p => `
        <div class="emergency-card ${p.emotion}">
            <div class="emergency-icon">${p.icon}</div>
            <div class="emergency-title">${p.title}</div>
            <div class="emergency-verse">${p.verse}</div>
            <div class="emergency-dhikr">${p.arabic}</div>
            <div class="emergency-details" style="display: none;">
                <div class="emergency-transliteration">${p.transliteration}</div>
                <div class="emergency-translation">${p.translation}</div>
                <div class="emergency-action">${p.action}</div>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.emergency-card').forEach(card => {
        card.addEventListener('click', () => {
            const details = card.querySelector('.emergency-details');
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });
    });
}

// Daily Quote
function initDailyQuote() {
    const quotes = [
        {
            arabic: 'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
            translation: 'There is no god but You, Glory be to You, I have been among the wrongdoers.',
            source: 'Surah Al-Anbiya 21:87 - Yunus (AS)'
        },
        {
            arabic: 'الرَّحْمَٰنُ. عَلَّمَ الْقُرْآنَ. خَلَقَ الْإِنسَانَ. عَلَّمَهُ الْبَيَانَ',
            translation: 'The Compassionate. Taught the Quran. Created humanity. Taught them eloquence.',
            source: 'Surah Ar-Rahman 55:1-4'
        },
        {
            arabic: 'نُونٌ. وَالْقَلَمِ وَمَا يَسْطُرُونَ',
            translation: 'Nun. By the pen and what they write.',
            source: 'Surah Al-Qalam 68:1-2'
        },
        {
            arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
            translation: 'Verily, in the remembrance of Allah do hearts find tranquility.',
            source: 'Surah Ar-Rad 13:28'
        },
        {
            arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
            translation: 'And your Lord will give you, and you will be satisfied.',
            source: 'Surah Ad-Duhaa 93:5'
        },
        {
            arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
            translation: 'For indeed, with hardship will be ease.',
            source: 'Surah Ash-Sharh 94:5-6'
        },
        {
            arabic: 'إِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ',
            translation: 'And you are of a great moral character.',
            source: 'Surah Al-Qalam 68:4'
        },
        {
            arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
            translation: 'Say, He is Allah, [who is] One.',
            source: 'Surah Al-Ikhlas 112:1'
        }
    ];
    
    // Pick a quote based on the day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const quote = quotes[dayOfYear % quotes.length];
    
    document.getElementById('dailyQuote').innerHTML = `
        <div class="quote-arabic">${quote.arabic}</div>
        <div class="quote-translation">${quote.translation}</div>
        <div class="quote-source">${quote.source}</div>
    `;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initMystic();
});
