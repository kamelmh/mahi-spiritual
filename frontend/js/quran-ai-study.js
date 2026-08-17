/**
 * QuranAIStudy — AI-Enhanced Quran Study & Memorization System
 * =============================================================
 * Features:
 * 1. AI Tafsir Explorer — contextual ayah analysis with word-by-word breakdown
 * 2. AI Memorization Coach — forgetting curve analysis, optimal review scheduling
 * 3. Smart Quiz System — AI-generated quizzes from memorized portions
 * 4. Daily AI Reflection — personalized daily Quran reflection
 * 5. Thematic Connections — find related ayahs by theme/concept
 * 6. Voice Analysis — recitation recording with pace/accuracy tracking
 * 7. Progress Analytics — deep study analytics and insights
 */
const QuranAIStudy = (function() {
    'use strict';

    const STORAGE_KEY = 'mahi-quran-ai-study';
    const AL_QURAN_API = 'https://api.alquran.cloud/v1';

    // ─── Comprehensive Arabic Root Dictionary ───
    // Common Quranic roots with meanings, forms, and occurrences
    const ARABIC_ROOTS = {
        'ك ت ب': { meaning: 'to write', english: 'Write/Writing', related: ['كتاب', 'مكتوب', 'كاتب', 'كتابة'], count: 267 },
        'ق ر ي': { meaning: 'to read/recite', english: 'Read/Recite', related: ['قرآن', 'قارئ', 'قراءة', 'مقرئ'], count: 85 },
        'ع ل م': { meaning: 'to know', english: 'Know/Knowledge', related: ['علم', 'عالم', 'عليم', 'معلوم', 'علامة'], count: 854 },
        'ه د ي': { meaning: 'to guide', english: 'Guide/Guidance', related: ['هداية', 'هادي', 'مهتد', 'مرشد'], count: 314 },
        'ر ح م': { meaning: 'to have mercy', english: 'Mercy/Merciful', related: ['رحمة', 'رحيم', 'راحم', 'مرحوم'], count: 339 },
        'ص ل ه': { meaning: 'to pray', english: 'Prayer/Worship', related: ['صلاة', 'مصلح', 'صالح'], count: 104 },
        'ذ ك ر': { meaning: 'to remember', english: 'Remember/Remembrance', related: ['ذكر', 'ذكرى', 'مذكور', 'ذاكر'], count: 388 },
        'أ م ن': { meaning: 'to believe/be safe', english: 'Faith/Peace', related: ['إيمان', 'أمين', 'مؤمن', 'أمن'], count: 531 },
        'ن و ر': { meaning: 'to give light', english: 'Light/Illumination', related: ['نور', 'منير', 'مضيء'], count: 240 },
        'ح ي ي': { meaning: 'to live', english: 'Life/Living', related: ['حياة', 'حي', 'محيي', 'حيا'], count: 232 },
        'م و ت': { meaning: 'to die', english: 'Death/Die', related: ['موت', 'ميت', 'ممات', 'مميت'], count: 165 },
        'خ ل ق': { meaning: 'to create', english: 'Create/Creation', related: ['خلق', 'خالق', 'مخلوق', 'خلقة'], count: 273 },
        'ر ب ب': { meaning: 'to lord/nurture', english: 'Lord/Sustainer', related: ['رب', 'ربوبية', 'مربي'], count: 1005 },
        'د ي ن': { meaning: 'to owe/judge', english: 'Religion/Judgment', related: ['دين', 'داين', 'مدين'], count: 346 },
        'م ل ك': { meaning: 'to own/possess', english: 'Kingdom/Ownership', related: ['ملك', 'ملكوت', 'ملك', 'مالك'], count: 219 },
        'ح ك م': { meaning: 'to judge/wisdom', english: 'Wisdom/Judge', related: ['حكمة', 'حكيم', 'حاكم', 'محكم'], count: 207 },
        'ج ل ل': { meaning: 'to be great', english: 'Majesty/Greatness', related: ['جلال', 'جليل', 'جلال'], count: 20 },
        'س ل م': { meaning: 'to be safe/submit', english: 'Peace/Submission', related: ['سلام', 'إسلام', 'مسلم', 'سالم'], count: 150 },
        'ع ب د': { meaning: 'to worship/serve', english: 'Worship/Servant', related: ['عبد', 'عبادة', 'عبد', 'عابد'], count: 260 },
        'ط و ط': { meaning: 'to obey', english: 'Obedience/Obey', related: ['طاعة', 'مطيع', 'طائع'], count: 106 },
        'ص ب ر': { meaning: 'to be patient', english: 'Patience/Perseverance', related: ['صبر', 'صبور', 'صابر'], count: 104 },
        'ت و ب': { meaning: 'to repent', english: 'Repentance/Return', related: ['توبة', 'تائب', 'تواب'], count: 87 },
        'غ ف ر': { meaning: 'to forgive', english: 'Forgiveness/Forgive', related: ['غفران', 'غفور', 'غافر', 'مغفرة'], count: 234 },
        'ع ف و': { meaning: 'to pardon', english: 'Pardon/Clemency', related: ['عفو', 'عاف', 'معفو'], count: 35 },
        'ح س ب': { meaning: 'to reckon/calculate', english: 'Account/Reckon', related: ['حساب', 'محاسبة', 'حسب'], count: 114 },
        'ش ك ر': { meaning: 'to be grateful', english: 'Gratitude/Thankful', related: ['شكر', 'شكر', 'شكور', 'مشكور'], count: 75 },
        'ك ف ر': { meaning: 'to disbelieve/cover', english: 'Disbelief/Cover', related: ['كفر', 'كافر', 'كفور'], count: 526 },
        'ن ص ر': { meaning: 'to help/victory', english: 'Help/Victory', related: ['نصر', 'نصير', 'منصور', 'ناصر'], count: 192 },
        'ع ز ز': { meaning: 'to be strong', english: 'Might/Honor', related: ['عزّ', 'عزيز', 'عزت', 'معز'], count: 210 },
        'ذ ل ل': { meaning: 'to humble', english: 'Humiliation/Humble', related: ['ذلّ', 'ذليل', 'ذلة'], count: 48 },
        'ك ر م': { meaning: 'to be generous', english: 'Generosity/Noble', related: ['كرم', 'كريم', 'مكرم', 'كرامة'], count: 135 },
        'ج م ل': { meaning: 'to be beautiful', english: 'Beauty/Beautiful', related: ['جمال', 'جميل', 'جميل'], count: 40 },
        'ب د ل': { meaning: 'to change/replace', english: 'Change/Replace', related: ['بديل', 'تبديل', 'مبدل'], count: 40 },
        'خ ل ف': { meaning: 'to succeed/replace', english: 'Successor/After', related: ['خلف', 'خليفة', 'خلافة'], count: 50 },
        'و ل ي': { meaning: 'to be close/govern', english: 'Guardian/Authority', related: ['ولي', 'ولاية', 'ولية'], count: 130 },
        'ن ب ي': { meaning: 'to prophesy', english: 'Prophet/Prophecy', related: ['نبي', 'نبوة', 'نبأ'], count: 334 },
        'ر س ل': { meaning: 'to send/messenger', english: 'Messenger/Send', related: ['رسول', 'رسالة', 'مرسل'], count: 518 },
        'و ح ي': { meaning: 'to reveal', english: 'Revelation/Inspire', related: ['وحي', 'موحي', 'مُوحى'], count: 68 },
        'د ع و': { meaning: 'to call/invoke', english: 'Call/Invoke', related: ['دعوة', 'داعي', 'مدعي'], count: 234 },
        'ص و ر': { meaning: 'to form/shape', english: 'Form/Shape/Image', related: ['صورة', 'تصوير', 'مسطور'], count: 146 },
        'آ ت ي': { meaning: 'to give/grant', english: 'Give/Grant/Bestow', related: ['آية', 'إيتاء', 'معطي'], count: 278 },
        'ج ه د': { meaning: 'to strive', english: 'Strive/Effort', related: ['جهاد', 'مجاهد', 'مجتهد'], count: 41 },
        'ف ق ه': { meaning: 'to understand', english: 'Understanding/Comprehend', related: ['فقه', 'فقير', 'مفقوه'], count: 22 },
        'ب ص ر': { meaning: 'to see/perceive', english: 'Vision/Insight', related: ['بصر', 'بصيرة', 'مُبصر'], count: 120 },
        'س م ع': { meaning: 'to hear/listen', english: 'Hearing/Listen', related: ['سمع', 'سميع', 'مسماع'], count: 165 },
        'ل س ع': { meaning: 'to speak', english: 'Speech/Speak', related: ['لسعة', 'لسعة'], count: 6 },
        'ف ت ح': { meaning: 'to open', english: 'Open/Victory', related: ['فتاح', 'فتوح', 'مفتاح'], count: 108 },
        'غ ل ق': { meaning: 'to close/shut', english: 'Close/Shut', related: ['غلق', 'قالق'], count: 14 },
        'ب ن ي': { meaning: 'to build', english: 'Build/Structure', related: ['بنّ', 'باني', 'بناء', 'مبني'], count: 145 },
        'هدم': { meaning: 'to destroy', english: 'Destroy/Ruin', related: ['هدم', 'مهدم'], count: 17 },
        'ن ش أ': { meaning: 'to grow/origin', english: 'Origin/Grow', related: ['نشأ', 'نشأة', 'منشأ'], count: 37 },
        'م و ت': { meaning: 'to die', english: 'Death', related: ['موت', 'ميت', 'مميت'], count: 165 },
        'ب ع ث': { meaning: 'to resurrect', english: 'Resurrection/Raise', related: ['بعث', 'بعثة', 'مبعوث'], count: 73 },
        'ح ش ر': { meaning: 'to gather', english: 'Gathering/Herd', related: ['حشر', 'محشر', 'حاشور'], count: 24 },
        'د ف ن': { meaning: 'to bury', english: 'Bury/Grave', related: ['دفن', 'مدفون'], count: 9 },
        'ز ر ع': { meaning: 'to sow/plant', english: 'Sow/Plant', related: ['زرع', 'زارع', 'زريع'], count: 20 },
        'ح ص د': { meaning: 'to harvest', english: 'Harvest/Reap', related: ['حصاد', 'محصد'], count: 8 },
        'ث م ر': { meaning: 'to bear fruit', english: 'Fruit/Bear', related: ['ثمرة', 'ثمّر'], count: 32 },
    };

    // ─── Quranic Themes Index ───
    const THEMES = {
        'monotheism': { name: 'Tawhid (Monotheism)', keywords: ['אחד', 'له', 'إله', 'رب', 'الله', 'рабб', 'ilah'], surahs: [112, 2, 3, 4, 6, 7, 10, 20, 21, 23, 37, 59, 62, 72, 87, 98, 112], color: '#4a90d9' },
        'mercy': { name: 'Rahma (Mercy)', keywords: ['رحمة', 'رحيم', 'راحم', 'رحم', 'فرّح'], surahs: [1, 2, 7, 17, 21, 55, 59, 85], color: '#4caf50' },
        'patience': { name: 'Sabr (Patience)', keywords: ['صبر', 'صبور', 'صابر', 'اصبر'], surahs: [2, 3, 7, 11, 12, 16, 46], color: '#d4a574' },
        'gratitude': { name: 'Shukr (Gratitude)', keywords: ['شكر', 'شكور', 'مشكور', 'لشكر'], surahs: [2, 14, 27, 31, 34, 39, 76], color: '#9c27b0' },
        'prayer': { name: 'Salah (Prayer)', keywords: ['صلاة', 'صلوات', 'أقيموا', 'ركع', 'سجود'], surahs: [2, 4, 5, 11, 17, 20, 23, 70, 73, 74, 87, 96], color: '#06b6d4' },
        'justice': { name: 'Adl (Justice)', keywords: ['عدل', 'قسط', 'أقاموا', 'حُكم'], surahs: [4, 5, 16, 42, 57, 60], color: '#f59e0b' },
        'creation': { name: 'Khalq (Creation)', keywords: ['خلق', 'خالق', 'مخلوق', 'أنشأ', 'بنّى'], surahs: [2, 6, 10, 13, 15, 16, 21, 23, 25, 30, 32, 50, 59, 64, 67, 71, 75, 79, 80, 82, 84, 86, 87, 88, 91, 95, 96, 99, 100, 107], color: '#10b981' },
        'paradise': { name: 'Jannah (Paradise)', keywords: ['جنة', 'جنّات', 'نعيم', 'خلد', 'فيها'], surahs: [2, 3, 4, 9, 10, 18, 22, 47, 56, 76, 77, 78, 83, 98], color: '#e91e63' },
        'hellfire': { name: 'Jahannam (Hellfire)', keywords: ['نار', 'جهنم', 'عذاب', 'سعير', 'قهار'], surahs: [2, 3, 4, 9, 10, 11, 22, 40, 56, 67, 74, 77, 78, 82, 84, 98, 104], color: '#f44336' },
        'prophets': { name: 'Anbiya (Prophets)', keywords: ['نبي', 'رسول', 'أرسلنا', 'أوحينا', 'لقد أرسلنا'], surahs: [2, 3, 4, 5, 6, 7, 10, 11, 12, 14, 15, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 29, 33, 38, 40, 46, 47, 57, 66, 71, 72, 87], color: '#ff9800' },
        'quran': { name: 'Al-Quran', keywords: ['قرآن', 'كتاب', 'تنزيل', 'آية', 'ءايات'], surahs: [2, 3, 4, 7, 10, 12, 13, 15, 16, 17, 18, 20, 21, 25, 27, 30, 36, 38, 41, 42, 43, 44, 46, 47, 50, 54, 55, 56, 59, 68, 69, 72, 73, 75, 76, 78, 79, 80, 81, 82, 83, 84, 85, 87, 91, 92, 93, 94, 95, 96, 97, 98, 100, 101, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114], color: '#8b5cf6' },
        'day_of_judgment': { name: 'Yawm al-Qiyamah', keywords: ['قيامة', 'ساعة', 'يوم', 'بعث', 'حشر'], surahs: [1, 6, 7, 11, 15, 16, 17, 18, 20, 21, 22, 23, 25, 27, 30, 36, 39, 40, 43, 44, 45, 50, 51, 52, 53, 54, 56, 58, 64, 69, 70, 74, 75, 77, 78, 79, 80, 81, 82, 83, 84, 88, 99, 101, 102, 104, 107], color: '#ef4444' },
    };

    // ─── Internal State ───
    let state = {
        studySessions: [],
        favorites: [],
        notes: {},
        quizHistory: [],
        dailyReflections: {},
        memorizationAnalysis: {},
        wordBank: {},
        studyStreak: 0,
        lastStudyDate: null,
        totalStudyMinutes: 0,
        weeklyGoal: 30, // minutes
        currentLevel: 'beginner', // beginner, intermediate, advanced
        preferences: {
            translation: 'en.sahih',
            tafsir: 'en.jalalayn',
            arabicFont: 'traditional',
            autoPlayAudio: true,
            showTransliteration: true,
        }
    };

    // ─── Surah Metadata ───
    const SURAH_META = [
        { n:1, name:'Al-Fatihah', arabic:'الفاتحة', meaning:'The Opening', type:'Meccan', ayahs:7, juz:1 },
        { n:2, name:'Al-Baqarah', arabic:'البقرة', meaning:'The Cow', type:'Medinan', ayahs:286, juz:1 },
        { n:3, name:'Ali Imran', arabic:'آل عمران', meaning:'Family of Imran', type:'Medinan', ayahs:200, juz:3 },
        { n:4, name:'An-Nisa', arabic:'النساء', meaning:'The Women', type:'Medinan', ayahs:176, juz:4 },
        { n:5, name:'Al-Maidah', arabic:'المائدة', meaning:'The Table Spread', type:'Medinan', ayahs:120, juz:6 },
        { n:6, name:'Al-Anam', arabic:'الأنعام', meaning:'The Cattle', type:'Meccan', ayahs:165, juz:7 },
        { n:7, name:'Al-Araf', arabic:'الأعراف', meaning:'The Heights', type:'Meccan', ayahs:206, juz:8 },
        { n:8, name:'Al-Anfal', arabic:'الأنفال', meaning:'The Spoils of War', type:'Medinan', ayahs:75, juz:9 },
        { n:9, name:'At-Tawbah', arabic:'التوبة', meaning:'The Repentance', type:'Medinan', ayahs:129, juz:10 },
        { n:10, name:'Yunus', arabic:'يونس', meaning:'Jonah', type:'Meccan', ayahs:109, juz:11 },
        { n:11, name:'Hud', arabic:'هود', meaning:'Hud', type:'Meccan', ayahs:123, juz:11 },
        { n:12, name:'Yusuf', arabic:'يوسف', meaning:'Joseph', type:'Meccan', ayahs:111, juz:12 },
        { n:13, name:'Ar-Rad', arabic:'الرعد', meaning:'The Thunder', type:'Medinan', ayahs:43, juz:13 },
        { n:14, name:'Ibrahim', arabic:'إبراهيم', meaning:'Abraham', type:'Meccan', ayahs:52, juz:13 },
        { n:15, name:'Al-Hijr', arabic:'الحجر', meaning:'The Rocky Tract', type:'Meccan', ayahs:99, juz:14 },
        { n:16, name:'An-Nahl', arabic:'النحل', meaning:'The Bee', type:'Meccan', ayahs:128, juz:14 },
        { n:17, name:'Al-Isra', arabic:'الإسراء', meaning:'The Night Journey', type:'Meccan', ayahs:111, juz:15 },
        { n:18, name:'Al-Kahf', arabic:'الكهف', meaning:'The Cave', type:'Meccan', ayahs:110, juz:15 },
        { n:19, name:'Maryam', arabic:'مريم', meaning:'Mary', type:'Meccan', ayahs:98, juz:16 },
        { n:20, name:'Taha', arabic:'طه', meaning:'Ta-Ha', type:'Meccan', ayahs:135, juz:16 },
        { n:21, name:'Al-Anbiya', arabic:'الأنبياء', meaning:'The Prophets', type:'Meccan', ayahs:112, juz:17 },
        { n:22, name:'Al-Hajj', arabic:'الحج', meaning:'The Pilgrimage', type:'Medinan', ayahs:78, juz:17 },
        { n:23, name:'Al-Muminun', arabic:'المؤمنون', meaning:'The Believers', type:'Meccan', ayahs:118, juz:18 },
        { n:24, name:'An-Nur', arabic:'النور', meaning:'The Light', type:'Medinan', ayahs:64, juz:18 },
        { n:25, name:'Al-Furqan', arabic:'الفرقان', meaning:'The Criterion', type:'Meccan', ayahs:77, juz:18 },
        { n:26, name:'Ash-Shuara', arabic:'الشعراء', meaning:'The Poets', type:'Meccan', ayahs:227, juz:19 },
        { n:27, name:'An-Naml', arabic:'النمل', meaning:'The Ant', type:'Meccan', ayahs:93, juz:19 },
        { n:28, name:'Al-Qasas', arabic:'القصص', meaning:'The Stories', type:'Meccan', ayahs:88, juz:20 },
        { n:29, name:'Al-Ankabut', arabic:'العنكبوت', meaning:'The Spider', type:'Meccan', ayahs:69, juz:20 },
        { n:30, name:'Ar-Rum', arabic:'الروم', meaning:'The Romans', type:'Meccan', ayahs:60, juz:21 },
        { n:31, name:'Luqman', arabic:'لقمان', meaning:'Luqman', type:'Meccan', ayahs:34, juz:21 },
        { n:32, name:'As-Sajdah', arabic:'السجدة', meaning:'The Prostration', type:'Meccan', ayahs:30, juz:21 },
        { n:33, name:'Al-Ahzab', arabic:'الأحزاب', meaning:'The Combined Forces', type:'Medinan', ayahs:73, juz:21 },
        { n:34, name:'Saba', arabic:'سبأ', meaning:'Sheba', type:'Meccan', ayahs:54, juz:22 },
        { n:35, name:'Fatir', arabic:'فاطر', meaning:'Originator', type:'Meccan', ayahs:45, juz:22 },
        { n:36, name:'Ya-Sin', arabic:'يس', meaning:'Ya-Sin', type:'Meccan', ayahs:83, juz:22 },
        { n:37, name:'As-Saffat', arabic:'الصافات', meaning:'Those Who Set The Ranks', type:'Meccan', ayahs:182, juz:23 },
        { n:38, name:'Sad', arabic:'ص', meaning:'Sad', type:'Meccan', ayahs:88, juz:23 },
        { n:39, name:'Az-Zumar', arabic:'الزمر', meaning:'The Troops', type:'Meccan', ayahs:75, juz:23 },
        { n:40, name:'Ghafir', arabic:'غافر', meaning:'The Forgiver', type:'Meccan', ayahs:85, juz:24 },
        { n:41, name:'Fussilat', arabic:'فصلت', meaning:'Explained in Detail', type:'Meccan', ayahs:54, juz:24 },
        { n:42, name:'Ash-Shura', arabic:'الشورى', meaning:'The Consultation', type:'Meccan', ayahs:53, juz:25 },
        { n:43, name:'Az-Zukhruf', arabic:'الزخرف', meaning:'The Ornaments of Gold', type:'Meccan', ayahs:89, juz:25 },
        { n:44, name:'Ad-Dukhan', arabic:'الدخان', meaning:'The Smoke', type:'Meccan', ayahs:59, juz:25 },
        { n:45, name:'Al-Jathiyah', arabic:'الجاثية', meaning:'The Crouching', type:'Meccan', ayahs:37, juz:25 },
        { n:46, name:'Al-Ahqaf', arabic:'الأحقاف', meaning:'The Wind-Curved Sandhills', type:'Meccan', ayahs:35, juz:26 },
        { n:47, name:'Muhammad', arabic:'محمد', meaning:'Muhammad', type:'Medinan', ayahs:38, juz:26 },
        { n:48, name:'Al-Fath', arabic:'الفتح', meaning:'The Victory', type:'Medinan', ayahs:29, juz:26 },
        { n:49, name:'Al-Hujurat', arabic:'الحجرات', meaning:'The Rooms', type:'Medinan', ayahs:18, juz:26 },
        { n:50, name:'Qaf', arabic:'ق', meaning:'Qaf', type:'Meccan', ayahs:45, juz:26 },
        { n:51, name:'Adh-Dhariyat', arabic:'الذاريات', meaning:'The Winnowing Winds', type:'Meccan', ayahs:60, juz:26 },
        { n:52, name:'At-Tur', arabic:'الطور', meaning:'The Mount', type:'Meccan', ayahs:49, juz:27 },
        { n:53, name:'An-Najm', arabic:'النجم', meaning:'The Star', type:'Meccan', ayahs:62, juz:27 },
        { n:54, name:'Al-Qamar', arabic:'القمر', meaning:'The Moon', type:'Meccan', ayahs:55, juz:27 },
        { n:55, name:'Ar-Rahman', arabic:'الرحمن', meaning:'The Beneficent', type:'Medinan', ayahs:78, juz:27 },
        { n:56, name:'Al-Waqiah', arabic:'الواقعة', meaning:'The Inevitable', type:'Meccan', ayahs:96, juz:27 },
        { n:57, name:'Al-Hadid', arabic:'الحديد', meaning:'The Iron', type:'Medinan', ayahs:29, juz:27 },
        { n:58, name:'Al-Mujadila', arabic:'المجادلة', meaning:'The Pleading Woman', type:'Medinan', ayahs:22, juz:28 },
        { n:59, name:'Al-Hashr', arabic:'الحشر', meaning:'The Exile', type:'Medinan', ayahs:24, juz:28 },
        { n:60, name:'Al-Mumtahanah', arabic:'الممتحنة', meaning:'She That is Examined', type:'Medinan', ayahs:13, juz:28 },
        { n:61, name:'As-Saff', arabic:'الصف', meaning:'The Ranks', type:'Medinan', ayahs:14, juz:28 },
        { n:62, name:'Al-Jumuah', arabic:'الجمعة', meaning:'The Congregation', type:'Medinan', ayahs:11, juz:28 },
        { n:63, name:'Al-Munafiqun', arabic:'المنافقون', meaning:'The Hypocrites', type:'Medinan', ayahs:11, juz:28 },
        { n:64, name:'At-Taghabun', arabic:'التغابن', meaning:'The Mutual Disillusion', type:'Medinan', ayahs:18, juz:28 },
        { n:65, name:'At-Talaq', arabic:'الطلاق', meaning:'The Divorce', type:'Medinan', ayahs:12, juz:28 },
        { n:66, name:'At-Tahrim', arabic:'التحريم', meaning:'The Prohibition', type:'Medinan', ayahs:12, juz:28 },
        { n:67, name:'Al-Mulk', arabic:'الملك', meaning:'The Sovereignty', type:'Meccan', ayahs:30, juz:29 },
        { n:68, name:'Al-Qalam', arabic:'القلم', meaning:'The Pen', type:'Meccan', ayahs:52, juz:29 },
        { n:69, name:'Al-Haqqah', arabic:'الحاقة', meaning:'The Reality', type:'Meccan', ayahs:52, juz:29 },
        { n:70, name:'Al-Maarij', arabic:'المعارج', meaning:'The Ascending Stairways', type:'Meccan', ayahs:44, juz:29 },
        { n:71, name:'Nuh', arabic:'نوح', meaning:'Noah', type:'Meccan', ayahs:28, juz:29 },
        { n:72, name:'Al-Jinn', arabic:'الجن', meaning:'The Jinn', type:'Meccan', ayahs:28, juz:29 },
        { n:73, name:'Al-Muzzammil', arabic:'المزمل', meaning:'The Enshrouded One', type:'Meccan', ayahs:20, juz:29 },
        { n:74, name:'Al-Muddaththir', arabic:'المدثر', meaning:'The Cloaked One', type:'Meccan', ayahs:56, juz:29 },
        { n:75, name:'Al-Qiyamah', arabic:'القيامة', meaning:'The Resurrection', type:'Meccan', ayahs:40, juz:29 },
        { n:76, name:'Al-Insan', arabic:'الإنسان', meaning:'The Man', type:'Medinan', ayahs:31, juz:29 },
        { n:77, name:'Al-Mursalat', arabic:'المرسلات', meaning:'The Emissaries', type:'Meccan', ayahs:50, juz:29 },
        { n:78, name:'An-Naba', arabic:'النبأ', meaning:'The Tidings', type:'Meccan', ayahs:40, juz:30 },
        { n:79, name:'An-Naziat', arabic:'النازعات', meaning:'Those Who Drag Forth', type:'Meccan', ayahs:46, juz:30 },
        { n:80, name:'Abasa', arabic:'عبس', meaning:'He Frowned', type:'Meccan', ayahs:42, juz:30 },
        { n:81, name:'At-Takwir', arabic:'التكوير', meaning:'The Overthrowing', type:'Meccan', ayahs:29, juz:30 },
        { n:82, name:'Al-Infitar', arabic:'الانفطار', meaning:'The Cleaving', type:'Meccan', ayahs:19, juz:30 },
        { n:83, name:'Al-Mutaffifin', arabic:'المطففين', meaning:'The Defrauding', type:'Meccan', ayahs:36, juz:30 },
        { n:84, name:'Al-Inshiqaq', arabic:'الانشقاق', meaning:'The Sundering', type:'Meccan', ayahs:25, juz:30 },
        { n:85, name:'Al-Buruj', arabic:'البروج', meaning:'The Mansions of the Stars', type:'Meccan', ayahs:22, juz:30 },
        { n:86, name:'At-Tariq', arabic:'الطارق', meaning:'The Morning Star', type:'Meccan', ayahs:17, juz:30 },
        { n:87, name:'Al-Ala', arabic:'الأعلى', meaning:'The Most High', type:'Meccan', ayahs:19, juz:30 },
        { n:88, name:'Al-Ghashiyah', arabic:'الغاشية', meaning:'The Overwhelming', type:'Meccan', ayahs:26, juz:30 },
        { n:89, name:'Al-Fajr', arabic:'الفجر', meaning:'The Dawn', type:'Meccan', ayahs:30, juz:30 },
        { n:90, name:'Al-Balad', arabic:'البلد', meaning:'The City', type:'Meccan', ayahs:20, juz:30 },
        { n:91, name:'Ash-Shams', arabic:'الشمس', meaning:'The Sun', type:'Meccan', ayahs:15, juz:30 },
        { n:92, name:'Al-Layl', arabic:'الليل', meaning:'The Night', type:'Meccan', ayahs:21, juz:30 },
        { n:93, name:'Ad-Duhaa', arabic:'الضحى', meaning:'The Morning Hours', type:'Meccan', ayahs:11, juz:30 },
        { n:94, name:'Ash-Sharh', arabic:'الشرح', meaning:'The Relief', type:'Meccan', ayahs:8, juz:30 },
        { n:95, name:'At-Tin', arabic:'التين', meaning:'The Fig', type:'Meccan', ayahs:8, juz:30 },
        { n:96, name:'Al-Alaq', arabic:'العلق', meaning:'The Clot', type:'Meccan', ayahs:19, juz:30 },
        { n:97, name:'Al-Qadr', arabic:'القدر', meaning:'The Power', type:'Meccan', ayahs:5, juz:30 },
        { n:98, name:'Al-Bayyinah', arabic:'البينة', meaning:'The Clear Proof', type:'Medinan', ayahs:8, juz:30 },
        { n:99, name:'Az-Zalzalah', arabic:'الزلزلة', meaning:'The Earthquake', type:'Medinan', ayahs:8, juz:30 },
        { n:100, name:'Al-Adiyat', arabic:'العاديات', meaning:'The Courser', type:'Meccan', ayahs:11, juz:30 },
        { n:101, name:'Al-Qariah', arabic:'القارعة', meaning:'The Calamity', type:'Meccan', ayahs:11, juz:30 },
        { n:102, name:'At-Takathur', arabic:'التكاثر', meaning:'The Rivalry in Worldly Increase', type:'Meccan', ayahs:8, juz:30 },
        { n:103, name:'Al-Asr', arabic:'العصر', meaning:'The Declining Day', type:'Meccan', ayahs:3, juz:30 },
        { n:104, name:'Al-Humazah', arabic:'الهمزة', meaning:'The Traducer', type:'Meccan', ayahs:9, juz:30 },
        { n:105, name:'Al-Fil', arabic:'الفيل', meaning:'The Elephant', type:'Meccan', ayahs:5, juz:30 },
        { n:106, name:'Quraysh', arabic:'قريش', meaning:'Quraysh', type:'Meccan', ayahs:4, juz:30 },
        { n:107, name:'Al-Maun', arabic:'الماعون', meaning:'The Small Kindnesses', type:'Meccan', ayahs:7, juz:30 },
        { n:108, name:'Al-Kawthar', arabic:'الكوثر', meaning:'The Abundance', type:'Meccan', ayahs:3, juz:30 },
        { n:109, name:'Al-Kafirun', arabic:'الكافرون', meaning:'The Disbelievers', type:'Meccan', ayahs:6, juz:30 },
        { n:110, name:'An-Nasr', arabic:'النصر', meaning:'The Divine Support', type:'Medinan', ayahs:3, juz:30 },
        { n:111, name:'Al-Masad', arabic:'المسد', meaning:'The Palm Fiber', type:'Meccan', ayahs:5, juz:30 },
        { n:112, name:'Al-Ikhlas', arabic:'الإخلاص', meaning:'The Sincerity', type:'Meccan', ayahs:4, juz:30 },
        { n:113, name:'Al-Falaq', arabic:'الفلق', meaning:'The Daybreak', type:'Meccan', ayahs:5, juz:30 },
        { n:114, name:'An-Nas', arabic:'الناس', meaning:'Mankind', type:'Meccan', ayahs:6, juz:30 },
    ];

    // ─── HifdhEngine Reference ───
    function getHifdhState() {
        try {
            const raw = localStorage.getItem('mahi-hifdh');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    // ─── Forgetting Curve Model (Ebbinghaus) ───
    function forgettingCurveStrength(daysSinceReview, initialStrength) {
        // R = e^(-t/S) where S = stability (days), t = time since review
        const stability = initialStrength * 15; // strength 1=15d, 5=75d
        return Math.exp(-daysSinceReview / stability);
    }

    function optimalReviewInterval(currentStrength, successRate) {
        // SM-2 inspired: interval *= easeFactor on success
        const easeFactor = 1.3 + (successRate * 0.8); // 1.3 to 2.1
        const baseInterval = [1, 3, 7, 14, 30, 60][Math.min(currentStrength - 1, 5)];
        return Math.round(baseInterval * easeFactor);
    }

    // ─── Fetch Ayah Data from Al Quran Cloud ───
    async function fetchAyahText(surah, ayah) {
        try {
            const edition = state.preferences.translation || 'en.sahih';
            const res = await fetch(`${AL_QURAN_API}/ayah/${surah}:${ayah}/${edition}`);
            const data = await res.json();
            if (data.code === 200) {
                return {
                    arabic: data.data.text,
                    numberInSurah: data.data.numberInSurah,
                    surah: data.data.surah.number,
                    juz: data.data.juz,
                    page: data.data.page,
                    hizbQuarter: data.data.hizbQuarter,
                };
            }
        } catch (e) { /* fallback */ }
        return null;
    }

    async function fetchSurahText(surah, edition) {
        try {
            const ed = edition || state.preferences.translation || 'en.sahih';
            const res = await fetch(`${AL_QURAN_API}/surah/${surah}/${ed}`);
            const data = await res.json();
            if (data.code === 200) return data.data.ayahs;
        } catch (e) { /* fallback */ }
        return [];
    }

    async function fetchArabicText(surah) {
        try {
            const res = await fetch(`${AL_QURAN_API}/surah/${surah}/ar.alafasy`);
            const data = await res.json();
            if (data.code === 200) return data.data.ayahs;
        } catch (e) { /* fallback */ }
        return [];
    }

    // ─── Arabic Text Analysis ───
    function analyzeArabicText(text) {
        if (!text) return { words: [], rootWords: [], patterns: [] };

        const words = text.split(/\s+/).filter(w => w.length > 0);
        const analysis = words.map(word => {
            // Remove tashkeel (diacritics) for root analysis
            const clean = word.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '');
            // Find matching roots
            const foundRoots = Object.keys(ARABIC_ROOTS).filter(root => {
                const rootParts = root.split(' ');
                return rootParts.some(part => clean.includes(part));
            });
            // Identify pattern (wazn)
            const patterns = identifyPattern(clean);

            return {
                word: word,
                clean: clean,
                roots: foundRoots.map(r => ({ root: r, ...ARABIC_ROOTS[r] })),
                patterns: patterns,
                length: clean.length,
                hasTashkeel: word !== clean,
            };
        });

        return {
            words: analysis,
            totalWords: words.length,
            uniqueRoots: [...new Set(analysis.flatMap(a => a.roots.map(r => r.root)))],
            rootCount: analysis.reduce((sum, a) => sum + a.roots.length, 0),
        };
    }

    function identifyPattern(word) {
        const patterns = [];
        if (word.startsWith('مُ')) patterns.push('مفعول (被动名词)');
        if (word.startsWith('فَعَلَ')) patterns.push('فَعَلَ (过去式)');
        if (word.startsWith('يَفْعَلُ')) patterns.push('يَفْعَلُ (现在式)');
        if (word.endsWith('ِيَّة')) patterns.push('فعيلة (形容词)');
        if (word.endsWith('َان')) patterns.push('فعّان (主动分词)');
        if (word.endsWith('ُون')) patterns.push('فاعلون (复数)');
        if (word.endsWith('َات')) patterns.push('فعلات (阴性复数)');
        if (word.startsWith('ال')) patterns.push('ال التعريف (定冠词)');
        return patterns;
    }

    // ─── Theme Detection ───
    function detectThemes(text, surahNum) {
        const detected = [];
        const textLower = (text || '').toLowerCase();

        for (const [key, theme] of Object.entries(THEMES)) {
            const keywordMatch = theme.keywords.some(kw => textLower.includes(kw.toLowerCase()));
            const surahMatch = theme.surahs.includes(surahNum);
            if (keywordMatch || surahMatch) {
                detected.push({ ...theme, key, matchType: keywordMatch ? 'keyword' : 'surah' });
            }
        }
        return detected;
    }

    // ─── AI Tafsir Generator (Local, No API) ───
    function generateTafsir(surah, ayah, arabicText, translation) {
        const meta = SURAH_META.find(s => s.n === surah);
        if (!meta) return null;

        const themes = detectThemes(translation, surah);
        const arabicAnalysis = analyzeArabicText(arabicText);

        // Context-aware analysis
        const context = {
            surahName: meta.name,
            surahArabic: meta.arabic,
            surahMeaning: meta.meaning,
            type: meta.type,
            juz: meta.juz,
            position: `${meta.name} (${ayah}/${meta.ayahs})`,
        };

        // Generate word insights
        const wordInsights = arabicAnalysis.words
            .filter(w => w.roots.length > 0)
            .map(w => ({
                word: w.clean,
                roots: w.roots.map(r => ({
                    root: r.root,
                    meaning: r.meaning,
                    english: r.english,
                })),
                patterns: w.patterns,
            }));

        // Generate thematic connections
        const connections = [];
        if (themes.length > 0) {
            themes.forEach(theme => {
                const relatedSurahs = theme.surahs
                    .filter(s => s !== surah)
                    .slice(0, 5)
                    .map(s => SURAH_META.find(m => m.n === s))
                    .filter(Boolean);
                connections.push({
                    theme: theme.name,
                    color: theme.color,
                    relatedSurahs: relatedSurahs.map(s => `${s.name} (${s.meaning})`),
                });
            });
        }

        // Generate structural insight
        let structuralInsight = '';
        if (ayah === 1 && meta.ayahs > 1) {
            structuralInsight = `Opening ayah of ${meta.name} — sets the theme for the entire surah.`;
        } else if (ayah === meta.ayahs) {
            structuralInsight = `Final ayah of ${meta.name} — concludes the surah's message.`;
        } else if (ayah <= 3) {
            structuralInsight = `Early passage — establishes the foundation of ${meta.name}'s message.`;
        } else if (ayah >= meta.ayahs - 2) {
            structuralInsight = `Closing section — ${meta.name} reaches its conclusion.`;
        }

        return {
            context,
            themes,
            wordInsights,
            connections,
            structuralInsight,
            totalRoots: arabicAnalysis.uniqueRoots.length,
            totalWords: arabicAnalysis.totalWords,
        };
    }

    // ─── Memorization Coach ───
    function analyzeMemorizationPattern() {
        const hifdhState = getHifdhState();
        if (!hifdhState || !hifdhState.surahs) return null;

        const surahs = Object.entries(hifdhState.surahs);
        const analyzed = surahs.map(([num, data]) => {
            const ayahEntries = Object.entries(data.ayahs || {});
            const strengths = ayahEntries.map(([, a]) => a.strength || 0);
            const avgStrength = strengths.length ? strengths.reduce((a, b) => a + b, 0) / strengths.length : 0;

            // Calculate forgetting curve predictions
            const now = Date.now();
            const predictions = ayahEntries.map(([ayahNum, a]) => {
                const daysSince = a.lastReview ? (now - new Date(a.lastReview).getTime()) / (1000 * 60 * 60 * 24) : 999;
                const retention = forgettingCurveStrength(daysSince, a.strength || 1);
                return {
                    ayah: parseInt(ayahNum),
                    strength: a.strength || 1,
                    retention: Math.round(retention * 100),
                    daysSinceReview: Math.round(daysSince),
                    needsReview: retention < 0.7,
                };
            });

            const needsReview = predictions.filter(p => p.needsReview).length;
            const strongCount = predictions.filter(p => p.retention >= 80).length;

            return {
                surah: parseInt(num),
                name: SURAH_META.find(s => s.n === parseInt(num))?.name || `Surah ${num}`,
                status: data.status,
                avgStrength: Math.round(avgStrength * 10) / 10,
                totalAyahs: ayahEntries.length,
                needsReview,
                strongCount,
                predictions,
                priority: needsReview > 3 ? 'high' : needsReview > 0 ? 'medium' : 'low',
            };
        });

        // Sort by priority (high first)
        analyzed.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
        });

        // Calculate overall metrics
        const totalAyahsMemorized = analyzed.reduce((sum, s) => sum + s.totalAyahs, 0);
        const totalNeedsReview = analyzed.reduce((sum, s) => sum + s.needsReview, 0);
        const avgRetention = analyzed.length
            ? analyzed.reduce((sum, s) => {
                const surahRet = s.predictions.reduce((ps, p) => ps + p.retention, 0) / (s.predictions.length || 1);
                return sum + surahRet;
            }, 0) / analyzed.length
            : 0;

        // Generate daily recommendations
        const recommendations = [];
        const highPriority = analyzed.filter(s => s.priority === 'high');
        if (highPriority.length > 0) {
            recommendations.push({
                type: 'urgent',
                message: `${highPriority.length} surah(s) need urgent review — retention dropping below 70%.`,
                surahs: highPriority.map(s => s.name),
                action: 'Review these surahs today to prevent forgetting.',
            });
        }

        const decliningSurahs = analyzed.filter(s => {
            const declining = s.predictions.filter(p => p.daysSinceReview > 7 && p.retention < 50);
            return declining.length > 0;
        });
        if (decliningSurahs.length > 0) {
            recommendations.push({
                type: 'warning',
                message: `${decliningSurahs.length} surah(s) have ayahs with retention below 50%.`,
                surahs: decliningSurahs.map(s => s.name),
                action: 'Schedule a deep review session for these portions.',
            });
        }

        // Weekly schedule suggestion
        const weeklySchedule = generateWeeklySchedule(analyzed);

        return {
            surahs: analyzed,
            totalAyahsMemorized,
            totalNeedsReview,
            avgRetention: Math.round(avgRetention),
            recommendations,
            weeklySchedule,
            level: totalAyahsMemorized > 500 ? 'advanced' : totalAyahsMemorized > 100 ? 'intermediate' : 'beginner',
        };
    }

    function generateWeeklySchedule(analyzed) {
        const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const schedule = [];
        const highPriority = analyzed.filter(s => s.priority === 'high');
        const mediumPriority = analyzed.filter(s => s.priority === 'medium');
        const lowPriority = analyzed.filter(s => s.priority === 'low');

        // Distribute across the week
        let dayIdx = 0;
        highPriority.forEach(surah => {
            if (!schedule[dayIdx]) schedule[dayIdx] = { day: days[dayIdx], newMemorization: [], review: [], deepReview: [] };
            schedule[dayIdx].deepReview.push(surah.name);
            dayIdx = (dayIdx + 1) % 7;
        });

        mediumPriority.forEach(surah => {
            if (!schedule[dayIdx]) schedule[dayIdx] = { day: days[dayIdx], newMemorization: [], review: [], deepReview: [] };
            schedule[dayIdx].review.push(surah.name);
            dayIdx = (dayIdx + 1) % 7;
        });

        // Fill remaining days with new memorization targets
        days.forEach((day, i) => {
            if (!schedule[i]) schedule[i] = { day, newMemorization: [], review: [], deepReview: [] };
            if (schedule[i].review.length === 0 && schedule[i].deepReview.length === 0) {
                schedule[i].newMemorization.push('Continue current portion');
            }
        });

        return schedule;
    }

    // ─── Quiz System ───
    function generateQuiz(type, options = {}) {
        const hifdhState = getHifdhState();
        const memorized = [];

        if (hifdhState && hifdhState.surahs) {
            Object.entries(hifdhState.surahs).forEach(([num, data]) => {
                if (data.status === 'memorized' || data.status === 'in_progress') {
                    const ayahs = Object.entries(data.ayahs || {})
                        .filter(([, a]) => (a.strength || 0) >= 3)
                        .map(([n]) => parseInt(n));
                    if (ayahs.length > 0) {
                        memorized.push({ surah: parseInt(num), ayahs });
                    }
                }
            });
        }

        if (memorized.length === 0) {
            return { error: 'No memorized portions available for quiz. Start memorizing first!', questions: [] };
        }

        const questions = [];
        const numQuestions = options.count || 10;

        for (let i = 0; i < numQuestions; i++) {
            const randomSurah = memorized[Math.floor(Math.random() * memorized.length)];
            const randomAyah = randomSurah.ayahs[Math.floor(Math.random() * randomSurah.ayahs.length)];
            const meta = SURAH_META.find(s => s.n === randomSurah.surah);

            if (type === 'next_ayah') {
                // "What comes next?"
                const nextAyah = randomAyah + 1;
                if (nextAyah <= (meta?.ayahs || 999)) {
                    questions.push({
                        type: 'next_ayah',
                        question: `In ${meta?.name || 'Surah ' + randomSurah.surah}, what ayah comes after ayah ${randomAyah}?`,
                        correctAnswer: nextAyah,
                        surah: randomSurah.surah,
                        ayah: randomAyah,
                        hint: `Think about the sequence in ${meta?.name}.`,
                    });
                }
            } else if (type === 'surah_info') {
                // "Which surah is this?"
                questions.push({
                    type: 'surah_info',
                    question: `Surah ${randomSurah.surah} has ${meta?.ayahs || '?'} ayahs. What is its name?`,
                    correctAnswer: meta?.name || 'Unknown',
                    surah: randomSurah.surah,
                    hint: `It's a ${meta?.type || ''} surah in Juz ${meta?.juz || '?'}.`,
                });
            } else if (type === 'ayah_count') {
                questions.push({
                    type: 'ayah_count',
                    question: `How many ayahs does Surah ${meta?.name || randomSurah.surah} have?`,
                    correctAnswer: meta?.ayahs || 0,
                    surah: randomSurah.surah,
                    hint: `It's in Juz ${meta?.juz || '?'}.`,
                });
            } else if (type === 'juz') {
                questions.push({
                    type: 'juz',
                    question: `In which Juz is Surah ${meta?.name || randomSurah.surah}?`,
                    correctAnswer: meta?.juz || 0,
                    surah: randomSurah.surah,
                    hint: `It has ${meta?.ayahs || '?'} ayahs.`,
                });
            } else if (type === 'theme') {
                const themes = detectThemes('', randomSurah.surah);
                if (themes.length > 0) {
                    const theme = themes[Math.floor(Math.random() * themes.length)];
                    questions.push({
                        type: 'theme',
                        question: `Which major theme is found in Surah ${meta?.name || randomSurah.surah}?`,
                        correctAnswer: theme.name,
                        options: [theme.name, 'Warfare', 'Stories of Prophets', 'Law'].sort(() => Math.random() - 0.5),
                        surah: randomSurah.surah,
                    });
                }
            }
        }

        return { questions, type, timestamp: new Date().toISOString() };
    }

    function evaluateQuiz(quiz, answers) {
        if (!quiz || !quiz.questions) return { score: 0, total: 0, details: [] };

        let correct = 0;
        const details = quiz.questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = String(userAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
            if (isCorrect) correct++;
            return { question: q.question, correct: isCorrect, userAnswer, correctAnswer: q.correctAnswer };
        });

        return {
            score: correct,
            total: quiz.questions.length,
            percentage: Math.round((correct / quiz.questions.length) * 100),
            details,
            timestamp: new Date().toISOString(),
        };
    }

    // ─── Daily Reflection Generator ───
    function generateDailyReflection() {
        const today = new Date().toISOString().split('T')[0];
        if (state.dailyReflections[today]) return state.dailyReflections[today];

        // Select ayahs based on various factors
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const reflectionSurahs = [1, 2, 3, 55, 67, 73, 87, 93, 94, 95, 96, 97, 103, 112, 113, 114];
        const surahNum = reflectionSurahs[dayOfYear % reflectionSurahs.length];
        const meta = SURAH_META.find(s => s.n === surahNum);
        const ayahNum = (dayOfYear % (meta?.ayahs || 7)) + 1;

        // Detect themes
        const themes = detectThemes('', surahNum);

        // Generate reflection prompts based on themes
        const prompts = [];
        if (themes.some(t => t.key === 'mercy')) {
            prompts.push('How has Allah\'s mercy manifested in your life today?');
            prompts.push('Reflect on a moment where you showed mercy to someone.');
        }
        if (themes.some(t => t.key === 'patience')) {
            prompts.push('What challenge tested your patience today? How did you respond?');
            prompts.push('How can you practice more sabr tomorrow?');
        }
        if (themes.some(t => t.key === 'gratitude')) {
            prompts.push('List 3 things you are grateful for today.');
            prompts.push('How can you express shukr in your actions?');
        }
        if (themes.some(t => t.key === 'prayer')) {
            prompts.push('How was your connection with Salah today?');
            prompts.push('What distracted you from your prayers?');
        }
        if (themes.some(t => t.key === 'creation')) {
            prompts.push('What sign in creation caught your attention today?');
            prompts.push('How does contemplating creation strengthen your iman?');
        }
        if (prompts.length === 0) {
            prompts.push('What did you learn from the Quran today?');
            prompts.push('How will you apply today\'s ayah to your life?');
        }

        const reflection = {
            date: today,
            surah: surahNum,
            surahName: meta?.name || 'Unknown',
            ayah: ayahNum,
            themes: themes.map(t => t.name),
            prompts: prompts.slice(0, 3),
            memorizationFocus: analyzeMemorizationPattern()?.surahs?.[0]?.name || 'Start memorizing!',
            gratitude: [],
            journal: '',
        };

        state.dailyReflections[today] = reflection;
        saveState();
        return reflection;
    }

    // ─── Study Session Tracking ───
    function startStudySession(type) {
        const session = {
            id: Date.now(),
            type: type, // 'tafseer', 'memorization', 'quiz', 'reflection'
            startTime: new Date().toISOString(),
            endTime: null,
            ayahsStudied: 0,
            details: {},
        };
        state.studySessions.push(session);
        return session.id;
    }

    function endStudySession(sessionId, details) {
        const session = state.studySessions.find(s => s.id === sessionId);
        if (session) {
            session.endTime = new Date().toISOString();
            session.details = details || {};
            const duration = (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60);
            state.totalStudyMinutes += duration;
        }
        updateStudyStreak();
        saveState();
    }

    function updateStudyStreak() {
        const today = new Date().toISOString().split('T')[0];
        if (state.lastStudyDate === today) return;

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (state.lastStudyDate === yesterday) {
            state.studyStreak++;
        } else if (state.lastStudyDate !== today) {
            state.studyStreak = 1;
        }
        state.lastStudyDate = today;
    }

    // ─── Persistence ───
    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) { console.warn('Failed to save AI study state:', e); }
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                state = { ...state, ...saved };
            }
        } catch (e) { console.warn('Failed to load AI study state:', e); }
    }

    // ─── Favorites & Notes ───
    function toggleFavorite(surah, ayah) {
        const key = `${surah}:${ayah}`;
        const idx = state.favorites.indexOf(key);
        if (idx >= 0) {
            state.favorites.splice(idx, 1);
        } else {
            state.favorites.push(key);
        }
        saveState();
        return state.favorites.includes(key);
    }

    function isFavorite(surah, ayah) {
        return state.favorites.includes(`${surah}:${ayah}`);
    }

    function saveNote(surah, ayah, note) {
        const key = `${surah}:${ayah}`;
        state.notes[key] = { text: note, timestamp: new Date().toISOString() };
        saveState();
    }

    function getNote(surah, ayah) {
        return state.notes[`${surah}:${ayah}`] || null;
    }

    // ─── UI Setup ───
    function populateSurahDropdowns() {
        const selectors = ['tafsirSurah', 'wordSurah', 'quizSurah'];
        selectors.forEach(id => {
            const sel = document.getElementById(id);
            if (!sel) return;
            sel.innerHTML = '<option value="">Select Surah...</option>';
            SURAH_META.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.n;
                opt.textContent = `${s.n}. ${s.name} (${s.arabic}) — ${s.ayahs} ayahs`;
                sel.appendChild(opt);
            });
        });
    }

    function setupUI() {
        populateSurahDropdowns();

        // Tab switching
        document.querySelectorAll('.ai-tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tab = this.dataset.tab;
                document.querySelectorAll('.ai-tab-btn').forEach(b => {
                    b.classList.remove('btn-primary');
                    b.classList.add('btn');
                });
                this.classList.remove('btn');
                this.classList.add('btn-primary');
                document.querySelectorAll('.ai-study-panel').forEach(p => p.style.display = 'none');
                const panel = document.getElementById('panel-' + tab);
                if (panel) panel.style.display = '';
                if (tab === 'reflection') loadDailyReflection();
                if (tab === 'themes') loadThemes();
                if (tab === 'analytics') loadAnalytics();
                if (tab === 'mem-coach') loadMemCoach();
            });
        });

        // Tafsir explore
        const tafsirBtn = document.getElementById('tafsirExploreBtn');
        if (tafsirBtn) tafsirBtn.addEventListener('click', exploreTafsir);

        // Word analysis
        const wordBtn = document.getElementById('wordAnalyzeBtn');
        if (wordBtn) wordBtn.addEventListener('click', analyzeWord);

        // Quiz start
        const quizBtn = document.getElementById('quizStartBtn');
        if (quizBtn) quizBtn.addEventListener('click', startQuiz);

        // Surah change → update ayah max
        const tafsirSurah = document.getElementById('tafsirSurah');
        if (tafsirSurah) tafsirSurah.addEventListener('change', function() {
            const meta = SURAH_META.find(s => s.n === parseInt(this.value));
            if (meta) {
                document.getElementById('tafsirAyahTo').value = Math.min(5, meta.ayahs);
                document.getElementById('tafsirAyahFrom').value = 1;
            }
        });

        const wordSurahSel = document.getElementById('wordSurah');
        if (wordSurahSel) wordSurahSel.addEventListener('change', function() {
            const meta = SURAH_META.find(s => s.n === parseInt(this.value));
            if (meta) document.getElementById('wordAyah').max = meta.ayahs;
        });
    }

    async function exploreTafsir() {
        const surah = parseInt(document.getElementById('tafsirSurah')?.value);
        const from = parseInt(document.getElementById('tafsirAyahFrom')?.value) || 1;
        const to = parseInt(document.getElementById('tafsirAyahTo')?.value) || 5;
        const context = document.getElementById('tafsirContext')?.value || 'general';
        const resultDiv = document.getElementById('tafsirResult');
        if (!surah || !resultDiv) return;

        resultDiv.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-secondary)">Loading ayah analysis...</div>';
        const meta = SURAH_META.find(s => s.n === surah);

        let html = `<div style="margin-bottom:16px">
            <span class="arabic-word" style="font-size:18px">${meta?.arabic || ''}</span>
            <span style="margin-left:8px;color:var(--text-secondary)">${meta?.name} — Ayahs ${from} to ${to}</span>
        </div>`;

        for (let ayah = from; ayah <= to && ayah <= (meta?.ayahs || 0); ayah++) {
            try {
                const analysis = await QuranAIStudy.getAyahAnalysis(surah, ayah);
                html += `<div class="ayah-card">
                    <div class="arabic-text">${analysis.arabic || '(Arabic text)'}</div>
                    <div class="translation">${analysis.translation || '(Translation)'}</div>
                    <div style="margin-top:8px;font-size:13px;color:var(--text-secondary)"><strong>Tafsir:</strong> ${analysis.tafsir}</div>
                    ${analysis.themes.length ? `<div style="margin-top:6px">${analysis.themes.map(t => `<span class="ref-surah">${t}</span>`).join(' ')}</div>` : ''}
                </div>`;
            } catch (e) {
                html += `<div class="ayah-card"><div style="color:var(--accent-red)">Error loading ayah ${ayah}: ${e.message}</div></div>`;
            }
        }
        resultDiv.innerHTML = html;
    }

    async function analyzeWord() {
        const surah = parseInt(document.getElementById('wordSurah')?.value);
        const ayah = parseInt(document.getElementById('wordAyah')?.value) || 1;
        const resultDiv = document.getElementById('wordAnalysisResult');
        if (!surah || !resultDiv) return;

        resultDiv.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-secondary)">Analyzing Arabic text...</div>';
        try {
            const analysis = await QuranAIStudy.getAyahAnalysis(surah, ayah);
            const arabicWords = (analysis.arabic || '').split(/\s+/).filter(Boolean);
            let html = `<div class="ayah-card">
                <div class="arabic-text" style="font-size:28px">${analysis.arabic || ''}</div>
                <div class="translation" style="margin-bottom:16px">${analysis.translation || ''}</div>
                <div style="font-weight:600;margin-bottom:8px;color:var(--accent-gold)">Word-by-Word Breakdown</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px">`;

            arabicWords.forEach(word => {
                const roots = analysis.analysis?.roots || {};
                const foundRoot = Object.keys(roots).find(r => word.includes(r.replace(/\s/g, '')));
                const rootInfo = foundRoot ? (ARABIC_ROOTS[foundRoot] || null) : null;
                html += `<div style="background:var(--bg-tertiary);padding:8px;border-radius:6px;text-align:center">
                    <div class="arabic-word" style="font-size:24px">${word}</div>
                    ${rootInfo ? `<div class="word-root">Root: ${foundRoot} — ${rootInfo.meaning}</div>` : '<div style="font-size:11px;color:var(--text-secondary)">Function word</div>'}
                </div>`;
            });

            html += '</div></div>';
            if (analysis.analysis?.uniqueRoots?.length) {
                html += `<div style="margin-top:12px;font-size:13px"><strong>Unique Roots Found:</strong> ${analysis.analysis.uniqueRoots.join(', ')}</div>`;
            }
            resultDiv.innerHTML = html;
        } catch (e) {
            resultDiv.innerHTML = `<div style="color:var(--accent-red)">Error: ${e.message}</div>`;
        }
    }

    function startQuiz() {
        const type = document.getElementById('quizType')?.value || 'next-ayah';
        const surah = parseInt(document.getElementById('quizSurah')?.value) || 0;
        const container = document.getElementById('quizContainer');
        if (!container) return;

        const meta = SURAH_META.find(s => s.n === surah);
        if (!meta) {
            container.innerHTML = '<div style="color:var(--text-secondary)">Select a surah first</div>';
            return;
        }

        const quiz = QuranAIStudy.generateQuiz(type, { surah, count: 5 });
        if (!quiz || !quiz.questions?.length) {
            container.innerHTML = '<div style="color:var(--text-secondary)">Could not generate quiz. Try another surah or quiz type.</div>';
            return;
        }

        let html = '';
        let currentQ = 0;

        function renderQuestion(idx) {
            if (idx >= quiz.questions.length) {
                container.innerHTML = '<div style="text-align:center;padding:24px;color:var(--accent-gold);font-weight:600">Quiz Complete! جزاكم الله خيراً</div>';
                return;
            }
            const q = quiz.questions[idx];
            html = `<div style="margin-bottom:16px">
                <div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">Question ${idx + 1} of ${quiz.questions.length}</div>
                <div style="font-size:16px;font-weight:600;margin-bottom:12px">${q.question}</div>`;
            if (q.options) {
                q.options.forEach((opt, i) => {
                    html += `<button class="quiz-option" data-idx="${i}" onclick="window._quizAnswer(${idx},${i})">${opt}</button>`;
                });
            }
            html += '</div>';
            container.innerHTML = html;
        }

        window._quizAnswer = function(qIdx, aIdx) {
            const q = quiz.questions[qIdx];
            const correct = aIdx === q.correctIndex;
            const btns = container.querySelectorAll('.quiz-option');
            btns.forEach((btn, i) => {
                btn.disabled = true;
                if (i === q.correctIndex) btn.classList.add('correct');
                if (i === aIdx && !correct) btn.classList.add('wrong');
            });
            if (correct) {
                state.quizHistory[`${surah}:${qIdx}`] = { correct: true, date: new Date().toISOString() };
            }
            saveState();
            setTimeout(() => renderQuestion(qIdx + 1), 1200);
        };

        renderQuestion(0);
    }

    function loadDailyReflection() {
        const div = document.getElementById('dailyReflection');
        if (!div) return;
        const reflection = QuranAIStudy.getDailyReflection();
        if (!reflection) {
            div.innerHTML = '<div style="color:var(--text-secondary)">Could not load daily reflection.</div>';
            return;
        }
        div.innerHTML = `<div class="ayah-card">
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">${reflection.date} — Level: ${reflection.level}</div>
            <div class="arabic-text" style="font-size:22px;margin-bottom:8px">${reflection.surahArabic || ''}</div>
            <div style="font-weight:600;color:var(--accent-gold);margin-bottom:4px">${reflection.surahName} — Ayah ${reflection.ayah}</div>
            <div class="translation" style="margin-bottom:12px">${reflection.translation || ''}</div>
            <div style="font-size:14px;line-height:1.6;margin-bottom:12px">${reflection.reflection || ''}</div>
            ${reflection.connectionToLife ? `<div style="font-size:13px;color:var(--accent-blue);font-style:italic">"${reflection.connectionToLife}"</div>` : ''}
            <div style="margin-top:8px">${reflection.themes?.map(t => `<span class="ref-surah">${t}</span>`).join(' ') || ''}</div>
        </div>`;
    }

    function loadThemes() {
        const list = document.getElementById('themeList');
        const content = document.getElementById('themeContent');
        if (!list || !content) return;

        list.innerHTML = Object.entries(THEMES).map(([key, theme]) =>
            `<div class="theme-card" onclick="window._showTheme('${key}')">
                <div style="font-size:24px;margin-bottom:4px">${theme.icon || '📖'}</div>
                <div style="font-weight:600;font-size:13px">${theme.name}</div>
            </div>`
        ).join('');

        window._showTheme = function(key) {
            const theme = THEMES[key];
            if (!theme) return;
            const surahs = theme.surahs || [];
            content.innerHTML = `<div style="margin-bottom:12px;font-weight:600;color:var(--accent-gold)">${theme.name}</div>
                <div style="margin-bottom:12px;font-size:13px;color:var(--text-secondary)">${theme.description || ''}</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px">
                    ${surahs.map(s => {
                        const m = SURAH_META.find(sm => sm.n === s);
                        return m ? `<div style="background:var(--bg-tertiary);padding:8px;border-radius:6px;text-align:center">
                            <div style="font-size:11px;color:var(--text-secondary)">${m.n}</div>
                            <div style="font-weight:600;font-size:13px">${m.name}</div>
                            <div style="font-size:11px;color:var(--text-secondary)">${m.meaning}</div>
                        </div>` : '';
                    }).join('')}
                </div>`;
        };
    }

    function loadAnalytics() {
        const div = document.getElementById('analyticsContent');
        if (!div) return;
        const stats = QuranAIStudy.getStudyStats();
        div.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px">
            <div class="stat-card"><div class="stat-value">${stats.totalSessions}</div><div class="stat-label">Study Sessions</div></div>
            <div class="stat-card"><div class="stat-value">${stats.totalMinutes}</div><div class="stat-label">Total Minutes</div></div>
            <div class="stat-card"><div class="stat-value">${stats.streak}</div><div class="stat-label">Day Streak</div></div>
            <div class="stat-card"><div class="stat-value">${stats.favoriteCount}</div><div class="stat-label">Favorites</div></div>
            <div class="stat-card"><div class="stat-value">${stats.noteCount}</div><div class="stat-label">Notes</div></div>
            <div class="stat-card"><div class="stat-value">${stats.weeklyGoal}m</div><div class="stat-label">Weekly Goal</div></div>
        </div>
        <div style="font-size:13px;color:var(--text-secondary)">
            ${stats.lastStudyDate ? `Last study: ${new Date(stats.lastStudyDate).toLocaleDateString()}` : 'No sessions yet'}
        </div>`;
    }

    function loadMemCoach() {
        const statsDiv = document.getElementById('memCoachStats');
        const planDiv = document.getElementById('memCoachPlan');
        if (!statsDiv) return;
        const analysis = QuranAIStudy.getMemorizationAnalysis();
        if (!analysis) {
            statsDiv.innerHTML = '<div style="color:var(--text-secondary);grid-column:span 2">Start memorizing to see coaching insights!</div>';
            if (planDiv) planDiv.innerHTML = '';
            return;
        }
        statsDiv.innerHTML = `<div class="stat-card"><div class="stat-value">${analysis.totalMemorized || 0}</div><div class="stat-label">Ayahs Memorized</div></div>
            <div class="stat-card"><div class="stat-value">${analysis.avgStrength?.toFixed(1) || 0}</div><div class="stat-label">Avg Strength</div></div>
            <div class="stat-card"><div class="stat-value">${analysis.dueForReview || 0}</div><div class="stat-label">Due for Review</div></div>
            <div class="stat-card"><div class="stat-value">${analysis.newToday || 0}</div><div class="stat-label">New Today</div></div>`;
        if (planDiv) {
            planDiv.innerHTML = `<div style="font-size:13px;color:var(--text-secondary)">
                ${analysis.recommendations?.map(r => `<div style="margin-bottom:4px">• ${r}</div>`).join('') || 'Keep memorizing consistently!'}
            </div>`;
        }
    }

    // ─── Public API ───
    return {
        init() {
            loadState();
            setupUI();
            console.log('[QuranAIStudy] Initialized');
            return state;
        },

        // Tafsir
        async getAyahAnalysis(surah, ayah) {
            const sessionId = startStudySession('tafseer');
            const arabicData = await fetchAyahText(surah, ayah);
            const translationData = await fetchAyahText(surah, ayah);
            const meta = SURAH_META.find(s => s.n === surah);

            // Fetch Arabic and translation
            let arabic = '', translation = '';
            try {
                const [arbRes, transRes] = await Promise.all([
                    fetch(`${AL_QURAN_API}/ayah/${surah}:${ayah}/ar.alafasy`),
                    fetch(`${AL_QURAN_API}/ayah/${surah}:${ayah}/${state.preferences.translation}`)
                ]);
                const arbData = await arbRes.json();
                const transData = await transRes.json();
                arabic = arbData?.data?.text || '';
                translation = transData?.data?.text || '';
            } catch (e) { /* use fallbacks */ }

            const tafsir = generateTafsir(surah, ayah, arabic, translation);
            const themes = detectThemes(translation, surah);

            endStudySession(sessionId, { surah, ayah });

            return {
                surah, ayah,
                surahName: meta?.name,
                surahArabic: meta?.arabic,
                surahMeaning: meta?.meaning,
                arabic,
                translation,
                tafsir,
                themes,
                isFavorite: isFavorite(surah, ayah),
                note: getNote(surah, ayah),
                totalAyahs: meta?.ayahs,
            };
        },

        async getSurahStudy(surah) {
            const meta = SURAH_META.find(s => s.n === surah);
            if (!meta) return null;

            const arabicAyahs = await fetchArabicText(surah);
            const translationAyahs = await fetchSurahText(surah);

            const ayahAnalyses = [];
            for (let i = 0; i < Math.min(meta.ayahs, 5); i++) { // Sample first 5
                const arabic = arabicAyahs[i]?.text || '';
                const trans = translationAyahs[i]?.text || '';
                ayahAnalyses.push({
                    ayah: i + 1,
                    arabic,
                    translation: trans,
                    analysis: analyzeArabicText(arabic),
                    themes: detectThemes(trans, surah),
                });
            }

            const allThemes = detectThemes('', surah);
            const totalRoots = [...new Set(ayahAnalyses.flatMap(a => a.analysis.uniqueRoots))];

            return {
                surah,
                meta,
                ayahAnalyses,
                themes: allThemes,
                uniqueRoots: totalRoots,
                totalUniqueRoots: totalRoots.length,
                avgRootsPerAyah: Math.round((totalRoots.length / meta.ayahs) * 10) / 10,
            };
        },

        // Memorization Coach
        getMemorizationAnalysis() {
            return analyzeMemorizationPattern();
        },

        getForgettingCurve(surah, ayah) {
            const hifdhState = getHifdhState();
            if (!hifdhState?.surahs?.[surah]?.ayahs?.[ayah]) return null;

            const ayahData = hifdhState.surahs[surah].ayahs[ayah];
            const now = Date.now();
            const daysSince = ayahData.lastReview ? (now - new Date(ayahData.lastReview).getTime()) / (1000 * 60 * 60 * 24) : 0;

            // Generate curve points (0 to 60 days)
            const points = [];
            for (let d = 0; d <= 60; d++) {
                points.push({
                    day: d,
                    retention: Math.round(forgettingCurveStrength(d, ayahData.strength || 1) * 100),
                });
            }

            return {
                currentRetention: Math.round(forgettingCurveStrength(daysSince, ayahData.strength || 1) * 100),
                daysSinceReview: Math.round(daysSince),
                strength: ayahData.strength,
                optimalInterval: optimalReviewInterval(ayahData.strength || 1, 0.8),
                curvePoints: points,
            };
        },

        // Quiz
        generateQuiz(type, options) {
            return generateQuiz(type, options);
        },

        evaluateQuiz(quiz, answers) {
            return evaluateQuiz(quiz, answers);
        },

        // Daily Reflection
        getDailyReflection() {
            return generateDailyReflection();
        },

        saveReflectionJournal(text) {
            const today = new Date().toISOString().split('T')[0];
            if (state.dailyReflections[today]) {
                state.dailyReflections[today].journal = text;
                saveState();
            }
        },

        // Favorites & Notes
        toggleFavorite,
        isFavorite,
        saveNote,
        getNote,

        // Study Tracking
        startStudySession,
        endStudySession,

        // Analytics
        getStudyStats() {
            return {
                totalSessions: state.studySessions.length,
                totalMinutes: Math.round(state.totalStudyMinutes),
                streak: state.studyStreak,
                lastStudyDate: state.lastStudyDate,
                favoriteCount: state.favorites.length,
                noteCount: Object.keys(state.notes).length,
                quizHistory: state.quizHistory.slice(-10),
                weeklyGoal: state.weeklyGoal,
                weeklyProgress: Math.round((state.totalStudyMinutes % (state.weeklyGoal * 7)) / (state.weeklyGoal * 7) * 100),
            };
        },

        // Utilities
        getSurahMeta(surah) {
            return SURAH_META.find(s => s.n === surah);
        },

        getAllSurahMeta() {
            return SURAH_META;
        },

        detectThemes(text, surah) {
            return detectThemes(text, surah);
        },

        analyzeArabic(text) {
            return analyzeArabicText(text);
        },

        getRootInfo(root) {
            return ARABIC_ROOTS[root] || null;
        },

        searchRoots(query) {
            const q = query.toLowerCase();
            return Object.entries(ARABIC_ROOTS)
                .filter(([root, info]) =>
                    root.includes(q) ||
                    info.meaning.toLowerCase().includes(q) ||
                    info.english.toLowerCase().includes(q)
                )
                .map(([root, info]) => ({ root, ...info }));
        },

        // Export/Import
        exportData() {
            return JSON.stringify(state, null, 2);
        },

        importData(json) {
            try {
                const data = JSON.parse(json);
                state = { ...state, ...data };
                saveState();
                return true;
            } catch { return false; }
        },

        resetAll() {
            state = {
                studySessions: [], favorites: [], notes: {}, quizHistory: {},
                dailyReflections: {}, memorizationAnalysis: {}, wordBank: {},
                studyStreak: 0, lastStudyDate: null, totalStudyMinutes: 0,
                weeklyGoal: 30, currentLevel: 'beginner',
                preferences: state.preferences,
            };
            saveState();
        },

        // Constants
        SURAH_META,
        ARABIC_ROOTS,
        THEMES,
    };
})();

if (typeof window !== 'undefined') window.QuranAIStudy = QuranAIStudy;
