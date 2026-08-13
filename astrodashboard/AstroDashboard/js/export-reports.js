/**
 * export-reports.js — Spiritual Reports Export & Print
 * Generates print-friendly HTML reports and triggers browser print dialog.
 * Uses CSS @media print to hide navigation and show only report content.
 */

(function () {
  'use strict';

  // ── Helpers ──────────────────────────────────────────────────────────

  function safeParse(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function fmtDate(ts) {
    if (!ts) return 'N/A';
    var d = new Date(ts);
    return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  function fmtTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function sumValues(obj) {
    var total = 0;
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) total += Number(obj[k]) || 0;
    }
    return total;
  }

  // ── Data Collection ──────────────────────────────────────────────────

  function gatherData() {
    var recitations = safeParse('recitations', {});
    var practice = safeParse('practice', {});
    var yunusDhikr = safeParse('yunusDhikr', {});
    var arRahman = safeParse('arRahman', {});
    var alQalam = safeParse('alQalam', {});
    var audioState = safeParse('quran-audio-player-state', {});

    return {
      recitations: recitations,
      practice: practice,
      yunusDhikr: yunusDhikr,
      arRahman: arRahman,
      alQalam: alQalam,
      audioState: audioState
    };
  }

  // ── Spiritual Profile (static config) ────────────────────────────────

  function getProfile() {
    return {
      name: 'MAHI Kamel Abdelghani',
      birth: 'March 6, 1996 — 2:00 PM CET',
      location: 'El Bayadh, Algeria',
      ascendant: 'Gemini 21°31\' (Punarvasu Nakshatra)',
      moon: 'Scorpio 5°50\' (Anuradha Nakshatra) — Debilitated with cancellation',
      sun: 'Aquarius 22°26\' (Purva Bhadra Nakshatra)',
      coreVerses: ['21:87 (Yunus)', '55:1-4 (Ar-Rahman)', '68:1-4 (Al-Qalam)'],
      divineNames: ['Ya Hafiz (The Protector)', 'Ya Rahman (The Merciful)', 'Ya Alim (The All-Knowing)'],
      dasha: 'Mercury (2018–2028) — Communication, writing, teaching',
      powerDay: 'Thursday (Jupiter energy)',
      method: 'MAHI — Morning (Fajr), Afternoon (ASR), Hour (Maghrib), Isha'
    };
  }

  // ── Weekly Summary ───────────────────────────────────────────────────

  function buildWeeklyReport(data) {
    var now = new Date();
    var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    var yunusCount = 0;
    var arRahmanCount = 0;
    var alQalamCount = 0;
    var practiceDays = 0;
    var journalEntries = [];

    // Yunus dhikr this week
    if (data.yunusDhikr.history) {
      data.yunusDhikr.history.forEach(function (entry) {
        var t = new Date(entry.date || entry.timestamp);
        if (t >= weekAgo) {
          yunusCount += Number(entry.count) || 0;
          if (entry.journal) journalEntries.push(entry);
        }
      });
    }

    // Ar-Rahman this week
    if (data.arRahman.history) {
      data.arRahman.history.forEach(function (entry) {
        var t = new Date(entry.date || entry.timestamp);
        if (t >= weekAgo) arRahmanCount += Number(entry.count) || 0;
      });
    }

    // Al-Qalam this week
    if (data.alQalam.history) {
      data.alQalam.history.forEach(function (entry) {
        var t = new Date(entry.date || entry.timestamp);
        if (t >= weekAgo) alQalamCount += Number(entry.count) || 0;
      });
    }

    // Practice days this week
    if (data.practice.days) {
      var days = data.practice.days;
      for (var d in days) {
        if (days.hasOwnProperty(d)) {
          var dt = new Date(d);
          if (dt >= weekAgo && dt <= now && days[d].completed) practiceDays++;
        }
      }
    }

    // Recitation stats
    var totalRecitations = sumValues(data.recitations);

    return {
      title: 'Weekly Spiritual Summary',
      subtitle: weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
                ' – ' + now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      yunusCount: yunusCount,
      arRahmanCount: arRahmanCount,
      alQalamCount: alQalamCount,
      practiceDays: practiceDays,
      journalEntries: journalEntries,
      totalRecitations: totalRecitations,
      streak: data.practice.streak || 0
    };
  }

  // ── Monthly Report ───────────────────────────────────────────────────

  function buildMonthlyReport(data) {
    var now = new Date();
    var monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    var yunusCount = 0;
    var arRahmanCount = 0;
    var alQalamCount = 0;
    var practiceDays = 0;
    var journalEntries = [];
    var heatmap = {};

    // Yunus dhikr this month
    if (data.yunusDhikr.history) {
      data.yunusDhikr.history.forEach(function (entry) {
        var t = new Date(entry.date || entry.timestamp);
        if (t >= monthAgo) {
          yunusCount += Number(entry.count) || 0;
          var dayKey = t.toISOString().slice(0, 10);
          heatmap[dayKey] = (heatmap[dayKey] || 0) + (Number(entry.count) || 0);
          if (entry.journal) journalEntries.push(entry);
        }
      });
    }

    // Ar-Rahman this month
    if (data.arRahman.history) {
      data.arRahman.history.forEach(function (entry) {
        var t = new Date(entry.date || entry.timestamp);
        if (t >= monthAgo) {
          arRahmanCount += Number(entry.count) || 0;
          var dayKey = t.toISOString().slice(0, 10);
          heatmap[dayKey] = (heatmap[dayKey] || 0) + (Number(entry.count) || 0);
        }
      });
    }

    // Al-Qalam this month
    if (data.alQalam.history) {
      data.alQalam.history.forEach(function (entry) {
        var t = new Date(entry.date || entry.timestamp);
        if (t >= monthAgo) {
          alQalamCount += Number(entry.count) || 0;
          var dayKey = t.toISOString().slice(0, 10);
          heatmap[dayKey] = (heatmap[dayKey] || 0) + (Number(entry.count) || 0);
        }
      });
    }

    // Practice days this month
    if (data.practice.days) {
      var days = data.practice.days;
      for (var d in days) {
        if (days.hasOwnProperty(d)) {
          var dt = new Date(d);
          if (dt >= monthAgo && dt <= now && days[d].completed) practiceDays++;
        }
      }
    }

    var totalRecitations = sumValues(data.recitations);

    return {
      title: 'Monthly Spiritual Report',
      subtitle: monthAgo.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) +
                ' – ' + now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      yunusCount: yunusCount,
      arRahmanCount: arRahmanCount,
      alQalamCount: alQalamCount,
      practiceDays: practiceDays,
      journalEntries: journalEntries,
      totalRecitations: totalRecitations,
      streak: data.practice.streak || 0,
      heatmap: heatmap
    };
  }

  // ── Full Spiritual Profile ───────────────────────────────────────────

  function buildFullProfile(data) {
    var weekly = buildWeeklyReport(data);
    var monthly = buildMonthlyReport(data);
    var profile = getProfile();

    return {
      title: 'Full Spiritual Profile',
      subtitle: profile.name + ' — Generated ' + fmtDate(Date.now()),
      profile: profile,
      weekly: weekly,
      monthly: monthly
    };
  }

  // ── HTML Rendering ───────────────────────────────────────────────────

  function renderWeeklyHTML(r) {
    var journalHTML = '';
    if (r.journalEntries.length > 0) {
      var rows = r.journalEntries.map(function (e) {
        return '<tr><td>' + fmtDate(e.date || e.timestamp) + '</td><td>' +
               (e.text || e.journal || '—') + '</td></tr>';
      }).join('');
      journalHTML = '<h2>Journal Entries</h2><table><thead><tr><th>Date</th><th>Entry</th></tr></thead><tbody>' + rows + '</tbody></table>';
    }

    return '<div class="report">' +
      '<header><h1>' + r.title + '</h1><p class="subtitle">' + r.subtitle + '</p></header>' +
      '<section class="stats-grid">' +
        '<div class="stat-card"><h3>Yunus Dhikr</h3><p class="stat-value">' + r.yunusCount + '</p><p class="stat-label">recitations</p></div>' +
        '<div class="stat-card"><h3>Ar-Rahman</h3><p class="stat-value">' + r.arRahmanCount + '</p><p class="stat-label">recitations</p></div>' +
        '<div class="stat-card"><h3>Al-Qalam</h3><p class="stat-value">' + r.alQalamCount + '</p><p class="stat-label">pages</p></div>' +
        '<div class="stat-card"><h3>Practice Days</h3><p class="stat-value">' + r.practiceDays + '</p><p class="stat-label">of 7</p></div>' +
        '<div class="stat-card"><h3>Current Streak</h3><p class="stat-value">' + r.streak + '</p><p class="stat-label">days</p></div>' +
        '<div class="stat-card"><h3>Total Recitations</h3><p class="stat-value">' + r.totalRecitations + '</p><p class="stat-label">all time</p></div>' +
      '</section>' +
      journalHTML +
      '<footer class="report-footer">Generated by MAHI Spiritual Dashboard</footer>' +
    '</div>';
  }

  function renderHeatmap(heatmap) {
    var keys = Object.keys(heatmap).sort();
    if (keys.length === 0) return '<p>No activity data for this period.</p>';

    var max = 1;
    for (var k in heatmap) {
      if (heatmap[k] > max) max = heatmap[k];
    }

    var cells = keys.map(function (day) {
      var val = heatmap[day];
      var intensity = Math.round((val / max) * 255);
      var bg = 'rgb(' + intensity + ',' + Math.round(intensity * 0.6) + ',' + Math.round(intensity * 0.3) + ')';
      return '<div class="heatmap-cell" style="background:' + bg + '" title="' + day + ': ' + val + '">' +
             '<span class="hm-date">' + day.slice(5) + '</span><span class="hm-val">' + val + '</span></div>';
    }).join('');

    return '<div class="heatmap">' + cells + '</div>';
  }

  function renderMonthlyHTML(r) {
    var journalHTML = '';
    if (r.journalEntries.length > 0) {
      var rows = r.journalEntries.map(function (e) {
        return '<tr><td>' + fmtDate(e.date || e.timestamp) + '</td><td>' +
               (e.text || e.journal || '—') + '</td></tr>';
      }).join('');
      journalHTML = '<h2>Journal Entries</h2><table><thead><tr><th>Date</th><th>Entry</th></tr></thead><tbody>' + rows + '</tbody></table>';
    }

    return '<div class="report">' +
      '<header><h1>' + r.title + '</h1><p class="subtitle">' + r.subtitle + '</p></header>' +
      '<section class="stats-grid">' +
        '<div class="stat-card"><h3>Yunus Dhikr</h3><p class="stat-value">' + r.yunusCount + '</p><p class="stat-label">recitations</p></div>' +
        '<div class="stat-card"><h3>Ar-Rahman</h3><p class="stat-value">' + r.arRahmanCount + '</p><p class="stat-label">recitations</p></div>' +
        '<div class="stat-card"><h3>Al-Qalam</h3><p class="stat-value">' + r.alQalamCount + '</p><p class="stat-label">pages</p></div>' +
        '<div class="stat-card"><h3>Practice Days</h3><p class="stat-value">' + r.practiceDays + '</p><p class="stat-label">of 30</p></div>' +
        '<div class="stat-card"><h3>Current Streak</h3><p class="stat-value">' + r.streak + '</p><p class="stat-label">days</p></div>' +
        '<div class="stat-card"><h3>Total Recitations</h3><p class="stat-value">' + r.totalRecitations + '</p><p class="stat-label">all time</p></div>' +
      '</section>' +
      '<h2>Activity Heatmap</h2>' +
      renderHeatmap(r.heatmap) +
      journalHTML +
      '<footer class="report-footer">Generated by MAHI Spiritual Dashboard</footer>' +
    '</div>';
  }

  function renderFullProfileHTML(r) {
    var p = r.profile;

    var verseRows = p.coreVerses.map(function (v) {
      return '<tr><td>' + v + '</td></tr>';
    }).join('');

    var nameRows = p.divineNames.map(function (n) {
      return '<tr><td>' + n + '</td></tr>';
    }).join('');

    var weeklyHTML = renderWeeklyHTML(r.weekly);
    var monthlyHTML = renderMonthlyHTML(r.monthly);

    return '<div class="report report-full">' +
      '<header class="profile-header">' +
        '<h1>' + r.title + '</h1>' +
        '<p class="subtitle">' + r.subtitle + '</p>' +
      '</header>' +
      '<section class="profile-section">' +
        '<h2>Natal Chart Summary</h2>' +
        '<table class="profile-table">' +
          '<tr><th>Name</th><td>' + p.name + '</td></tr>' +
          '<tr><th>Birth</th><td>' + p.birth + '</td></tr>' +
          '<tr><th>Location</th><td>' + p.location + '</td></tr>' +
          '<tr><th>Ascendant</th><td>' + p.ascendant + '</td></tr>' +
          '<tr><th>Moon</th><td>' + p.moon + '</td></tr>' +
          '<tr><th>Sun</th><td>' + p.sun + '</td></tr>' +
          '<tr><th>Current Dasha</th><td>' + p.dasha + '</td></tr>' +
          '<tr><th>Power Day</th><td>' + p.powerDay + '</td></tr>' +
          '<tr><th>Method</th><td>' + p.method + '</td></tr>' +
        '</table>' +
      '</section>' +
      '<section class="profile-section">' +
        '<h2>Core Verses</h2>' +
        '<table class="profile-table"><tbody>' + verseRows + '</tbody></table>' +
        '<h2>Divine Names</h2>' +
        '<table class="profile-table"><tbody>' + nameRows + '</tbody></table>' +
      '</section>' +
      '<section class="profile-section page-break">' +
        '<h2>This Week</h2>' +
        weeklyHTML +
      '</section>' +
      '<section class="profile-section page-break">' +
        '<h2>Last 30 Days</h2>' +
        monthlyHTML +
      '</section>' +
      '<footer class="report-footer">Generated by MAHI Spiritual Dashboard — ' + fmtDate(Date.now()) + '</footer>' +
    '</div>';
  }

  // ── Print CSS Injection ──────────────────────────────────────────────

  var printStyleInjected = false;

  function injectPrintStyles() {
    if (printStyleInjected) return;
    var style = document.createElement('style');
    style.setAttribute('data-export', 'print-styles');
    style.textContent = [
      '@media print {',
      '  body * { visibility: hidden !important; }',
      '  #print-report-container, #print-report-container * { visibility: visible !important; }',
      '  #print-report-container {',
      '    position: absolute; left: 0; top: 0; width: 100%;',
      '    padding: 20px; background: #fff; color: #000;',
      '    font-family: "Georgia", serif; font-size: 12pt;',
      '    line-height: 1.5;',
      '  }',
      '  #print-report-container .nav,',
      '  #print-report-container .sidebar,',
      '  #print-report-container header:not(.profile-header),',
      '  #print-report-container .no-print,',
      '  #print-report-container footer:not(.report-footer) {',
      '    display: none !important;',
      '  }',
      '  .report { max-width: 700px; margin: 0 auto; }',
      '  .report h1 { font-size: 22pt; margin-bottom: 4px; border-bottom: 2px solid #333; padding-bottom: 6px; }',
      '  .report h2 { font-size: 15pt; margin-top: 18px; border-bottom: 1px solid #999; padding-bottom: 3px; }',
      '  .subtitle { color: #666; font-size: 11pt; margin-top: 0; }',
      '  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 14px 0; }',
      '  .stat-card { border: 1px solid #ccc; padding: 10px; text-align: center; border-radius: 4px; }',
      '  .stat-card h3 { margin: 0 0 4px 0; font-size: 10pt; color: #555; }',
      '  .stat-value { font-size: 20pt; font-weight: bold; margin: 2px 0; color: #111; }',
      '  .stat-label { font-size: 9pt; color: #777; margin: 0; }',
      '  table { width: 100%; border-collapse: collapse; margin: 8px 0; }',
      '  th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; font-size: 10pt; }',
      '  th { background: #f0f0f0; font-weight: bold; }',
      '  .profile-table th { width: 130px; }',
      '  .heatmap { display: flex; flex-wrap: wrap; gap: 3px; margin: 8px 0; }',
      '  .heatmap-cell { width: 32px; height: 32px; display: flex; flex-direction: column;',
      '    align-items: center; justify-content: center; border-radius: 3px; font-size: 7pt; color: #fff; }',
      '  .hm-date { font-size: 6pt; opacity: 0.8; }',
      '  .hm-val { font-weight: bold; font-size: 8pt; }',
      '  .page-break { page-break-before: always; }',
      '  .profile-section { margin-bottom: 16px; }',
      '  .report-footer { margin-top: 30px; text-align: center; font-size: 9pt; color: #999;',
      '    border-top: 1px solid #ddd; padding-top: 8px; }',
      '  @page { margin: 1.5cm; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
    printStyleInjected = true;
  }

  // ── Print Trigger ────────────────────────────────────────────────────

  function printReport(html) {
    injectPrintStyles();

    var container = document.getElementById('print-report-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'print-report-container';
      document.body.appendChild(container);
    }

    container.innerHTML = html;
    container.style.display = 'block';

    setTimeout(function () {
      window.print();
    }, 250);
  }

  // ── Public API ───────────────────────────────────────────────────────

  function printWeekly() {
    var data = gatherData();
    var report = buildWeeklyReport(data);
    printReport(renderWeeklyHTML(report));
  }

  function printMonthly() {
    var data = gatherData();
    var report = buildMonthlyReport(data);
    printReport(renderMonthlyHTML(report));
  }

  function printFullProfile() {
    var data = gatherData();
    var report = buildFullProfile(data);
    printReport(renderFullProfileHTML(report));
  }

  function init() {
    var btnWeekly = document.getElementById('export-weekly');
    var btnMonthly = document.getElementById('export-monthly');
    var btnFull = document.getElementById('export-full-profile');

    if (btnWeekly) btnWeekly.addEventListener('click', function (e) {
      e.preventDefault();
      printWeekly();
    });

    if (btnMonthly) btnMonthly.addEventListener('click', function (e) {
      e.preventDefault();
      printMonthly();
    });

    if (btnFull) btnFull.addEventListener('click', function (e) {
      e.preventDefault();
      printFullProfile();
    });
  }

  // ── Export ───────────────────────────────────────────────────────────

  window.ExportReports = {
    init: init,
    printWeekly: printWeekly,
    printMonthly: printMonthly,
    printFullProfile: printFullProfile
  };

})();
