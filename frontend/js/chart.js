/* MAHI Spiritual System - Enhanced Divisional Chart Visualization */
let chartData = null;
let divisionalData = null;
let activeView = 'D1'; // 'D1', 'D9', 'D10'
let selectedPlanet = null;

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_SYM = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_CLR = {'Aries':'#ef4444','Taurus':'#22c55e','Gemini':'#eab308','Cancer':'#94a3b8','Leo':'#f97316','Virgo':'#84cc16','Libra':'#ec4899','Scorpio':'#6366f1','Sagittarius':'#a855f7','Capricorn':'#64748b','Aquarius':'#06b6d4','Pisces':'#8b5cf6'};
const PSYM = {'Sun':'☉','Moon':'☽','Mercury':'☿','Venus':'♀','Mars':'♂','Jupiter':'♃','Saturn':'♄','Rahu':'☊','Ketu':'☋'};

function s2d(sign,deg){ const i=SIGNS.indexOf(sign); return i===-1?0:i*30+(deg||0); }

async function initChart(){
    await loadChartData();
    setupViewSelector();
    createEnhancedChartWheel();
    createPlanetTable();
    createHouseList();
    createYogaList();
    if(typeof TransitEngine!=='undefined') TransitEngine.renderTransitCard('transitAspects',chartData).catch(()=>{});
}

async function loadChartData(){
    try {
        const divRes = await fetch('/api/astrology/divisional?name=Kamel');
        if (divRes.ok) {
            divisionalData = await divRes.json();
        }
    } catch(e) {
        divisionalData = null;
    }

    try {
        const r = await fetch('/api/astrology/chart?name=Kamel');
        if (r.ok) {
            const raw = await r.json();
            chartData = formatApiChart(raw);
        } else {
            const staticRes = await fetch('data/chart.json');
            chartData = await staticRes.json();
            normalizePlanets(chartData);
        }
    } catch(e) {
        try {
            const staticRes = await fetch('data/chart.json');
            chartData = await staticRes.json();
            normalizePlanets(chartData);
        } catch(err) {
            chartData = null;
        }
    }
}

function formatApiChart(raw) {
    if (raw.planets && Array.isArray(raw.planets)) return raw;
    if (raw.planets && typeof raw.planets === 'object') {
        const planetsList = [];
        const signHouseMap = { 'Gemini': 1, 'Cancer': 2, 'Leo': 3, 'Virgo': 4, 'Libra': 5, 'Scorpio': 6, 'Sagittarius': 7, 'Capricorn': 8, 'Aquarius': 9, 'Pisces': 10, 'Aries': 11, 'Taurus': 12 };
        for (const [name, p] of Object.entries(raw.planets)) {
            if (p.error) continue;
            planetsList.push({
                name,
                symbol: PSYM[name] || name[0],
                sign: p.sign,
                degree: p.degree,
                house: signHouseMap[p.sign] || 1,
                nakshatra: p.nakshatra,
                lord: p.nakshatra_lord,
                pada: p.pada,
                dignity: p.dignity,
                d9: p.d9,
                d10: p.d10
            });
        }
        const housesList = SIGNS.map((sign, idx) => ({
            number: ((idx - SIGNS.indexOf('Gemini') + 12) % 12) + 1,
            sign: sign,
            theme: `House ${((idx - SIGNS.indexOf('Gemini') + 12) % 12) + 1} Theme`
        }));
        return {
            name: raw.name || 'Kamel',
            ascendant: raw.ascendant && raw.ascendant.sign ? raw.ascendant : (raw.houses && raw.houses.house_1 ? { sign: raw.houses.house_1.sign, degree: raw.houses.house_1.degree } : { sign: 'Gemini', degree: 14.5 }),
            planets: planetsList,
            houses: housesList,
            yogas: raw.yogas || []
        };
    }
    return raw;
}

function normalizePlanets(data) {
    if (!data || !data.planets || Array.isArray(data.planets)) return;
    const signHouseMap = { 'Aries':1,'Taurus':2,'Gemini':3,'Cancer':4,'Leo':5,'Virgo':6,'Libra':7,'Scorpio':8,'Sagittarius':9,'Capricorn':10,'Aquarius':11,'Pisces':12 };
    const planetsList = [];
    for (const [name, p] of Object.entries(data.planets)) {
        if (p.error) continue;
        planetsList.push({
            name,
            symbol: PSYM[name] || name[0],
            sign: p.sign,
            degree: p.degree,
            house: p.house || signHouseMap[p.sign] || 1,
            nakshatra: p.nakshatra,
            lord: p.nakshatra_lord,
            pada: p.pada,
            dignity: p.dignity,
            d9: p.d9,
            d10: p.d10
        });
    }
    data.planets = planetsList;

    // Handle houses with error field
    if (data.houses && data.houses.error) {
        data.houses = null;
    }
    
    // Normalize houses from object to array
    if (data.houses && typeof data.houses === 'object' && !Array.isArray(data.houses)) {
        const housesArr = [];
        for (let i = 1; i <= 12; i++) {
            const h = data.houses[`house_${i}`] || {};
            housesArr.push({
                number: i,
                sign: h.sign || 'Aries',
                degree: h.degree || 0,
                cusp_degree: h.cusp_degree || (i - 1) * 30,
                theme: `House ${i}`
            });
        }
        data.houses = housesArr;
    }
}

function setupViewSelector() {
    const selector = document.getElementById('chartViewSelector');
    if (!selector) return;
    selector.querySelectorAll('.chart-view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selector.querySelectorAll('.chart-view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeView = btn.dataset.view;
            createEnhancedChartWheel();
        });
    });
}

function getActivePlanets() {
    if (!chartData || !chartData.planets) return [];
    if (activeView === 'D1') return chartData.planets;
    
    return chartData.planets.map(p => {
        let div = null;
        if (divisionalData && divisionalData[activeView] && divisionalData[activeView].planets[p.name]) {
            div = divisionalData[activeView].planets[p.name];
        } else if (p[activeView.toLowerCase()]) {
            div = p[activeView.toLowerCase()];
        }
        
        if (div) {
            return {
                ...p,
                sign: div.sign,
                degree: div.degree,
                originalSign: p.sign,
                originalDegree: p.degree
            };
        }
        return p;
    });
}

function createEnhancedChartWheel(){
    const wheel = document.getElementById('chartWheel');
    if (!wheel || !chartData) return;

    const activePlanets = getActivePlanets();
    const sz=440, cx=220, oR=200, sR=175, iR=115, pR=145, tR=95;
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox',`0 0 ${sz} ${sz}`);
    svg.setAttribute('width','100%');
    svg.setAttribute('height','100%');
    svg.style.maxWidth=sz+'px';

    function el(tag,attrs){ const e=document.createElementNS('http://www.w3.org/2000/svg',tag); for(const[k,v]of Object.entries(attrs)) e.setAttribute(k,v); return e; }

    // Outer and Inner Rings
    svg.appendChild(el('circle',{cx,cy:cx,r:oR,fill:'none',stroke:'var(--accent-gold)','stroke-width':'2',opacity:'0.7'}));
    svg.appendChild(el('circle',{cx,cy:cx,r:iR,fill:'none',stroke:'var(--border-color)','stroke-width':'1'}));

    // Render 12 Zodiac Sign Sectors
    for(let i=0;i<12;i++){
        const sa=(i*30-90)*Math.PI/180, ea=((i+1)*30-90)*Math.PI/180, ma=((i*30+15)-90)*Math.PI/180;
        const ox1=cx+oR*Math.cos(sa),oy1=cx+oR*Math.sin(sa),ox2=cx+oR*Math.cos(ea),oy2=cx+oR*Math.sin(ea);
        const ix1=cx+sR*Math.cos(sa),iy1=cx+sR*Math.sin(sa),ix2=cx+sR*Math.cos(ea),iy2=cx+sR*Math.sin(ea);
        svg.appendChild(el('path',{d:`M${ix1},${iy1} L${ox1},${oy1} A${oR},${oR} 0 0,1 ${ox2},${oy2} L${ix2},${iy2} A${sR},${sR} 0 0,0 ${ix1},${iy1}`,fill:SIGN_CLR[SIGNS[i]],opacity:'0.25',stroke:SIGN_CLR[SIGNS[i]],'stroke-width':'1'}));
        const sx=cx+(sR+(oR-sR)/2)*Math.cos(ma), sy=cx+(sR+(oR-sR)/2)*Math.sin(ma);
        const signTxt = el('text',{x:sx,y:sy,'text-anchor':'middle','dominant-baseline':'middle',fill:SIGN_CLR[SIGNS[i]],'font-size':'16','font-weight':'bold'});
        signTxt.textContent=SIGN_SYM[i];
        svg.appendChild(signTxt);
        svg.appendChild(el('line',{x1:cx+sR*Math.cos(sa),y1:cx+sR*Math.sin(sa),x2:cx+oR*Math.cos(sa),y2:cx+oR*Math.sin(sa),stroke:'var(--border-color)','stroke-width':'0.75'}));
    }

    // Render House Cusp Numbers
    if (chartData.houses) {
        for(let i=0;i<12;i++){
            const a=(s2d(chartData.houses[i].sign,0)-90)*Math.PI/180;
            svg.appendChild(el('line',{x1:cx+45*Math.cos(a),y1:cx+45*Math.sin(a),x2:cx+iR*Math.cos(a),y2:cx+iR*Math.sin(a),stroke:'var(--border-color)','stroke-width':'1',opacity:'0.6'}));
            const hTxt = el('text',{x:cx+60*Math.cos(a),y:cx+60*Math.sin(a),'text-anchor':'middle','dominant-baseline':'middle',fill:'var(--accent-gold)','font-size':'11','font-weight':'bold'});
            hTxt.textContent=i+1;
            svg.appendChild(hTxt);
        }
    }

    // Draw Aspect Lines between Planets
    for(let i=0;i<activePlanets.length;i++){
        for(let j=i+1;j<activePlanets.length;j++){
            const p1=activePlanets[i], p2=activePlanets[j];
            let diff=Math.abs(s2d(p1.sign,p1.degree)-s2d(p2.sign,p2.degree));
            if(diff>180) diff=360-diff;
            let asp=null;
            if(Math.abs(diff-0)<=8) asp={c:'#ffd700',w:1.8, type:'Conjunction'};
            else if(Math.abs(diff-60)<=6) asp={c:'#22c55e',w:1, type:'Sextile'};
            else if(Math.abs(diff-90)<=7) asp={c:'#ef4444',w:1.2, type:'Square'};
            else if(Math.abs(diff-120)<=8) asp={c:'#6366f1',w:1.2, type:'Trine'};
            else if(Math.abs(diff-180)<=8) asp={c:'#f97316',w:1.8, type:'Opposition'};
            
            if(asp){
                const a1=(s2d(p1.sign,p1.degree)-90)*Math.PI/180;
                const a2=(s2d(p2.sign,p2.degree)-90)*Math.PI/180;
                const isHighlighted = selectedPlanet && (selectedPlanet === p1.name || selectedPlanet === p2.name);
                svg.appendChild(el('line',{
                    x1:cx+50*Math.cos(a1),y1:cx+50*Math.sin(a1),
                    x2:cx+50*Math.cos(a2),y2:cx+50*Math.sin(a2),
                    stroke:asp.c,
                    'stroke-width': isHighlighted ? asp.w * 2 : asp.w,
                    opacity: isHighlighted ? '0.9' : '0.35',
                    'stroke-dasharray':'4,4'
                }));
            }
        }
    }

    // Render Planet Nodes
    activePlanets.forEach(p => {
        const pd=s2d(p.sign,p.degree), pa=(pd-90)*Math.PI/180, px=cx+pR*Math.cos(pa), py=cx+pR*Math.sin(pa);
        const isSel = selectedPlanet === p.name;
        const g=el('g',{class: 'planet-node'});
        g.style.cursor='pointer';
        
        g.appendChild(el('circle',{
            cx:px, cy:py, r: isSel ? '17' : '14',
            fill: SIGN_CLR[p.sign] || '#888',
            stroke: isSel ? '#ffd700' : '#fff',
            'stroke-width': isSel ? '3' : '2'
        }));
        
        const txt = el('text',{
            x:px, y:py,
            'text-anchor':'middle', 'dominant-baseline':'middle',
            fill:'#fff', 'font-size':'14', 'font-weight':'bold'
        });
        txt.textContent = PSYM[p.name] || p.name[0];
        g.appendChild(txt);
        
        g.addEventListener('click', (e) => {
            e.stopPropagation();
            inspectPlanet(p);
        });
        
        svg.appendChild(g);
    });

    // Chart Label Tag (D1, D9, D10)
    const labelTag = el('text',{x:cx,y:cx,'text-anchor':'middle','dominant-baseline':'middle',fill:'var(--accent-gold)','font-size':'18','font-weight':'bold'});
    labelTag.textContent = activeView === 'D1' ? 'D-1 NATAL' : (activeView === 'D9' ? 'D-9 NAVAMSHA' : 'D-10 DASHAMSHA');
    svg.appendChild(labelTag);

    wheel.innerHTML='';
    wheel.appendChild(svg);
    addPlanetLegend();
}

function inspectPlanet(p) {
    selectedPlanet = p.name;
    createEnhancedChartWheel(); // Re-render wheel to update aspect line highlights
    
    const inspector = document.getElementById('planetInspector');
    if (!inspector) return;
    
    const d9Info = p.d9 ? `${p.d9.sign} ${p.d9.degree}°` : 'N/A';
    const d10Info = p.d10 ? `${p.d10.sign} ${p.d10.degree}°` : 'N/A';
    
    inspector.style.display = 'block';
    inspector.innerHTML = `
        <div class="inspector-card-inner">
            <div class="inspector-header">
                <span class="inspector-symbol" style="color:${SIGN_CLR[p.sign]}">${PSYM[p.name] || p.name[0]}</span>
                <div>
                    <h4>${p.name}</h4>
                    <p class="inspector-subtitle">${p.sign} ${p.degree.toFixed(2)}° • House ${p.house}</p>
                </div>
                <button class="inspector-close" onclick="document.getElementById('planetInspector').style.display='none'; selectedPlanet=null; createEnhancedChartWheel();">✕</button>
            </div>
            <div class="inspector-grid">
                <div class="inspector-item"><span class="lbl">Nakshatra:</span> <span class="val">${p.nakshatra || 'Unknown'} (Pada ${p.pada || 1})</span></div>
                <div class="inspector-item"><span class="lbl">Ruler:</span> <span class="val">${p.lord || 'N/A'}</span></div>
                <div class="inspector-item"><span class="lbl">Dignity:</span> <span class="val dignity-tag ${p.dignity}">${p.dignity || 'neutral'}</span></div>
                <div class="inspector-item"><span class="lbl">Navamsha (D-9):</span> <span class="val">${d9Info}</span></div>
                <div class="inspector-item"><span class="lbl">Dashamsha (D-10):</span> <span class="val">${d10Info}</span></div>
            </div>
        </div>
    `;
}

function addPlanetLegend(){
    if(!chartData||!chartData.planets) return;
    const activePlanets = getActivePlanets();
    let h='<div class="chart-legend">';
    activePlanets.forEach(p=>{
        h+=`<div class="legend-item" onclick="inspectPlanet(chartData.planets.find(x=>x.name==='${p.name}'))" style="cursor:pointer;"><span class="legend-symbol" style="color:${SIGN_CLR[p.sign]}">${PSYM[p.name]||p.name[0]}</span><span class="legend-name">${p.name}</span><span class="legend-position">${p.sign} ${p.degree.toFixed(1)}°</span></div>`;
    });
    h+='</div>';
    const el=document.createElement('div'); el.className='chart-legend-container'; el.innerHTML=h;
    document.getElementById('chartWheel').appendChild(el);
}

function createPlanetTable(){
    const t=document.getElementById('planetTable'); if(!chartData||!chartData.planets) return;
    t.innerHTML=chartData.planets.map(p=>`<div class="planet-row"><div class="planet-symbol">${p.symbol}</div><div class="planet-name">${p.name}</div><div class="planet-sign">${p.sign}</div><div class="planet-degree">${p.degree.toFixed(2)}°</div><div class="planet-house">H${p.house}</div><div class="planet-nakshatra">${p.nakshatra}</div></div>`).join('');
}

function createHouseList(){
    const t=document.getElementById('houseList'); if(!chartData||!chartData.houses) return;
    t.innerHTML=chartData.houses.map(h=>`<div class="house-item"><div class="house-number">${h.number}</div><div class="house-sign">${h.sign}</div><div class="house-theme">${h.theme}</div></div>`).join('');
}

function createYogaList(){
    const t=document.getElementById('yogaList'); if(!chartData||!chartData.yogas) return;
    t.innerHTML=chartData.yogas.map(y=>{
        const name = y.name || (y.type === 'conjunction' ? `${y.planets.join(' - ')} Conjunction in ${y.sign}` : y.type || 'Planetary Yoga');
        const desc = y.description || y.significance || `${y.planets.join(' and ')} combined in ${y.sign}`;
        const insight = y.quranicInsight || '';
        return `<div class="yoga-item"><div class="yoga-name">${name}</div><div class="yoga-desc">${desc}</div>${insight ? `<div class="yoga-insight">${insight}</div>` : ''}</div>`;
    }).join('');
}

const chartCSS=`
.chart-container{display:flex;flex-direction:column;gap:16px}
.chart-controls{display:flex;justify-content:center;margin-bottom:8px}
.chart-view-selector{display:flex;background:var(--bg-tertiary);padding:4px;border-radius:10px;gap:6px;border:1px solid var(--border-color)}
.chart-view-btn{background:none;border:none;color:var(--text-secondary);padding:8px 16px;font-size:13px;font-weight:600;border-radius:6px;cursor:pointer;transition:all 0.2s}
.chart-view-btn.active{background:var(--accent-gold);color:#000}
.chart-wheel{background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:12px;min-height:440px;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;position:relative}
.chart-wheel svg{max-width:100%;max-height:100%}
.planet-inspector-card{background:var(--bg-tertiary);border:1px solid var(--accent-gold);border-radius:10px;padding:14px;margin-top:10px;box-shadow:0 4px 12px rgba(0,0,0,0.3)}
.inspector-header{display:flex;align-items:center;gap:12px;margin-bottom:10px;position:relative}
.inspector-symbol{font-size:24px}
.inspector-header h4{margin:0;font-size:16px;color:var(--text-primary)}
.inspector-subtitle{margin:0;font-size:12px;color:var(--text-secondary)}
.inspector-close{position:absolute;right:0;top:0;background:none;border:none;color:var(--text-secondary);font-size:16px;cursor:pointer}
.inspector-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px}
.inspector-item{color:var(--text-secondary)}
.inspector-item .lbl{font-weight:600;color:var(--text-primary)}
.dignity-tag{text-transform:capitalize;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600}
.dignity-tag.own_sign{background:rgba(34,197,94,0.2);color:#22c55e}
.dignity-tag.exalted{background:rgba(234,179,8,0.2);color:#eab308}
.dignity-tag.debilitated{background:rgba(239,68,68,0.2);color:#ef4444}
.chart-legend-container{margin-top:12px}
.chart-legend{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.legend-item{display:flex;align-items:center;gap:4px;font-size:11px}
.legend-symbol{font-size:14px}
.legend-name{color:var(--text-primary);font-weight:600}
.legend-position{color:var(--text-secondary);font-size:10px}
.planet-row{display:flex;align-items:center;padding:10px;background:var(--bg-tertiary);border-radius:8px;gap:10px;margin-bottom:6px}
.planet-symbol{width:24px;text-align:center;font-size:16px;color:var(--accent-gold)}
.planet-name{width:70px;font-weight:600;color:var(--text-primary)}
.planet-sign{flex:1;color:var(--text-primary)}
.planet-degree{width:55px;text-align:right;color:var(--text-secondary);font-size:12px}
.planet-house{width:35px;text-align:center;color:var(--accent-blue);font-weight:600}
.planet-nakshatra{width:95px;text-align:right;color:var(--accent-gold);font-size:12px}
.house-item{display:flex;align-items:center;padding:10px;background:var(--bg-tertiary);border-radius:8px;gap:10px;margin-bottom:6px}
.house-number{width:24px;height:24px;display:flex;align-items:center;justify-content:center;background:var(--accent-blue);color:#fff;border-radius:50%;font-weight:600;font-size:12px}
.house-sign{width:75px;font-weight:600;color:var(--text-primary)}
.house-theme{flex:1;color:var(--text-secondary);font-size:12px}
.yoga-item{padding:10px;background:var(--bg-tertiary);border-radius:8px;margin-bottom:8px;border-left:3px solid var(--accent-gold)}
.yoga-name{font-weight:600;color:var(--accent-gold);margin-bottom:4px}
.yoga-desc{color:var(--text-primary);font-size:13px;margin-bottom:4px}
.yoga-insight{color:var(--text-secondary);font-size:12px;font-style:italic}
@media(max-width:768px){.chart-wheel{min-height:320px}}
`;
const cssEl=document.createElement('style'); cssEl.textContent=chartCSS; document.head.appendChild(cssEl);
document.addEventListener('DOMContentLoaded',()=>{ initChart(); });
