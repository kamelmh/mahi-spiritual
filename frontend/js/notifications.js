/**
 * Prayer Time Notifications for El Bayadh, Algeria
 * Location: 33.6832°N, 1.0167°E
 */

(function () {
  'use strict';

  const LAT = 33.6832;
  const LON = 1.0167;
  const TIMEZONE = 1; // CET (UTC+1)

  const FAJR_ANGLE = 18;
  const ISHA_ANGLE = 17;
  const MAGHRIB_ANGLE = 0.833;
  const ASR_SHADOW_MULT = 1;

  const NOTIFICATION_OFFSET_MIN = 5;
  const CHECK_INTERVAL_MS = 60000;

  let audioCtx = null;
  let checkTimer = null;
  let lastNotifiedKey = null;

  // --- Math helpers ---

  function toRad(deg) { return deg * Math.PI / 180; }
  function toDeg(rad) { return rad * 180 / Math.PI; }

  function fixAngle(a) { return a - 360 * Math.floor(a / 360); }
  function fixHour(a) { return a - 24 * Math.floor(a / 24); }

  function JulianDate(year, month, day) {
    if (month <= 2) { year -= 1; month += 12; }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716))
      + Math.floor(30.6001 * (month + 1))
      + day + B - 1524.5;
  }

  // --- Sun position ---

  function sunPosition(jd) {
    const D = jd - 2451545.0;
    const g = fixAngle(357.529 + 0.98560028 * D);
    const q = fixAngle(280.459 + 0.98564736 * D);
    const L = fixAngle(q + 1.915 * Math.sin(toRad(g)) + 0.020 * Math.sin(toRad(2 * g)));
    const e = 23.439 - 0.00000036 * D;
    const RA = toDeg(Math.atan2(Math.cos(toRad(e)) * Math.sin(toRad(L)), Math.cos(toRad(L)))) / 15;
    const d = toDeg(Math.asin(Math.sin(toRad(e)) * Math.sin(toRad(L))));
    const EqT = q / 15 - fixHour(RA);
    return { declination: d, equation: EqT };
  }

  // --- Prayer time calculations ---

  function computePrayerTimes(year, month, day) {
    const jd = JulianDate(year, month, day) - LON / (15 * 360);
    const sun = sunPosition(jd + 0.5);

    function hourAngle(angle) {
      const cosHA = (Math.sin(toRad(-angle)) - Math.sin(toRad(LAT)) * Math.sin(toRad(sun.declination)))
        / (Math.cos(toRad(LAT)) * Math.cos(toRad(sun.declination)));
      if (cosHA > 1 || cosHA < -1) return null;
      return toDeg(Math.acos(cosHA)) / 15;
    }

    function asrTime() {
      const angle = Math.atan(1 / (1 + Math.tan(Math.abs(toRad(LAT - sun.declination)))));
      const shadowAngle = toDeg(angle);
      const alt = toDeg(Math.asin(
        Math.sin(toRad(LAT)) * Math.sin(toRad(sun.declination))
        + Math.cos(toRad(LAT)) * Math.cos(toRad(sun.declination))
      ));
      const noonShadow = 1 / Math.tan(toRad(alt > 0.01 ? alt : 0.01));
      const asrAlt = Math.atan(1 / (ASR_SHADOW_MULT + noonShadow));
      const asrDeg = toDeg(asrAlt);
      return (12 + sun.equation + toDeg(Math.acos(
        (Math.sin(toRad(asrDeg)) - Math.sin(toRad(LAT)) * Math.sin(toRad(sun.declination)))
        / (Math.cos(toRad(LAT)) * Math.cos(toRad(sun.declination)))
      )) / 15);
    }

    const fajrHA = hourAngle(FAJR_ANGLE);
    const sunriseHA = hourAngle(MAGHRIB_ANGLE);
    const ishaHA = hourAngle(ISHA_ANGLE);

    const dhuhr = 12 + sun.equation + TIMEZONE;
    const asr = asrTime();

    function toLocal(utHour) {
      if (utHour === null) return null;
      let h = fixHour(utHour + TIMEZONE);
      return h < 0 ? h + 24 : h;
    }

    return {
      fajr:     fajrHA !== null ? toLocal(dhuhr - fajrHA) : null,
      sunrise:  sunriseHA !== null ? toLocal(dhuhr - sunriseHA) : null,
      dhuhr:    dhuhr,
      asr:      asr !== null ? toLocal(asr + sun.equation + TIMEZONE) : null,
      maghrib:  sunriseHA !== null ? toLocal(dhuhr + sunriseHA) : null,
      isha:     ishaHA !== null ? toLocal(dhuhr + ishaHA) : null
    };
  }

  // --- Formatting ---

  function pad(n) { return Math.floor(n).toString().padStart(2, '0'); }
  function minutesStr(h) {
    const totalMin = Math.round(h * 60);
    const hrs = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return pad(hrs) + ':' + pad(mins);
  }

  function formatTime12(h) {
    if (h === null) return '--:--';
    let totalMin = Math.round(h * 60);
    if (totalMin < 0) totalMin += 1440;
    const hrs = Math.floor(totalMin / 60) % 24;
    const mins = totalMin % 60;
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const h12 = hrs === 0 ? 12 : hrs > 12 ? hrs - 12 : hrs;
    return h12 + ':' + pad(mins) + ' ' + ampm;
  }

  // --- Date math ---

  function getToday() {
    const now = new Date();
    const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + TIMEZONE * 3600000);
    return {
      year: utcDate.getFullYear(),
      month: utcDate.getMonth() + 1,
      day: utcDate.getDate()
    };
  }

  function todayKey() {
    const d = getToday();
    return d.year + '-' + pad(d.month) + '-' + pad(d.day);
  }

  // --- Notification logic ---

  function getPrayers() {
    const d = getToday();
    return computePrayerTimes(d.year, d.month, d.day);
  }

  function getNextPrayer() {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const prayers = getPrayers();
    const order = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    for (const name of order) {
      const t = prayers[name];
      if (t === null) continue;
      const tMin = Math.round(t * 60);
      if (tMin > nowMin) {
        return { name, time: t, minutesUntil: tMin - nowMin };
      }
    }
    return { name: 'fajr', time: prayers.fajr, minutesUntil: (Math.round(prayers.fajr * 60) + 1440) - nowMin };
  }

  function notificationAllowed() {
    try { return localStorage.getItem('prayerNotifications') !== 'off'; } catch (_) { return true; }
  }

  function soundAllowed() {
    try { return localStorage.getItem('prayerSound') !== 'off'; } catch (_) { return true; }
  }

  function playBeep() {
    if (!soundAllowed()) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (_) {}
  }

  function fireNotification(prayerName) {
    const displayName = prayerName.charAt(0).toUpperCase() + prayerName.slice(1);
    if ('Notification' in window && Notification.permission === 'granted') {
      playBeep();
      try {
        new Notification(displayName + ' Prayer', {
          body: displayName + ' prayer time is in ' + NOTIFICATION_OFFSET_MIN + ' minutes.',
          icon: '🕌',
          silent: true
        });
      } catch (_) {}
    } else {
      playBeep();
    }
  }

  // --- DOM updates ---

  function el(id) {
    const e = document.getElementById(id);
    return e || null;
  }

  function updateDOM(prayers) {
    const map = {
      fajr: 'fajrTime',
      sunrise: 'sunriseTime',
      dhuhr: 'dhuhrTime',
      asr: 'asrTime',
      maghrib: 'maghribTime',
      isha: 'ishaTime'
    };
    for (const [key, id] of Object.entries(map)) {
      const e = el(id);
      if (e) e.textContent = formatTime12(prayers[key]);
    }

    const next = getNextPrayer();
    const cdEl = el('nextPrayerCountdown');
    if (cdEl) {
      const displayName = next.name.charAt(0).toUpperCase() + next.name.slice(1);
      cdEl.textContent = displayName + ': ' + next.minutesUntil + ' min';
    }
  }

  // --- Check loop ---

  function checkPrayers() {
    const prayers = getPrayers();
    updateDOM(prayers);

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const key = todayKey();

    const order = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    for (const name of order) {
      const t = prayers[name];
      if (t === null) continue;
      const tMin = Math.round(t * 60);
      const triggerMin = tMin - NOTIFICATION_OFFSET_MIN;
      if (nowMin === triggerMin) {
        const notifKey = key + '-' + name;
        if (lastNotifiedKey !== notifKey) {
          lastNotifiedKey = notifKey;
          fireNotification(name);
        }
      }
    }
  }

  // --- Public API ---

  function requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function init() {
    requestPermission();
    checkPrayers();
    checkTimer = setInterval(checkPrayers, CHECK_INTERVAL_MS);
  }

  // --- localStorage preferences ---

  function setNotificationsEnabled(enabled) {
    try { localStorage.setItem('prayerNotifications', enabled ? 'on' : 'off'); } catch (_) {}
  }

  function setSoundEnabled(enabled) {
    try { localStorage.setItem('prayerSound', enabled ? 'on' : 'off'); } catch (_) {}
  }

  function isNotificationsEnabled() { return notificationAllowed(); }
  function isSoundEnabled() { return soundAllowed(); }

  // --- Export ---

  window.Notifications = {
    init: init,
    requestPermission: requestPermission,
    getNextPrayer: getNextPrayer,
    setNotificationsEnabled: setNotificationsEnabled,
    setSoundEnabled: setSoundEnabled,
    isNotificationsEnabled: isNotificationsEnabled,
    isSoundEnabled: isSoundEnabled,
    computePrayerTimes: computePrayerTimes,
    formatTime12: formatTime12,
    playBeep: playBeep
  };
})();
