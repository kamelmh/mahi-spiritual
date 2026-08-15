/**
 * AstroConnector — bridges AstroDashboard with LifeWorkspace astrological data
 * Fetches chart data, enriches dashboard with nakshatras, dashas, yogas, divisional charts
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'astro-connector-data';

  const NAKSHATRAS = [
    { name: 'Ashwini', symbol: 'Horse Head', deity: 'Ashwini Kumaras', power: 'Healing & Speed', element: 'Earth', start: 0, end: 13.333, ruler: 'Ketu', nature: 'Deva' },
    { name: 'Bharani', symbol: 'Yoni', deity: 'Yama', power: 'Transformation', element: 'Earth', start: 13.333, end: 26.666, ruler: 'Venus', nature: 'Manushya' },
    { name: 'Krittika', symbol: 'Razor / Flame', deity: 'Agni', power: 'Purification', element: 'Fire', start: 26.666, end: 40, ruler: 'Sun', nature: 'Rakshasa' },
    { name: 'Rohini', symbol: 'Ox Cart', deity: 'Brahma', power: 'Creation & Fertility', element: 'Earth', start: 40, end: 53.333, ruler: 'Moon', nature: 'Manushya' },
    { name: 'Mrigashirsha', symbol: 'Deer Head', deity: 'Soma', power: 'Searching & Seeking', element: 'Earth', start: 53.333, end: 66.666, ruler: 'Mars', nature: 'Deva' },
    { name: 'Ardra', symbol: 'Teardrop / Diamond', deity: 'Rudra', power: 'Destruction & Rebirth', element: 'Water', start: 66.666, end: 80, ruler: 'Rahu', nature: 'Manushya' },
    { name: 'Punarvasu', symbol: 'Bow & Quiver', deity: 'Aditi', power: 'Renewal & Return', element: 'Water', start: 80, end: 93.333, ruler: 'Jupiter', nature: 'Deva' },
    { name: 'Pushya', symbol: 'Lotus / Udder', deity: 'Brihaspati', power: 'Nourishment', element: 'Water', start: 93.333, end: 106.666, ruler: 'Saturn', nature: 'Deva' },
    { name: 'Ashlesha', symbol: 'Serpent', deity: 'Naga', power: 'Mysticism & Kundalini', element: 'Water', start: 106.666, end: 120, ruler: 'Mercury', nature: 'Rakshasa' },
    { name: 'Magha', symbol: 'Throne', deity: 'Pitrs (Ancestors)', power: 'Authority & Heritage', element: 'Fire', start: 120, end: 133.333, ruler: 'Ketu', nature: 'Rakshasa' },
    { name: 'Purva Phalguni', symbol: 'Hammock / Front legs of bed', deity: 'Bhaga', power: 'Pleasure & procreation', element: 'Fire', start: 133.333, end: 146.666, ruler: 'Venus', nature: 'Manushya' },
    { name: 'Uttara Phalguni', symbol: 'Back legs of bed', deity: 'Aryaman', power: 'Patronage & contracts', element: 'Fire', start: 146.666, end: 160, ruler: 'Sun', nature: 'Manushya' },
    { name: 'Hasta', symbol: 'Hand / Fist', deity: 'Savitar', power: 'Craftsmanship & Skill', element: 'Fire', start: 160, end: 173.333, ruler: 'Moon', nature: 'Deva' },
    { name: 'Chitra', symbol: 'Pearl / Jewel', deity: 'Vishvakarma', power: 'Artistry & Brilliance', element: 'Fire', start: 173.333, end: 186.666, ruler: 'Mars', nature: 'Rakshasa' },
    { name: 'Swati', symbol: 'Coral / Young plant', deity: 'Vayu', power: 'Independence & Freedom', element: 'Air', start: 186.666, end: 200, ruler: 'Rahu', nature: 'Deva' },
    { name: 'Vishakha', symbol: 'Archway / Gateway', deity: 'Indra-Agni', power: 'Goal achievement', element: 'Air', start: 200, end: 213.333, ruler: 'Jupiter', nature: 'Rakshasa' },
    { name: 'Anuradha', symbol: 'Lotus / Triumphant arch', deity: 'Mitra', power: 'Friendship & Devotion', element: 'Air', start: 213.333, end: 226.666, ruler: 'Saturn', nature: 'Deva' },
    { name: 'Jyeshtha', symbol: 'Umbrella / Earring', deity: 'Indra', power: 'Seniority & Power', element: 'Air', start: 226.666, end: 240, ruler: 'Mercury', nature: 'Rakshasa' },
    { name: 'Mula', symbol: 'Bunch of roots', deity: 'Nirriti', power: 'Investigation & Research', element: 'Ether', start: 240, end: 253.333, ruler: 'Ketu', nature: 'Rakshasa' },
    { name: 'Purva Ashadha', symbol: 'Fan / Tusk', deity: 'Apas', power: 'Invincibility', element: 'Ether', start: 253.333, end: 266.666, ruler: 'Venus', nature: 'Manushya' },
    { name: 'Uttara Ashadha', symbol: 'Elephant tusk / Slippers', deity: 'Vishvadevas', power: 'Final victory', element: 'Ether', start: 266.666, end: 280, ruler: 'Sun', nature: 'Manushya' },
    { name: 'Shravana', symbol: 'Ear / Three footprints', deity: 'Vishnu', power: 'Listening & Learning', element: 'Ether', start: 280, end: 293.333, ruler: 'Moon', nature: 'Deva' },
    { name: 'Dhanishta', symbol: 'Drum / Flute', deity: 'Vasus', power: 'Wealth & Music', element: 'Ether', start: 293.333, end: 306.666, ruler: 'Mars', nature: 'Rakshasa' },
    { name: 'Shatabhisha', symbol: 'Circle / Empty circle', deity: 'Varuna', power: 'Healing & Mysticism', element: 'Water', start: 306.666, end: 320, ruler: 'Rahu', nature: 'Rakshasa' },
    { name: 'Purva Bhadrapada', symbol: 'Sword / Two-faced man', deity: 'Aja Ekapada', power: 'Purification by fire', element: 'Fire', start: 320, end: 333.333, ruler: 'Jupiter', nature: 'Manushya' },
    { name: 'Uttara Bhadrapada', symbol: 'Twin swords /棺材', deity: 'Ahir Budhnya', power: 'Spiritual depth', element: 'Air', start: 333.333, end: 346.666, ruler: 'Saturn', nature: 'Manushya' },
    { name: 'Revati', symbol: 'Fish / Drum', deity: 'Pushan', power: 'Journey & Protection', element: 'Water', start: 346.666, end: 360, ruler: 'Mercury', nature: 'Deva' }
  ];

  const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  const YOGA_PATTERNS = [
    { name: 'Gaja Kesari Yoga', condition: (p) => p.Jupiter && p.Moon && Math.abs(p.Jupiter - p.Moon) <= 3, description: 'Wealth, wisdom, and lasting reputation. Jupiter in kendra from Moon.' },
    { name: 'Chandrama Mangala Yoga', condition: (p) => p.Moon !== undefined && p.Mars !== undefined, description: 'Mars-Moon conjunction or aspect creates emotional courage and decisiveness.' },
    { name: 'Budha Aditya Yoga', condition: (p) => p.Mercury !== undefined && p.Sun !== undefined && Math.abs(p.Mercury - p.Sun) <= 3, description: 'Intelligence and analytical ability. Sun-Mercury conjunction.' },
    { name: 'Lakshmi Yoga', condition: (p) => p.Venus !== undefined && p.Mercury !== undefined && p.Venus < p.Mercury, description: 'Wealth and luxury. Venus in kendras or trikonas with Mercury.' },
    { name: 'Shri Yoga', condition: (p) => p.Venus !== undefined && p.Jupiter !== undefined, description: 'Prosperity and fortunate circumstances. Venus-Jupiter connection.' },
    { name: 'Rahu Ketu Yoga', condition: (p) => p.Rahu !== undefined && p.Ketu !== undefined, description: 'Karmic lessons and spiritual growth through Rahu-Ketu axis.' },
    { name: 'Neecha Bhanga Raja Yoga', condition: (p) => p.Venus !== undefined && p.Mercury !== undefined, description: 'Cancellation of debilitation, leading to unexpected success.' },
    { name: 'Dharma Karmadhipati Yoga', condition: (p) => p.Jupiter !== undefined && p.Saturn !== undefined && Math.abs(p.Jupiter - p.Saturn) <= 5, description: 'Combines dharma and karma houses for purposeful action.' }
  ];

  const VIMSHOTTARI_DASHA_YEARS = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
    Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
  };

  const DASHA_SEQUENCE = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

  let state = {
    chartData: null,
    connected: false,
    lastFetch: null,
    nakshatraLookup: {}
  };

  // Build lookup map
  NAKSHATRAS.forEach((n, i) => {
    state.nakshatraLookup[n.name.toLowerCase()] = { ...n, index: i };
  });

  /**
   * Determine nakshatra from moon longitude
   */
  function getNakshatraFromLongitude(moonLong) {
    const deg = ((moonLong % 360) + 360) % 360;
    for (let i = 0; i < NAKSHATRAS.length; i++) {
      if (deg >= NAKSHATRAS[i].start && deg < NAKSHATRAS[i].end) {
        const padaDeg = (deg - NAKSHATRAS[i].start) / 3.333;
        const pada = Math.floor(padaDeg) + 1;
        return { ...NAKSHATRAS[i], index: i, pada, position: deg };
      }
    }
    return { ...NAKSHATRAS[0], index: 0, pada: 1, position: deg };
  }

  /**
   * Calculate Vimshottari Dasha periods from birth date and moon longitude
   */
  function calculateDashaPeriods(birthDate, moonLongitude) {
    if (!birthDate) return [];

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return [];

    // Approximate moon nakshatra at birth for dasha start
    const nakshatra = getNakshatraFromLongitude(moonLongitude || 0);
    const startPlanet = NAKSHATRAS[nakshatra.index].ruler;

    // Find starting index in Dasha sequence
    let currentIndex = DASHA_SEQUENCE.indexOf(startPlanet);
    if (currentIndex === -1) currentIndex = 0;

    // Calculate remaining portion of starting dasha
    const elapsed = (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const totalCycle = 120; // Total Vimshottari cycle in years
    let currentStart = new Date(birth);

    const dashas = [];
    let yearsUsed = 0;

    for (let cycle = 0; cycle < 3 && yearsUsed < elapsed + 40; cycle++) {
      for (let i = 0; i < DASHA_SEQUENCE.length && yearsUsed < elapsed + 40; i++) {
        const planet = DASHA_SEQUENCE[(currentIndex + i) % DASHA_SEQUENCE.length];
        const duration = VIMSHOTTARI_DASHA_YEARS[planet];

        const dashaStart = new Date(currentStart);
        const dashaEnd = new Date(currentStart);
        dashaEnd.setFullYear(dashaEnd.getFullYear() + duration);

        // Calculate antardashas within this mahadasha
        const antardashas = calculateAntardashas(planet, dashaStart, duration);

        dashas.push({
          planet,
          startDate: dashaStart.toISOString().split('T')[0],
          endDate: dashaEnd.toISOString().split('T')[0],
          duration,
          antardashas,
          isActive: elapsed >= yearsUsed && elapsed < yearsUsed + duration
        });

        currentStart = dashaEnd;
        yearsUsed += duration;
      }
    }

    return dashas;
  }

  /**
   * Calculate antardasha subdivisions within a mahadasha
   */
  function calculateAntardashas(mahaPlanet, startDate, mahaDuration) {
    const mahaYears = VIMSHOTTARI_DASHA_YEARS[mahaPlanet];
    const startIdx = DASHA_SEQUENCE.indexOf(mahaPlanet);
    const antardashas = [];
    let current = new Date(startDate);

    for (let i = 0; i < DASHA_SEQUENCE.length; i++) {
      const subPlanet = DASHA_SEQUENCE[(startIdx + i) % DASHA_SEQUENCE.length];
      const subDuration = (mahaYears * VIMSHOTTARI_DASHA_YEARS[subPlanet]) / 120;
      const subEnd = new Date(current);
      subEnd.setDate(subEnd.getDate() + Math.round(subDuration * 365.25));

      antardashas.push({
        planet: subPlanet,
        startDate: current.toISOString().split('T')[0],
        endDate: subEnd.toISOString().split('T')[0],
        durationYears: parseFloat(subDuration.toFixed(2))
      });

      current = subEnd;
    }

    return antardashas;
  }

  /**
   * Detect yogas from planet positions
   */
  function detectYogas(planetPositions) {
    if (!planetPositions || typeof planetPositions !== 'object') return [];

    const detected = [];
    for (const yoga of YOGA_PATTERNS) {
      try {
        if (yoga.condition(planetPositions)) {
          detected.push({ ...yoga });
        }
      } catch (e) {
        // Skip pattern on error
      }
    }

    return detected;
  }

  /**
   * Extract divisional chart data (D-9, D-10)
   */
  function extractDivisionalCharts(chartData) {
    const result = { D9: null, D10: null };

    if (!chartData) return result;

    // Try to extract from various chart data formats
    const charts = chartData.divisionalCharts || chartData.divisional_charts || chartData.charts || {};

    if (charts.D9 || charts.navamsha || charts['9']) {
      result.D9 = charts.D9 || charts.navamsha || charts['9'];
    }
    if (charts.D10 || charts.dashamsha || charts['10']) {
      result.D10 = charts.D10 || charts.dashamsha || charts['10'];
    }

    // If raw chart data has divisional info embedded
    if (!result.D9 && chartData.planets) {
      result.D9 = { note: 'Divisional chart D-9 not found in source data', planets: chartData.planets };
    }

    return result;
  }

  /**
   * Fetch chart data with graceful fallback
   */
  async function fetchChartData() {
    const paths = [
      '/api/astrology/chart?name=Kamel',
      '../My Drive/LifeWorkspace/12_Astrology/chart.json',
      '../My Drive/LifeWorkspace/12_Astrology/natal_chart.json',
      './data/chart.json',
      './data/natal_chart.json'
    ];

    for (const path of paths) {
      try {
        const response = await fetch(path, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          const data = await response.json();
          return { source: path, data, success: true };
        }
      } catch (e) {
        // Continue to next path
      }
    }

    // Fallback: try to load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { source: 'localStorage-cache', data: parsed.chartData || parsed, success: false, cached: true };
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    return { source: 'none', data: null, success: false, cached: false };
  }

  /**
   * Enrich and parse chart data into a normalized format
   */
  function enrichChartData(rawData) {
    if (!rawData) return null;

    const enriched = {
      planets: {},
      moonLongitude: 0,
      ascendant: 0,
      birthDate: null,
      birthPlace: null,
      nakshatra: null,
      divisionalCharts: null,
      yogas: [],
      raw: rawData
    };

    // Extract planet positions
    const planetData = rawData.planets || rawData.planet_positions || rawData.positions || {};
    PLANETS.forEach(planet => {
      if (planetData[planet] !== undefined) {
        const pos = typeof planetData[planet] === 'object'
          ? (planetData[planet].longitude || planetData[planet].long || planetData[planet].degree || 0)
          : planetData[planet];
        enriched.planets[planet] = pos;
      }
    });

    // Moon longitude for nakshatra
    enriched.moonLongitude = enriched.planets.Moon || 0;
    enriched.ascendant = enriched.planets.Ascendant || rawData.ascendant || rawData.lagna || 0;
    enriched.birthDate = rawData.birthDate || rawData.birth_date || rawData.dob || null;
    enriched.birthPlace = rawData.birthPlace || rawData.birth_place || rawData.location || null;

    // Nakshatra
    enriched.nakshatra = getNakshatraFromLongitude(enriched.moonLongitude);

    // Divisional charts
    enriched.divisionalCharts = extractDivisionalCharts(rawData);

    // Yogas
    enriched.yogas = detectYogas(enriched.planets);

    // Dasha periods
    enriched.dashas = calculateDashaPeriods(enriched.birthDate, enriched.moonLongitude);

    return enriched;
  }

  /**
   * Store data to localStorage
   */
  function storeData(data) {
    try {
      const payload = {
        chartData: data,
        connected: state.connected,
        lastFetch: new Date().toISOString(),
        version: '1.0.0'
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('AstroConnector: Could not store to localStorage', e.message);
    }
  }

  /**
   * Get Nakshatra info panel HTML
   */
  function getNakshatraInfo(nakshatraName) {
    let nakshatra;

    if (nakshatraName) {
      const key = nakshatraName.toLowerCase().replace(/\s+/g, '');
      nakshatra = NAKSHATRAS.find(n => n.name.toLowerCase().replace(/\s+/g, '') === key);
    }

    if (!nakshatra && state.chartData && state.chartData.nakshatra) {
      nakshatra = state.chartData.nakshatra;
    }

    if (!nakshatra) {
      return {
        found: false,
        name: 'Unknown',
        html: '<div class="nakshatra-panel"><p>No nakshatra data available.</p></div>'
      };
    }

    const favorableActivities = getFavorableActivities(nakshatra.name);
    const avoidActivities = getAvoidActivities(nakshatra.name);

    const html = `
      <div class="nakshatra-panel" data-nakshatra="${nakshatra.name}">
        <div class="nakshatra-header">
          <h3>${nakshatra.name} <span class="pada">Pada ${(state.chartData && state.chartData.nakshatra && state.chartData.nakshatra.pada) || '?'}</span></h3>
          <span class="symbol">${nakshatra.symbol}</span>
        </div>
        <div class="nakshatra-details">
          <div class="detail-row"><span class="label">Deity:</span> <span class="value">${nakshatra.deity}</span></div>
          <div class="detail-row"><span class="label">Ruling Planet:</span> <span class="value">${nakshatra.ruler}</span></div>
          <div class="detail-row"><span class="label">Element:</span> <span class="value">${nakshatra.element}</span></div>
          <div class="detail-row"><span class="label">Nature:</span> <span class="value">${nakshatra.nature}</span></div>
          <div class="detail-row"><span class="label">Power:</span> <span class="value">${nakshatra.power}</span></div>
        </div>
        <div class="nakshatra-activities">
          <div class="favorable">
            <h4>Favorable Activities</h4>
            <ul>${favorableActivities.map(a => `<li>${a}</li>`).join('')}</ul>
          </div>
          <div class="avoid">
            <h4>Activities to Avoid</h4>
            <ul>${avoidActivities.map(a => `<li>${a}</li>`).join('')}</ul>
          </div>
        </div>
      </div>
    `;

    return { found: true, name: nakshatra.name, data: nakshatra, html };
  }

  function getFavorableActivities(nakshatraName) {
    const activities = {
      'Ashwini': ['Healing', 'Medical treatment', 'Starting new ventures', 'Travel', 'Exercise'],
      'Bharani': ['Creative projects', 'Transformation work', 'Endings & new beginnings', 'Charity'],
      'Krittika': ['Cutting', 'Surgery', 'Purification rituals', 'Spiritual practice', 'Decision making'],
      'Rohini': ['Planting', 'Blessings', 'Marriage', 'Buying property', 'Artistic endeavors'],
      'Mrigashirsha': ['Searching', 'Learning', 'Pilgrimage', 'Romance', 'Exploration'],
      'Ardra': ['Intense work', 'Breaking obstacles', 'Research', 'Overcoming challenges'],
      'Punarvasu': ['Renewal', 'Starting over', 'Teaching', 'Spiritual practices', 'Generosity'],
      'Pushya': ['Spiritual learning', 'Blessings', 'Starting education', 'Ayurveda', 'Charity'],
      'Ashlesha': ['Mystical practices', 'Yoga', 'Tantra', 'Healing', 'Secret knowledge'],
      'Magha': ['Royal ceremonies', 'Ancestral worship', 'Authority', 'Inaugurations'],
      'Purva Phalguni': ['Marriage', 'Romance', 'Comfort', 'Recreation', 'Musical arts'],
      'Uttara Phalguni': ['Contracts', 'Friendship', 'Patronage', 'Legal matters', 'Business'],
      'Hasta': ['Craftsmanship', 'Manual work', 'Art', 'Creating objects', 'Skill-based tasks'],
      'Chitra': ['Design', 'Architecture', 'Jewelry making', 'Interior decoration', 'Art'],
      'Swati': ['Independent work', 'Trade', 'Diplomacy', 'Flexibility', 'Communication'],
      'Vishakha': ['Goal setting', 'Long-term projects', 'Pujas', 'Determining aims'],
      'Anuradha': ['Friendship', 'Devotion', 'Community work', 'Cooperation', 'Spiritual study'],
      'Jyeshtha': ['Leadership', 'Power tasks', 'Protection', 'Strategy', 'Seniority roles'],
      'Mula': ['Research', 'Investigation', 'Meditation', 'Breaking down barriers'],
      'Purva Ashadha': ['Victory', 'Conquest', 'Public speaking', 'Water rituals', 'Courage'],
      'Uttara Ashadha': ['Final victories', 'Long-term goals', 'Patience', 'Perseverance'],
      'Shravana': ['Listening', 'Learning', 'Study', 'Teaching', 'Audiology', 'Music'],
      'Dhanishta': ['Music', 'Wealth acquisition', 'Dancing', 'Celebration', 'Parties'],
      'Shatabhisha': ['Healing', 'Alternative medicine', 'Mysticism', 'Scientific work'],
      'Purva Bhadrapada': ['Spiritual purification', 'Fasting', 'Austerity', 'Fire rituals'],
      'Uttara Bhadrapada': ['Deep meditation', 'Spiritual depth', 'Charity', 'Quiet study'],
      'Revati': ['Travel', 'Journeys', 'Protection', 'Nourishment', 'Safe passages']
    };
    return activities[nakshatraName] || ['General positive activities', 'Spiritual practice'];
  }

  function getAvoidActivities(nakshatraName) {
    const activities = {
      'Ashwini': ['Surgery on head', 'Long commitments'],
      'Bharani': ['Excessive indulgence', 'Impatience'],
      'Krittika': ['Rash decisions', 'Aggression'],
      'Rohini': ['Stubbornness', 'Overindulgence'],
      'Mrigashirsha': ['Indecision', 'Restlessness'],
      'Ardra': ['Extreme actions', 'Uncontrolled anger'],
      'Punarvasu': ['Laziness', 'Complacency'],
      'Pushya': ['Over-caution', 'Missed opportunities'],
      'Ashlesha': ['Manipulation', 'Deceit'],
      'Magha': ['Arrogance', 'Abuse of power'],
      'Purva Phalguni': ['Laziness', 'Excessive comfort seeking'],
      'Uttara Phalguni': ['Over-trust', 'Being naive'],
      'Hasta': ['Deception', 'Manipulation with skill'],
      'Chitra': ['Vanity', 'Superficiality'],
      'Swati': ['Instability', 'Lack of commitment'],
      'Vishakha': ['Obsession with goals', 'Impatience'],
      'Anuradha': ['Over-dependence on others', 'Compromise of self'],
      'Jyeshtha': ['Abuse of power', 'Jealousy'],
      'Mula': ['Destructive behavior', 'Extreme measures'],
      'Purva Ashadha': ['Overconfidence', 'Arrogance'],
      'Uttara Ashadha': ['Over-patience', 'Missed timing'],
      'Shravana': ['Gossip', 'Listening to negative influences'],
      'Dhanishta': ['Over-spending', 'Extravagance'],
      'Shatabhisha': ['Isolation', 'Secretiveness'],
      'Purva Bhadrapada': ['Extremism', 'Fanaticism'],
      'Uttara Bhadrapada': ['Withdrawal', 'Apathy'],
      'Revati': ['Unsafe travel', 'Rushing journeys']
    };
    return activities[nakshatraName] || ['General negative patterns', 'Avoid impulsive actions'];
  }

  /**
   * Get current dasha period
   */
  function getDashaPeriod() {
    if (!state.chartData || !state.chartData.dashas || !state.chartData.dashas.length) {
      return {
        found: false,
        current: null,
        upcoming: [],
        html: '<div class="dasha-panel"><p>No dasha data available. Load chart data first.</p></div>'
      };
    }

    const dashas = state.chartData.dashas;
    const current = dashas.find(d => d.isActive) || dashas[0];
    const upcoming = dashas.filter(d => !d.isActive).slice(0, 3);

    // Find current antardasha
    let currentAntardasha = null;
    if (current && current.antardashas) {
      const now = new Date();
      currentAntardasha = current.antardashas.find(a => {
        const start = new Date(a.startDate);
        const end = new Date(a.endDate);
        return now >= start && now < end;
      }) || current.antardashas[0];
    }

    const html = `
      <div class="dasha-panel">
        <div class="dasha-current">
          <h3>Current Mahadasha</h3>
          <div class="dasha-item active">
            <span class="planet">${current.planet}</span>
            <span class="period">${current.startDate} — ${current.endDate}</span>
            <span class="duration">${current.duration} years</span>
          </div>
          ${currentAntardasha ? `
            <div class="dasha-antardasha">
              <h4>Current Antardasha</h4>
              <span class="planet">${currentAntardasha.planet}</span>
              <span class="period">${currentAntardasha.startDate} — ${currentAntardasha.endDate}</span>
            </div>
          ` : ''}
        </div>
        <div class="dasha-upcoming">
          <h3>Upcoming Mahadashas</h3>
          ${upcoming.map(d => `
            <div class="dasha-item">
              <span class="planet">${d.planet}</span>
              <span class="period">${d.startDate} — ${d.endDate}</span>
              <span class="duration">${d.duration} years</span>
            </div>
          `).join('')}
        </div>
        <div class="dasha-timeline">
          <h3>Full Timeline</h3>
          <div class="timeline-bar">
            ${dashas.slice(0, 9).map(d => {
              const pct = (d.duration / 120 * 100).toFixed(1);
              return `<div class="timeline-segment ${d.isActive ? 'active' : ''}" style="width:${pct}%" title="${d.planet}: ${d.startDate} — ${d.endDate} (${d.duration}y)">
                <span class="segment-label">${d.planet}</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    return {
      found: true,
      current,
      currentAntardasha,
      upcoming,
      allDashas: dashas,
      html
    };
  }

  /**
   * Get detected yogas
   */
  function getYogas() {
    if (!state.chartData || !state.chartData.yogas || !state.chartData.yogas.length) {
      return {
        found: false,
        yogas: [],
        html: '<div class="yoga-panel"><p>No yogas detected. Ensure planet positions are available.</p></div>'
      };
    }

    const yogas = state.chartData.yogas;

    const html = `
      <div class="yoga-panel">
        <h3>Detected Yogas (${yogas.length})</h3>
        <div class="yoga-list">
          ${yogas.map(y => `
            <div class="yoga-item">
              <div class="yoga-name">${y.name}</div>
              <div class="yoga-description">${y.description}</div>
            </div>
          `).join('')}
        </div>
        ${yogas.length === 0 ? '<p class="yoga-empty">No specific yogas detected from available planet positions.</p>' : ''}
      </div>
    `;

    return { found: yogas.length > 0, yogas, html };
  }

  /**
   * Render all panels into the dashboard if containers exist
   */
  function renderPanels() {
    // Nakshatra panel
    const nakContainer = document.getElementById('nakshatra-panel') || document.getElementById('nakshatra-info');
    if (nakContainer) {
      const info = getNakshatraInfo();
      nakContainer.innerHTML = info.html;
    }

    // Dasha panel
    const dashaContainer = document.getElementById('dasha-panel') || document.getElementById('dasha-timeline');
    if (dashaContainer) {
      const info = getDashaPeriod();
      dashaContainer.innerHTML = info.html;
    }

    // Yoga panel
    const yogaContainer = document.getElementById('yoga-panel') || document.getElementById('yoga-info');
    if (yogaContainer) {
      const info = getYogas();
      yogaContainer.innerHTML = info.html;
    }

    // Divisional charts
    const d9Container = document.getElementById('d9-chart') || document.getElementById('navamsha-chart');
    if (d9Container && state.chartData && state.chartData.divisionalCharts && state.chartData.divisionalCharts.D9) {
      d9Container.innerHTML = `<div class="divisional-chart d9"><h4>Navamsha (D-9)</h4><pre>${JSON.stringify(state.chartData.divisionalCharts.D9, null, 2)}</pre></div>`;
    }

    const d10Container = document.getElementById('d10-chart') || document.getElementById('dashamsha-chart');
    if (d10Container && state.chartData && state.chartData.divisionalCharts && state.chartData.divisionalCharts.D10) {
      d10Container.innerHTML = `<div class="divisional-chart d10"><h4>Dashamsha (D-10)</h4><pre>${JSON.stringify(state.chartData.divisionalCharts.D10, null, 2)}</pre></div>`;
    }

    // Status indicator
    const statusEl = document.getElementById('astro-connector-status');
    if (statusEl) {
      statusEl.textContent = state.connected ? 'Connected to LifeWorkspace' : 'Using cached/local data';
      statusEl.className = state.connected ? 'status-connected' : 'status-cached';
    }
  }

  /**
   * Initialize the connector
   */
  async function init() {
    const result = await fetchChartData();

    if (result.data) {
      state.chartData = enrichChartData(result.data);
      state.connected = result.success;
      state.lastFetch = new Date().toISOString();
      storeData(state.chartData);
    } else {
      // Create minimal state with default nakshatra
      state.chartData = {
        planets: {},
        moonLongitude: 0,
        ascendant: 0,
        birthDate: null,
        birthPlace: null,
        nakshatra: getNakshatraFromLongitude(0),
        divisionalCharts: { D9: null, D10: null },
        yogas: [],
        dashas: []
      };
      state.connected = false;
    }

    renderPanels();

    return {
      connected: state.connected,
      lastFetch: state.lastFetch,
      nakshatra: state.chartData.nakshatra ? state.chartData.nakshatra.name : 'Unknown',
      hasDashas: state.chartData.dashas && state.chartData.dashas.length > 0,
      yogaCount: state.chartData.yogas ? state.chartData.yogas.length : 0
    };
  }

  // Expose public API
  window.AstroConnector = {
    init,
    getNakshatraInfo,
    getDashaPeriod,
    getYogas,
    NAKSHATRAS,
    state
  };

  // Auto-init if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }

})();
