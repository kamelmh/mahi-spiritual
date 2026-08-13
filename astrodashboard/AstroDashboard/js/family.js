/**
 * Family Charts Module
 * Renders family synastry data, shared nakshatras, and Quranic archetypes
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

    const mission = familyData.family;
    const archetypes = familyData.quranic_archetypes;

    let html = `<div class="family-mission">
      <div class="mission-verse">${mission.core_verse}</div>
      <div class="mission-statement">${mission.quranic_mission}</div>
    </div>`;

    html += '<div class="archetypes-grid">';
    archetypes.forEach(a => {
      html += `<div class="archetype-card">
        <div class="archetype-name">${a.archetype}</div>
        <div class="archetype-verse">${a.verse}</div>
        <div class="archetype-members">${a.members.join(', ')}</div>
        <div class="archetype-desc">${a.description}</div>
      </div>`;
    });
    html += '</div>';

    el.innerHTML = html;
  }

  function renderCharts() {
    if (!familyData) return;

    const chartIds = {
      'motherChart': familyData.members.find(m => m.name === 'Zohra'),
      'fatherChart': familyData.members.find(m => m.name === 'Father'),
      'kheireddineChart': familyData.members.find(m => m.name === 'Kheireddine'),
      'kamelChart': familyData.members.find(m => m.name === 'Kamel')
    };

    Object.entries(chartIds).forEach(([id, member]) => {
      const el = document.getElementById(id);
      if (!el || !member) return;

      let html = `<div class="chart-archetype">${member.archetype}</div>`;

      if (member.sidereal) {
        html += '<div class="planet-positions">';
        const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu'];
        planets.forEach(p => {
          if (member.sidereal[p]) {
            const pos = member.sidereal[p];
            html += `<div class="planet-row">
              <span class="planet-name">${p}</span>
              <span class="planet-pos">${pos.sign} ${pos.degree.toFixed(1)}°</span>
              <span class="planet-nak">${pos.nakshatra}</span>
            </div>`;
          }
        });
        html += '</div>';
      }

      if (member.strengths) {
        html += '<div class="strengths"><strong>Strengths:</strong> ' + member.strengths.join(', ') + '</div>';
      }

      if (member.challenges) {
        html += '<div class="challenges"><strong>Challenges:</strong> ' + member.challenges.join(', ') + '</div>';
      }

      if (member.note) {
        html += `<div class="chart-note">${member.note}</div>`;
      }

      el.innerHTML = html;
    });
  }

  function renderSynastry() {
    const el = document.getElementById('synastryGrid');
    if (!el || !familyData) return;

    const bonds = familyData.synastry_bonds;
    let html = '';

    const parentChild = bonds.filter(b => b.type === 'parent-child');
    const sibling = bonds.filter(b => b.type === 'sibling');
    const parentParent = bonds.filter(b => b.type === 'parent-parent');

    if (parentChild.length) {
      html += '<div class="synastry-section"><h4>Parent → Child Bonds</h4>';
      parentChild.forEach(b => {
        html += `<div class="synastry-bond">
          <span class="bond-from">${b.from}</span>
          <span class="bond-arrow">→</span>
          <span class="bond-to">${b.to}</span>
          <span class="bond-nak">${b.nakshatra}</span>
          <span class="bond-desc">${b.description}</span>
        </div>`;
      });
      html += '</div>';
    }

    if (sibling.length) {
      html += '<div class="synastry-section"><h4>Sibling Bonds</h4>';
      sibling.forEach(b => {
        html += `<div class="synastry-bond">
          <span class="bond-from">${b.from}</span>
          <span class="bond-arrow">↔</span>
          <span class="bond-to">${b.to}</span>
          <span class="bond-nak">${b.nakshatra}</span>
          <span class="bond-desc">${b.description}</span>
        </div>`;
      });
      html += '</div>';
    }

    if (parentParent.length) {
      html += '<div class="synastry-section"><h4>Parent Bonds</h4>';
      parentParent.forEach(b => {
        html += `<div class="synastry-bond">
          <span class="bond-from">${b.from}</span>
          <span class="bond-arrow">↔</span>
          <span class="bond-to">${b.to}</span>
          <span class="bond-nak">${b.nakshatra}</span>
          <span class="bond-desc">${b.description}</span>
        </div>`;
      });
      html += '</div>';
    }

    el.innerHTML = html;
  }

  function renderNakshatraPatterns() {
    const el = document.getElementById('nakshatraPatterns');
    if (!el || !familyData) return;

    const patterns = familyData.shared_nakshatras;
    let html = '<div class="patterns-grid">';

    patterns.forEach(p => {
      html += `<div class="pattern-card">
        <div class="pattern-name">${p.nakshatra}</div>
        <div class="pattern-members">${p.members.join(', ')}</div>
        <div class="pattern-significance">${p.significance}</div>
      </div>`;
    });

    html += '</div>';
    el.innerHTML = html;
  }

  function renderMissingData() {
    const el = document.getElementById('missingDataList');
    if (!el || !familyData) return;

    const missing = [
      { name: 'Ikram', data: 'Exact birth date, time, location' },
      { name: 'Ghofran', data: 'Exact birth date, time, location' },
      { name: 'Sara', data: 'Exact birth date, time, location' },
      { name: 'Father', data: 'Month and day of birth' },
      { name: 'Zohra', data: 'Exact birth time' }
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
