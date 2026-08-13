/* MAHI Spiritual System - Quranic Verses */

let versesData = null;
let currentVerse = '21-87';

// Initialize Verses
async function initVerses() {
    await loadVersesData();
    setupVerseSelector();
    displayVerse(currentVerse);
}

// Load verses data
async function loadVersesData() {
    try {
        const response = await fetch('data/verses.json');
        versesData = await response.json();
    } catch (error) {
        console.error('Error loading verses data:', error);
    }
}

// Setup verse selector
function setupVerseSelector() {
    if (!versesData || !versesData.verses) return;
    
    const selector = document.getElementById('verseSelector');
    
    selector.innerHTML = versesData.verses.map(verse => `
        <button class="verse-btn ${verse.id === currentVerse ? 'active' : ''}" data-verse="${verse.id}">
            ${verse.surahName} ${verse.ayah}
        </button>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.verse-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            document.querySelectorAll('.verse-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Display selected verse
            currentVerse = btn.dataset.verse;
            displayVerse(currentVerse);
        });
    });
}

// Display verse
function displayVerse(verseId) {
    if (!versesData || !versesData.verses) return;
    
    const verse = versesData.verses.find(v => v.id === verseId);
    if (!verse) return;
    
    const verseDisplay = document.getElementById('verseDisplay');
    
    verseDisplay.innerHTML = `
        <div class="verse-card">
            <div class="verse-header">
                <div class="verse-name">Surah ${verse.surahName} (${verse.surah})</div>
                <h3>${verse.name}</h3>
                <div class="verse-theme">${verse.theme}</div>
            </div>
            
            <div class="verse-arabic arabic-text">
                ${verse.arabic}
            </div>
            
            <div class="verse-transliteration">
                ${verse.transliteration}
            </div>
            
            <div class="verse-translation">
                ${verse.translation}
            </div>
            
            <div class="verse-connection">
                <strong>Connection to Your Chart:</strong> ${verse.connection}
            </div>
            
            <div class="verse-practice">
                <strong>Practice:</strong> ${verse.practice}
            </div>
            
            ${verse.words && verse.words.length > 0 ? `
                <div class="verse-words">
                    <h4>Word-by-Word Breakdown</h4>
                    <div class="words-grid">
                        ${verse.words.map(word => `
                            <div class="verse-word">
                                <div class="arabic">${word.arabic}</div>
                                <div class="transliteration">${word.transliteration}</div>
                                <div class="meaning">${word.meaning}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Add styles for verses page
const verseStyles = `
    .verse-card {
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 30px;
        margin-bottom: 20px;
    }
    
    .verse-header {
        text-align: center;
        margin-bottom: 24px;
    }
    
    .verse-name {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 8px;
    }
    
    .verse-header h3 {
        font-size: 24px;
        color: var(--accent-gold);
        margin-bottom: 8px;
    }
    
    .verse-theme {
        color: var(--accent-blue);
        font-style: italic;
    }
    
    .verse-arabic {
        font-size: 28px;
        line-height: 1.8;
        margin-bottom: 20px;
        text-align: center;
        color: var(--accent-gold);
    }
    
    .verse-transliteration {
        font-size: 16px;
        color: var(--text-secondary);
        text-align: center;
        font-style: italic;
        margin-bottom: 16px;
    }
    
    .verse-translation {
        font-size: 18px;
        color: var(--text-primary);
        text-align: center;
        margin-bottom: 20px;
    }
    
    .verse-connection,
    .verse-practice {
        background-color: var(--bg-tertiary);
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 12px;
        font-size: 14px;
    }
    
    .verse-connection strong,
    .verse-practice strong {
        color: var(--accent-gold);
    }
    
    .verse-words {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--border-color);
    }
    
    .verse-words h4 {
        text-align: center;
        margin-bottom: 16px;
        color: var(--text-primary);
    }
    
    .words-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 12px;
    }
    
    .verse-word {
        text-align: center;
        padding: 12px;
        background-color: var(--bg-tertiary);
        border-radius: 8px;
    }
    
    .verse-word .arabic {
        font-size: 18px;
        color: var(--accent-gold);
        margin-bottom: 4px;
    }
    
    .verse-word .transliteration {
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: 2px;
    }
    
    .verse-word .meaning {
        font-size: 12px;
        color: var(--text-primary);
        font-weight: 500;
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = verseStyles;
document.head.appendChild(styleSheet);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initVerses();
});
