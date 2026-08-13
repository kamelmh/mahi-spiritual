(() => {
  'use strict';

  const RING_CIRCUMFERENCE = 753.98;
  const STORAGE_KEY = 'dhikr_data';

  const $ = id => document.getElementById(id);

  const countEl = $('count');
  const targetLabel = $('targetLabel');
  const ringProgress = $('ringProgress');
  const counterBtn = $('counterBtn');
  const dhikrSelect = $('dhikrSelect');
  const targetSelect = $('targetSelect');
  const resetBtn = $('resetBtn');
  const soundBtn = $('soundBtn');
  const soundOn = $('soundOn');
  const soundOff = $('soundOff');
  const dailyTotalEl = $('dailyTotal');
  const streakEl = $('streak');
  const sessionTotalEl = $('sessionTotal');
  const completedMsg = $('completedMsg');
  const dhikrName = $('dhikrName');

  let state = loadState();
  let sessionTotal = 0;
  let soundEnabled = state.soundEnabled !== false;
  let audioCtx = null;

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function defaultState() {
    return {
      count: 0,
      target: 33,
      dhikr: 'SubhanAllah',
      soundEnabled: true,
      daily: {},
      streak: 0,
      lastDate: null
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const saved = JSON.parse(raw);
      if (saved.lastDate !== todayKey()) {
        if (saved.lastDate === getYesterday()) {
          saved.streak = (saved.streak || 0) + 1;
        } else if (saved.lastDate !== todayKey()) {
          saved.streak = saved.lastDate ? 0 : 0;
        }
        saved.count = 0;
        saved.lastDate = todayKey();
      }
      return { ...defaultState(), ...saved };
    } catch {
      return defaultState();
    }
  }

  function getYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  function saveState() {
    state.lastDate = todayKey();
    state.soundEnabled = soundEnabled;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function updateUI() {
    countEl.textContent = state.count;
    targetLabel.textContent = `/ ${state.target}`;
    dhikrName.textContent = state.dhikr;
    dhikrSelect.value = state.dhikr;
    targetSelect.value = state.target;

    const progress = Math.min(state.count / state.target, 1);
    ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);

    const todayTotal = (state.daily && state.daily[todayKey()]) || 0;
    dailyTotalEl.textContent = todayTotal;
    streakEl.textContent = state.streak;
    sessionTotalEl.textContent = sessionTotal;

    if (progress >= 1) {
      ringProgress.style.stroke = '#4ade80';
    } else {
      ringProgress.style.stroke = '';
    }
  }

  function playClick() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {}
  }

  function vibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms || 12);
  }

  function showCompleted() {
    completedMsg.classList.add('show');
    vibrate([50, 30, 50]);
    setTimeout(() => completedMsg.classList.remove('show'), 1800);
  }

  function increment() {
    const wasComplete = state.count >= state.target;
    state.count++;
    sessionTotal++;

    if (!state.daily) state.daily = {};
    state.daily[todayKey()] = (state.daily[todayKey()] || 0) + 1;

    if (wasComplete && state.count === state.target) {
      showCompleted();
    }

    countEl.classList.add('bump');
    setTimeout(() => countEl.classList.remove('bump'), 100);

    playClick();
    vibrate();
    updateUI();
    saveState();
  }

  function reset() {
    state.count = 0;
    updateUI();
    saveState();
    vibrate(20);
  }

  counterBtn.addEventListener('click', increment);
  counterBtn.addEventListener('touchend', e => { e.preventDefault(); increment(); });

  resetBtn.addEventListener('click', reset);

  dhikrSelect.addEventListener('change', () => {
    state.dhikr = dhikrSelect.value;
    updateUI();
    saveState();
  });

  targetSelect.addEventListener('change', () => {
    state.target = parseInt(targetSelect.value);
    state.count = 0;
    updateUI();
    saveState();
  });

  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundOn.style.display = soundEnabled ? '' : 'none';
    soundOff.style.display = soundEnabled ? 'none' : '';
    saveState();
  });

  soundOn.style.display = soundEnabled ? '' : 'none';
  soundOff.style.display = soundEnabled ? 'none' : '';

  ringProgress.style.strokeDasharray = RING_CIRCUMFERENCE;
  updateUI();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    $('installBtn').style.display = '';
  });

  $('installBtn').addEventListener('click', () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
  });
})();
