/* MAHI Spiritual System - Transit-to-Natal Aspect Engine */

const TransitEngine = {
    aspects: {
        conjunction: { name: 'Conjunction', angle: 0, orb: 8, symbol: '☌', effect: 'Fusion, intensification' },
        sextile: { name: 'Sextile', angle: 60, orb: 6, symbol: '✦', effect: 'Opportunity, harmony' },
        square: { name: 'Square', angle: 90, orb: 7, symbol: '□', effect: 'Tension, growth' },
        trine: { name: 'Trine', angle: 120, orb: 8, symbol: '△', effect: 'Flow, ease' },
        opposition: { name: 'Opposition', angle: 180, orb: 8, symbol: '☍', effect: 'Polarity, awareness' }
    },

    signToDegree(sign, degree) {
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                       'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const idx = signs.indexOf(sign);
        if (idx === -1) return 0;
        return idx * 30 + degree;
    },

    degreeToSign(totalDeg) {
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                       'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const norm = ((totalDeg % 360) + 360) % 360;
        const idx = Math.floor(norm / 30);
        const deg = norm - idx * 30;
        return { sign: signs[idx], degree: deg };
    },

    calcAngle(a, b) {
        let diff = Math.abs(a - b);
        if (diff > 180) diff = 360 - diff;
        return diff;
    },

    findAspects(natalPlanets, transitPlanets) {
        const results = [];
        const aspectsList = Object.values(this.aspects);

        for (const tp of transitPlanets) {
            const tDeg = this.signToDegree(tp.sign, tp.degree);
            for (const np of natalPlanets) {
                const nDeg = this.signToDegree(np.sign, np.degree);
                const angle = this.calcAngle(tDeg, nDeg);

                for (const asp of aspectsList) {
                    if (Math.abs(angle - asp.angle) <= asp.orb) {
                        const orb = Math.abs(angle - asp.angle).toFixed(1);
                        const nPos = this.degreeToSign(nDeg);
                        const tPos = this.degreeToSign(tDeg);
                        results.push({
                            transit: { name: tp.name, symbol: tp.symbol || tp.name[0], ...tPos },
                            natal: { name: np.name, symbol: np.symbol || np.name[0], ...nPos },
                            aspect: asp,
                            orb: parseFloat(orb),
                            intensity: Math.round((1 - parseFloat(orb) / asp.orb) * 100)
                        });
                    }
                }
            }
        }

        results.sort((a, b) => a.orb - b.orb);
        return results;
    },

    getTransitsNow() {
        const now = new Date();
        const moonPos = MoonEngine ? MoonEngine.getMoonEclipticLong(now) : 0;
        const moonSign = this.degreeToSign(moonPos);
        const sunPos = this.degreeToSign(212 + (now.getDate() * 0.96));

        return {
            sun: { name: 'Sun', symbol: '☉', sign: sunPos.sign, degree: sunPos.degree },
            moon: { name: 'Moon', symbol: '☽', sign: moonSign.sign, degree: moonSign.degree },
            mercury: { name: 'Mercury', symbol: '☿', sign: 'Cancer', degree: 18 },
            venus: { name: 'Venus', symbol: '♀', sign: 'Virgo', degree: 9 },
            mars: { name: 'Mars', symbol: '♂', sign: 'Gemini', degree: 10 },
            jupiter: { name: 'Jupiter', symbol: '♃', sign: 'Cancer', degree: 8 },
            saturn: { name: 'Saturn', symbol: '♄', sign: 'Pisces', degree: 20 },
            rahu: { name: 'Rahu', symbol: '☊', sign: 'Virgo', degree: 25 },
            ketu: { name: 'Ketu', symbol: '☋', sign: 'Pisces', degree: 25 }
        };
    },

    getNatalPlanets(chartData) {
        if (!chartData || !chartData.planets) return [];
        return chartData.planets.map(p => ({
            name: p.name,
            symbol: p.symbol,
            sign: p.sign,
            degree: p.degree,
            house: p.house,
            nakshatra: p.nakshatra
        }));
    },

    computeFullTransitReport(chartData) {
        const transitNow = this.getTransitsNow();
        const natal = this.getNatalPlanets(chartData);
        const aspects = this.findAspects(natal, Object.values(transitNow));

        const active = aspects.filter(a => a.orb <= 3);
        const building = aspects.filter(a => a.orb > 3 && a.orb <= 5);
        const wide = aspects.filter(a => a.orb > 5);

        const byPlanet = {};
        for (const asp of aspects) {
            const key = asp.transit.name;
            if (!byPlanet[key]) byPlanet[key] = [];
            byPlanet[key].push(asp);
        }

        return {
            date: new Date(),
            transitNow,
            natalPlanets: natal,
            allAspects: aspects,
            active,
            building,
            wide,
            byPlanet,
            summary: this.generateSummary(aspects)
        };
    },

    generateSummary(aspects) {
        const lines = [];
        const conjunctions = aspects.filter(a => a.aspect.name === 'Conjunction');
        const squares = aspects.filter(a => a.aspect.name === 'Square');
        const trines = aspects.filter(a => a.aspect.name === 'Trine');

        if (conjunctions.length > 0) {
            const top = conjunctions[0];
            lines.push(`Transit ${top.transit.name} conjunct natal ${top.natal.name} (${top.orb}° orb) — ${top.aspect.effect}`);
        }
        if (squares.length > 0) {
            const top = squares[0];
            lines.push(`Transit ${top.transit.name} square natal ${top.natal.name} (${top.orb}° orb) — ${top.aspect.effect}`);
        }
        if (trines.length > 0) {
            const top = trines[0];
            lines.push(`Transit ${top.transit.name} trine natal ${top.natal.name} (${top.orb}° orb) — ${top.aspect.effect}`);
        }

        if (lines.length === 0) {
            lines.push('No tight aspects currently active. Rest period.');
        }

        return lines;
    },

    renderTransitCard(containerId, chartData) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const report = this.computeFullTransitReport(chartData);
        let html = '<div class="transit-aspect-list">';

        if (report.active.length > 0) {
            html += '<h4 class="transit-section-title active-title">⚡ Active Aspects (within 3°)</h4>';
            for (const asp of report.active) {
                html += this.renderAspectRow(asp, 'active');
            }
        }

        if (report.building.length > 0) {
            html += '<h4 class="transit-section-title building-title">🌊 Building Aspects (3-5°)</h4>';
            for (const asp of report.building) {
                html += this.renderAspectRow(asp, 'building');
            }
        }

        if (report.wide.length > 0) {
            html += '<h4 class="transit-section-title wide-title">🔭 Wide Aspects (5-8°)</h4>';
            for (const asp of report.wide.slice(0, 5)) {
                html += this.renderAspectRow(asp, 'wide');
            }
        }

        html += '</div>';
        html += '<div class="transit-summary">';
        html += '<h4>Summary</h4>';
        for (const line of report.summary) {
            html += `<p>${line}</p>`;
        }
        html += '</div>';

        container.innerHTML = html;
    },

    renderAspectRow(asp, level) {
        const levelClass = level === 'active' ? 'aspect-active' : level === 'building' ? 'aspect-building' : 'aspect-wide';
        return `
            <div class="aspect-row ${levelClass}">
                <span class="aspect-transit-symbol">${asp.transit.symbol}</span>
                <span class="aspect-transit-name">${asp.transit.name}</span>
                <span class="aspect-type">${asp.aspect.symbol} ${asp.aspect.name}</span>
                <span class="aspect-natal-symbol">${asp.natal.symbol}</span>
                <span class="aspect-natal-name">${asp.natal.name}</span>
                <span class="aspect-orb">${asp.orb}°</span>
                <span class="aspect-intensity">${asp.intensity}%</span>
            </div>
        `;
    }
};

window.TransitEngine = TransitEngine;
