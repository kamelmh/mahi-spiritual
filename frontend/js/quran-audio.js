/**
 * Quran Ayah Audio Player
 * Uses Al Quran Cloud API (free, no auth) for ayah-level recitation
 * Falls back to Web Speech API for Arabic TTS if API unavailable
 */
const QuranAudio = (() => {
  'use strict';

  const API_BASE = 'https://api.alquran.cloud/v1';
  const STORAGE_KEY = 'quran-ayah-player';
  const SURAH_COUNT = 114;

  // State
  let surahs = [];
  let currentSurah = 1;
  let currentAyah = 1;
  let totalAyahs = 7;
  let isPlaying = false;
  let volume = 0.8;
  let repeatMode = 'off'; // 'off', 'ayah', 'surah'
  let audio = null;
  let ayahData = null;
  let useTTS = false;

  // DOM references
  const el = {};

  // --- Surah list from local verses.json ---
  async function fetchSurahList() {
    try {
      const r = await fetch('data/verses.json');
      const data = await r.json();
      surahs = Array.isArray(data) ? data : (data.surahs || []);
    } catch (_) {
      // Fallback: minimal surah list
      surahs = [];
    }
  }

  // --- Fetch ayah text from Al Quran Cloud ---
  async function fetchAyahText(surah, ayah) {
    try {
      const r = await fetch(`${API_BASE}/ayah/${surah}:${ayah}/editions/quran-uthmani,en.transliteration,en.sahih`);
      if (!r.ok) throw new Error('API error');
      const data = await r.json();
      const editions = data.data;
      return {
        arabic: editions[0]?.text || '',
        transliteration: editions[1]?.text || '',
        translation: editions[2]?.text || '',
        surahName: editions[0]?.surah?.englishName || `Surah ${surah}`,
        surahArabic: editions[0]?.surah?.name || '',
      };
    } catch (_) {
      return null;
    }
  }

  // --- Fetch full surah ayahs from Al Quran Cloud ---
  async function fetchSurahAyahs(surah) {
    try {
      const r = await fetch(`${API_BASE}/surah/${surah}/editions/quran-uthmani,en.transliteration,en.sahih`);
      if (!r.ok) throw new Error('API error');
      const data = await r.json();
      const editions = data.data;
      const ayahCount = editions[0]?.numberOfAyahs || 0;
      const ayahs = [];
      for (let i = 0; i < ayahCount; i++) {
        ayahs.push({
          number: editions[0]?.ayahs[i]?.numberInSurah || i + 1,
          arabic: editions[0]?.ayahs[i]?.text || '',
          transliteration: editions[1]?.ayahs[i]?.text || '',
          translation: editions[2]?.ayahs[i]?.text || '',
        });
      }
      return { ayahs, ayahCount, surahName: editions[0]?.surah?.englishName || `Surah ${surah}`, surahArabic: editions[0]?.surah?.name || '' };
    } catch (_) {
      return null;
    }
  }

  // --- Build Al Quran Cloud audio URL ---
  function getAudioUrl(surah, ayah) {
    return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surah}.mp3`;
  }

  // --- Format time ---
  function fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  // --- localStorage ---
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        surah: currentSurah,
        ayah: currentAyah,
        volume,
        repeatMode,
      }));
    } catch (_) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.surah && s.surah >= 1 && s.surah <= SURAH_COUNT) currentSurah = s.surah;
      if (s.ayyah) currentAyah = s.ayah;
      if (typeof s.volume === 'number') volume = s.volume;
      if (s.repeatMode) repeatMode = s.repeatMode;
    } catch (_) {}
  }

  // --- Audio engine ---
  function initAudio() {
    audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', () => { isPlaying = true; updatePlayBtn(); });
    audio.addEventListener('pause', () => { isPlaying = false; updatePlayBtn(); });
    audio.addEventListener('error', () => {
      // Audio failed - try TTS fallback
      if (isPlaying) speakAyah();
    });
  }

  function onEnded() {
    if (repeatMode === 'ayah') {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } else if (repeatMode === 'surah' || repeatMode === 'off') {
      nextAyah();
    }
  }

  // --- TTS fallback (Web Speech API) ---
  function speakAyah() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!ayahData || !ayahData.transliteration) {
      isPlaying = false;
      updatePlayBtn();
      return;
    }
    const utter = new SpeechSynthesisUtterance(ayahData.transliteration);
    utter.lang = 'en-US';
    utter.rate = 0.8;
    utter.volume = volume;
    utter.onend = () => {
      isPlaying = false;
      updatePlayBtn();
      if (repeatMode === 'ayah') {
        speakAyah();
      } else {
        nextAyah();
      }
    };
    utter.onerror = () => {
      isPlaying = false;
      updatePlayBtn();
    };
    window.speechSynthesis.speak(utter);
  }

  // --- Controls ---
  async function play() {
    if (!audio) initAudio();

    // Load ayah text if not loaded
    if (!ayahData || ayahData.surahNumber !== currentSurah || ayahData.ayahNumber !== currentAyah) {
      await loadAyah(currentSurah, currentAyah);
    }

    // Try audio file first (surah-level MP3)
    const url = getAudioUrl(currentSurah, currentAyah);
    if (audio.src !== url) {
      audio.src = url;
      audio.load();
    }

    try {
      await audio.play();
      isPlaying = true;
    } catch (_) {
      // Audio failed, try TTS
      useTTS = true;
      speakAyah();
    }
    updatePlayBtn();
    save();
  }

  function pause() {
    if (useTTS) {
      window.speechSynthesis?.cancel();
    } else if (audio) {
      audio.pause();
    }
    isPlaying = false;
    updatePlayBtn();
    save();
  }

  function stop() {
    if (useTTS) {
      window.speechSynthesis?.cancel();
    } else if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    isPlaying = false;
    updatePlayBtn();
    updateProgress();
    save();
  }

  function nextAyah() {
    if (currentAyah < totalAyahs) {
      currentAyah++;
    } else if (repeatMode === 'surah') {
      currentAyah = 1;
    } else {
      // End of surah
      isPlaying = false;
      updatePlayBtn();
      save();
      return;
    }
    loadAyah(currentSurah, currentAyah).then(() => {
      if (isPlaying || repeatMode !== 'off') {
        play();
      } else {
        updateDisplay();
      }
    });
  }

  function prevAyah() {
    if (currentAyah > 1) {
      currentAyah--;
      loadAyah(currentSurah, currentAyah).then(() => {
        if (isPlaying) play();
        else updateDisplay();
      });
      save();
    }
  }

  async function loadAyah(surah, ayah) {
    const data = await fetchAyahText(surah, ayah);
    if (data) {
      ayahData = { ...data, surahNumber: surah, ayahNumber: ayah };
      totalAyahs = surahs.find(s => s.number === surah)?.verses || ayahData.ayahCount || 286;
    } else {
      // Fallback: try local data
      const local = await fetchLocalVerse(surah, ayah);
      if (local) {
        ayahData = { ...local, surahNumber: surah, ayahNumber: ayah };
      } else {
        ayahData = {
          arabic: '',
          transliteration: `Surah ${surah}, Ayah ${ayah}`,
          translation: '',
          surahName: `Surah ${surah}`,
          surahArabic: '',
          surahNumber: surah,
          ayahNumber: ayah,
        };
      }
    }
    totalAyahs = surahs.find(s => s.number === surah)?.verses || ayahData.ayahCount || 286;
    updateDisplay();
    save();
  }

  async function fetchLocalVerse(surah, ayah) {
    try {
      const r = await fetch('data/verses.json');
      const data = await r.json();
      const verses = data.verses || [];
      const match = verses.find(v => v.surah === surah);
      if (match) {
        return {
          arabic: match.arabic || '',
          transliteration: match.transliteration || '',
          translation: match.translation || '',
          surahName: match.surahName || `Surah ${surah}`,
          surahArabic: '',
        };
      }
    } catch (_) {}
    return null;
  }

  // --- UI ---
  function populateSurahSelect() {
    const sel = el.surahSelect;
    if (!sel) return;
    sel.innerHTML = '';
    if (surahs.length > 0) {
      surahs.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.number;
        opt.textContent = `${s.number}. ${s.name} (${s.arabic}) — ${s.verses} ayahs`;
        sel.appendChild(opt);
      });
    } else {
      for (let i = 1; i <= SURAH_COUNT; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Surah ${i}`;
        sel.appendChild(opt);
      }
    }
    sel.value = currentSurah;
  }

  function updateDisplay() {
    if (el.ayahArabic) el.ayahArabic.textContent = ayahData?.arabic || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
    if (el.ayahTranslit) el.ayahTranslit.textContent = ayahData?.transliteration || '';
    if (el.ayahTranslation) el.ayahTranslation.textContent = ayahData?.translation || '';
    if (el.ayahRef) el.ayahRef.textContent = ayahData ? `${ayahData.surahName} ${currentSurah}:${currentAyah}` : `Surah ${currentSurah}:${currentAyah}`;
    if (el.ayahCount) el.ayahCount.textContent = `Ayah ${currentAyah} of ${totalAyahs}`;
    if (el.surahSelect) el.surahSelect.value = currentSurah;
    updateRepeatBtn();
    updatePlayBtn();
  }

  function updateProgress() {
    if (el.progressFill && audio?.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      el.progressFill.style.width = `${pct}%`;
    }
    if (el.currentTime) el.currentTime.textContent = fmt(audio?.currentTime);
    if (el.duration) el.duration.textContent = fmt(audio?.duration);
  }

  function updatePlayBtn() {
    if (el.playBtn) el.playBtn.textContent = isPlaying ? '⏸' : '▶';
  }

  function updateRepeatBtn() {
    if (el.repeatBtn) {
      el.repeatBtn.classList.toggle('active', repeatMode !== 'off');
      const icons = { off: '🔁', ayah: '🔂', surah: '🔁' };
      el.repeatBtn.textContent = icons[repeatMode] || '🔁';
      el.repeatBtn.title = repeatMode === 'off' ? 'Repeat: Off' : repeatMode === 'ayah' ? 'Repeat: Single Ayah' : 'Repeat: Full Surah';
    }
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (audio) audio.volume = volume;
    save();
  }

  function toggleRepeat() {
    const modes = ['off', 'ayah', 'surah'];
    const idx = modes.indexOf(repeatMode);
    repeatMode = modes[(idx + 1) % modes.length];
    updateRepeatBtn();
    save();
  }

  // --- Event binding ---
  function bind() {
    el.surahSelect = document.getElementById('qa-surah');
    el.playBtn = document.getElementById('qa-play');
    el.pauseBtn = document.getElementById('qa-pause');
    el.stopBtn = document.getElementById('qa-stop');
    el.prevBtn = document.getElementById('qa-prev');
    el.nextBtn = document.getElementById('qa-next');
    el.repeatBtn = document.getElementById('qa-repeat');
    el.volumeSlider = document.getElementById('qa-volume');
    el.progressFill = document.getElementById('qa-progress-fill');
    el.progressBar = document.getElementById('qa-progress-bar');
    el.currentTime = document.getElementById('qa-current-time');
    el.duration = document.getElementById('qa-duration');
    el.ayahArabic = document.getElementById('qa-arabic');
    el.ayahTranslit = document.getElementById('qa-translit');
    el.ayahTranslation = document.getElementById('qa-translation');
    el.ayahRef = document.getElementById('qa-ref');
    el.ayahCount = document.getElementById('qa-ayah-count');
    el.playingInfo = document.getElementById('qa-playing-info');

    el.playBtn?.addEventListener('click', () => isPlaying ? pause() : play());
    el.pauseBtn?.addEventListener('click', pause);
    el.stopBtn?.addEventListener('click', stop);
    el.prevBtn?.addEventListener('click', prevAyah);
    el.nextBtn?.addEventListener('click', nextAyah);
    el.repeatBtn?.addEventListener('click', toggleRepeat);

    el.surahSelect?.addEventListener('change', async function () {
      const val = parseInt(this.value, 10);
      if (val >= 1 && val <= SURAH_COUNT) {
        currentSurah = val;
        currentAyah = 1;
        await loadAyah(currentSurah, currentAyah);
        if (isPlaying) play();
        updateDisplay();
        save();
      }
    });

    el.volumeSlider?.addEventListener('input', function () {
      setVolume(parseInt(this.value, 10) / 100);
    });

    el.progressBar?.addEventListener('click', function (e) {
      if (!audio?.duration) return;
      const rect = this.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });
  }

  // --- MAHI Practice ---
  const MAHI_PRACTICE = [
    {
      id: 'fajr',
      label: 'Fajr',
      timeRange: [4, 7],
      surah: 21,
      ayahStart: 87,
      ayahEnd: 87,
      surahName: 'Al-Anbiya',
      arabic: 'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
      transliteration: 'La ilaha illa Anta, Subhanaka, inni kuntu min al-dhalimeen',
      translation: 'There is no god but You, Glory be to You, indeed I have been among the wrongdoers.',
      dhikrText: 'La ilaha illa Anta, Subhanaka, inni kuntu min al-dhalimeen',
      dhikrTarget: 100,
      icon: '🌅',
      purpose: 'Yunus Dhikr — Protection for Moon in Pisces, emotional purification',
    },
    {
      id: 'asr',
      label: 'ASR',
      timeRange: [13, 16],
      surah: 68,
      ayahStart: 1,
      ayahEnd: 4,
      surahName: 'Al-Qalam',
      arabic: 'نُّونٌ وَالْقَلَمِ وَمَا يَسْطُرُونَ',
      transliteration: 'Nun, wal-qalami wa ma yasturun',
      translation: 'Nun. By the pen and what they inscribe.',
      dhikrText: null,
      dhikrTarget: 0,
      icon: '✍️',
      purpose: 'Al-Qalam — Bless writing, activate Mercury in Aquarius',
    },
    {
      id: 'maghrib',
      label: 'Maghrib',
      timeRange: [17, 19],
      surah: 55,
      ayahStart: 1,
      ayahEnd: 4,
      surahName: 'Ar-Rahman',
      arabic: 'الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ',
      transliteration: 'Ar-Rahman, allamal-quran, khalaqal-insan, allamahu\'l-bayan',
      translation: 'The Most Merciful, taught the Quran, created man, taught him eloquence.',
      dhikrText: null,
      dhikrTarget: 0,
      icon: '🌙',
      purpose: 'Ar-Rahman Reflection — Activate Jupiter, align with teaching purpose',
    },
    {
      id: 'isha',
      label: 'Isha',
      timeRange: [19, 23],
      surah: null,
      ayahStart: 0,
      ayahEnd: 0,
      surahName: null,
      arabic: null,
      transliteration: null,
      translation: null,
      dhikrText: null,
      dhikrTarget: 0,
      icon: '📝',
      purpose: 'Journaling — Reflect on the day, record insights',
    },
  ];

  let dhikrCount = parseInt(localStorage.getItem('mahi-dhikr-count') || '0', 10);

  function loadMAHIPractice() {
    return MAHI_PRACTICE;
  }

  function getCurrentPractice() {
    const h = new Date().getHours();
    return MAHI_PRACTICE.find(p => h >= p.timeRange[0] && h < p.timeRange[1]) || null;
  }

  function renderMAHISection() {
    const container = document.getElementById('mahi-practice-card');
    if (!container) return;

    const now = new Date();
    const h = now.getHours();
    const practice = getCurrentPractice();

    let html = '';
    if (practice) {
      html += `<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <span style="font-size:32px">${practice.icon}</span>
        <div>
          <div style="font-weight:700;color:var(--accent-gold);font-size:18px">Current: ${practice.label} Practice</div>
          <div style="font-size:13px;color:var(--text-secondary)">${practice.purpose}</div>
        </div>
      </div>`;

      if (practice.surah) {
        html += `<div style="padding:16px;background:var(--bg-tertiary);border-radius:8px;border-left:3px solid var(--accent-blue);margin-bottom:16px">
          <div style="font-size:20px;color:var(--accent-gold);font-family:'Amiri',serif;line-height:1.8;text-align:center;direction:rtl;margin-bottom:12px">
            ${practice.arabic}
          </div>
          <div style="font-size:13px;color:var(--text-secondary);font-style:italic;text-align:center;margin-bottom:8px">
            ${practice.transliteration}
          </div>
          <div style="font-size:13px;color:var(--text-primary);text-align:center;margin-bottom:12px">
            "${practice.translation}"
          </div>
          <div style="text-align:center">
            <button class="btn btn-primary" onclick="QuranAudio.loadSurah(${practice.surah},${practice.ayahStart})">
              ▶ Play Surah ${practice.surah} (${practice.surahName})
            </button>
          </div>
        </div>`;
      } else {
        html += `<div style="padding:16px;background:var(--bg-tertiary);border-radius:8px;border-left:3px solid var(--accent-green);margin-bottom:16px;text-align:center">
          <div style="font-size:13px;color:var(--text-primary)">
            Take time to reflect on today. What did Allah teach you?
          </div>
        </div>`;
      }
    } else {
      html += `<div style="padding:16px;background:var(--bg-tertiary);border-radius:8px;text-align:center;margin-bottom:16px">
        <div style="font-size:13px;color:var(--text-secondary)">
          No practice scheduled for this hour (${h}:00). Next practice times:<br>
          Fajr (4-7am) · ASR (1-4pm) · Maghrib (5-7pm) · Isha (7-11pm)
        </div>
      </div>`;
    }

    html += `<div style="padding:16px;background:var(--bg-tertiary);border-radius:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="font-weight:600;color:var(--accent-gold)">Yunus Dhikr Counter</div>
        <div style="font-size:12px;color:var(--text-secondary)">La ilaha illa Anta, Subhanaka, inni kuntu min al-dhalimeen</div>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;gap:16px">
        <button class="btn" onclick="QuranAudio.dhikrReset()" style="font-size:14px">Reset</button>
        <div style="font-size:48px;font-weight:700;color:var(--accent-gold);min-width:80px;text-align:center" id="mahi-dhikr-display">${dhikrCount}</div>
        <div style="font-size:12px;color:var(--text-secondary)">/ 100</div>
        <button class="btn btn-primary" onclick="QuranAudio.dhikrAdd()" style="font-size:18px;padding:8px 20px">+1</button>
      </div>
      <div style="margin-top:8px;height:8px;background:var(--bg-primary);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${Math.min(100, (dhikrCount / 100) * 100)}%;background:linear-gradient(90deg,var(--accent-gold),var(--accent-green));border-radius:4px;transition:width 0.3s"></div>
      </div>
      <div style="text-align:center;margin-top:12px">
        <a href="#practice" onclick="document.querySelector('[data-page=daily-practice]').click()" style="font-size:13px;color:var(--accent-blue);text-decoration:none">Open Daily Practice page →</a>
      </div>
    </div>`;

    container.innerHTML = html;
  }

  function dhikrAdd() {
    dhikrCount++;
    localStorage.setItem('mahi-dhikr-count', String(dhikrCount));
    const d = document.getElementById('mahi-dhikr-display');
    if (d) d.textContent = dhikrCount;
    renderMAHISection();
  }

  function dhikrReset() {
    dhikrCount = 0;
    localStorage.setItem('mahi-dhikr-count', '0');
    const d = document.getElementById('mahi-dhikr-display');
    if (d) d.textContent = '0';
    renderMAHISection();
  }

  function loadSurahFromAudio(surah, ayah) {
    currentSurah = surah;
    currentAyah = ayah || 1;
    loadAyah(currentSurah, currentAyah).then(() => {
      play();
    });
  }

  // --- Public API ---
  async function init() {
    load();
    initAudio();
    bind();
    await fetchSurahList();
    populateSurahSelect();
    if (el.volumeSlider) el.volumeSlider.value = Math.round(volume * 100);
    await loadAyah(currentSurah, currentAyah);
    updateDisplay();
    renderMAHISection();
  }

  return {
    init,
    play,
    pause,
    stop,
    nextAyah,
    prevAyah,
    toggleRepeat,
    setVolume,
    loadSurah: loadSurahFromAudio,
    dhikrAdd,
    dhikrReset,
    loadMAHIPractice,
    renderMAHISection,
    get currentSurah() { return currentSurah; },
    get currentAyah() { return currentAyah; },
    get isPlaying() { return isPlaying; },
  };
})();
