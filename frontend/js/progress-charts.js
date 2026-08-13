/**
 * ProgressCharts - Spiritual Practice Progress Visualization
 * Pure SVG charts, no external dependencies
 */
(function () {
  'use strict';

  const COLORS = {
    bg: '#0a0a0f',
    blue: '#4a90d9',
    gold: '#d4a574',
    green: '#4caf50',
    text: '#e0e0e0',
    textMuted: '#888',
    grid: '#1a1a2e',
    heatmapEmpty: '#161b22',
    heatmapLow: '#0e4429',
    heatmapMed: '#006d32',
    heatmapHigh: '#26a641',
    heatmapMax: '#39d353'
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  function loadData() {
    try {
      const recitations = JSON.parse(localStorage.getItem('recitations') || '{}');
      const practice = JSON.parse(localStorage.getItem('practice') || '{}');
      const yunusDhikr = parseInt(localStorage.getItem('yunusDhikr') || '0', 10);
      const arRahman = parseInt(localStorage.getItem('arRahman') || '0', 10);
      const alQalam = parseInt(localStorage.getItem('alQalam') || '0', 10);
      return { recitations, practice, yunusDhikr, arRahman, alQalam };
    } catch (e) {
      return { recitations: {}, practice: {}, yunusDhikr: 0, arRahman: 0, alQalam: 0 };
    }
  }

  function getWeeklyData(practice) {
    const history = practice.history || [];
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const counts = new Array(7).fill(0);
    history.forEach(function (entry) {
      const d = new Date(entry.date || entry.timestamp);
      if (d >= weekStart && d <= now) {
        const idx = (d.getDay() + 6) % 7;
        counts[idx] += entry.count || 1;
      }
    });
    return counts;
  }

  function getMonthlyData(practice) {
    const history = practice.history || [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dailyCounts = new Array(daysInMonth).fill(0);
    history.forEach(function (entry) {
      const d = new Date(entry.date || entry.timestamp);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate() - 1;
        dailyCounts[day] += entry.count || 1;
      }
    });
    return dailyCounts;
  }

  function getVerseBreakdown(recitations) {
    const surahMap = {};
    Object.keys(recitations).forEach(function (verseId) {
      const parts = verseId.split(':');
      const surah = parts[0] || 'Unknown';
      if (!surahMap[surah]) surahMap[surah] = 0;
      surahMap[surah] += recitations[verseId] || 1;
    });
    return surahMap;
  }

  function getStreakData(practice) {
    const history = practice.history || [];
    const now = new Date();
    const days = 30;
    const dailyCounts = new Array(days).fill(0);

    history.forEach(function (entry) {
      const d = new Date(entry.date || entry.timestamp);
      const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < days) {
        dailyCounts[days - 1 - diff] += entry.count || 1;
      }
    });
    return dailyCounts;
  }

  function createSVG(width, height) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.background = COLORS.bg;
    return svg;
  }

  function addText(svg, x, y, text, opts) {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', y);
    t.setAttribute('fill', (opts && opts.fill) || COLORS.text);
    t.setAttribute('font-size', (opts && opts.size) || 12);
    t.setAttribute('font-family', 'monospace, sans-serif');
    if (opts && opts.anchor) t.setAttribute('text-anchor', opts.anchor);
    if (opts && opts.transform) t.setAttribute('transform', opts.transform);
    t.textContent = text;
    svg.appendChild(t);
    return t;
  }

  function addLine(svg, x1, y1, x2, y2, stroke, width) {
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', x1);
    l.setAttribute('y1', y1);
    l.setAttribute('x2', x2);
    l.setAttribute('y2', y2);
    l.setAttribute('stroke', stroke || COLORS.grid);
    l.setAttribute('stroke-width', width || 1);
    svg.appendChild(l);
    return l;
  }

  function addRect(svg, x, y, w, h, fill, rx) {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    r.setAttribute('x', x);
    r.setAttribute('y', y);
    r.setAttribute('width', w);
    r.setAttribute('height', h);
    r.setAttribute('fill', fill);
    if (rx) r.setAttribute('rx', rx);
    svg.appendChild(r);
    return r;
  }

  function addCircle(svg, cx, cy, r, fill) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', cx);
    c.setAttribute('cy', cy);
    c.setAttribute('r', r);
    c.setAttribute('fill', fill);
    svg.appendChild(c);
    return c;
  }

  // ========== WEEKLY BAR CHART ==========
  function renderWeeklyChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const data = loadData();
    const counts = getWeeklyData(data.practice);
    const max = Math.max.apply(null, counts.concat([1]));

    const W = 400, H = 220;
    const pad = { top: 30, right: 20, bottom: 40, left: 45 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const barW = chartW / 7 * 0.6;
    const gap = chartW / 7;

    const svg = createSVG(W, H);
    addText(svg, W / 2, 18, 'Weekly Recitations', { anchor: 'middle', size: 14, fill: COLORS.gold });

    for (var i = 0; i <= 4; i++) {
      var y = pad.top + chartH - (chartH * i / 4);
      addLine(svg, pad.left, y, W - pad.right, y, COLORS.grid, 0.5);
      addText(svg, pad.left - 8, y + 4, Math.round(max * i / 4), { anchor: 'end', size: 10, fill: COLORS.textMuted });
    }

    counts.forEach(function (count, idx) {
      var x = pad.left + idx * gap + (gap - barW) / 2;
      var barH = (count / max) * chartH;
      var y = pad.top + chartH - barH;
      var color = count > 0 ? COLORS.blue : COLORS.grid;
      addRect(svg, x, y, barW, barH, color, 3);
      if (count > 0) {
        addText(svg, x + barW / 2, y - 6, count, { anchor: 'middle', size: 10, fill: COLORS.text });
      }
      addText(svg, x + barW / 2, H - pad.bottom + 16, DAYS[idx], { anchor: 'middle', size: 11, fill: COLORS.textMuted });
    });

    container.appendChild(svg);
  }

  // ========== MONTHLY HEATMAP ==========
  function getHeatmapColor(count, max) {
    if (count === 0) return COLORS.heatmapEmpty;
    var ratio = count / max;
    if (ratio < 0.25) return COLORS.heatmapLow;
    if (ratio < 0.5) return COLORS.heatmapMed;
    if (ratio < 0.75) return COLORS.heatmapHigh;
    return COLORS.heatmapMax;
  }

  function renderMonthlyHeatmap(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var data = loadData();
    var counts = getMonthlyData(data.practice);
    var max = Math.max.apply(null, counts.concat([1]));
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

    var cellSize = 20;
    var cellGap = 3;
    var cols = 7;
    var rows = Math.ceil((daysInMonth + firstDay) / cols);
    var W = cols * (cellSize + cellGap) + 60;
    var H = rows * (cellSize + cellGap) + 60;

    var svg = createSVG(W, H);
    addText(svg, W / 2, 18, MONTHS[month] + ' ' + year + ' Activity', { anchor: 'middle', size: 14, fill: COLORS.gold });

    DAYS.forEach(function (day, idx) {
      addText(svg, 40 + idx * (cellSize + cellGap) + cellSize / 2, 38, day.substring(0, 2), { anchor: 'middle', size: 10, fill: COLORS.textMuted });
    });

    for (var d = 1; d <= daysInMonth; d++) {
      var pos = d - 1 + firstDay;
      var col = pos % cols;
      var row = Math.floor(pos / cols);
      var x = 40 + col * (cellSize + cellGap);
      var y = 48 + row * (cellSize + cellGap);
      var count = counts[d - 1];
      var color = getHeatmapColor(count, max);
      var rect = addRect(svg, x, y, cellSize, cellSize, color, 3);
      rect.setAttribute('data-day', d);
      rect.setAttribute('data-count', count);
      var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = d + ': ' + count + ' recitations';
      rect.appendChild(title);
    }

    var legendY = H - 18;
    addText(svg, W / 2 - 80, legendY, 'Less', { size: 10, fill: COLORS.textMuted });
    [COLORS.heatmapEmpty, COLORS.heatmapLow, COLORS.heatmapMed, COLORS.heatmapHigh, COLORS.heatmapMax].forEach(function (c, i) {
      addRect(svg, W / 2 - 48 + i * 16, legendY - 10, 12, 12, c, 2);
    });
    addText(svg, W / 2 + 40, legendY, 'More', { size: 10, fill: COLORS.textMuted });

    container.appendChild(svg);
  }

  // ========== DONUT CHART ==========
  function renderDonutChart(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var data = loadData();
    var breakdown = getVerseBreakdown(data.recitations);
    var keys = Object.keys(breakdown);

    if (keys.length === 0) {
      keys = ['No data'];
      breakdown['No data'] = 1;
    }

    var total = 0;
    keys.forEach(function (k) { total += breakdown[k]; });

    var W = 360, H = 280;
    var cx = W / 2 - 50, cy = H / 2 + 10;
    var outerR = 90, innerR = 55;

    var svg = createSVG(W, H);
    addText(svg, W / 2, 18, 'Verse Recitation Breakdown', { anchor: 'middle', size: 14, fill: COLORS.gold });

    var palette = [COLORS.blue, COLORS.gold, COLORS.green, '#e06c75', '#c678dd', '#56b6c2', '#d19a66', '#98c379'];
    var startAngle = -Math.PI / 2;

    keys.forEach(function (key, idx) {
      var val = breakdown[key];
      var sliceAngle = (val / total) * Math.PI * 2;
      var endAngle = startAngle + sliceAngle;
      var largeArc = sliceAngle > Math.PI ? 1 : 0;

      var x1 = cx + outerR * Math.cos(startAngle);
      var y1 = cy + outerR * Math.sin(startAngle);
      var x2 = cx + outerR * Math.cos(endAngle);
      var y2 = cy + outerR * Math.sin(endAngle);
      var ix1 = cx + innerR * Math.cos(endAngle);
      var iy1 = cy + innerR * Math.sin(endAngle);
      var ix2 = cx + innerR * Math.cos(startAngle);
      var iy2 = cy + innerR * Math.sin(startAngle);

      var d = 'M ' + x1 + ' ' + y1 +
        ' A ' + outerR + ' ' + outerR + ' 0 ' + largeArc + ' 1 ' + x2 + ' ' + y2 +
        ' L ' + ix1 + ' ' + iy1 +
        ' A ' + innerR + ' ' + innerR + ' 0 ' + largeArc + ' 0 ' + ix2 + ' ' + iy2 + ' Z';

      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', palette[idx % palette.length]);
      path.setAttribute('stroke', COLORS.bg);
      path.setAttribute('stroke-width', 2);

      var titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      titleEl.textContent = key + ': ' + val + ' (' + Math.round(val / total * 100) + '%)';
      path.appendChild(titleEl);
      svg.appendChild(path);

      startAngle = endAngle;
    });

    addCircle(svg, cx, cy, innerR, COLORS.bg);
    addText(svg, cx, cy - 4, total, { anchor: 'middle', size: 20, fill: COLORS.text });
    addText(svg, cx, cy + 14, 'total', { anchor: 'middle', size: 11, fill: COLORS.textMuted });

    var legendX = W - 110;
    var legendY = 45;
    keys.slice(0, 8).forEach(function (key, idx) {
      var y = legendY + idx * 22;
      addRect(svg, legendX, y - 6, 12, 12, palette[idx % palette.length], 2);
      var label = key.length > 12 ? key.substring(0, 11) + '..' : key;
      addText(svg, legendX + 18, y + 4, label + ' (' + breakdown[key] + ')', { size: 11, fill: COLORS.text });
    });

    container.appendChild(svg);
  }

  // ========== STREAK LINE CHART ==========
  function renderStreakLine(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    var data = loadData();
    var counts = getStreakData(data.practice);
    var max = Math.max.apply(null, counts.concat([1]));

    var W = 440, H = 220;
    var pad = { top: 30, right: 20, bottom: 40, left: 45 };
    var chartW = W - pad.left - pad.right;
    var chartH = H - pad.top - pad.bottom;

    var svg = createSVG(W, H);
    addText(svg, W / 2, 18, 'Streak (Last 30 Days)', { anchor: 'middle', size: 14, fill: COLORS.gold });

    for (var i = 0; i <= 4; i++) {
      var y = pad.top + chartH - (chartH * i / 4);
      addLine(svg, pad.left, y, W - pad.right, y, COLORS.grid, 0.5);
      addText(svg, pad.left - 8, y + 4, Math.round(max * i / 4), { anchor: 'end', size: 10, fill: COLORS.textMuted });
    }

    var points = [];
    counts.forEach(function (count, idx) {
      var x = pad.left + (idx / (counts.length - 1)) * chartW;
      var y = pad.top + chartH - (count / max) * chartH;
      points.push({ x: x, y: y, count: count });
    });

    if (points.length > 1) {
      var pathD = 'M ' + points[0].x + ' ' + points[0].y;
      for (var j = 1; j < points.length; j++) {
        pathD += ' L ' + points[j].x + ' ' + points[j].y;
      }

      var areaD = pathD + ' L ' + points[points.length - 1].x + ' ' + (pad.top + chartH) +
        ' L ' + points[0].x + ' ' + (pad.top + chartH) + ' Z';

      var area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      area.setAttribute('d', areaD);
      area.setAttribute('fill', COLORS.blue);
      area.setAttribute('fill-opacity', '0.15');
      svg.appendChild(area);

      var line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.setAttribute('d', pathD);
      line.setAttribute('fill', 'none');
      line.setAttribute('stroke', COLORS.blue);
      line.setAttribute('stroke-width', 2);
      svg.appendChild(line);

      points.forEach(function (pt) {
        var dot = addCircle(svg, pt.x, pt.y, 3, COLORS.blue);
        dot.setAttribute('stroke', COLORS.bg);
        dot.setAttribute('stroke-width', 1.5);
        var titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        titleEl.textContent = pt.count + ' recitations';
        dot.appendChild(titleEl);
      });
    }

    for (var k = 0; k < counts.length; k += 5) {
      var xLabel = pad.left + (k / (counts.length - 1)) * chartW;
      addText(svg, xLabel, H - pad.bottom + 16, 'D' + (k + 1), { anchor: 'middle', size: 10, fill: COLORS.textMuted });
    }

    container.appendChild(svg);
  }

  // ========== INIT ==========
  function init() {
    renderWeeklyChart('weeklyChart');
    renderMonthlyHeatmap('monthlyHeatmap');
    renderDonutChart('versesDonut');
    renderStreakLine('streakLine');
  }

  window.ProgressCharts = {
    renderWeeklyChart: renderWeeklyChart,
    renderMonthlyHeatmap: renderMonthlyHeatmap,
    renderDonutChart: renderDonutChart,
    renderStreakLine: renderStreakLine,
    init: init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
