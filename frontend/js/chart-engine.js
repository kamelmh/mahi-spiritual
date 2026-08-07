/* MAHI Spiritual System - Chart Visualization Engine */

const ChartEngine = {
    // Chart configuration
    config: {
        size: 400,
        center: 200,
        radius: 180,
        innerRadius: 120,
        planetRadius: 150,
        signColors: {
            'Aries': '#ef4444',
            'Taurus': '#22c55e',
            'Gemini': '#eab308',
            'Cancer': '#94a3b8',
            'Leo': '#f97316',
            'Virgo': '#84cc16',
            'Libra': '#ec4899',
            'Scorpio': '#6366f1',
            'Sagittarius': '#a855f7',
            'Capricorn': '#64748b',
            'Aquarius': '#06b6d4',
            'Pisces': '#8b5cf6'
        },
        planetSymbols: {
            'Sun': '☉',
            'Moon': '☽',
            'Mercury': '☿',
            'Venus': '♀',
            'Mars': '♂',
            'Jupiter': '♃',
            'Saturn': '♄',
            'Rahu': '☊',
            'Ketu': '☋'
        }
    },

    // Initialize chart
    init(containerId, chartData) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        this.container = container;
        this.data = chartData;
        
        this.render();
    },

    // Render the chart
    render() {
        const { size, center, radius, innerRadius } = this.config;
        
        // Normalize planets: if object keyed by name, convert to array
        let planets = this.data.planets || [];
        if (!Array.isArray(planets)) {
            planets = Object.entries(planets).map(([name, data]) => ({
                name,
                ...data,
                symbol: this.config.planetSymbols[name]
            }));
        }
        this._planets = planets;
        
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        svg.style.maxWidth = `${size}px`;
        
        // Draw outer circle (zodiac)
        this.drawCircle(svg, center, center, radius, 'zodiac-circle');
        
        // Draw inner circle (houses)
        this.drawCircle(svg, center, center, innerRadius, 'house-circle');
        
        // Draw house cusps (only if valid)
        const houses = this.data.houses;
        if (houses && !houses.error && Array.isArray(houses) && houses.length > 0) {
            this.drawHouseCusps(svg);
        }
        
        // Draw signs
        this.drawSigns(svg);
        
        // Draw planets
        this.drawPlanets(svg);
        
        // Draw center point
        this.drawCenter(svg);
        
        // Add to container
        this.container.innerHTML = '';
        this.container.appendChild(svg);
        
        // Add planet legend
        this.addPlanetLegend();
    },

    // Draw circle
    drawCircle(svg, cx, cy, r, className) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('class', className);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', 'var(--border-color)');
        circle.setAttribute('stroke-width', '1');
        svg.appendChild(circle);
    },

    // Draw house cusps
    drawHouseCusps(svg) {
        const { center, radius, innerRadius } = this.config;
        const houses = this.data.houses || [];
        
        houses.forEach((house, i) => {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const x1 = center + innerRadius * Math.cos(angle);
            const y1 = center + innerRadius * Math.sin(angle);
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('class', 'house-cusp');
            line.setAttribute('stroke', 'var(--border-color)');
            line.setAttribute('stroke-width', '0.5');
            svg.appendChild(line);
            
            // House number
            const textX = center + (innerRadius - 15) * Math.cos(angle);
            const textY = center + (innerRadius - 15) * Math.sin(angle);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', textX);
            text.setAttribute('y', textY);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('class', 'house-number');
            text.setAttribute('fill', 'var(--text-secondary)');
            text.setAttribute('font-size', '10');
            text.textContent = i + 1;
            svg.appendChild(text);
        });
    },

    // Draw zodiac signs
    drawSigns(svg) {
        const { center, radius } = this.config;
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                       'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const symbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
        
        signs.forEach((sign, i) => {
            const angle = (i * 30 + 15 - 90) * Math.PI / 180;
            const x = center + (radius - 20) * Math.cos(angle);
            const y = center + (radius - 20) * Math.sin(angle);
            
            // Sign symbol
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('class', 'sign-symbol');
            text.setAttribute('fill', this.config.signColors[sign]);
            text.setAttribute('font-size', '16');
            text.textContent = symbols[i];
            svg.appendChild(text);
            
            // Sign name (smaller)
            const nameX = center + (radius - 35) * Math.cos(angle);
            const nameY = center + (radius - 35) * Math.sin(angle);
            
            const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            nameText.setAttribute('x', nameX);
            nameText.setAttribute('y', nameY);
            nameText.setAttribute('text-anchor', 'middle');
            nameText.setAttribute('dominant-baseline', 'middle');
            nameText.setAttribute('class', 'sign-name');
            nameText.setAttribute('fill', 'var(--text-secondary)');
            nameText.setAttribute('font-size', '6');
            nameText.textContent = sign.substring(0, 3).toUpperCase();
            svg.appendChild(nameText);
        });
    },

    // Draw planets
    drawPlanets(svg) {
        const { center, planetRadius } = this.config;
        const planets = this._planets || [];
        
        planets.forEach(planet => {
            const signIndex = this.getSignIndex(planet.sign);
            const degreeInSign = planet.degree;
            const totalAngle = (signIndex * 30 + degreeInSign - 90) * Math.PI / 180;
            
            const x = center + planetRadius * Math.cos(totalAngle);
            const y = center + planetRadius * Math.sin(totalAngle);
            
            // Planet circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', '12');
            circle.setAttribute('class', 'planet-marker');
            circle.setAttribute('fill', this.config.signColors[planet.sign] || 'var(--text-primary)');
            circle.setAttribute('data-planet', planet.name);
            svg.appendChild(circle);
            
            // Planet symbol
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('class', 'planet-symbol');
            text.setAttribute('fill', 'white');
            text.setAttribute('font-size', '14');
            text.textContent = this.config.planetSymbols[planet.name] || planet.name[0];
            svg.appendChild(text);
        });
    },

    // Draw center
    drawCenter(svg) {
        const { center } = this.config;
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', center);
        circle.setAttribute('cy', center);
        circle.setAttribute('r', '5');
        circle.setAttribute('class', 'center-point');
        circle.setAttribute('fill', 'var(--accent-color)');
        svg.appendChild(circle);
    },

    // Get sign index
    getSignIndex(sign) {
        const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                       'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        return signs.indexOf(sign);
    },

    // Add planet legend
    addPlanetLegend() {
        const planets = this._planets || [];
        
        let legendHTML = '<div class="chart-legend">';
        planets.forEach(planet => {
            legendHTML += `
                <div class="legend-item">
                    <span class="legend-symbol" style="color: ${this.config.signColors[planet.sign]}">
                        ${this.config.planetSymbols[planet.name] || planet.name[0]}
                    </span>
                    <span class="legend-name">${planet.name}</span>
                    <span class="legend-position">${planet.sign} ${planet.degree.toFixed(1)}°</span>
                </div>
            `;
        });
        legendHTML += '</div>';
        
        const legendContainer = document.createElement('div');
        legendContainer.className = 'chart-legend-container';
        legendContainer.innerHTML = legendHTML;
        this.container.appendChild(legendContainer);
    },

    // Get planet details
    getPlanetDetails(planetName) {
        const planets = this._planets || [];
        const planet = planets.find(p => p.name === planetName);
        if (!planet) return null;
        
        return {
            ...planet,
            signColor: this.config.signColors[planet.sign],
            symbol: this.config.planetSymbols[planet.name]
        };
    }
};

// Export
window.ChartEngine = ChartEngine;
