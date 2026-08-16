/* MAHI Spiritual System - Hifdh Tracker Engine
 * Quran Memorization Tracker with Spaced Repetition
 * Uses Modified Leitner system for review scheduling
 */

const HifdhEngine = (() => {
  'use strict';

  const STORAGE_KEY = 'mahi-hifdh';
  const TOTAL_AYAHS = 6236;

  // Leitner boxes: review intervals in days
  const LEITNER_BOXES = [1, 3, 7, 14, 30, 60, 120];

  // Surah data (name, ayah count, juz, type)
  const SURAH_DATA = [
    { n: 1, name: 'Al-Fatiha', ayahs: 7, juz: 1, type: 'Makki' },
    { n: 2, name: 'Al-Baqarah', ayahs: 286, juz: '1-2', type: 'Madani' },
    { n: 3, name: 'Ali Imran', ayahs: 200, juz: '3-4', type: 'Madani' },
    { n: 4, name: 'An-Nisa', ayahs: 176, juz: '4-5', type: 'Madani' },
    { n: 5, name: 'Al-Ma\'idah', ayahs: 120, juz: '6-7', type: 'Madani' },
    { n: 6, name: 'Al-An\'am', ayahs: 165, juz: '7-8', type: 'Makki' },
    { n: 7, name: 'Al-A\'raf', ayahs: 206, juz: '8-9', type: 'Makki' },
    { n: 8, name: 'Al-Anfal', ayahs: 75, juz: '9-10', type: 'Madani' },
    { n: 9, name: 'At-Tawbah', ayahs: 129, juz: '10-11', type: 'Madani' },
    { n: 10, name: 'Yunus', ayahs: 109, juz: '11', type: 'Makki' },
    { n: 11, name: 'Hud', ayahs: 123, juz: '11-12', type: 'Makki' },
    { n: 12, name: 'Yusuf', ayahs: 111, juz: '12-13', type: 'Makki' },
    { n: 13, name: 'Ar-Ra\'d', ayahs: 43, juz: '13', type: 'Madani' },
    { n: 14, name: 'Ibrahim', ayahs: 52, juz: '13', type: 'Makki' },
    { n: 15, name: 'Al-Hijr', ayahs: 99, juz: '14', type: 'Makki' },
    { n: 16, name: 'An-Nahl', ayahs: 128, juz: '14-15', type: 'Makki' },
    { n: 17, name: 'Al-Isra', ayahs: 111, juz: '15', type: 'Makki' },
    { n: 18, name: 'Al-Kahf', ayahs: 110, juz: '15-16', type: 'Makki' },
    { n: 19, name: 'Maryam', ayahs: 98, juz: '16', type: 'Makki' },
    { n: 20, name: 'Taha', ayahs: 135, juz: '16', type: 'Makki' },
    { n: 21, name: 'Al-Anbiya', ayahs: 112, juz: '17', type: 'Makki' },
    { n: 22, name: 'Al-Hajj', ayahs: 78, juz: '17-18', type: 'Madani' },
    { n: 23, name: 'Al-Mu\'minun', ayahs: 118, juz: '18', type: 'Makki' },
    { n: 24, name: 'An-Nur', ayahs: 64, juz: '18-19', type: 'Madani' },
    { n: 25, name: 'Al-Furqan', ayahs: 77, juz: '18-19', type: 'Makki' },
    { n: 26, name: 'Ash-Shu\'ara', ayahs: 227, juz: '19', type: 'Makki' },
    { n: 27, name: 'An-Naml', ayahs: 93, juz: '19-20', type: 'Makki' },
    { n: 28, name: 'Al-Qasas', ayahs: 88, juz: '20-21', type: 'Makki' },
    { n: 29, name: 'Al-Ankabut', ayahs: 69, juz: '20-21', type: 'Makki' },
    { n: 30, name: 'Ar-Rum', ayahs: 60, juz: '21', type: 'Makki' },
    { n: 31, name: 'Luqman', ayahs: 34, juz: '21', type: 'Makki' },
    { n: 32, name: 'As-Sajdah', ayahs: 30, juz: '21', type: 'Makki' },
    { n: 33, name: 'Al-Ahzab', ayahs: 73, juz: '21-22', type: 'Madani' },
    { n: 34, name: 'Saba\'', ayahs: 54, juz: '22', type: 'Makki' },
    { n: 35, name: 'Fatir', ayahs: 45, juz: '22', type: 'Makki' },
    { n: 36, name: 'Ya-Sin', ayahs: 83, juz: '22-23', type: 'Makki' },
    { n: 37, name: 'As-Saffat', ayahs: 182, juz: '23', type: 'Makki' },
    { n: 38, name: 'Sad', ayahs: 88, juz: '23', type: 'Makki' },
    { n: 39, name: 'Az-Zumar', ayahs: 75, juz: '23-24', type: 'Makki' },
    { n: 40, name: 'Ghafir', ayahs: 85, juz: '24-25', type: 'Makki' },
    { n: 41, name: 'Fussilat', ayahs: 54, juz: '24-25', type: 'Makki' },
    { n: 42, name: 'Ash-Shura', ayahs: 53, juz: '25', type: 'Makki' },
    { n: 43, name: 'Az-Zukhruf', ayahs: 89, juz: '25-26', type: 'Makki' },
    { n: 44, name: 'Ad-Dukhan', ayahs: 59, juz: '25', type: 'Makki' },
    { n: 45, name: 'Al-Jathiyah', ayahs: 37, juz: '25-26', type: 'Makki' },
    { n: 46, name: 'Al-Ahqaf', ayahs: 35, juz: '26', type: 'Makki' },
    { n: 47, name: 'Muhammad', ayahs: 38, juz: '26-27', type: 'Madani' },
    { n: 48, name: 'Al-Fath', ayahs: 29, juz: '26', type: 'Madani' },
    { n: 49, name: 'Al-Hujurat', ayahs: 18, juz: '26-27', type: 'Madani' },
    { n: 50, name: 'Qaf', ayahs: 45, juz: '26-27', type: 'Makki' },
    { n: 51, name: 'Adh-Dhariyat', ayahs: 60, juz: '26-27', type: 'Makki' },
    { n: 52, name: 'At-Tur', ayahs: 49, juz: '27', type: 'Makki' },
    { n: 53, name: 'An-Najm', ayahs: 62, juz: '27', type: 'Makki' },
    { n: 54, name: 'Al-Qamar', ayahs: 55, juz: '27', type: 'Makki' },
    { n: 55, name: 'Ar-Rahman', ayahs: 78, juz: '27-28', type: 'Madani' },
    { n: 56, name: 'Al-Waqi\'ah', ayahs: 96, juz: '27-28', type: 'Makki' },
    { n: 57, name: 'Al-Hadid', ayahs: 29, juz: '27-28', type: 'Madani' },
    { n: 58, name: 'Al-Mujadilah', ayahs: 22, juz: '28', type: 'Madani' },
    { n: 59, name: 'Al-Hashr', ayahs: 24, juz: '28', type: 'Madani' },
    { n: 60, name: 'Al-Mumtahanah', ayahs: 13, juz: '28', type: 'Madani' },
    { n: 61, name: 'As-Saff', ayahs: 14, juz: '28', type: 'Madani' },
    { n: 62, name: 'Al-Jumu\'ah', ayahs: 11, juz: '28', type: 'Madani' },
    { n: 63, name: 'Al-Munafiqun', ayahs: 11, juz: '28', type: 'Madani' },
    { n: 64, name: 'At-Taghabun', ayahs: 18, juz: '28', type: 'Madani' },
    { n: 65, name: 'At-Talaq', ayahs: 12, juz: '28-29', type: 'Madani' },
    { n: 66, name: 'At-Tahrim', ayahs: 12, juz: '28', type: 'Madani' },
    { n: 67, name: 'Al-Mulk', ayahs: 30, juz: '29', type: 'Makki' },
    { n: 68, name: 'Al-Qalam', ayahs: 52, juz: '29', type: 'Makki' },
    { n: 69, name: 'Al-Haqqah', ayahs: 52, juz: '29', type: 'Makki' },
    { n: 70, name: 'Al-Ma\'arij', ayahs: 44, juz: '29', type: 'Makki' },
    { n: 71, name: 'Nuh', ayahs: 28, juz: '29', type: 'Makki' },
    { n: 72, name: 'Al-Jinn', ayahs: 28, juz: '29-30', type: 'Makki' },
    { n: 73, name: 'Al-Muzzammil', ayahs: 20, juz: '29', type: 'Makki' },
    { n: 74, name: 'Al-Muddaththir', ayahs: 56, juz: '29-30', type: 'Makki' },
    { n: 75, name: 'Al-Qiyamah', ayahs: 40, juz: '29-30', type: 'Makki' },
    { n: 76, name: 'Al-Insan', ayahs: 31, juz: '29-30', type: 'Madani' },
    { n: 77, name: 'Al-Mursalat', ayahs: 50, juz: '29-30', type: 'Makki' },
    { n: 78, name: 'An-Naba', ayahs: 40, juz: '30', type: 'Makki' },
    { n: 79, name: 'An-Nazi\'at', ayahs: 46, juz: '30', type: 'Makki' },
    { n: 80, name: 'Abasa', ayahs: 42, juz: '30', type: 'Makki' },
    { n: 81, name: 'At-Takwir', ayahs: 29, juz: '30', type: 'Makki' },
    { n: 82, name: 'Al-Infitar', ayahs: 19, juz: '30', type: 'Makki' },
    { n: 83, name: 'Al-Mutaffifin', ayahs: 36, juz: '30', type: 'Makki' },
    { n: 84, name: 'Al-Inshiqaq', ayahs: 25, juz: '30', type: 'Makki' },
    { n: 85, name: 'Al-Buruj', ayahs: 22, juz: '30', type: 'Makki' },
    { n: 86, name: 'At-Tariq', ayahs: 17, juz: '30', type: 'Makki' },
    { n: 87, name: 'Al-A\'la', ayahs: 19, juz: '30', type: 'Makki' },
    { n: 88, name: 'Al-Ghashiyah', ayahs: 26, juz: '30', type: 'Makki' },
    { n: 89, name: 'Al-Fajr', ayahs: 30, juz: '30', type: 'Makki' },
    { n: 90, name: 'Al-Balad', ayahs: 20, juz: '30', type: 'Makki' },
    { n: 91, name: 'Ash-Shams', ayahs: 15, juz: '30', type: 'Makki' },
    { n: 92, name: 'Al-Layl', ayahs: 21, juz: '30', type: 'Makki' },
    { n: 93, name: 'Ad-Duha', ayahs: 11, juz: '30', type: 'Makki' },
    { n: 94, name: 'Ash-Sharh', ayahs: 8, juz: '30', type: 'Makki' },
    { n: 95, name: 'At-Tin', ayahs: 8, juz: '30', type: 'Makki' },
    { n: 96, name: 'Al-Alaq', ayahs: 19, juz: '30', type: 'Makki' },
    { n: 97, name: 'Al-Qadr', ayahs: 5, juz: '30', type: 'Makki' },
    { n: 98, name: 'Al-Bayyinah', ayahs: 8, juz: '30', type: 'Madani' },
    { n: 99, name: 'Az-Zalzalah', ayahs: 8, juz: '30', type: 'Madani' },
    { n: 100, name: 'Al-Adiyat', ayahs: 11, juz: '30', type: 'Makki' },
    { n: 101, name: 'Al-Qari\'ah', ayahs: 11, juz: '30', type: 'Makki' },
    { n: 102, name: 'At-Takathur', ayahs: 8, juz: '30', type: 'Makki' },
    { n: 103, name: 'Al-Asr', ayahs: 3, juz: '30', type: 'Makki' },
    { n: 104, name: 'Al-Humazah', ayahs: 9, juz: '30', type: 'Makki' },
    { n: 105, name: 'Al-Fil', ayahs: 5, juz: '30', type: 'Makki' },
    { n: 106, name: 'Quraysh', ayahs: 4, juz: '30', type: 'Makki' },
    { n: 107, name: 'Al-Ma\'un', ayahs: 7, juz: '30', type: 'Makki' },
    { n: 108, name: 'Al-Kawthar', ayahs: 3, juz: '30', type: 'Makki' },
    { n: 109, name: 'Al-Kafirun', ayahs: 6, juz: '30', type: 'Makki' },
    { n: 110, name: 'An-Nasr', ayahs: 3, juz: '30', type: 'Madani' },
    { n: 111, name: 'Al-Masad', ayahs: 5, juz: '30', type: 'Makki' },
    { n: 112, name: 'Al-Ikhlas', ayahs: 4, juz: '30', type: 'Makki' },
    { n: 113, name: 'Al-Falaq', ayahs: 5, juz: '30', type: 'Makki' },
    { n: 114, name: 'An-Nas', ayahs: 6, juz: '30', type: 'Makki' },
  ];

  // State
  let state = {
    surahs: {},       // { "1": { status, strength, box, ayahs: {}, lastReview } }
    reviewQueue: [],  // [{ surah, ayah, dueDate, strength, box }]
    stats: {
      totalMemorized: 0,
      totalInProgress: 0,
      streak: 0,
      lastSession: null,
      sessionsCompleted: 0,
    },
    startDate: null,
  };

  // --- Persistence ---
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = { ...state, ...parsed };
      }
    } catch (_) {}
    if (!state.startDate) {
      state.startDate = new Date().toISOString();
      save();
    }
  }

  // --- Surah Info ---
  function getSurahInfo(num) {
    return SURAH_DATA.find(s => s.n === num) || null;
  }

  function getAllSurahs() {
    return SURAH_DATA;
  }

  // --- Status Management ---
  function getSurahStatus(num) {
    const key = String(num);
    return state.surahs[key] || { status: 'not_started', strength: 0, box: 0, ayahs: {}, lastReview: null };
  }

  function setSurahStatus(num, status) {
    const key = String(num);
    if (!state.surahs[key]) {
      state.surahs[key] = { status: 'not_started', strength: 0, box: 0, ayahs: {}, lastReview: null };
    }
    state.surahs[key].status = status;
    save();
  }

  // --- Memory Strength (1-5) ---
  function setStrength(num, strength, ayah) {
    const key = String(num);
    const s = Math.max(1, Math.min(5, strength));
    
    if (ayah) {
      // Ayah-level
      if (!state.surahs[key]) state.surahs[key] = { status: 'in_progress', strength: 0, box: 0, ayahs: {}, lastReview: null };
      if (!state.surahs[key].ayahs) state.surahs[key].ayahs = {};
      state.surahs[key].ayahs[String(ayah)] = {
        strength: s,
        box: getLeitnerBox(s),
        lastReview: new Date().toISOString(),
        nextReview: getReviewDate(getLeitnerBox(s)),
      };
      // Update surah-level strength as average
      const ayahs = Object.values(state.surahs[key].ayahs);
      const avg = ayahs.reduce((sum, a) => sum + a.strength, 0) / ayahs.length;
      state.surahs[key].strength = Math.round(avg);
      state.surahs[key].box = getLeitnerBox(Math.round(avg));
      state.surahs[key].lastReview = new Date().toISOString();
    } else {
      // Surah-level
      if (!state.surahs[key]) state.surahs[key] = { status: 'in_progress', strength: 0, box: 0, ayahs: {}, lastReview: null };
      state.surahs[key].strength = s;
      state.surahs[key].box = getLeitnerBox(s);
      state.surahs[key].lastReview = new Date().toISOString();
    }
    save();
    updateStats();
  }

  function getLeitnerBox(strength) {
    // Strength 1 → box 0, strength 2 → box 1, ..., strength 5 → box 6
    return Math.min(strength - 1, LEITNER_BOXES.length - 1);
  }

  function getReviewDate(box) {
    const days = LEITNER_BOXES[box] || LEITNER_BOXES[LEITNER_BOXES.length - 1];
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }

  // --- Spaced Repetition ---
  function getDueReviews() {
    const now = new Date();
    const due = [];
    
    Object.entries(state.surahs).forEach(([surahNum, surahData]) => {
      if (!surahData.ayahs) return;
      
      Object.entries(surahData.ayahs).forEach(([ayahNum, ayahData]) => {
        if (ayahData.nextReview && new Date(ayahData.nextReview) <= now) {
          due.push({
            surah: parseInt(surahNum),
            ayah: parseInt(ayahNum),
            strength: ayahData.strength,
            box: ayahData.box,
            nextReview: ayahData.nextReview,
          });
        }
      });
    });
    
    // Sort by urgency (oldest first)
    due.sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview));
    return due;
  }

  function getTodayReviewCount() {
    const now = new Date();
    const todayStr = now.toDateString();
    
    let count = 0;
    Object.values(state.surahs).forEach(surahData => {
      if (!surahData.ayahs) return;
      Object.values(surahData.ayahs).forEach(ayahData => {
        if (ayahData.lastReview && new Date(ayahData.lastReview).toDateString() === todayStr) {
          count++;
        }
      });
    });
    return count;
  }

  // --- Statistics ---
  function updateStats() {
    let memorized = 0;
    let inProgress = 0;
    let totalAyahsMemorized = 0;
    
    Object.values(state.surahs).forEach(surahData => {
      if (surahData.status === 'memorized') {
        memorized++;
      } else if (surahData.status === 'in_progress') {
        inProgress++;
      }
      // Count ayahs with strength >= 4 as memorized
      if (surahData.ayahs) {
        Object.values(surahData.ayahs).forEach(ayahData => {
          if (ayahData.strength >= 4) totalAyahsMemorized++;
        });
      }
    });
    
    state.stats.totalMemorized = memorized;
    state.stats.totalInProgress = inProgress;
    state.stats.totalAyahsMemorized = totalAyahsMemorized;
    
    // Update streak
    const today = new Date().toDateString();
    if (state.stats.lastSession) {
      const lastDate = new Date(state.stats.lastSession).toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate === today) {
        // Already recorded today
      } else if (lastDate === yesterday.toDateString()) {
        state.stats.streak++;
      } else {
        state.stats.streak = 1;
      }
    } else {
      state.stats.streak = 1;
    }
    state.stats.lastSession = new Date().toISOString();
    state.stats.sessionsCompleted++;
    
    save();
  }

  function getStats() {
    updateStats();
    return {
      ...state.stats,
      totalSurahs: 114,
      totalAyahs: TOTAL_AYAHS,
      percentComplete: Math.round((state.stats.totalMemorized / 114) * 100),
      ayahPercent: Math.round((state.stats.totalAyahsMemorized / TOTAL_AYAHS) * 100),
      dueReviews: getDueReviews().length,
      startDate: state.startDate,
    };
  }

  // --- Dashboard Data ---
  function getDashboardData() {
    const stats = getStats();
    const dueReviews = getDueReviews();
    const todayReviews = getTodayReviewCount();
    
    // Group surahs by status
    const byStatus = {
      memorized: [],
      in_progress: [],
      not_started: [],
    };
    
    SURAH_DATA.forEach(surah => {
      const status = getSurahStatus(surah.n);
      byStatus[status.status].push({
        ...surah,
        strength: status.strength,
        box: status.box,
        lastReview: status.lastReview,
      });
    });
    
    // Upcoming reviews (next 7 days)
    const upcoming = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() + i);
      const dayStr = day.toDateString();
      const count = dueReviews.filter(r => new Date(r.nextReview).toDateString() === dayStr).length;
      upcoming.push({ date: day, count });
    }
    
    return {
      stats,
      dueReviews: dueReviews.slice(0, 10), // Next 10 reviews
      todayReviews,
      byStatus,
      upcoming,
    };
  }

  // --- Session Recording ---
  function recordSession(surahNum, ayahStart, ayahEnd, strength) {
    const key = String(surahNum);
    if (!state.surahs[key]) {
      state.surahs[key] = { status: 'in_progress', strength: 0, box: 0, ayahs: {}, lastReview: null };
    }
    
    // Record each ayah in range
    for (let ayah = ayahStart; ayah <= ayahEnd; ayah++) {
      setStrength(surahNum, strength, ayah);
    }
    
    // Check if entire surah is memorized
    const surahInfo = getSurahInfo(surahNum);
    if (surahInfo) {
      const ayahsMemorized = Object.values(state.surahs[key].ayahs || {}).filter(a => a.strength >= 4).length;
      if (ayahsMemorized >= surahInfo.ayahs) {
        state.surahs[key].status = 'memorized';
      }
    }
    
    updateStats();
    save();
  }

  // --- Reset ---
  function resetSurah(num) {
    const key = String(num);
    delete state.surahs[key];
    save();
    updateStats();
  }

  function resetAll() {
    state = {
      surahs: {},
      reviewQueue: [],
      stats: { totalMemorized: 0, totalInProgress: 0, streak: 0, lastSession: null, sessionsCompleted: 0 },
      startDate: new Date().toISOString(),
    };
    save();
  }

  // --- Export/Import ---
  function exportData() {
    return JSON.stringify(state, null, 2);
  }

  function importData(json) {
    try {
      const data = JSON.parse(json);
      state = { ...state, ...data };
      save();
      return true;
    } catch (_) {
      return false;
    }
  }

  // --- Init ---
  function init() {
    load();
    updateStats();
  }

  // --- Public API ---
  return {
    init,
    getSurahInfo,
    getAllSurahs,
    getSurahStatus,
    setSurahStatus,
    setStrength,
    getDueReviews,
    getTodayReviewCount,
    getStats,
    getDashboardData,
    recordSession,
    resetSurah,
    resetAll,
    exportData,
    importData,
    LEITNER_BOXES,
  };
})();

// Export
window.HifdhEngine = HifdhEngine;
