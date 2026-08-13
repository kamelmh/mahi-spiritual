/**
 * Family Charts Module
 * Renders family member charts from the new family.json format
 * Members are top-level keys, planets are objects (not arrays)
 */

const Family = (() => {
  let familyData = null;

  async function init() {
    try {
      const resp = await fetch('data/family.json');
      familyData = await resp.json();
    } catch (e) {
      console.warn('Family data not loaded:', e);
      return;
    }
    renderArchetypes();
    renderCharts();
    renderSynastry();
    renderNakshatraPatterns();
    renderMissingData();
  }

  function renderArchetypes() {
    const el = document.getElementById('familyArchetypes');
    if (!el || !familyData) return;

    // Build family overview from the actual member data
    const members = Object.keys(familyData).filter(k => familyData[k].name);
    const kamel = familyData.Kamel;

    let html = `<div class="family-mission">
      <div class="mission-verse">The Mahi Family — A Quranic Blueprint</div>
      <div class="mission-statement">Each member carries a unique nakshatra energy, forming a family karmic pattern through shared planetary placements.</div>
    </div>`;

    // Show family members as archetypes
    html += '<div class="archetypes-grid">';
    members.forEach(name => {
      const m = familyData[name];
      const sun = m.planets ? m.planets.Sun : null;
      const moon = m.planets ? m.planets.Moon : null;
      const role = m.role || '';
      const sunInfo = sun ? `${sun.sign} ${sun.degree}° (${sun.nakshatra})` : 'Unknown';
      const moonInfo = moon ? `${moon.sign} ${moon.degree}° (${moon.nakshatra})` : 'Unknown';

      html += `<div class="archetype-card">
        <div class="archetype-name">${name}</div>
        <div class="archetype-verse">${role}</div>
        <div class="archetype-desc">Sun: ${sunInfo}<br>Moon: ${moonInfo}</div>
      </div>`;
    });
    html += '</div>';

    el.innerHTML = html;
  }

  function renderCharts() {
    if (!familyData) return;

    const chartIds = {
      'motherChart': familyData.Zohra,
      'fatherChart': familyData.Father,
      'kheireddineChart': familyData.Kheireddine,
      'kamelChart': familyData.Kamel
    };

    Object.entries(chartIds).forEach(([id, member]) => {
      const el = document.getElementById(id);
      if (!el || !member) {
        if (el) el.innerHTML = '<div style="color:var(--text-secondary);font-size:13px">No data available</div>';
        return;
      }

      let html = `<div class="chart-archetype">${member.role || ''}</div>`;

      if (member.planets) {
        html += '<div class="planet-positions">';
        const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu'];
        planets.forEach(p => {
          if (member.planets[p]) {
            const pos = member.planets[p];
            html += `<div class="planet-row">
              <span class="planet-name">${p}</span>
              <span class="planet-pos">${pos.sign} ${typeof pos.degree === 'number' ? pos.degree.toFixed(1) : pos.degree}°</span>
              <span class="planet-nak">${pos.nakshatra || ''}</span>
            </div>`;
          }
        });
        html += '</div>';
      }

      el.innerHTML = html;
    });
  }

  function renderSynastry() {
    const el = document.getElementById('synastryGrid');
    if (!el || !familyData) return;

    // Compute synastry from shared nakshatra placements
    const members = Object.keys(familyData).filter(k => familyData[k].planets);
    const nakMap = {};

    members.forEach(name => {
      const m = familyData[name];
      const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
      planets.forEach(p => {
        if (m.planets[p] && m.planets[p].nakshatra) {
          const nak = m.planets[p].nakshatra;
          if (!nakMap[nak]) nakMap[nak] = [];
          nakMap[nak].push(`${name} (${p})`);
        }
      });
    });

    // Find shared nakshatras (2+ members)
    const shared = Object.entries(nakMap).filter(([_, arr]) => arr.length >= 2);

    let html = '<div class="synastry-section"><h4>Shared Nakshatra Bonds</h4>';
    if (shared.length > 0) {
      shared.forEach(([nak, arr]) => {
        html += `<div class="synastry-bond">
          <span class="bond-nak">${nak}</span>
          <span class="bond-desc">${arr.join(', ')}</span>
        </div>`;
      });
    } else {
      html += '<div style="color:var(--text-secondary)">No shared nakshatras found</div>';
    }
    html += '</div>';

    el.innerHTML = html;
  }

  function renderNakshatraPatterns() {
    const el = document.getElementById('nakshatraPatterns');
    if (!el || !familyData) return;

    const members = Object.keys(familyData).filter(k => familyData[k].planets);
    const nakCount = {};

    members.forEach(name => {
      const m = familyData[name];
      const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
      planets.forEach(p => {
        if (m.planets[p] && m.planets[p].nakshatra) {
          const nak = m.planets[p].nakshatra;
          if (!nakCount[nak]) nakCount[nak] = [];
          nakCount[nak].push(`${name} (${p})`);
        }
      });
    });

    let html = '<div class="patterns-grid">';
    const sorted = Object.entries(nakCount).sort((a, b) => b[1].length - a[1].length);
    sorted.forEach(([nak, arr]) => {
      html += `<div class="pattern-card">
        <div class="pattern-name">${nak}</div>
        <div class="pattern-members">${arr.join(', ')}</div>
        <div class="pattern-significance">${arr.length} placement${arr.length > 1 ? 's' : ''} across family</div>
      </div>`;
    });
    html += '</div>';

    el.innerHTML = html;
  }

  function renderMissingData() {
    const el = document.getElementById('missingDataList');
    if (!el) return;

    const missing = [
      { name: 'Father', data: 'Exact birth date/time — only year (1961) known' },
      { name: 'Zohra', data: 'Exact birth time' },
      { name: 'Sara', data: 'Not in family.json — needs birth data' },
      { name: 'Hanane', data: 'Not in family.json — needs birth data' }
    ];

    let html = '';
    missing.forEach(m => {
      html += `<div class="missing-item">
        <span class="missing-name">${m.name}</span>
        <span class="missing-data">${m.data}</span>
      </div>`;
    });

    el.innerHTML = html;
  }

  return { init };
})();
