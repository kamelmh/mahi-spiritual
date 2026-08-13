/**
 * Quran Recitation Audio Player
 * Uses mp3quran.net free API (no API key needed)
 */
(function () {
  'use strict';

  const RECITERS = [
    { id: 'alafasy', name: 'Mishary Rashid Alafasy', server: 'server12.mp3quran.net', folder: 'afs' },
    { id: 'abdulbasit', name: 'Abdul Basit Abdul Samad', server: 'server7.mp3quran.net', folder: 'abdulbasit' },
    { id: 'maher', name: 'Maher Al Muaiqly', server: 'server11.mp3quran.net', folder: 'maher' }
  ];

  const STORAGE_KEY = 'quran-audio-player-state';
  const SURAH_COUNT = 114;

  let audio = null;
  let surahs = [];
  let currentSurah = 1;
  let currentReciter = RECITERS[0];
  let repeatMode = false;
  let autoPlayNext = false;
  let isPlaying = false;

  const elements = {};

  function buildUrl(reciter, surahNumber) {
    const padded = String(surahNumber).padStart(3, '0');
    return `https://${reciter.server}/${reciter.folder}/${padded}.mp3`;
  }

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function saveState() {
    try {
      const state = {
        surah: currentSurah,
        reciter: currentReciter.id,
        volume: audio ? audio.volume : 1,
        position: audio ? audio.currentTime : 0,
        repeatMode,
        autoPlayNext
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { /* localStorage unavailable */ }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw);
      if (state.reciter) {
        const found = RECITERS.find(r => r.id === state.reciter);
        if (found) currentReciter = found;
      }
      if (state.surah && state.surah >= 1 && state.surah <= SURAH_COUNT) {
        currentSurah = state.surah;
      }
      if (typeof state.repeatMode === 'boolean') repeatMode = state.repeatMode;
      if (typeof state.autoPlayNext === 'boolean') autoPlayNext = state.autoPlayNext;
      return state;
    } catch (_) {
      return null;
    }
  }

  function populateSurahSelector() {
    const sel = elements.surahSelect;
    if (!sel) return;
    sel.innerHTML = '';
    for (let i = 1; i <= SURAH_COUNT; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      const name = surahs.find(s => s.number === i);
      opt.textContent = name ? `${i}. ${name.name}` : `Surah ${i}`;
      sel.appendChild(opt);
    }
    sel.value = currentSurah;
  }

  function populateReciterSelector() {
    const sel = elements.reciterSelect;
    if (!sel) return;
    sel.innerHTML = '';
    RECITERS.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.name;
      sel.appendChild(opt);
    });
    sel.value = currentReciter.id;
  }

  function updateDisplay() {
    if (elements.currentTime) elements.currentTime.textContent = formatTime(audio?.currentTime);
    if (elements.duration) elements.duration.textContent = formatTime(audio?.duration);
    if (elements.progressFill && audio?.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      elements.progressFill.style.width = `${pct}%`;
    }
    if (elements.repeatBtn) {
      elements.repeatBtn.classList.toggle('active', repeatMode);
    }
    if (elements.autoplayToggle) {
      elements.autoplayToggle.checked = autoPlayNext;
    }
  }

  function loadSurah(surahNumber, autoPlay) {
    if (!audio) return;
    if (surahNumber < 1 || surahNumber > SURAH_COUNT) return;
    currentSurah = surahNumber;
    audio.src = buildUrl(currentReciter, currentSurah);
    audio.load();
    if (elements.surahSelect) elements.surahSelect.value = currentSurah;
    updateDisplay();
    saveState();
    if (autoPlay) {
      audio.play().catch(() => {});
      isPlaying = true;
    }
  }

  function play() {
    if (!audio) return;
    if (!audio.src) {
      loadSurah(currentSurah, true);
      return;
    }
    audio.play().catch(() => {});
    isPlaying = true;
    saveState();
  }

  function pause() {
    if (!audio) return;
    audio.pause();
    isPlaying = false;
    saveState();
  }

  function stop() {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    updateDisplay();
    saveState();
  }

  function toggleRepeat() {
    repeatMode = !repeatMode;
    updateDisplay();
    saveState();
  }

  function setVolume(val) {
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, val));
    saveState();
  }

  function playNextSurah() {
    if (currentSurah < SURAH_COUNT) {
      loadSurah(currentSurah + 1, autoPlayNext);
    } else if (repeatMode) {
      loadSurah(1, true);
    }
  }

  function initAudio() {
    audio = new Audio();
    audio.preload = 'metadata';

    audio.addEventListener('timeupdate', updateDisplay);
    audio.addEventListener('loadedmetadata', updateDisplay);
    audio.addEventListener('ended', function () {
      if (repeatMode && !autoPlayNext) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (autoPlayNext) {
        playNextSurah();
      } else {
        isPlaying = false;
        updateDisplay();
      }
    });
    audio.addEventListener('play', function () {
      isPlaying = true;
      updateDisplay();
    });
    audio.addEventListener('pause', function () {
      isPlaying = false;
    });
  }

  function bindControls() {
    elements.playBtn = document.getElementById('ap-play');
    elements.pauseBtn = document.getElementById('ap-pause');
    elements.stopBtn = document.getElementById('ap-stop');
    elements.prevBtn = document.getElementById('ap-prev');
    elements.nextBtn = document.getElementById('ap-next');
    elements.surahSelect = document.getElementById('ap-surah');
    elements.reciterSelect = document.getElementById('ap-reciter');
    elements.volumeSlider = document.getElementById('ap-volume');
    elements.currentTime = document.getElementById('ap-current-time');
    elements.duration = document.getElementById('ap-duration');
    elements.progressFill = document.getElementById('ap-progress-fill');
    elements.progressBar = document.getElementById('ap-progress-bar');
    elements.repeatBtn = document.getElementById('ap-repeat');
    elements.autoplayToggle = document.getElementById('ap-autoplay');
    elements.playingInfo = document.getElementById('ap-playing-info');

    elements.playBtn?.addEventListener('click', play);
    elements.pauseBtn?.addEventListener('click', pause);
    elements.stopBtn?.addEventListener('click', stop);
    elements.repeatBtn?.addEventListener('click', toggleRepeat);

    elements.prevBtn?.addEventListener('click', function () {
      if (currentSurah > 1) loadSurah(currentSurah - 1, isPlaying);
    });

    elements.nextBtn?.addEventListener('click', function () {
      if (currentSurah < SURAH_COUNT) loadSurah(currentSurah + 1, isPlaying);
    });

    elements.surahSelect?.addEventListener('change', function () {
      const val = parseInt(this.value, 10);
      if (val >= 1 && val <= SURAH_COUNT) loadSurah(val, isPlaying);
    });

    elements.reciterSelect?.addEventListener('change', function () {
      const found = RECITERS.find(r => r.id === this.value);
      if (found) {
        currentReciter = found;
        loadSurah(currentSurah, isPlaying);
      }
    });

    elements.volumeSlider?.addEventListener('input', function () {
      setVolume(parseFloat(this.value));
    });

    elements.progressBar?.addEventListener('click', function (e) {
      if (!audio?.duration) return;
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = x / rect.width;
      audio.currentTime = pct * audio.duration;
      updateDisplay();
    });

    elements.autoplayToggle?.addEventListener('change', function () {
      autoPlayNext = this.checked;
      saveState();
    });
  }

  function updatePlayingInfo() {
    if (!elements.playingInfo) return;
    const name = surahs.find(s => s.number === currentSurah);
    const surahName = name ? name.name : `Surah ${currentSurah}`;
    elements.playingInfo.textContent = `${currentReciter.name} - ${surahName}`;
  }

  async function fetchSurahs() {
    try {
      const resp = await fetch('data/verses.json');
      if (!resp.ok) throw new Error('Failed to load surahs');
      const data = await resp.json();
      if (Array.isArray(data)) {
        surahs = data;
      } else if (data.surahs && Array.isArray(data.surahs)) {
        surahs = data.surahs;
      } else {
        surahs = [];
      }
    } catch (_) {
      surahs = [];
    }
  }

  async function init() {
    initAudio();
    bindControls();

    const savedState = loadState();

    await fetchSurahs();
    populateSurahSelector();
    populateReciterSelector();

    if (savedState?.volume != null) {
      setVolume(savedState.volume);
      if (elements.volumeSlider) elements.volumeSlider.value = savedState.volume;
    }

    if (savedState?.position > 0 && !savedState?.surah) {
      loadSurah(currentSurah, false);
      audio.currentTime = savedState.position;
    }

    updateDisplay();
    updatePlayingInfo();
  }

  function playSurah(surahNumber) {
    loadSurah(surahNumber, true);
    updatePlayingInfo();
  }

  window.AudioPlayer = {
    init,
    play,
    pause,
    stop,
    toggleRepeat,
    setVolume,
    playSurah,
    get currentSurah() { return currentSurah; },
    get currentReciter() { return currentReciter; },
    get isPlaying() { return isPlaying; }
  };
})();
