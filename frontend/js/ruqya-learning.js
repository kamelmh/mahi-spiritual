// MAHI Spiritual System — Ruqya Learning Module
// Interactive flashcards, quiz, and memorization system

const RuqyaLearning = (() => {
  let data = null;
  let flashcards = [];
  let currentCard = 0;
  let isFlipped = false;
  let currentFilter = 'all';
  let quiz = [];
  let currentQuiz = 0;
  let score = 0;
  let answered = false;
  let selectedAnswer = null;

  async function init() {
    try {
      const res = await fetch('data/ruqya-learning.json');
      data = await res.json();
      flashcards = data.flashcards;
      quiz = data.quiz_questions;
      renderHome();
    } catch (e) {
      console.error('Failed to load Ruqya learning data:', e);
      document.getElementById('ruqya-learning-content').innerHTML =
        '<div class="error-message">Failed to load learning data.</div>';
    }
  }

  // === Navigation ===
  function renderHome() {
    const el = document.getElementById('ruqya-learning-content');
    el.innerHTML = `
      <div class="rl-home">
        <div class="rl-hero">
          <div class="rl-icon-large">📖</div>
          <h2>Ruqya Learning System</h2>
          <p class="rl-subtitle">Master the 3-Stage Ruqya Methodology by Ben Halima</p>
        </div>

        <div class="rl-nav-cards">
          <button class="rl-nav-card" onclick="RuqyaLearning.showStages()">
            <span class="rl-nav-icon">📊</span>
            <h3>3 Stages</h3>
            <p>Self-Ruqya → Ruqya on Others → Captive</p>
          </button>
          <button class="rl-nav-card" onclick="RuqyaLearning.showCaptage()">
            <span class="rl-nav-icon">🔒</span>
            <h3>Captive Procedure</h3>
            <p>5-step binding method</p>
          </button>
          <button class="rl-nav-card" onclick="RuqyaLearning.showFlashcards()">
            <span class="rl-nav-icon">🃏</span>
            <h3>Flashcards</h3>
            <p>20 cards to memorize</p>
          </button>
          <button class="rl-nav-card" onclick="RuqyaLearning.showQuiz()">
            <span class="rl-nav-icon">✅</span>
            <h3>Quiz</h3>
            <p>12 questions test</p>
          </button>
          <button class="rl-nav-card" onclick="RuqyaLearning.showDailyPractice()">
            <span class="rl-nav-icon">📅</span>
            <h3>Daily Practice</h3>
            <p>Your personalized schedule</p>
          </button>
          <button class="rl-nav-card" onclick="RuqyaLearning.showSurahGuide()">
            <span class="rl-nav-icon">🕌</span>
            <h3>Surah Guide</h3>
            <p>Authority over jinn</p>
          </button>
        </div>

        <div class="rl-memorization-tips">
          <h3>🧠 Memorization Tips</h3>
          <ul>
            ${data.memorization_tips.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>

        <div class="rl-chart-connection">
          <h3>⭐ Your Chart Connection</h3>
          <div class="rl-chart-cards">
            ${Object.entries(data.chart_connections).map(([key, val]) => `
              <div class="rl-chart-card">
                <h4>${key.replace('_', ' ').toUpperCase()}</h4>
                <p><strong>Planet:</strong> ${val.planet}</p>
                <p><strong>Gift:</strong> ${val.gift}</p>
                <p><strong>Use in Captive:</strong> ${val.use_in_captive}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // === 3 Stages Overview ===
  function showStages() {
    const el = document.getElementById('ruqya-learning-content');
    el.innerHTML = `
      <button class="rl-back" onclick="RuqyaLearning.renderHome()">← Back</button>
      <h2>The 3-Stage Ruqya System</h2>
      <p class="rl-desc">Think of it as escalation levels — always start with the lightest approach.</p>

      <div class="rl-stages">
        ${data.stages.map(stage => `
          <div class="rl-stage-card ${stage.is_last_resort ? 'rl-stage-danger' : ''}">
            <div class="rl-stage-header">
              <span class="rl-stage-num">Stage ${stage.id}</span>
              <h3>${stage.name}</h3>
              <span class="rl-stage-arabic">${stage.name_arabic}</span>
            </div>
            <p class="rl-stage-desc">${stage.description}</p>
            <div class="rl-stage-meta">
              <span>Force: ${'⚡'.repeat(stage.force_level)}</span>
              <span>Risk: ${'⚠️'.repeat(stage.risk_level)}</span>
              <span>Practitioner: ${stage.practitioner}</span>
            </div>
            <div class="rl-stage-goal">
              <strong>Goal:</strong> ${stage.goal}
            </div>
            ${stage.daily_practice ? `
              <div class="rl-stage-practice">
                <h4>Daily Practice:</h4>
                ${stage.daily_practice.map(p => `
                  <div class="rl-practice-item">
                    <strong>${p.time}</strong>
                    <div class="rl-verses">${p.verses.join(' • ')}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${stage.key_rules ? `
              <div class="rl-stage-rules">
                <h4>Key Rules:</h4>
                <ul>${stage.key_rules.map(r => `<li>${r}</li>`).join('')}</ul>
              </div>
            ` : ''}
            ${stage.danger_warnings ? `
              <div class="rl-stage-warnings">
                <h4>⚠️ Warnings:</h4>
                <ul>${stage.danger_warnings.map(w => `<li>${w}</li>`).join('')}</ul>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div class="rl-comparison">
        <h3>Ruqya vs Captive</h3>
        <table>
          <tr><th>Aspect</th><th>Ruqya (Stage 1-2)</th><th>Captive (Stage 3)</th></tr>
          <tr><td>Goal</td><td>Heal, repel, comfort</td><td>Bind, trap, contain</td></tr>
          <tr><td>Force</td><td>Gentle recitation</td><td>Authoritative command</td></tr>
          <tr><td>Jinn Reaction</td><td>May leave or resist</td><td>MUST submit</td></tr>
          <tr><td>When Used</td><td>First attempt</td><td>After 7+ failed sessions</td></tr>
          <tr><td>Risk Level</td><td>Low</td><td>High</td></tr>
          <tr><td>Practitioner</td><td>Anyone with iman</td><td>Experienced specialist</td></tr>
        </table>
      </div>
    `;
  }

  // === Captive Procedure ===
  function showCaptage() {
    const stage = data.stages.find(s => s.id === 3);
    const el = document.getElementById('ruqya-learning-content');
    el.innerHTML = `
      <button class="rl-back" onclick="RuqyaLearning.renderHome()">← Back</button>
      <h2>🔒 Captive (الكبت) — Binding Jinn</h2>
      <p class="rl-desc">The nuclear option — binding jinn with Quranic authority.</p>

      <div class="rl-captive-warning">
        <h4>⚠️ Only for Experienced Practitioners</h4>
        <p>Used ONLY after 7+ failed standard Ruqya sessions. This is the last resort.</p>
      </div>

      <div class="rl-captive-steps">
        ${stage.procedure.map(step => `
          <div class="rl-captive-step ${step.is_core ? 'rl-step-core' : ''}">
            <div class="rl-step-header">
              <span class="rl-step-num">Step ${step.step}</span>
              <h3>${step.name}</h3>
              <span class="rl-step-arabic">${step.name_arabic}</span>
            </div>
            ${step.requirements ? `
              <div class="rl-step-content">
                <h4>Requirements:</h4>
                <ul>${step.requirements.map(r => `<li>${r}</li>`).join('')}</ul>
              </div>
            ` : ''}
            ${step.questions ? `
              <div class="rl-step-content">
                <h4>Questions to Ask:</h4>
                <ul>${step.questions.map(q => `<li>"${q}"</li>`).join('')}</ul>
                <p><strong>Rule:</strong> ${step.rule}</p>
                <p><strong>If refuses:</strong> ${step.outcome_if_refuses}</p>
                <p><strong>If answers:</strong> ${step.outcome_if_answers}</p>
              </div>
            ` : ''}
            ${step.question ? `
              <div class="rl-step-content">
                <h4>Ask:</h4>
                <p>"${step.question}"</p>
                <p><strong>If wants to leave:</strong> ${step.if_wants_to_leave}</p>
                <p><strong>If refuses:</strong> ${step.if_refuses}</p>
              </div>
            ` : ''}
            ${step.verses ? `
              <div class="rl-step-content">
                <h4>Recite:</h4>
                <div class="rl-verses-box">
                  ${step.verses.map(v => `<div class="rl-verse">${v}</div>`).join('')}
                </div>
                ${step.command ? `
                  <div class="rl-command">
                    <strong>Command:</strong> "${step.command}"
                  </div>
                ` : ''}
                ${step.method ? `
                  <div class="rl-method">
                    <strong>Method:</strong> ${step.method}
                  </div>
                ` : ''}
                ${step.delivery ? `
                  <div class="rl-delivery">
                    <strong>Delivery:</strong> ${step.delivery}
                  </div>
                ` : ''}
                ${step.result ? `
                  <div class="rl-result">
                    <strong>Result:</strong> ${step.result}
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div class="rl-jinn-authority">
        <h3>🕌 Most Powerful Surahs for Jinn Authority</h3>
        <div class="rl-surah-list">
          ${data.jinn_authority_surahs.map(s => `
            <div class="rl-surah-item rl-level-${s.level}">
              <div class="rl-surah-name">${s.surah}</div>
              <div class="rl-surah-desc">${s.name} — ${s.power}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="rl-personal-verse">
        <h3>⭐ Your Personal Captive Verse</h3>
        <div class="rl-verse-box">
          <p class="rl-arabic">لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ</p>
          <p class="rl-transliteration">La ilaha illa Anta, Subhanaka, inni kuntu min ad-dhalimin</p>
          <p class="translation">"There is no god but You, Glory be to You, I have been among the wrongdoers"</p>
          <p class="rl-source">Surah Al-Anbiya 21:87 — Yunus dhikr</p>
          <p class="rl-instruction">Recite × 100 — This freed Yunus from the whale</p>
        </div>
      </div>
    `;
  }

  // === Flashcards ===
  function showFlashcards() {
    currentCard = 0;
    isFlipped = false;
    renderFlashcard();
  }

  function renderFlashcard() {
    const card = flashcards[currentCard];
    const el = document.getElementById('ruqya-learning-content');
    el.innerHTML = `
      <button class="rl-back" onclick="RuqyaLearning.renderHome()">← Back</button>
      <h2>🃏 Flashcards</h2>
      <p class="rl-desc">Card ${currentCard + 1} of ${flashcards.length} — Click to flip</p>

      <div class="rl-filters">
        <button class="rl-filter ${currentFilter === 'all' ? 'active' : ''}" onclick="RuqyaLearning.filterCards('all')">All</button>
        <button class="rl-filter ${currentFilter === 'stages' ? 'active' : ''}" onclick="RuqyaLearning.filterCards('stages')">Stages</button>
        <button class="rl-filter ${currentFilter === 'captage' ? 'active' : ''}" onclick="RuqyaLearning.filterCards('captage')">Captive</button>
        <button class="rl-filter ${currentFilter === 'daily' ? 'active' : ''}" onclick="RuqyaLearning.filterCards('daily')">Daily</button>
        <button class="rl-filter ${currentFilter === 'rules' ? 'active' : ''}" onclick="RuqyaLearning.filterCards('rules')">Rules</button>
        <button class="rl-filter ${currentFilter === 'personal' ? 'active' : ''}" onclick="RuqyaLearning.filterCards('personal')">Personal</button>
      </div>

      <div class="rl-flashcard-container">
        <div class="rl-flashcard ${isFlipped ? 'flipped' : ''}" onclick="RuqyaLearning.flipCard()">
          <div class="rl-card-front">
            <div class="rl-card-difficulty ${card.difficulty}">${card.difficulty}</div>
            <div class="rl-card-category">${card.category}</div>
            <p class="rl-card-question">${card.front}</p>
            <span class="rl-tap-hint">Tap to reveal</span>
          </div>
          <div class="rl-card-back">
            <div class="rl-card-difficulty ${card.difficulty}">${card.difficulty}</div>
            <div class="rl-card-category">${card.category}</div>
            <p class="rl-card-answer">${card.back.replace(/\n/g, '<br>')}</p>
            <span class="rl-tap-hint">Tap to flip back</span>
          </div>
        </div>
      </div>

      <div class="rl-card-nav">
        <button onclick="RuqyaLearning.prevCard()" ${currentCard === 0 ? 'disabled' : ''}>← Previous</button>
        <span class="rl-card-progress">${currentCard + 1} / ${flashcards.length}</span>
        <button onclick="RuqyaLearning.nextCard()" ${currentCard === flashcards.length - 1 ? 'disabled' : ''}>Next →</button>
      </div>

      <div class="rl-card-difficulty-bar">
        <span>Easy: ${flashcards.filter(c => c.difficulty === 'easy').length}</span>
        <span>Medium: ${flashcards.filter(c => c.difficulty === 'medium').length}</span>
        <span>Hard: ${flashcards.filter(c => c.difficulty === 'hard').length}</span>
      </div>
    `;
  }

  function flipCard() {
    isFlipped = !isFlipped;
    renderFlashcard();
  }

  function nextCard() {
    if (currentCard < flashcards.length - 1) {
      currentCard++;
      isFlipped = false;
      renderFlashcard();
    }
  }

  function prevCard() {
    if (currentCard > 0) {
      currentCard--;
      isFlipped = false;
      renderFlashcard();
    }
  }

  function filterCards(category) {
    currentFilter = category;
    if (category === 'all') {
      flashcards = data.flashcards;
    } else {
      flashcards = data.flashcards.filter(c => c.category === category);
    }
    currentCard = 0;
    isFlipped = false;
    renderFlashcard();
  }

  // === Quiz ===
  function showQuiz() {
    currentQuiz = 0;
    score = 0;
    answered = false;
    selectedAnswer = null;
    renderQuiz();
  }

  function renderQuiz() {
    const q = quiz[currentQuiz];
    const el = document.getElementById('ruqya-learning-content');
    el.innerHTML = `
      <button class="rl-back" onclick="RuqyaLearning.renderHome()">← Back</button>
      <h2>✅ Quiz</h2>
      <p class="rl-desc">Question ${currentQuiz + 1} of ${quiz.length} — Score: ${score}</p>

      <div class="rl-quiz-card">
        <div class="rl-quiz-progress">
          <div class="rl-progress-bar" style="width: ${((currentQuiz + 1) / quiz.length) * 100}%"></div>
        </div>
        <p class="rl-quiz-question">${q.question}</p>
        <div class="rl-quiz-options">
          ${q.options.map((opt, i) => `
            <button class="rl-quiz-option ${answered ? (i === q.correct ? 'correct' : (i === selectedAnswer ? 'wrong' : '')) : ''}"
              onclick="RuqyaLearning.answerQuiz(${i})" ${answered ? 'disabled' : ''}>
              <span class="rl-option-letter">${String.fromCharCode(65 + i)}</span>
              <span class="rl-option-text">${opt}</span>
            </button>
          `).join('')}
        </div>
        ${answered ? `
          <div class="rl-quiz-explanation">
            <p><strong>${selectedAnswer === q.correct ? '✅ Correct!' : '❌ Wrong!'}</strong></p>
            <p>${q.explanation}</p>
          </div>
        ` : ''}
      </div>

      <div class="rl-quiz-nav">
        ${answered ? `
          <button onclick="RuqyaLearning.nextQuiz()" class="rl-btn-primary">
            ${currentQuiz < quiz.length - 1 ? 'Next Question →' : 'See Results'}
          </button>
        ` : ''}
      </div>
    `;
  }

  function answerQuiz(index) {
    if (answered) return;
    selectedAnswer = index;
    answered = true;
    if (index === quiz[currentQuiz].correct) score++;
    renderQuiz();
  }

  function nextQuiz() {
    if (currentQuiz < quiz.length - 1) {
      currentQuiz++;
      answered = false;
      selectedAnswer = null;
      renderQuiz();
    } else {
      showResults();
    }
  }

  function showResults() {
    const pct = Math.round((score / quiz.length) * 100);
    const grade = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Needs Work' : 'Study More';
    const emoji = pct >= 80 ? '🌟' : pct >= 60 ? '👍' : pct >= 40 ? '📚' : '💪';

    const el = document.getElementById('ruqya-learning-content');
    el.innerHTML = `
      <button class="rl-back" onclick="RuqyaLearning.renderHome()">← Back</button>
      <h2>Quiz Results</h2>

      <div class="rl-results">
        <div class="rl-results-emoji">${emoji}</div>
        <div class="rl-results-score">${score} / ${quiz.length}</div>
        <div class="rl-results-pct">${pct}%</div>
        <div class="rl-results-grade">${grade}</div>
      </div>

      <div class="rl-results-breakdown">
        <h3>Breakdown</h3>
        <ul>
          <li>Correct: ${score}</li>
          <li>Wrong: ${quiz.length - score}</li>
          <li>Percentage: ${pct}%</li>
        </ul>
      </div>

      <div class="rl-results-tips">
        <h3>Study Tips</h3>
        <p>Review flashcards for the categories you got wrong.</p>
        <p>Focus on the Captive procedure — it's the most complex.</p>
        <p>Practice the daily recitations until they're automatic.</p>
      </div>

      <button onclick="RuqyaLearning.showQuiz()" class="rl-btn-primary">Retake Quiz</button>
      <button onclick="RuqyaLearning.showFlashcards()" class="rl-btn-secondary">Review Flashcards</button>
    `;
  }

  // === Daily Practice ===
  function showDailyPractice() {
    const practice = data.stages[0].daily_practice;
    const el = document.getElementById('ruqya-learning-content');
    el.innerHTML = `
      <button class="rl-back" onclick="RuqyaLearning.renderHome()">← Back</button>
      <h2>📅 Your Personalized Daily Ruqya Practice</h2>
      <p class="rl-desc">Based on Ben Halima methodology — Gemini ASC connections</p>

      <div class="rl-practice-timeline">
        ${practice.map(p => `
          <div class="rl-practice-card">
            <div class="rl-practice-time">${p.time}</div>
            <div class="rl-practice-verses">
              ${p.verses.map(v => `<div class="rl-verse-item">${v}</div>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="rl-practice-key-points">
        <h3>Key Points</h3>
        <ul>
          <li><strong>Consistency is key:</strong> Do these EVERY day, no exceptions</li>
          <li><strong>Start small:</strong> If overwhelmed, begin with just Fajr and Sleep</li>
          <li><strong>Build gradually:</strong> Add more sessions as you get comfortable</li>
          <li><strong>Your personal verse:</strong> Add Yunus dhikr (21:87) × 100 anywhere</li>
          <li><strong>Language matters:</strong> Learn Arabic for maximum impact</li>
        </ul>
      </div>

      <div class="rl-practice-gemini">
        <h3>⭐ Gemini ASC Connections</h3>
        <div class="rl-gemini-cards">
          <div class="rl-gemini-card">
            <h4>Al-Fatihah</h4>
            <p>Mercury-ruled opening — your ascendant ruler's surah</p>
          </div>
          <div class="rl-gemini-card">
            <h4>Ya-Sin</h4>
            <p>Communication and binding words — Gemini strength</p>
          </div>
          <div class="rl-gemini-card">
            <h4>Al-Kahf</h4>
            <p>Youth of the Cave — protection through faith</p>
          </div>
          <div class="rl-gemini-card">
            <h4>Al-Mulk</h4>
            <p>Sovereignty — authority through divine power</p>
          </div>
        </div>
      </div>
    `;
  }

  // === Surah Guide ===
  function showSurahGuide() {
    const el = document.getElementById('ruqya-learning-content');
    el.innerHTML = `
      <button class="rl-back" onclick="RuqyaLearning.renderHome()">← Back</button>
      <h2>🕌 Surahs for Specific Needs</h2>
      <p class="rl-desc">Categories from Ben Halima methodology</p>

      <div class="rl-surah-categories">
        <div class="rl-category-card">
          <h3>🛡️ Spiritual Protection</h3>
          <ul>
            <li><strong>Ayat al-Kursi</strong> (2:255) — Supreme authority</li>
            <li><strong>Al-Mu'awwidhatayn</strong> (113-114) — Protection trio</li>
            <li><strong>Al-Fatihah</strong> (1) — Opening, healing</li>
            <li><strong>Al-Baqarah:286</strong> — Last 2 verses</li>
          </ul>
        </div>

        <div class="rl-category-card">
          <h3>💚 Health & Healing</h3>
          <ul>
            <li><strong>Al-Fatihah</strong> × 7 — For all illness</li>
            <li><strong>Ya-Sin</strong> × 3 — Heart of Quran</li>
            <li><strong>Ar-Rahman</strong> — Mercy healing</li>
            <li><strong>Al-Shu'ara</strong> (26) — Prophetic healing</li>
          </ul>
        </div>

        <div class="rl-category-card">
          <h3>💰 Rizq (Provision)</h3>
          <ul>
            <li><strong>Al-Waqi'ah</strong> — Evening provision</li>
            <li><strong>Al-Mulk</strong> — Protection + provision</li>
            <li><strong>Yusuf</strong> (12) — Abundance</li>
          </ul>
        </div>

        <div class="rl-category-card">
          <h3>⚠️ Dajjal Protection</h3>
          <ul>
            <li><strong>Al-Kahf</strong> (18) — First/last 10 verses</li>
            <li><strong>Ayat al-Kursi</strong> — Supreme protection</li>
            <li><strong>Al-Mu'awwidhatayn</strong> — Shield</li>
          </ul>
        </div>

        <div class="rl-category-card">
          <h3>💍 Marriage</h3>
          <ul>
            <li><strong>Ya-Sin</strong> — Communication</li>
            <li><strong>Al-Furqan</strong> — Right partner</li>
            <li><strong>Ar-Rum</strong> (30) — Love and mercy</li>
          </ul>
        </div>

        <div class="rl-category-card">
          <h3>💪 Spiritual Authority</h3>
          <ul>
            <li><strong>Al-Baqarah:255-257</strong> — Ayat al-Kursi</li>
            <li><strong>Al-Baqarah:102</strong> — Solomon's authority</li>
            <li><strong>An-Naml:17-19</strong> — Sulayman's power</li>
            <li><strong>As-Saffat:1-10</strong> — Angelic warfare</li>
          </ul>
        </div>
      </div>

      <div class="rl-jinn-authority">
        <h3>🔒 Most Powerful for Jinn Authority</h3>
        <div class="rl-surah-list">
          ${data.jinn_authority_surahs.map(s => `
            <div class="rl-surah-item rl-level-${s.level}">
              <div class="rl-surah-name">${s.surah}</div>
              <div class="rl-surah-desc">${s.name} — ${s.power}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="rl-emergency">
        <h3>🚨 Emergency Ruqya Protocol</h3>
        <div class="rl-emergency-steps">
          <div class="rl-emergency-step">
            <span class="rl-em-num">1</span>
            <p>Say <strong>Bismillah</strong> × 3</p>
          </div>
          <div class="rl-emergency-step">
            <span class="rl-em-num">2</span>
            <p>Recite <strong>Ayat al-Kursi</strong> × 3</p>
          </div>
          <div class="rl-emergency-step">
            <span class="rl-em-num">3</span>
            <p>Recite <strong>Al-Mu'awwidhatayn</strong> × 3</p>
          </div>
          <div class="rl-emergency-step">
            <span class="rl-em-num">4</span>
            <p>Say <strong>La hawla wa la quwwata illa billah</strong> × 7</p>
          </div>
          <div class="rl-emergency-step">
            <span class="rl-em-num">5</span>
            <p>Recite <strong>Yunus dhikr</strong> (21:87) × 100</p>
          </div>
        </div>
      </div>
    `;
  }

  return {
    init,
    renderHome,
    showStages,
    showCaptage,
    showFlashcards,
    showQuiz,
    showDailyPractice,
    showSurahGuide,
    flipCard,
    nextCard,
    prevCard,
    filterCards,
    answerQuiz,
    nextQuiz
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('ruqya-learning-content')) {
    RuqyaLearning.init();
  }
});
