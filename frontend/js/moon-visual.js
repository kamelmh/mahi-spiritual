/* MAHI Spiritual System - SVG Moon Phase Visualizer */

const MoonVisual = {
    size: 120,
    cx: 60,
    cy: 60,
    r: 50,

    renderMoonSVG(containerId, date = new Date()) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const phase = MoonEngine.calculatePhase(date);
        const illumination = phase.illumination / 100;
        const phaseAngle = phase.phase * 2 * Math.PI;
        const size = this.size;
        const cx = this.cx;
        const cy = this.cy;
        const r = this.r;

        let terminatorPath = '';
        const isWaxing = phase.phase < 0.5;

        if (illumination < 0.01) {
            terminatorPath = '';
        } else if (illumination > 0.99) {
            terminatorPath = '';
        } else {
            const sweepOuter = isWaxing ? 1 : 0;
            const sweepInner = isWaxing ? 0 : 1;

            const outerX = cx + r * Math.sin(phaseAngle);
            const innerX = cx - r * Math.sin(phaseAngle);
            const edgeX = isWaxing ? cx + r : cx - r;

            terminatorPath = `M ${cx} ${cy - r}
                A ${r} ${r} 0 0 ${sweepOuter} ${cx} ${cy + r}
                A ${Math.abs(r * Math.cos(phaseAngle))} ${r} 0 0 ${sweepInner} ${cx} ${cy - r} Z`;
        }

        const bgColor = phase.phase < 0.5 ? '#1a1a2e' : '#0f0f1a';
        const glowColor = isWaxing ? '#ffd700' : '#c0c0c0';

        const svg = `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="${glowColor}" stop-opacity="0"/>
                </radialGradient>
                <filter id="moonBlur">
                    <feGaussianBlur stdDeviation="2"/>
                </filter>
                <radialGradient id="moonSurface" cx="40%" cy="35%" r="60%">
                    <stop offset="0%" stop-color="#f5f5dc"/>
                    <stop offset="50%" stop-color="#d4d4a8"/>
                    <stop offset="100%" stop-color="#a8a878"/>
                </radialGradient>
            </defs>

            <!-- Glow -->
            <circle cx="${cx}" cy="${cy}" r="${r + 15}" fill="url(#moonGlow)"/>

            <!-- Moon body -->
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="#e8e8d0" stroke="#c0c090" stroke-width="0.5"/>

            <!-- Surface details -->
            <circle cx="${cx - 12}" cy="${cy - 10}" r="8" fill="#d0d0a0" opacity="0.5"/>
            <circle cx="${cx + 15}" cy="${cy + 5}" r="10" fill="#c8c898" opacity="0.4"/>
            <circle cx="${cx - 5}" cy="${cy + 18}" r="6" fill="#d0d0a0" opacity="0.3"/>
            <circle cx="${cx + 8}" cy="${cy - 15}" r="5" fill="#c8c898" opacity="0.4"/>

            <!-- Shadow / terminator -->
            ${terminatorPath ? `<path d="${terminatorPath}" fill="rgba(0,0,0,0.85)" filter="url(#moonBlur)"/>` : ''}

            <!-- Crater details on lit side -->
            ${illumination > 0.1 ? `
                <circle cx="${cx - 8}" cy="${cy - 5}" r="3" fill="rgba(180,180,140,0.3)"/>
                <circle cx="${cx + 10}" cy="${cy + 12}" r="4" fill="rgba(180,180,140,0.25)"/>
                <circle cx="${cx - 15}" cy="${cy + 8}" r="2.5" fill="rgba(180,180,140,0.2)"/>
            ` : ''}

            <!-- Phase label -->
            <text x="${cx}" y="${size - 5}" text-anchor="middle" fill="#a0a0a0" font-size="8" font-family="sans-serif">${Math.round(phase.illumination)}%</text>
        </svg>`;

        container.innerHTML = svg;
    },

    renderMoonPhaseBar(containerId, date = new Date()) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const phase = MoonEngine.calculatePhase(date);
        const phases = [
            { name: 'New', emoji: '🌑', pct: 0 },
            { name: 'Wax Crescent', emoji: '🌒', pct: 12.5 },
            { name: 'First Q', emoji: '🌓', pct: 25 },
            { name: 'Wax Gibbous', emoji: '🌔', pct: 37.5 },
            { name: 'Full', emoji: '🌕', pct: 50 },
            { name: 'Wan Gibbous', emoji: '🌖', pct: 62.5 },
            { name: 'Last Q', emoji: '🌗', pct: 75 },
            { name: 'Wan Crescent', emoji: '🌘', pct: 87.5 }
        ];

        const currentPct = phase.phase * 100;
        let markerPos = currentPct;

        let html = '<div class="moon-phase-bar">';
        html += '<div class="phase-track">';
        html += '<div class="phase-fill" style="width:' + currentPct + '%"></div>';
        html += '<div class="phase-marker" style="left:' + markerPos + '%"></div>';
        html += '</div>';
        html += '<div class="phase-labels">';
        for (const p of phases) {
            html += `<span class="phase-label ${Math.abs(currentPct - p.pct) < 7 ? 'active' : ''}">${p.emoji}</span>`;
        }
        html += '</div>';
        html += '</div>';

        container.innerHTML = html;
    }
};

window.MoonVisual = MoonVisual;
