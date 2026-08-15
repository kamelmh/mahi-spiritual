/* MAHI Spiritual System - Main Application (Enhanced) */

const AppState = {
    currentPage: 'dashboard',
    theme: localStorage.getItem('theme') || 'dark',
    practice: JSON.parse(localStorage.getItem('practice')) || { streak: 0, totalRecitations: 0, journalEntries: 0, lastPractice: null, history: [] },
    settings: JSON.parse(localStorage.getItem('settings')) || { name: 'Kamel M. Abdelghani', birthDate: '1996-03-06', birthTime: '12:47', birthLocation: 'El Bayadh, Algeria', fajrReminder: true, asrReminder: true, maghribReminder: true, ishaReminder: true }
};

document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initTheme();
    updateDate();
    initDashboard();
    safeInitEmergencyButtons();
    safeLoadSettings();
});

function $(id){ return document.getElementById(id); }

function initNavigation(){
    document.querySelectorAll('.nav-item').forEach(item=>{
        item.addEventListener('click',()=>{ navigateTo(item.dataset.page); });
    });
}

function navigateTo(page){
    document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
    const nav=document.querySelector(`[data-page="${page}"]`); if(nav)nav.classList.add('active');
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const pg=$(page); if(pg)pg.classList.add('active');
    AppState.currentPage=page;
    switch(page){
        case 'dashboard': initDashboard(); break;
        case 'chart': initChart(); break;
        case 'soul': initSoul(); break;
        case 'surahs': initSurahs(); break;
        case 'destiny': initDestiny(); break;
        case 'practice': initPractice(); break;
        case 'verses': initVerses(); break;
        case 'lunar': initLunar(); break;
        case 'emergency': break;
        case 'ruqya': initRuqya(); break;
        case 'ruqya-learning': if(window.RuqyaLearning)RuqyaLearning.init(); break;
        case 'daily-practice': initDailyPractice(); break;
        case 'learning': initLearning(); break;
        case 'settings': safeLoadSettings(); break;
        case 'prayer': if(window.Notifications)Notifications.init(); break;
        case 'progress': if(window.ProgressCharts)ProgressCharts.init(); break;
        case 'audio': if(window.AudioPlayer)AudioPlayer.init(); if(window.QuranAudio)QuranAudio.init(); break;
        case 'export': if(window.ExportReports)ExportReports.init(); break;
        case 'family': if(window.Family)Family.init(); break;
    }
}

function initTheme(){ document.documentElement.setAttribute('data-theme',AppState.theme); const t=$('themeToggle'); if(t)t.addEventListener('click',toggleTheme); }
function toggleTheme(){ setTheme(AppState.theme==='dark'?'light':'dark'); }
function setTheme(theme){ AppState.theme=theme; document.documentElement.setAttribute('data-theme',theme); localStorage.setItem('theme',theme); const t=$('themeToggle'); if(t){ const tx=t.querySelector('.theme-text'),ti=t.querySelector('.theme-icon'); if(tx)tx.textContent=theme==='dark'?'Dark Mode':'Light Mode'; if(ti)ti.textContent=theme==='dark'?'☾':'☀'; } }

async function initDashboard(){
    updateDate();
    updatePracticeList();
    updateStats();
    if(typeof RecitationEngine!=='undefined'){
        RecitationEngine.init();
        const recTotal=Object.values(RecitationEngine.counters||{}).reduce((s,c)=>s+(c.count||0),0);
        AppState.practice.totalRecitations=recTotal;
        localStorage.setItem('practice',JSON.stringify(AppState.practice));
    }
    await updateTransitInfo();
    updateDailyQuote();
    updateMoonWidget();
    await updateTransitAspectsWidget();
    renderActionBigThree();
    renderQuranBlueprint();
    renderDailyQuranWisdom();
}

function updateDate(){
    const now=new Date();
    const opts={weekday:'long',year:'numeric',month:'long',day:'numeric'};
    const ds=now.toLocaleDateString('en-US',opts);
    const el=$('currentDate');
    if(el){
        let txt=ds;
        if(now.getDay()===4) txt+=' - POWER DAY!';
        if(now.getDay()===5) txt+=' - Venus Day (Ar-Rahman)';
        el.textContent=txt;
    }
    const hijriEl=$('hijriDate');
    if(hijriEl && typeof MoonEngine!=='undefined'){
        const h=MoonEngine.getHijriDate(now);
        hijriEl.textContent=`${h.day} ${h.month} ${h.year} AH`;
    }
}

function updatePracticeList(){
    const pl=$('practiceList'); if(!pl) return;
    const now=new Date();
    const today=now.toDateString();
    const tp=AppState.practice.history.find(p=>p.date===today);

    // Get lunar/manzil data
    let lunarDay=1,manzilName='Al-Sharatain',manzilArabic='الشراطين',hijriDay='?',hijriMonth='?',moonPhaseName='?',moonEmoji='🌑',dayEnergy='',surahOfTheDay='Al-Baqarah (2)',surahTheme='Foundation, law, covenant',surahVerses=286;
    if(typeof MoonEngine!=='undefined'){
        const mp=MoonEngine.calculatePhase(now);
        moonPhaseName=mp.name; moonEmoji=mp.emoji;
        lunarDay=Math.floor(MoonEngine.getLunarDay(now));
        const h=MoonEngine.getHijriDate(now);
        hijriDay=h.day; hijriMonth=h.month;
        const moonPos=MoonEngine.getMoonEclipticLong(now);
        const mz=MoonEngine.getManzil(moonPos);
        manzilName=mz.name; manzilArabic=mz.arabic;
    }
    // Recitation plan
    if(typeof quranRecitationPlan!=='undefined'){
        const plan=quranRecitationPlan.find(p=>p.day===lunarDay)||quranRecitationPlan[0];
        surahOfTheDay=plan.surah; surahTheme=plan.theme; surahVerses=plan.verses;
    }
    // Day energy
    const dayNames=['Sunday — Sun (Leadership)','Monday — Moon (Emotions)','Tuesday — Mars (Action)','Wednesday — Mercury (Communication)','Thursday — Jupiter (Power Day!)','Friday — Venus (Ar-Rahman)','Saturday — Saturn (Shadow Work)'];
    dayEnergy=dayNames[now.getDay()];

    // Core verse data
    const coreVerses=[
        {id:'fajr',name:'Fajr — Protection',icon:'🌅',time:'Dawn prayer',
         action:'Recite Yunus dhikr × 100',
         arabic:'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
         translit:'La ilaha illa Anta, Subhanaka, inni kuntu min ad-dhalimin',
         translation:'There is no god but You, Glory be to You, I have been among the wrongdoers.',
         verse:'Surah Al-Anbiya 21:87',
         count:100,
         knowledge:'Yunus (AS) was swallowed by the whale for abandoning his people. In the deepest darkness, he called upon Allah and was delivered. This dhikr invokes divine protection through total surrender.',
         wisdom:'The whale\'s belly is not a prison — it\'s a womb. Your darkest moment is where you are reborn. Surrender is not weakness; it is the key that opens every locked door.',
         benefit:'Protection from harm, relief from anxiety, spiritual safety net, inner peace'},
        {id:'dhuhr',name:'Dhuhr — Light',icon:'☀️',time:'Midday prayer',
         action:'Recite Surah Ash-Shams × 1',
         arabic:'وَالشَّمْسِ وَضُحَاهَا',
         translit:'Wash-shamsi wa duhaaha',
         translation:'By the sun and its brightness.',
         verse:'Surah Ash-Shams 91:1',
         count:1,
         knowledge:'Ash-Shams (91) is MAHI\'s sun-surah. It speaks of the soul\'s capacity to purify or corrupt itself. The sun is the outer expression of inner light — your character IS your legacy.',
         wisdom:'Allah swore by the sun to emphasize that just as light is constant and reveals all things, your moral character reveals who you truly are. The sun does not hide — neither should your truth.',
         benefit:'Clarity of purpose, moral courage, leadership energy, divine light in actions'},
        {id:'asr',name:'Asr — Legacy',icon:'✍️',time:'Afternoon prayer',
         action:'Write one page (free writing)',
         arabic:'نُونٌ وَالْقَلَمِ وَمَا يَسْطُرُونَ',
         translit:'Nun. Wal-qalami wa ma yasturun',
         translation:'Nun. By the pen and what they write.',
         verse:'Surah Al-Qalam 68:1-4',
         count:1,
         knowledge:'Al-Qalam (68) opens with God swearing by the pen — the first tool of creation. Your writing is not just words; it is the architecture of your soul\'s legacy. Write daily, build eternally.',
         wisdom:'The pen was created before the tongue. Before you speak, write. Before you act, plan. The written word outlives the spoken one. Your daily page is your contribution to eternity.',
         benefit:'Writing legacy, creative manifestation, clarity of thought, intellectual growth'},
        {id:'maghrib',name:'Maghrib — Mercy',icon:'📖',time:'Sunset prayer',
         action:'Recite Surah Ar-Rahman × 1',
         arabic:'الرَّحْمَٰنُ. عَلَّمَ الْقُرْآنَ. خَلَقَ الْإِنسَانَ. عَلَّمَهُ الْبَيَانَ',
         translit:'Ar-Rahman. Allama al-Quran. Khalaqa al-insan. Allamahu al-bayan',
         translation:'The Compassionate. Taught the Quran. Created humanity. Taught them eloquence.',
         verse:'Surah Ar-Rahman 55:1-4',
         count:1,
         knowledge:'Ar-Rahman (55) is MAHI\'s teaching surah. It appears in 6 of MAHI\'s house cusps. The repeated question "Which of the favors of your Lord will you deny?" is a daily reminder of abundance.',
         wisdom:'Allah taught humanity eloquence — not just language, but the ability to express truth beautifully. Your teaching gift is not accidental; it is divinely installed. Use it daily.',
         benefit:'Teaching gift activation, abundance consciousness, gratitude, eloquence'},
        {id:'isha',name:'Isha — Wisdom',icon:'📝',time:'Night prayer',
         action:'Journal one insight from today',
         arabic:'إِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ',
         translit:'Innaka la\'ala khuluqin azeem',
         translation:'And you are of a great moral character.',
         verse:'Surah Al-Qalam 68:4',
         count:1,
         knowledge:'The day ends with reflection. Writing one insight crystallizes what Allah showed you today. The Quran says you are of great character — journaling helps you remember and embody that truth.',
         wisdom:'A day without reflection is a day wasted. The prophets reflected nightly. Your journal is a mirror that shows you who you are becoming. Write one truth, and tomorrow builds on it.',
         benefit:'Self-awareness, spiritual growth, pattern recognition, wisdom accumulation'}
    ];

    pl.innerHTML=coreVerses.map(p=>{
        const done=tp&&tp[p.id];
        return `<div class="practice-card ${done?'completed':''}" data-practice="${p.id}">
            <div class="practice-header">
                <div class="practice-icon">${p.icon}</div>
                <div class="practice-title">
                    <div class="practice-name">${p.name}</div>
                    <div class="practice-time">${p.time} — ${p.count>1?'Recite × '+p.count:p.action}</div>
                </div>
                <div class="practice-check">${done?'✓':'○'}</div>
            </div>
            <div class="practice-arabic">${p.arabic}</div>
            <div class="practice-translit">${p.translit}</div>
            <div class="practice-translation">${p.translation}</div>
            <div class="practice-source">${p.verse}</div>
            <div class="practice-knowledge">
                <div class="practice-section-title">Knowledge</div>
                <div>${p.knowledge}</div>
            </div>
            <div class="practice-wisdom">
                <div class="practice-section-title">Wisdom</div>
                <div>${p.wisdom}</div>
            </div>
            <div class="practice-benefit">
                <div class="practice-section-title">Output</div>
                <div>${p.benefit}</div>
            </div>
        </div>`;
    }).join('');

    // Add daily reading plan card
    let readingHTML=`<div class="practice-card reading-plan">
        <div class="practice-header">
            <div class="practice-icon">📖</div>
            <div class="practice-title">
                <div class="practice-name">Daily Surah — Lunar Day ${lunarDay}</div>
                <div class="practice-time">${surahOfTheDay} (${surahVerses} verses)</div>
            </div>
        </div>
        <div class="practice-knowledge">
            <div class="practice-section-title">Today\'s Reading</div>
            <div>Theme: ${surahTheme}</div>
        </div>
    </div>`;

    // Add manzil/nakshatra card
    readingHTML+=`<div class="practice-card cosmic-card">
        <div class="practice-header">
            <div class="practice-icon">🌙</div>
            <div class="practice-title">
                <div class="practice-name">Manzil of the Day</div>
                <div class="practice-time">${manzilName} (${manzilArabic})</div>
            </div>
        </div>
        <div class="practice-knowledge">
            <div class="practice-section-title">Cosmic Position</div>
            <div>Moon: ${moonEmoji} ${moonPhaseName} | Lunar Day ${lunarDay} | ${hijriDay} ${hijriMonth}</div>
            <div>Day Energy: ${dayEnergy}</div>
        </div>
    </div>`;

    pl.innerHTML+=readingHTML;

    document.querySelectorAll('.practice-card').forEach(item=>{
        item.addEventListener('click',()=>togglePractice(item.dataset.practice));
    });
    updateCompletionBadge();
}

function togglePractice(pid){
    const today=new Date().toDateString();
    let tp=AppState.practice.history.find(p=>p.date===today);
    if(!tp){ tp={date:today}; AppState.practice.history.push(tp); }
    tp[pid]=!tp[pid];
    const practices=['fajr','dhuhr','asr','maghrib','isha'];
    const completed=practices.filter(p=>tp[p]).length;
    if(completed===practices.length){
        const yest=new Date(Date.now()-86400000).toDateString();
        const yp=AppState.practice.history.find(p=>p.date===yest);
        if(AppState.practice.lastPractice===yest) AppState.practice.streak++;
        else if(AppState.practice.lastPractice!==today) AppState.practice.streak=1;
        AppState.practice.lastPractice=today;
    }
    saveState(); updatePracticeList(); updateStats();
}

function updateCompletionBadge(){
    const today=new Date().toDateString();
    const tp=AppState.practice.history.find(p=>p.date===today);
    const practices=['fajr','dhuhr','asr','maghrib','isha'];
    const completed=practices.filter(p=>tp&&tp[p]).length;
    const pct=Math.round((completed/practices.length)*100);
    const b=$('completionBadge'); if(b) b.textContent=pct+'%';
}

function updateStats(){
    const s=$('streakCount'),t=$('totalRecitations'),j=$('journalEntries');
    if(s) s.textContent=AppState.practice.streak;
    if(t) t.textContent=AppState.practice.totalRecitations;
    if(j) j.textContent=AppState.practice.journalEntries;
}

async function updateTransitInfo(){
    const ti=$('transitInfo'); if(!ti) return;
    const now=new Date();
    const dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayName=dayNames[now.getDay()];

    let moonPhaseStr='',moonEmoji='';
    if(typeof MoonEngine!=='undefined'){
        const mp=MoonEngine.calculatePhase(now);
        moonPhaseStr=mp.name; moonEmoji=mp.emoji;
    }

    let transitStr='';
    // Try loading from transits.json first, then fall back to TransitEngine
    try{
        const r=await fetch('data/transits.json');
        const transits=await r.json();
        if(transits.member_analyses&&transits.member_analyses.Kamel){
            const kamel=transits.member_analyses.Kamel;
            if(kamel.significant_transits&&kamel.significant_transits.length>0){
                transitStr=kamel.significant_transits.slice(0,4).map(t=>`${t.transit_planet} ${t.aspect} ${t.natal_planet} (${t.degrees_orb}°)`).join(', ');
            }
        }
    }catch(e){
        // Fall back to TransitEngine
        if(typeof TransitEngine!=='undefined'){
            if(typeof chartData==='undefined'||!chartData){
                try{ const r2=await fetch('data/chart.json'); chartData=await r2.json(); }catch(e2){}
            }
            const report=await TransitEngine.computeFullTransitReport(typeof chartData!=='undefined'?chartData:null);
            if(report.active.length>0){
                transitStr=report.active.map(a=>`${a.transit.symbol}${a.aspect.symbol}${a.natal.symbol} ${a.orb}°`).join(', ');
            } else if(report.building.length>0){
                transitStr='Building: '+report.building.slice(0,3).map(a=>`${a.transit.symbol}${a.aspect.symbol}${a.natal.symbol}`).join(', ');
            }
        }
    }

    if(!transitStr) transitStr='No tight aspects active';

    let hijriStr='';
    if(typeof MoonEngine!=='undefined'){
        const h=MoonEngine.getHijriDate(now);
        hijriStr=`${h.day} ${h.month} ${h.year} AH`;
    }

    ti.innerHTML=`
        <div class="transit-item"><strong>Day:</strong> ${dayName}</div>
        <div class="transit-item"><strong>Moon:</strong> ${moonEmoji} ${moonPhaseStr}</div>
        <div class="transit-item"><strong>Hijri:</strong> ${hijriStr}</div>
        <div class="transit-item"><strong>Aspects:</strong> ${transitStr}</div>
        <div class="transit-item"><strong>Energy:</strong> ${getDailyEnergy(now)}</div>
    `;
}

function updateMoonWidget(){
    const container=$('moonWidget'); if(!container) return;
    const now=new Date();
    if(typeof MoonVisual!=='undefined'&&typeof MoonEngine!=='undefined'){
        MoonVisual.renderMoonSVG('moonWidget',now);
        const mp=MoonEngine.calculatePhase(now);
        const label=document.createElement('div');
        label.style.cssText='text-align:center;color:var(--text-secondary);font-size:12px;margin-top:4px';
        label.textContent=`${mp.name} (${mp.illumination}%)`;
        container.appendChild(label);
    } else if(typeof MoonEngine!=='undefined'){
        const mp=MoonEngine.calculatePhase(now);
        container.innerHTML=`<div style="text-align:center;font-size:48px">${mp.emoji}</div><div style="text-align:center;color:var(--text-secondary)">${mp.name} (${mp.illumination}%)</div>`;
    }
}

async function updateTransitAspectsWidget(){
    const container=$('transitAspectsWidget');
    if(!container) return;

    // Try loading from transits.json
    try{
        const r=await fetch('data/transits.json');
        const transits=await r.json();
        if(transits.member_analyses&&transits.member_analyses.Kamel){
            const kamel=transits.member_analyses.Kamel;
            let html='<div class="transit-aspect-list">';
            html+='<h4 class="transit-section-title active-title">⚡ Active Transits for Kamel</h4>';
            if(kamel.significant_transits){
                kamel.significant_transits.forEach(t=>{
                    const color=t.intensity==='strong'?'var(--accent-gold)':'var(--text-secondary)';
                    html+=`<div class="aspect-row aspect-active">
                        <span class="aspect-transit-name">${t.transit_planet}</span>
                        <span class="aspect-type">${t.aspect}</span>
                        <span class="aspect-natal-name">${t.natal_planet}</span>
                        <span class="aspect-orb">${t.degrees_orb}°</span>
                    </div>`;
                });
            }
            if(kamel.predictions){
                html+='<h4 class="transit-section-title building-title">🔮 Predictions</h4>';
                kamel.predictions.forEach(p=>{
                    html+=`<div class="aspect-row aspect-building">
                        <span class="aspect-transit-name">${p.planet} ${p.aspect}</span>
                        <span class="aspect-natal-name">${p.natal_planet}</span>
                        <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">${p.theme}</div>
                        <div style="font-size:11px;color:var(--accent-blue);font-style:italic">${p.advice}</div>
                    </div>`;
                });
            }
            html+='</div>';
            container.innerHTML=html;
            return;
        }
    }catch(e){}

    // Fall back to TransitEngine
    if(typeof TransitEngine!=='undefined'){
        if(typeof chartData==='undefined'||!chartData){
            try{ const r2=await fetch('data/chart.json'); chartData=await r2.json(); }catch(e2){ return; }
        }
        TransitEngine.renderTransitCard('transitAspectsWidget', chartData).catch(()=>{});
    }
}

function getDailyEnergy(date){
    const day=date.getDay();
    const energies=['Sun - Leadership & authenticity','Moon - Emotional purification','Mars - Protection & discipline','Mercury - Communication & learning','Jupiter - Abundance & expansion (POWER DAY!)','Venus - Beauty & mercy (Ar-Rahman day)','Saturn - Shadow work & accountability'];
    return energies[day];
}

function updateDailyQuote(){
    const q=$('dailyQuote'); if(!q) return;
    const quotes=[
        {text:"I am both the whale and the swimmer.",source:"Your Mantra"},
        {text:"And you are of a great moral character.",source:"Surah Al-Qalam 68:4"},
        {text:"There is no god but You, Glory be to You.",source:"Surah Al-Anbiya 21:87"},
        {text:"The Compassionate taught the Quran.",source:"Surah Ar-Rahman 55:1-4"},
        {text:"By the pen and what they write.",source:"Surah Al-Qalam 68:1"},
        {text:"He taught eloquence.",source:"Surah Ar-Rahman 55:4"},
        {text:"Remember Me, and I will remember you.",source:"Surah Al-Baqarah 2:152"}
    ];
    const today=new Date().getDate();
    const quote=quotes[today%quotes.length];
    q.innerHTML=`<div class="quote-text">"${quote.text}"</div><div class="quote-source">— ${quote.source}</div>`;
}

function safeInitEmergencyButtons(){
    const modal=$('emergencyModal'),closeBtn=$('closeModal');
    if(closeBtn) closeBtn.addEventListener('click',closeModal);
    if(modal) modal.addEventListener('click',e=>{if(e.target.id==='emergencyModal')closeModal();});
    document.querySelectorAll('.emergency-btn').forEach(btn=>{
        btn.addEventListener('click',()=>showEmergencyPractice(btn.dataset.emotion));
    });
}

function showEmergencyPractice(emotion){
    const practices={
        anxious:{title:'When Feeling Anxious',verse:'Surah Ar-Rad 13:28 × 7',arabic:'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',transliteration:'Ala bi-dhikri Allahi tatma\'innu al-qulub',translation:'Verily, in the remembrance of Allah do hearts find tranquility.',dhikr:'Ya Salam × 100',action:'Take 10 deep breaths while reciting'},
        overwhelmed:{title:'When Feeling Overwhelmed',verse:'Surah Al-Anbiya 21:87 × 7',arabic:'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',transliteration:'La ilaha illa Anta, Subhanaka, inni kuntu min ad-dhalimin',translation:'There is no god but You, Glory be to You, I have been among the wrongdoers.',dhikr:'Ya Hafiz × 100',action:'Visualize yourself in the whale\'s belly (safe, protected)'},
        lost:{title:'When Feeling Lost',verse:'Surah Ad-Duhaa 93 × 7',arabic:'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',transliteration:'Wa la sawfa yu\'tika rabbuka fatarda',translation:'And your Lord will give you, and you will be satisfied.',dhikr:'Ya Musawwir × 100',action:'Remember: Allah has a plan for you'},
        misunderstood:{title:'When Feeling Misunderstood',verse:'Surah Al-Qalam 68:1-4 × 7',arabic:'إِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ',transliteration:'Innaka la\'ala khuluqin azeem',translation:'And you are of a great moral character.',dhikr:'Ya Alim × 100',action:'Read the full verse 68:4 and remember your worth'}
    };
    const p=practices[emotion]; if(!p) return;
    const titleEl=$('emergencyTitle'),bodyEl=$('emergencyBody'),modalEl=$('emergencyModal');
    if(titleEl) titleEl.textContent=p.title;
    if(bodyEl) bodyEl.innerHTML=`<div class="emergency-practice"><div class="practice-verse"><h4>${p.verse}</h4><p class="arabic-text">${p.arabic}</p><p class="transliteration">${p.transliteration}</p><p class="translation">${p.translation}</p></div><div class="practice-dhikr"><h4>Dhikr:</h4><p>${p.dhikr}</p></div><div class="practice-action"><h4>Action:</h4><p>${p.action}</p></div></div>`;
    if(modalEl) modalEl.classList.add('active');
}

function closeModal(){ const m=$('emergencyModal'); if(m)m.classList.remove('active'); }

function getMoonPhase(date){
    const y=date.getFullYear(),m=date.getMonth()+1,d=date.getDate();
    const c=Math.floor(365.25*y),e=Math.floor(30.6*m),jd=c+e+d-694039.09;
    const phase=jd/29.5305882,cycle=phase-Math.floor(phase);
    let name,icon;
    if(cycle<0.0625){name='New Moon';icon='🌑';}else if(cycle<0.1875){name='Waxing Crescent';icon='🌒';}
    else if(cycle<0.3125){name='First Quarter';icon='🌓';}else if(cycle<0.4375){name='Waxing Gibbous';icon='🌔';}
    else if(cycle<0.5625){name='Full Moon';icon='🌕';}else if(cycle<0.6875){name='Waning Gibbous';icon='🌖';}
    else if(cycle<0.8125){name='Last Quarter';icon='🌗';}else if(cycle<0.9375){name='Waning Crescent';icon='🌘';}
    else{name='New Moon';icon='🌑';}
    return {name,icon,cycle};
}

function safeLoadSettings(){
    const pn=$('profileName'),bd=$('birthDate'),bt=$('birthTime'),bl=$('birthLocation');
    if(pn) pn.value=AppState.settings.name;
    if(bd) bd.value=AppState.settings.birthDate;
    if(bt) bt.value=AppState.settings.birthTime;
    if(bl) bl.value=AppState.settings.birthLocation;
    const eb=$('exportData'),ib=$('importData'),cb=$('clearData');
    if(eb) eb.addEventListener('click',exportData);
    if(ib) ib.addEventListener('click',importData);
    if(cb) cb.addEventListener('click',clearData);
}

function saveSettings(){
    const pn=$('profileName'),bd=$('birthDate'),bt=$('birthTime'),bl=$('birthLocation');
    AppState.settings={name:pn?pn.value:AppState.settings.name,birthDate:bd?bd.value:AppState.settings.birthDate,birthTime:bt?bt.value:AppState.settings.birthTime,birthLocation:bl?bl.value:AppState.settings.birthLocation,fajrReminder:true,asrReminder:true,maghribReminder:true,ishaReminder:true};
    localStorage.setItem('settings',JSON.stringify(AppState.settings));
}

function exportData(){
    const data={practice:AppState.practice,settings:AppState.settings,exportDate:new Date().toISOString()};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url; a.download=`mahi-backup-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url);
}

function importData(){
    const input=document.createElement('input'); input.type='file'; input.accept='.json';
    input.onchange=e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>{try{const d=JSON.parse(ev.target.result);if(d.practice)AppState.practice=d.practice;if(d.settings)AppState.settings=d.settings;localStorage.setItem('practice',JSON.stringify(AppState.practice));localStorage.setItem('settings',JSON.stringify(AppState.settings));alert('Data imported!');safeLoadSettings();initDashboard();}catch(err){alert('Invalid file');}};r.readAsText(f);}};input.click();
}

function clearData(){
    if(confirm('Clear all data? Cannot be undone.')){localStorage.removeItem('practice');localStorage.removeItem('settings');AppState.practice={streak:0,totalRecitations:0,journalEntries:0,lastPractice:null,history:[]};AppState.settings={name:'Kamel M. Abdelghani',birthDate:'1996-03-06',birthTime:'14:00',birthLocation:'El Bayadh, Algeria',fajrReminder:true,asrReminder:true,maghribReminder:true,ishaReminder:true};alert('Cleared!');safeLoadSettings();initDashboard();}
}

function saveState(){ localStorage.setItem('practice',JSON.stringify(AppState.practice)); }
function initRuqya(){
    // Ruqya page is static HTML - no dynamic loading needed
    // This function ensures the page is properly displayed
    console.log('Ruqya Guide page loaded');
}

function initDailyPractice(){
    console.log('Daily Practice page loaded');
    if(typeof RecitationEngine!=='undefined'){
        RecitationEngine.init();
        RecitationEngine.renderAllVerses('mahiVersesGrid');
    }
}

function initLearning(){
    // Learning Hub is now static Vedic Astrology content
    // This function ensures the page is properly displayed
    console.log('Learning Hub page loaded');
}

async function initSoul(){
    if(typeof chartData==='undefined'||!chartData){
        try{ const r=await fetch('data/chart.json'); chartData=await r.json(); }catch(e){
            ['soulPurpose','pastLife','challenges','gifts'].forEach(id=>{const el=$(id);if(el)el.innerHTML='<p style="color:var(--text-secondary)">Chart data unavailable. Run the Python backend to generate chart.json.</p>';});
            return;
        }
    }
    const planets=chartData.planets||{};
    const sp=$('soulPurpose'),pl=$('pastLife'),ch=$('challenges'),gf=$('gifts');

    // Derive soul purpose from Moon nakshatra (Anuradha/Uttara Phalguni) and Sun sign
    const moon=planets.Moon||{};
    const sun=planets.Sun||{};
    const rahu=planets.Rahu||{};
    const ketu=planets.Ketu||{};

    if(sp) sp.innerHTML=`<p style="color:var(--text-primary);line-height:1.6;font-size:15px">Your soul is guided by ${moon.nakshatra||'devotion'} energy (Moon in ${moon.sign||'Virgo'}), expressing through ${sun.sign||'Aquarius'} consciousness (${sun.nakshatra||'Purva Bhadra'}).</p><p style="color:var(--accent-gold);margin-top:8px;font-style:italic">Karmic Architect — building divine order through innovation</p>`;
    if(pl) pl.innerHTML=`<p style="color:var(--text-primary);line-height:1.6">Past life mastery: Ketu in ${ketu.sign||'Pisces'} (${ketu.nakshatra||'Revati'}) — spiritual depth, intuition, surrender. The infinite was your home.</p>`;
    if(ch) ch.innerHTML=`<p style="color:var(--text-primary);line-height:1.6">Current challenge: Rahu in ${rahu.sign||'Virgo'} (${rahu.nakshatra||'Chitra'}) — precision, service, daily practice. Make the invisible visible.</p><p style="color:var(--accent-gold);margin-top:8px;font-size:13px"><strong>Growth Edge:</strong> From dissolution (Pisces) to craftsmanship (Virgo)</p>`;
    if(gf) gf.innerHTML=`<p style="color:var(--text-primary);line-height:1.6">Spiritual gifts: ${sun.nakshatra||'Purva Bhadra'} fire (teaching authority), ${moon.nakshatra||'Uttara Phalguni'} warmth (service through devotion), ${rahu.nakshatra||'Chitra'} vision (architectural beauty).</p>`;
}

async function initSurahs(){
    const grid=$('surahGrid'); const search=$('surahSearch'); if(!grid) return;
    let verses=null;
    try{ const r=await fetch('data/verses.json'); verses=await r.json(); }catch(e){
        grid.innerHTML='<div style="color:var(--text-secondary);padding:20px;text-align:center">Verse data unavailable. Run the Python backend to generate verses.json.</div>';
        return;
    }
    if(!verses) return;
    const surahList = verses.surahs || [];
    if(!surahList.length) return;
    function renderSurahs(filter=''){
        const f=filter.toLowerCase();
        const matched=surahList.filter(s=>!f||s.name.toLowerCase().includes(f)||s.meaning.toLowerCase().includes(f)||String(s.number).includes(f));
        grid.innerHTML=matched.map(s=>`<div class="surah-card" onclick="navigateTo('verses')" style="background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:8px;padding:16px;cursor:pointer;transition:transform 0.2s" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'"><div style="font-size:14px;color:var(--accent-gold);font-weight:600;margin-bottom:4px">Surah ${s.number}</div><div style="font-size:16px;color:var(--text-primary);font-weight:600;margin-bottom:4px">${s.name}</div><div style="font-size:13px;color:var(--text-secondary)">${s.meaning}</div></div>`).join('');
    }
    renderSurahs();
    if(search) search.addEventListener('input',()=>renderSurahs(search.value));
}

async function initDestiny(){
    let dashaData=null;
    try{ const r=await fetch('data/dasha.json'); dashaData=await r.json(); }catch(e){ return; }
    if(!dashaData) return;

    const timeline=$('dashaTimeline');
    const current=$('currentDasha');
    const timing=$('timingWindows');

    const allDashas=dashaData.sequence.filter(d=>d.years>0).map(d=>({
        dasha:d.lord,
        start:d.start,
        end:d.end,
        lord:d.lord,
        years:d.years
    }));

    const now=new Date();
    const currentDasha=allDashas.find(d=>now>=new Date(d.start)&&now<new Date(d.end));

    if(timeline){
        timeline.innerHTML=allDashas.map(d=>{
            const isActive=now>=new Date(d.start)&&now<new Date(d.end);
            const isPast=now>=new Date(d.end);
            return `<div style="display:flex;align-items:center;padding:10px;border-left:3px solid ${isActive?'var(--accent-gold)':isPast?'#555':'var(--accent-blue)'};margin-bottom:8px;background:${isActive?'rgba(255,215,0,0.1)':'var(--bg-tertiary)'};border-radius:0 8px 8px 0">
                <div style="width:60px;font-weight:600;color:${isActive?'var(--accent-gold)':'var(--text-primary)'}">${d.dasha}</div>
                <div style="flex:1;font-size:12px;color:var(--text-secondary)">${d.start} → ${d.end} (${d.years}y)</div>
                ${isActive?'<div style="color:var(--accent-gold);font-size:12px;font-weight:600">← CURRENT</div>':''}
            </div>`;
        }).join('');
    }

    if(current){
        const cd=dashaData.current;
        const md=cd.maha_dasha;
        const bh=cd.bhukti;
        current.innerHTML=`<div style="padding:16px;background:var(--bg-tertiary);border-radius:8px;border-left:4px solid var(--accent-gold)">
            <div style="font-size:20px;font-weight:700;color:var(--accent-gold);margin-bottom:8px">${md.lord} Maha Dasha</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">${md.start} → ${md.end} (${md.years} years)</div>
            <div style="font-size:14px;color:var(--text-primary);margin-bottom:8px"><strong>Bhukti:</strong> ${bh.lord} (${bh.start} → ${bh.end})</div>
            <div style="font-size:13px;color:var(--accent-blue);font-style:italic;margin-bottom:8px">Sub-period: ${bh.lord} (${bh.days} days, ${bh.years} years)</div>
        </div>`;
    }

    if(timing){
        const mdEnd=dashaData.current&&dashaData.current.maha_dasha?dashaData.current.maha_dasha.end:'2035-06-05';
        const mdLord=dashaData.current&&dashaData.current.maha_dasha?dashaData.current.maha_dasha.lord:'Jupiter';
        const events=[
            {date:'2026-08-31',event:'CCA-F Certification Target',type:'career'},
            {date:mdEnd,event:mdLord+' Dasha ends → next begins',type:'dasha'},
            {date:'2026-09-01',event:'Thirduni AI Training Program',type:'career'}
        ];
        timing.innerHTML=events.map(e=>{
            const d=new Date(e.date);
            const diff=Math.ceil((d-now)/(1000*60*60*24));
            const color=e.type==='career'?'var(--accent-blue)':e.type==='dasha'?'var(--accent-gold)':'#22c55e';
            return `<div style="display:flex;align-items:center;padding:10px;background:var(--bg-tertiary);border-radius:8px;margin-bottom:6px;border-left:3px solid ${color}">
                <div style="width:90px;font-size:12px;color:var(--text-secondary)">${e.date}</div>
                <div style="flex:1;font-size:14px;color:var(--text-primary)">${e.event}</div>
                <div style="font-size:12px;color:${diff>0?'var(--accent-gold)':'var(--text-secondary)'}">${diff>0?diff+' days':'Past'}</div>
            </div>`;
        }).join('');
    }
}

// ============================================
// ACTION BIG THREE — Karmic Engine
// ============================================
function renderActionBigThree(){
    const el=$('actionBigThree'); if(!el) return;
    el.innerHTML=`
    <div class="big-three-grid">
        <!-- MC Pisces -->
        <div class="big-three-item mc-pisces">
            <div class="big-three-symbol">♆</div>
            <div class="big-three-label">MC — Career Calling</div>
            <div class="big-three-position">Pisces 6.8° • Revati Nakshatra</div>
            <div class="big-three-deity">Pushan — The Divine Shepherd</div>
            <div class="big-three-meaning">
                <strong>What it means:</strong> Your career is not a job — it's a calling. Pisces MC means the world sees you as a guide, a healer, one who dissolves boundaries between ignorance and wisdom. Revati ("the wealthy one") means your wealth comes through spiritual service, not material accumulation.
            </div>
            <div class="big-three-quranic">
                <span class="big-three-verse">Surah Ar-Rahman 55:1-4</span>
                <em>"The Compassionate. Taught the Quran. Created humanity. Taught them eloquence."</em>
                <br>Your career IS teaching. Not in a classroom — through every system you build, every document you format, every student you guide.
            </div>
            <div class="big-three-action">
                <strong>Action:</strong> Follow the call to serve. Don't wait for permission. Your teaching platform, your freelancing, your DSS — these are all expressions of Pisces MC.
            </div>
        </div>

        <!-- Mars Aquarius -->
        <div class="big-three-item mars-aquarius">
            <div class="big-three-symbol">♂</div>
            <div class="big-three-label">Mars — Your Engine</div>
            <div class="big-three-position">Aquarius 22° • Purva Bhadra Nakshatra</div>
            <div class="big-three-deity">Aja Ekapada — The One-Footed Fire Goat</div>
            <div class="big-three-meaning">
                <strong>What it means:</strong> You don't fight with fists. You fight with ideas, systems, and rebellion. Mars in Aquarius means your anger rises when you see injustice, inefficiency, or people trapped by broken systems. Your response is to <em>build something better</em>.
            </div>
            <div class="big-three-quranic">
                <span class="big-three-verse">Surah Al-Qalam 68:1-4</span>
                <em>"Nun. By the pen and what they write. Indeed, you are of a great moral character."</em>
                <br>22° is a critical degree — you go all in or you don't start. The pen is your weapon. Build systems that fix what angers you.
            </div>
            <div class="big-three-action">
                <strong>Action:</strong> When frustrated with broken systems, ask: "What can I build to fix this?" Channel anger into creation, not destruction. Your DSS is Mars Aquarius energy — fixing inventory management through innovation.
            </div>
        </div>

        <!-- Rahu Virgo -->
        <div class="big-three-item rahu-virgo">
            <div class="big-three-symbol">☊</div>
            <div class="big-three-label">North Node — Your Growth Edge</div>
            <div class="big-three-position">Virgo 25.15° • Chitra Nakshatra</div>
            <div class="big-three-deity">Vishvakarma — The Cosmic Architect</div>
            <div class="big-three-meaning">
                <strong>What it means:</strong> Your South Node (Ketu) is in Pisces — you already know how to dissolve, surrender, connect to the infinite. But your soul chose Virgo for this life: precision, service, daily practice, craftsmanship. You must make the invisible visible.
            </div>
            <div class="big-three-quranic">
                <span class="big-three-verse">Surah Al-Baqarah 2:1-5</span>
                <em>"This is the Book about which there is no doubt, a guidance for those conscious of Allah."</em>
                <br>The Quran is a Virgo Rahu creation — infinite wisdom (Pisces) organized into precise verses, chapters, and structures (Virgo). Your job is to do the same with your knowledge.
            </div>
            <div class="big-three-action">
                <strong>Action:</strong> Return to daily practice when scattered. Write one page. Format one document. Build one system. Completion breeds momentum. Vishvakarma didn't dream the city — he BUILT it.
            </div>
        </div>
    </div>

    <!-- Karmic Story -->
    <div class="big-three-story">
        <h4>Your Karmic Story</h4>
        <div class="karmic-flow">
            <div class="karmic-step">
                <div class="karmic-label">PAST (Ketu Pisces)</div>
                <div class="karmic-text">"I know the infinite"</div>
                <div class="karmic-detail">Gift: Spiritual depth, intuition, compassion. Trap: Passivity, giving power away to institutions.</div>
            </div>
            <div class="karmic-arrow">→</div>
            <div class="karmic-step">
                <div class="karmic-label">PRESENT (Mars Aquarius)</div>
                <div class="karmic-text">"I fight through innovation"</div>
                <div class="karmic-detail">Engine: Revolutionary fire, systems thinking. Trap: Rebellion for rebellion's sake.</div>
            </div>
            <div class="karmic-arrow">→</div>
            <div class="karmic-step">
                <div class="karmic-label">FUTURE (Rahu Virgo)</div>
                <div class="karmic-text">"I build with precision"</div>
                <div class="karmic-detail">Direction: Craftsmanship, daily practice, service. Trap: Perfectionism paralysis.</div>
            </div>
        </div>
    </div>`;
}

// ============================================
// QURANIC BLUEPRINT — Hidden Architecture
// ============================================
function renderQuranBlueprint(){
    const el=$('quranBlueprint'); if(!el) return;

    // Deep Quranic-mystical mapping based on MAHI's chart
    const blueprint={

        // The 7 Openers (Al-Hawamim) — 7 Surahs opening with "Ha-Mim"
        // These map to 7 spiritual stations. MAHI has Moon in Scorpio (Anuradha)
        // which resonates with Surah Ghafir (40) — "The Forgiver" (Ha-Mim #4)
        hawamim:[
            {num:40,name:'Ghafir',meaning:'The Forgiver — Forgiveness through spiritual fire',resonance:'Moon in Scorpio (Anuradha) — Devotion transforms through fire, forgiveness is the key'},
            {num:41,name:'Fussilat',meaning:'Explained in Detail — Clarity from chaos',resonance:'Gemini ASC — You explain complex truths clearly'},
            {num:42,name:'Ash-Shura',meaning:'The Consultation — Collaborative wisdom',resonance:'Mars in Aquarius — You consult with the future, not the past'},
            {num:43,name:'Az-Zukhruf',meaning:'The Ornaments — Beauty in truth',resonance:'Venus in Aries — Beauty through bold creation'},
            {num:44,name:'Ad-Dukhan',meaning:'The Smoke — Sign before the truth',resonance:'Saturn in Aquarius — Patience before revelation'},
            {num:45,name:'Al-Jathiyah',meaning:'The Crouching — Submission before Allah',resonance:'Ketu in Pisces — Surrender is your past-life mastery'},
            {num:46,name:'Al-Ahqaf',meaning:'The Wind-curved Sandhills — Patience with creation',resonance:'Jupiter in Sagittarius — Expansion through patience'}
        ],

        // The Mysterious Letters (Huruf Muqatta'at) — their hidden connection to MAHI
        huruf:[
            {letter:'Alif-Lam',surahs:'2 (Al-Baqarah), 3 (Ali Imran)',meaning:'Alif = Allah\'s Oneness, Lam = Lordship. Together = "Allah, the Lord." This is the foundational declaration.',mahi:'Your Gemini ASC makes you the communicator of Alif-Lam — you translate divine unity into human language.'},
            {letter:'Alif-Lam-Mim',surahs:'2,3,29,30,31,32',meaning:'Alif-Lam-Mim = "Allah, the Lord, the Knower." Three letters = three dimensions of reality.',mahi:'Your Sun in Aquarius + Mars in Aquarius = you know (Alim) through innovation, not tradition.'},
            {letter:'Ya-Sin',surahs:'36',meaning:'Ya = O (calling), Sin = the letter of revelation. "O Revelation!" The heart of the Quran.',mahi:'Venus in Aries 11th house = your heart beats for creative revelation. You are Ya-Sin incarnate — called to reveal through beauty.'},
            {letter:'Ha-Mim',surahs:'40-46 (7 Surahs)',meaning:'Ha = the breath of the Merciful, Mim = the essence of creation. Together = the divine breath that brings all things into being.',mahi:'Your chart has 4 planets in Aquarius — you are a Ha-Mim generator. Every breath you take creates new possibilities.'},
            {letter:'Ta-Ha',surahs:'20',meaning:'Ta = truth, Ha = revelation. "O Truth-Revealer!" Addressed to Prophet Muhammad (SAW).',mahi:'Moon in Scorpio (Anuradha) = you reveal hidden truths through emotional depth and devotion.'},
            {letter:'Nun',surahs:'68 (Al-Qalam)',meaning:'Nun = the primordial ink, the first point from which all creation emerges. "By the Pen!"',mahi:'This is YOUR letter. Al-Qalam 68:1-4 is your core verse. Nun is the cosmic pen — and you are its writer.'},
            {letter:'Qaf',surahs:'50,42',meaning:'Qaf = the dome of heaven, the cosmic vault. "By the Quran!" The container of all truth.',mahi:'Saturn in Aquarius 10th house = you are building the Qaf — the container (DSS, teaching system) that holds truth.'}
        ],

        // The 28 Mansions of the Moon — Quranic correspondences
        // MAHI's Moon is at Batn al-Hut (28) — the Fish's Belly
        mansions_quranic:[
            {num:28,name:'Batn al-Hut',quranic:'Yunus (21:87) — "There is no god but You, Glory be to You, I have been among the wrongdoers"',mahi:'YOUR PERSONAL MANZIL. When Moon returns here (every 27.3 days), it triggers the Yunus energy — surrender in the deep, protection through prayer. This is your monthly reset point.'},
            {num:17,name:'Al-Iklil (Scorpio)',quranic:'Ar-Rahman (55:1-4) — The Crown of Mercy',mahi:'Your Moon sits here in Scorpio. The crown (Iklil) represents the highest point of spiritual attainment through devotion (Anuradha).'},
            {num:7,name:'Al-Dhira (Cancer)',quranic:'Maryam (19) — The Arm that holds the child',mahi:'Your Cancer 4th house = home, mother, roots. Al-Dhira is the arm — your foundation is built on nurturing.'}
        ],

        // The Quran's mathematical miracle — 19
        // The Quran has 114 Surahs (114 = 6 × 19)
        // Bismillah has 19 letters
        // MAHI's chart has mathematical patterns
        numerology:{
            quran_19:'The Quran is encoded with the number 19 (74:30). 114 Surahs = 6×19. Bismillah = 19 Arabic letters. The verse of legal testimony (2:282) is the longest — 19 words.',
            mahi_chart:'Your chart has Aquarius stellium (4 planets) — Aquarius is the 11th sign. 11 is the master number. 11 × 19 = 209. Your birth day (6) × your birth month (3) = 18. 18 + 1 = 19. You carry the Quranic code in your birth date.',
            alif_lam:'Alif (1) + Lam (30) = 31. 31 is the 11th prime. Your Sun is at 22° (11×2). The divine code runs through your chart.'
        },

        // Deeper Surah correspondences — undiscovered connections
        hidden_surahs:[
            {surah:55,name:'Ar-Rahman',hidden:'Refrain: "Which of the favors of your Lord will you deny?" — appears 31 times. 31 = Alif-Lam = Allah. The refrain is a mirror: every favor IS Allah.',mahi:'This surah appears in 6 of your house cusps. You are Ar-Rahman incarnate — the living question "Which favor will you deny?" Every system you build is a favor.'},
            {surah:68,name:'Al-Qalam',hidden:'Opens with Nun — the cosmic pen. The surah is about moral character (khuluq). In Arabic, khuluq also means "creation" — your character IS your creation.',mahi:'Your core verse. The pen writes destiny — but the character of the writer determines what is written.'},
            {surah:97,name:'Al-Qadr',hidden:'"The Night of Power is better than a thousand months" (97:3). 1000 months = 83.3 years — a full human life. One night of divine encounter > entire lifetime of effort.',mahi:'Saturn in Aquarius 10th house = you are building toward a "Night of Power" moment in your career. One breakthrough > decades of work.'},
            {surah:93,name:'Ad-Duhaa',hidden:'"Your Lord has not abandoned you, nor has He become hateful" (93:3). This was revealed after a period of revelation silence. The promise: after silence comes expansion.',mahi:'When you feel stuck or abandoned (and you will), Ad-Duhaa is your reminder: the silence is not punishment. It\'s preparation.'},
            {surah:94,name:'Ash-Sharh',hidden:'"Verily, with hardship comes ease" (94:6). The Arabic is "ma\'al-usri yusra" — WITH hardship, not AFTER. Ease is embedded in the difficulty itself.',mahi:'Your entire chart is built on this principle. Moon debilitated in Scorpio WITH cancellation = ease embedded in hardship. Rahu Virgo = building precision FROM chaos.'}
        ],

        // The Quran's 5 categories of people — mapped to MAHI's chart
        people_categories:[
            {category:'Ulul Albab (People of Understanding)',verse:'3:190-191',meaning:'"Those who remember Allah while standing, sitting, or lying on their sides, reflecting on the creation of the heavens and the earth."',mahi:'Sun in Aquarius 9th house = you reflect on cosmic systems. Ulul Albab is YOUR category — the ones who see Allah in patterns, systems, and architecture.'},
            {category:'Ibād ar-Rahmān (Servants of the Merciful)',verse:'25:63-76',meaning:'The 8 characteristics: walk humbly, greet with peace, pray at night, seek forgiveness, stand for justice, do not worship idols, do not kill, do not commit adultery.',mahi:'Moon in Scorpio Anuradha = devotion personified. You are building toward becoming Ibād ar-Rahmān through daily practice (Fajr, Asr, Maghrib).'},
            {category:'Muhsinūn (Those Who Do Excellence)',verse:'2:195, 3:134, 3:146',meaning:'"Allah loves the Muhsinūn" — those who do ihsan (excellence/beauty) in everything. Not just good — BEAUTIFULLY good.',mahi:'Chitra Nakshatra (Rahu Virgo) = the architect who creates beauty. Muhsinūn is your calling — not just formatting documents, but making them beautiful.'}
        ]
    };

    el.innerHTML=`
    <div class="quran-section">
        <h4 class="quran-section-title">The 7 Openers (Al-Hawamim) — Your Station</h4>
        <p class="quran-section-intro">Seven Surahs open with "Ha-Mim" — the divine breath. Your Moon in Scorpio (Anuradha) resonates with Surah Ghafir (#4) — "The Forgiver." Forgiveness through spiritual fire is your emotional core.</p>
        <div class="hawamim-grid">
            ${blueprint.hawamim.map(h=>`<div class="hawamim-item ${h.num===40?'highlight':''}">
                <div class="hawamim-num">${h.num}</div>
                <div class="hawamim-name">${h.name}</div>
                <div class="hawamim-meaning">${h.meaning}</div>
                <div class="hawamim-resonance">${h.resonance}</div>
            </div>`).join('')}
        </div>
    </div>

    <div class="quran-section">
        <h4 class="quran-section-title">The Mysterious Letters (Huruf Muqatta'at) — Your Code</h4>
        <p class="quran-section-intro">29 Surahs begin with mysterious Arabic letters that no human authored. They are Allah's encryption — keys to the Quran's deeper dimensions. Your chart holds specific resonances with these codes.</p>
        <div class="huruf-list">
            ${blueprint.huruf.map(h=>`<div class="huruf-item ${h.letter==='Nun'?'highlight':''}">
                <div class="huruf-letter">${h.letter}</div>
                <div class="huruf-surahs">Surahs: ${h.surahs}</div>
                <div class="huruf-meaning">${h.meaning}</div>
                <div class="huruf-mahi">${h.mahi}</div>
            </div>`).join('')}
        </div>
    </div>

    <div class="quran-section">
        <h4 class="quran-section-title">Hidden Surah Wisdom — Undiscovered Connections</h4>
        <div class="hidden-surahs">
            ${blueprint.hidden_surahs.map(h=>`<div class="hidden-surah-item">
                <div class="hidden-surah-name">Surah ${h.name} (${h.surah})</div>
                <div class="hidden-surah-wisdom">${h.hidden}</div>
                <div class="hidden-surah-mahi">${h.mahi}</div>
            </div>`).join('')}
        </div>
    </div>

    <div class="quran-section">
        <h4 class="quran-section-title">Quranic Categories — Where You Belong</h4>
        <div class="categories-grid">
            ${blueprint.people_categories.map(c=>`<div class="category-item">
                <div class="category-name">${c.category}</div>
                <div class="category-verse">${c.verse}</div>
                <div class="category-meaning">${c.meaning}</div>
                <div class="category-mahi">${c.mahi}</div>
            </div>`).join('')}
        </div>
    </div>

    <div class="quran-section">
        <h4 class="quran-section-title">The Quranic Code — Your Birth Date</h4>
        <div class="numerology-box">
            <p>${blueprint.numerology.quran_19}</p>
            <p>${blueprint.numerology.mahi_chart}</p>
            <p>${blueprint.numerology.alif_lam}</p>
        </div>
    </div>`;
}

// ============================================
// DAILY QURANIC WISDOM — Undiscovered
// ============================================
function renderDailyQuranWisdom(){
    const el=$('dailyQuranWisdom'); if(!el) return;
    const now=new Date();
    const lunarDay=Math.floor(typeof MoonEngine!=='undefined'?MoonEngine.getLunarDay(now):1);

    const wisdoms=[
        {day:1,verse:'Al-Baqarah 2:286',wisdom:'"Allah does not burden a soul beyond that it can bear." Every challenge in your DSS, freelancing, or career is calibrated to your capacity. The weight IS the proof of your strength.',mahi:'Your Moon debilitated WITH cancellation = Allah gave you a heavy soul AND the capacity to bear it. The cancellation is the proof.'},
        {day:2,verse:'Al-Baqarah 2:152',wisdom:'"Remember Me, and I will remember you." This is not poetic — it\'s a contract. Every Fajr dhikr, every Al-Qalam recitation, every Ar-Rahman recitation is you remembering. Allah\'s response is guaranteed.',mahi:'Your practice list IS this contract in action. Fajr × 100, Asr writing, Maghrib recitation — you remember, He remembers.'},
        {day:3,verse:'Al-Baqarah 2:186',wisdom:'"I am near. I respond to the prayer of the supplicant when he prays to Me." Notice: Allah doesn\'t say "IF he prays" — He says "WHEN." The prayer is assumed. Your existence IS a prayer.',mahi:'Gemini ASC = your very presence is a communication with the divine. You don\'t need to "find time to pray" — your life IS the prayer.'},
        {day:5,verse:'Al-An\'am 6:102',wisdom:'"Your god is one god. There is no deity except Him, the Entirely Merciful, the Especially Merciful." Two mercies: Ar-Rahman (general, to all creation) and Ar-Rahim (specific, to the believers).',mahi:'Ar-Rahman appears in 6 of your house cusps. You carry BOTH mercies — general compassion for all + specific wisdom for those you teach.'},
        {day:7,verse:'Al-A\'raf 7:56',wisdom:'"Cause not corruption on the earth after its reformation." After Allah creates order, our job is to MAINTAIN it — not reinvent it. Sometimes the most spiritual act is to preserve what works.',mahi:'Your DSS is not just creating — it\'s preserving academic knowledge, formatting standards, educational systems. Maintenance IS worship.'},
        {day:10,verse:'Yunus 10:57',wisdom:'"O mankind, there has come to you an instruction from your Lord and a healing for what is in the chests." The Quran heals what no medicine can — the diseases of the heart.',mahi:'Moon in Scorpio = emotional depths that need healing. The Quran IS your medicine. Every recitation heals a chest that nothing else can reach.'},
        {day:14,verse:'Al-Anbiya 21:30',wisdom:'"The heavens and the earth were joined together, then We separated them." Before creation, everything was ONE. Your spiritual gift (Ketu Pisces) remembers this unity. Your task (Rahu Virgo) is to build systems that reconnect people to it.',mahi:'Your life IS this verse: from unity (Pisces past) to separation (Aquarius present) to reconnection through service (Virgo future).'},
        {day:15,verse:'Al-Mu\'minun 23:1-2',wisdom:'"Successful indeed are the believers who are humble in their prayers." Success (falāḥ) in the Quran is not wealth — it\'s the ability to bow. Humility is the ultimate power.',mahi:'Saturn in Aquarius 10th = your public success comes through humility (Saturn) not ego. The one who builds systems for others succeeds.'},
        {day:18,verse:'Luqman 31:17-19',wisdom:'"Be moderate in your bearing, and lower your voice." Luqman\'s advice to his son: be humble, speak softly, walk gently. The greatest wisdom is not in what you say but HOW you say it.',mahi:'Gemini ASC + Mercury in Aquarius = you communicate for a living. Luqman\'s advice is your professional code: moderate, humble, soft.'},
        {day:20,verse:'Ghafir 40:60',wisdom:'"Call upon Me; I will respond to you." This is the Ha-Mim surah that resonates with your Moon in Scorpio. The promise is direct, unconditional, immediate. Call. Response is guaranteed.',mahi:'Your Ya Hafiz × 100 at Fajr IS this verse in action. You call. He responds. The whale\'s belly is not a prison — it\'s a response.'},
        {day:24,verse:'Ar-Rahman 55:13',wisdom:'"So which of the favors of your Lord would you deny?" This question appears 31 times — once for each letter of Alif-Lam (Allah). Every favor IS Allah. Denying a favor is denying Allah.',mahi:'Ar-Rahman in 6 house cusps = you are the living embodiment of this question. Every system you build asks: "Which favor will you deny?"'},
        {day:28,verse:'Al-Qalam 68:4',wisdom:'"Indeed, you are of a great moral character." This is not flattery — it\'s a divine declaration. Your character (khuluq) is your creation (khuluq). What you ARE is what you CREATE.',mahi:'This is YOUR verse. The pen (Nun) writes your destiny, but your CHARACTER determines what is written. Al-Qalam is your birthright.'},
        {day:30,verse:'An-Nas 114:1-6',wisdom:'"Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer." The final Surah is about PROTECTION from whispering — both external and internal.',mahi:'Your Fajr practice (Yunus dhikr × 100) IS seeking refuge. The whispering is the doubt that says "you\'re not enough." Al-Nas says: you ARE enough, because Allah is your refuge.'}
    ];

    const todayWisdom=wisdoms.find(w=>w.day===lunarDay)||wisdoms[0];

    el.innerHTML=`
    <div class="wisdom-today">
        <div class="wisdom-verse-ref">Surah ${todayWisdom.verse}</div>
        <div class="wisdom-text">${todayWisdom.wisdom}</div>
        <div class="wisdom-mahi">${todayWisdom.mahi}</div>
    </div>
    <div class="wisdom-all">
        <h4>All 30 Days of Quranic Wisdom</h4>
        <div class="wisdom-grid">
            ${wisdoms.map(w=>`<div class="wisdom-item ${w.day===lunarDay?'active':''}">
                <div class="wisdom-day">Day ${w.day}</div>
                <div class="wisdom-verse">${w.verse}</div>
                <div class="wisdom-snippet">${w.wisdom.substring(0,120)}...</div>
            </div>`).join('')}
        </div>
    </div>`;
}

window.navigateTo=navigateTo;
window.toggleTheme=toggleTheme;
